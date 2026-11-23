
import type { NextFunction, Request, Response } from "express";
import { prisma } from "../lib/prisma.js";
import { verifyToken, type TokenPayload } from "../lib/jwt.js";

declare global {
  namespace Express {
    interface Request {
      user?: TokenPayload;
    }
  }
}

export async function requireAuth(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  const token =
    req.cookies?.marka_token ||
    req.headers.authorization?.split(" ")[1];

  if (!token) {
    res.status(401).json({
      error: {
        code: "UNAUTHENTICATED",
        message: "Acesso restrito. Faça login."
      }
    });
    return;
  }

  try {
    const decodedUser = verifyToken(token);

    if (!req.business) {
      res.status(400).json({
        error: {
          code: "BUSINESS_REQUIRED",
          message: "Não foi possível identificar o negócio."
        }
      });
      return;
    }

    if (
      !decodedUser.businessId ||
      decodedUser.businessId !== req.business.id
    ) {
      res.status(403).json({
        error: {
          code: "BUSINESS_MISMATCH",
          message: "Não tem permissão para gerir este negócio."
        }
      });
      return;
    }

    if (decodedUser.role !== "ADMIN") {
      res.status(403).json({
        error: {
          code: "INSUFFICIENT_ROLE",
          message: "Esta operação exige uma conta de administrador."
        }
      });
      return;
    }

    const user = await prisma.user.findFirst({
      where: {
        id: decodedUser.sub,
        email: decodedUser.email,
        businessId: req.business.id,
        role: "ADMIN"
      },
      select: {
        id: true
      }
    });

    if (!user) {
      res.status(401).json({
        error: {
          code: "INVALID_SESSION",
          message: "Esta sessão já não é válida. Faça login novamente."
        }
      });
      return;
    }

    req.user = decodedUser;
    next();
  } catch (error) {
    res.status(401).json({
      error: {
        code: "INVALID_TOKEN",
        message: "Sessão inválida ou expirada. Faça login novamente."
      }
    });
  }
}

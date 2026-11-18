import type { NextFunction, Request, Response } from "express";
import { verifyToken, type TokenPayload } from "../lib/jwt.js";

declare global {
  namespace Express {
    interface Request {
      user?: TokenPayload;
    }
  }
}

export function requireAuth(req: Request, res: Response, next: NextFunction): void {
  const token = req.cookies?.marka_token || req.headers.authorization?.split(" ")[1];

  if (!token) {
    res.status(401).json({ error: { code: "UNAUTHENTICATED", message: "Acesso restrito. Faça login." } });
    return;
  }

  try {
    const decodedUser = verifyToken(token);
    req.user = decodedUser;

    // =========================================================
    // AQUI ESTÁ A PROTEÇÃO MULTI-TENANT (O Escudo do Admin)
    // =========================================================
    // Se o tenantMiddleware já identificou o negócio (req.business),
    // verificamos se o utilizador logado pertence a esse negócio.
    if (req.business) {
      // Assumindo que o teu TokenPayload tem o businessId dentro dele
      // (Precisas confirmar se no teu lib/jwt.ts guardaste o businessId no token)
      const userBusinessId = (decodedUser as any).businessId; 

      if (userBusinessId && userBusinessId !== req.business.id) {
        res.status(403).json({ 
          error: { 
            code: "FORBIDDEN", 
            message: "Acesso negado. Não tem permissão para gerir este negócio." 
          } 
        });
        return;
      }
    }

    next();
  } catch {
    res.status(401).json({ error: { code: "INVALID_TOKEN", message: "Sessão expirada." } });
  }
}
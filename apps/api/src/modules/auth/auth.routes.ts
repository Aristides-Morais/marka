
import { Router } from "express";
import { z } from "zod";
import rateLimit from "express-rate-limit";
import { prisma } from "../../lib/prisma.js";
import { hashPassword, verifyPassword } from "../../lib/argon.js";
import { signToken } from "../../lib/jwt.js";
import { requireAuth } from "../../middleware/auth.middleware.js";

export const authRouter = Router();

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: {
    error: {
      code: "TOO_MANY_REQUESTS",
      message: "Demasiadas tentativas. Tente mais tarde."
    }
  },
  standardHeaders: true,
  legacyHeaders: false
});

const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  maxAge: 24 * 60 * 60 * 1000,
  path: "/"
};

// A criação de administradores passa a ser feita pelo Super Admin.
authRouter.post("/setup", (_req, res) => {
  res.status(403).json({
    error: {
      code: "SETUP_DISABLED",
      message: "A criação de administradores é feita pelo Super Admin."
    }
  });
});

authRouter.post("/login", loginLimiter, async (req, res, next) => {
  try {
    const schema = z.object({
      email: z.string().trim().email(),
      password: z.string().min(1)
    });

    const { email, password } = schema.parse(req.body);

    const user = await prisma.user.findFirst({
      where: {
        email,
        businessId: req.business!.id,
        role: "ADMIN"
      }
    });

    if (!user || !(await verifyPassword(user.passwordHash, password))) {
      res.status(401).json({
        error: {
          code: "INVALID_CREDENTIALS",
          message: "Email ou password incorrectos."
        }
      });
      return;
    }

    const token = signToken({
      sub: user.id,
      email: user.email,
      role: user.role,
      businessId: user.businessId
    });

    res.cookie("marka_token", token, cookieOptions);

    res.json({
      user: {
        name: user.name,
        email: user.email
      },
      token
    });
  } catch (err) {
    next(err);
  }
});

authRouter.post("/logout", (_req, res) => {
  res.clearCookie("marka_token", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/"
  });

  res.json({ ok: true });
});

// Alterar email e password
const emptyToUndefined = (value: unknown) =>
  typeof value === "string" && value.trim() === ""
    ? undefined
    : value;

authRouter.patch(
  "/update-credentials",
  requireAuth,
  async (req, res, next) => {
    try {
      const schema = z.object({
        currentPassword: z.string().min(1),
        newEmail: z.preprocess(
          emptyToUndefined,
          z.string().trim().email().optional()
        ),
        newPassword: z.preprocess(
          emptyToUndefined,
          z.string().min(8).optional()
        )
      });

      const { currentPassword, newEmail, newPassword } =
        schema.parse(req.body);

      const user = await prisma.user.findFirst({
        where: {
          id: req.user!.sub,
          businessId: req.business!.id,
          role: "ADMIN"
        }
      });

      if (!user) {
        res.status(404).json({
          error: {
            code: "NOT_FOUND",
            message: "Utilizador não encontrado."
          }
        });
        return;
      }

      const passwordIsValid = await verifyPassword(
        user.passwordHash,
        currentPassword
      );

      if (!passwordIsValid) {
        res.status(401).json({
          error: {
            code: "INVALID_CREDENTIALS",
            message: "A password actual está incorrecta."
          }
        });
        return;
      }

      if (!newEmail && !newPassword) {
        res.status(400).json({
          error: {
            code: "NOTHING_TO_UPDATE",
            message: "Indique um novo email ou uma nova password."
          }
        });
        return;
      }

      if (newEmail && newEmail !== user.email) {
        const existing = await prisma.user.findFirst({
          where: {
            email: newEmail,
            businessId: user.businessId,
            id: { not: user.id }
          }
        });

        if (existing) {
          res.status(409).json({
            error: {
              code: "EMAIL_IN_USE",
              message: "Esse email já está em uso neste negócio."
            }
          });
          return;
        }
      }

      const dataToUpdate: {
        email?: string;
        passwordHash?: string;
      } = {};

      if (newEmail) {
        dataToUpdate.email = newEmail;
      }

      if (newPassword) {
        dataToUpdate.passwordHash = await hashPassword(newPassword);
      }

      await prisma.user.update({
        where: { id: user.id },
        data: dataToUpdate
      });

      res.json({
        message: "Credenciais actualizadas com sucesso!"
      });
    } catch (err) {
      next(err);
    }
  }
);

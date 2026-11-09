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
  // Procura o token no cookie ou no header Authorization
  const token = req.cookies?.marka_token || req.headers.authorization?.split(" ")[1];

  if (!token) {
    res.status(401).json({ error: { code: "UNAUTHENTICATED", message: "Acesso restrito. Faça login." } });
    return;
  }

  try {
    req.user = verifyToken(token);
    next();
  } catch {
    res.status(401).json({ error: { code: "INVALID_TOKEN", message: "Sessão expirada." } });
  }
}
import jwt from "jsonwebtoken";
import { env } from "../config/env.js";

// Adicionámos o businessId!
export type TokenPayload = { sub: string; email: string; role: string; businessId: string };

export function signToken(payload: TokenPayload) {
  return jwt.sign(payload, env.JWT_SECRET, { expiresIn: "1d" });
}

export function verifyToken(token: string): TokenPayload {
  return jwt.verify(token, env.JWT_SECRET) as TokenPayload;
}
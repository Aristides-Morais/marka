
import jwt from "jsonwebtoken";
import { env } from "../config/env.js";

export type TokenPayload = {
  sub: string;
  email: string;
  role: string;
  businessId: string;
};

export function signToken(payload: TokenPayload): string {
  return jwt.sign(payload, env.JWT_SECRET, {
    expiresIn: "1d"
  });
}

export function verifyToken(token: string): TokenPayload {
  const decoded = jwt.verify(token, env.JWT_SECRET);

  if (
    typeof decoded !== "object" ||
    decoded === null ||
    typeof decoded.sub !== "string" ||
    typeof decoded.email !== "string" ||
    typeof decoded.role !== "string" ||
    typeof decoded.businessId !== "string" ||
    !decoded.sub ||
    !decoded.businessId
  ) {
    throw new Error("Token com dados inválidos.");
  }

  return {
    sub: decoded.sub,
    email: decoded.email,
    role: decoded.role,
    businessId: decoded.businessId
  };
}

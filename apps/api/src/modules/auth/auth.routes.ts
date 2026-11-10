import { Router } from "express";
import { z } from "zod";
import rateLimit from "express-rate-limit";
import { prisma } from "../../lib/prisma.js";
import { hashPassword, verifyPassword } from "../../lib/argon.js";
import { signToken } from "../../lib/jwt.js";

export const authRouter = Router();

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { error: { code: "TOO_MANY_REQUESTS", message: "Demasiadas tentativas. Tente mais tarde." } },
  standardHeaders: true,
  legacyHeaders: false,
});

authRouter.post("/setup", async (req, res, next) => {
  try {
    const schema = z.object({ name: z.string(), email: z.string().email(), password: z.string().min(8) });
    const { name, email, password } = schema.parse(req.body);
    const existing = await prisma.user.findFirst();
    if (existing) return res.status(403).json({ error: "Admin já existe." });
    const passwordHash = await hashPassword(password);
    const user = await prisma.user.create({ data: { name, email, passwordHash, role: "ADMIN" } });
    res.status(201).json({ message: "Admin criado com sucesso!", email: user.email });
  } catch (err) { next(err); }
});

authRouter.post("/login", loginLimiter, async (req, res, next) => {
  try {
    const schema = z.object({ email: z.string().email(), password: z.string() });
    const { email, password } = schema.parse(req.body);
    const cleanEmail = email.trim();
    const user = await prisma.user.findUnique({ where: { email: cleanEmail } });
    
    if (!user || !(await verifyPassword(user.passwordHash, password))) {
      return res.status(401).json({ error: { code: "INVALID_CREDENTIALS", message: "Email ou password incorretos." } });
    }
    
    const token = signToken({ sub: user.id, email: user.email, role: user.role });
    res.cookie("marka_token", token, { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", maxAge: 24 * 60 * 60 * 1000 });
    res.json({ user: { name: user.name, email: user.email }, token });
  } catch (err) { next(err); }
});

authRouter.post("/logout", (req, res) => {
  res.clearCookie("marka_token");
  res.json({ ok: true });
});
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
    
    // Verifica se já existe admin NESTE negócio
    const existing = await prisma.user.findFirst({ 
      where: { businessId: req.business!.id } 
    });
    if (existing) return res.status(403).json({ error: "Admin já existe para este negócio." });
    
    const passwordHash = await hashPassword(password);
    const user = await prisma.user.create({ 
      data: { 
        name, 
        email, 
        passwordHash, 
        role: "ADMIN",
        businessId: req.business!.id // <--- Amarra ao negócio!
      } 
    });
    res.status(201).json({ message: "Admin criado com sucesso!", email: user.email });
  } catch (err) { next(err); }
});

authRouter.post("/login", loginLimiter, async (req, res, next) => {
  try {
    const schema = z.object({ email: z.string().email(), password: z.string() });
    const { email, password } = schema.parse(req.body);
    const cleanEmail = email.trim();
    
    // PROCURA APENAS NESTE NEGÓCIO! (Para evitar conflitos de email)
    const user = await prisma.user.findFirst({ 
      where: { 
        email: cleanEmail,
        businessId: req.business!.id 
      } 
    });
    
    if (!user || !(await verifyPassword(user.passwordHash, password))) {
      return res.status(401).json({ error: { code: "INVALID_CREDENTIALS", message: "Email ou password incorretos." } });
    }
    
    // Gera o token com o businessId incluído
    const token = signToken({ 
      sub: user.id, 
      email: user.email, 
      role: user.role,
      businessId: user.businessId 
    });
    
    res.cookie("marka_token", token, { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", maxAge: 24 * 60 * 60 * 1000 });
    res.json({ user: { name: user.name, email: user.email }, token });
  } catch (err) { next(err); }
});

authRouter.post("/logout", (req, res) => {
  res.clearCookie("marka_token");
  res.json({ ok: true });
});
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
  message: { error: { code: "TOO_MANY_REQUESTS", message: "Demasiadas tentativas. Tente mais tarde." } },
  standardHeaders: true,
  legacyHeaders: false,
});

authRouter.post("/setup", async (req, res, next) => {
  try {
    const schema = z.object({ name: z.string(), email: z.string().email(), password: z.string().min(8) });
    const { name, email, password } = schema.parse(req.body);

    const existing = await prisma.user.findFirst({ where: { businessId: req.business!.id } });
    if (existing) {
      return res.status(403).json({ error: { code: "ADMIN_EXISTS", message: "Admin já existe para este negócio." } });
    }

    const passwordHash = await hashPassword(password);
    const user = await prisma.user.create({
      data: { name, email, passwordHash, role: "ADMIN", businessId: req.business!.id },
    });
    res.status(201).json({ message: "Admin criado com sucesso!", email: user.email });
  } catch (err) { next(err); }
});

authRouter.post("/login", loginLimiter, async (req, res, next) => {
  try {
    const schema = z.object({ email: z.string().email(), password: z.string() });
    const { email, password } = schema.parse(req.body);
    const cleanEmail = email.trim();

    const user = await prisma.user.findFirst({
      where: { email: cleanEmail, businessId: req.business!.id },
    });

    if (!user || !(await verifyPassword(user.passwordHash, password))) {
      return res.status(401).json({ error: { code: "INVALID_CREDENTIALS", message: "Email ou password incorretos." } });
    }

    const token = signToken({ sub: user.id, email: user.email, role: user.role, businessId: user.businessId });

    res.cookie("marka_token", token, { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", maxAge: 24 * 60 * 60 * 1000 });
    res.json({ user: { name: user.name, email: user.email }, token });
  } catch (err) { next(err); }
});

authRouter.post("/logout", (req, res) => {
  res.clearCookie("marka_token");
  res.json({ ok: true });
});

// Alterar Email e Password
// Campos vazios ("") contam como "não alterar"
const emptyToUndefined = (v: unknown) => (typeof v === "string" && v.trim() === "" ? undefined : v);

authRouter.patch("/update-credentials", requireAuth, async (req, res, next) => {
  try {
    const schema = z.object({
      currentPassword: z.string().min(1, "Indique a password atual"),
      newEmail: z.preprocess(emptyToUndefined, z.string().trim().email("Email inválido").optional()),
      newPassword: z.preprocess(emptyToUndefined, z.string().min(6, "A nova password precisa de pelo menos 6 caracteres").optional()),
    });

    const { currentPassword, newEmail, newPassword } = schema.parse(req.body);

    const auth = (req as any).user ?? (req as any).auth;
    const userId = auth?.sub ?? auth?.id;
    if (!userId) {
      return res.status(401).json({ error: { code: "UNAUTHORIZED", message: "Sessão inválida. Faça login outra vez." } });
    }

    const user = await prisma.user.findFirst({ where: { id: userId, businessId: req.business!.id } });
    if (!user) {
      return res.status(404).json({ error: { code: "NOT_FOUND", message: "Utilizador não encontrado." } });
    }

    if (!(await verifyPassword(user.passwordHash, currentPassword))) {
      return res.status(401).json({ error: { code: "INVALID_CREDENTIALS", message: "A sua password atual está incorreta." } });
    }

    if (!newEmail && !newPassword) {
      return res.status(400).json({ error: { code: "NOTHING_TO_UPDATE", message: "Indique um novo email ou uma nova password." } });
    }

    if (newEmail && newEmail !== user.email) {
      const taken = await prisma.user.findFirst({ where: { email: newEmail, businessId: user.businessId } });
      if (taken) {
        return res.status(409).json({ error: { code: "EMAIL_IN_USE", message: "Esse email já está em uso." } });
      }
    }

    const dataToUpdate: { email?: string; passwordHash?: string } = {};
    if (newEmail) dataToUpdate.email = newEmail;
    if (newPassword) dataToUpdate.passwordHash = await hashPassword(newPassword);

    await prisma.user.update({ where: { id: user.id }, data: dataToUpdate });
    res.json({ message: "Credenciais atualizadas com sucesso!" });
  } catch (err) { next(err); }
});
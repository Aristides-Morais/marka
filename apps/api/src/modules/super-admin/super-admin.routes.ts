import { Router } from "express";
import { z } from "zod";
import { prisma } from "../../lib/prisma.js";
import { hashPassword } from "../../lib/argon.js";
import { signToken } from "../../lib/jwt.js";

export const superAdminRouter = Router();

// Middleware simples para proteger as rotas do Super Admin
const requireSuperAdmin = (req: any, res: any, next: any) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ error: "Acesso negado." });
  try {
    const decoded: any = require("jsonwebtoken").verify(token, process.env.JWT_SECRET || "secret");
    if (decoded.role !== "SUPER_ADMIN") throw new Error();
    next();
  } catch {
    res.status(401).json({ error: "Acesso negado. Token inválido." });
  }
};

// LOGIN DO SUPER ADMIN (Não precisa de tenantMiddleware)
superAdminRouter.post("/login", async (req, res) => {
  const { email, password } = req.body;
  if (email === process.env.SUPER_ADMIN_EMAIL && password === process.env.SUPER_ADMIN_PASSWORD) {
    // Gera um token especial para o criador do sistema
    const token = signToken({ sub: "super-admin", email, role: "SUPER_ADMIN", businessId: "system" });
    return res.json({ token });
  }
  res.status(401).json({ error: "Credenciais de Super Admin inválidas." });
});

// LISTAR TODOS OS NEGÓCIOS
superAdminRouter.get("/businesses", requireSuperAdmin, async (req, res, next) => {
  try {
    const businesses = await prisma.business.findMany({
      include: { _count: { select: { users: true, products: true, reservations: true } } },
      orderBy: { createdAt: "desc" }
    });
    res.json(businesses);
  } catch (err) { next(err); }
});

// ATIVAR / DESATIVAR CONTA
superAdminRouter.patch("/businesses/:id/toggle", requireSuperAdmin, async (req, res, next) => {
  try {
    const business = await prisma.business.findUnique({ where: { id: req.params.id } });
    if (!business) return res.status(404).json({ error: "Negócio não encontrado." });

    const updated = await prisma.business.update({
      where: { id: req.params.id },
      data: { active: !business.active },
    });
    res.json(updated);
  } catch (err) { next(err); }
});

// CRIAR NOVO NEGÓCIO + ADMIN
superAdminRouter.post("/businesses", requireSuperAdmin, async (req, res, next) => {
  try {
    const schema = z.object({
      name: z.string(),
      slug: z.string(),
      adminEmail: z.string().email(),
      adminPassword: z.string().min(6),
    });
    const { name, slug, adminEmail, adminPassword } = schema.parse(req.body);

    // Verificar se o slug já existe
    const existing = await prisma.business.findUnique({ where: { slug } });
    if (existing) return res.status(400).json({ error: "Este link (slug) já está em uso." });

    const passwordHash = await hashPassword(adminPassword);

    // Criar o negócio e o utilizador admin ao mesmo tempo
    const newBusiness = await prisma.business.create({
      data: {
        name,
        slug,
        primaryColor: "#1A4D2E",
        active: true,
        users: {
          create: {
            name: "Admin " + name,
            email: adminEmail,
            passwordHash,
            role: "ADMIN",
          }
        }
      }
    });

    res.status(201).json(newBusiness);
  } catch (err) { next(err); }
});
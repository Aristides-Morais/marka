import { Router } from "express";
import { z } from "zod";
import { prisma } from "../../lib/prisma.js";
import { hashPassword } from "../../lib/argon.js";
import { signToken, verifyToken } from "../../lib/jwt.js"; // <-- Importa o verifyToken correto

export const superAdminRouter = Router();

// Middleware de Segurança corrigido
const requireSuperAdmin = (req: any, res: any, next: any) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ error: "Acesso negado. Token em falta." });
  
  try {
    const decoded = verifyToken(token); // <-- Usa a tua função oficial de validação
    if (decoded.role !== "SUPER_ADMIN") throw new Error("Não é super admin");
    next();
  } catch (error) {
    res.status(401).json({ error: "Acesso negado. Token inválido ou expirado." });
  }
};

superAdminRouter.post("/login", async (req, res) => {
  const { email, password } = req.body;
  if (email === process.env.SUPER_ADMIN_EMAIL && password === process.env.SUPER_ADMIN_PASSWORD) {
    const token = signToken({ sub: "super-admin", email, role: "SUPER_ADMIN", businessId: "system" });
    return res.json({ token });
  }
  res.status(401).json({ error: "Credenciais de Super Admin inválidas." });
});

superAdminRouter.get("/businesses", requireSuperAdmin, async (req, res, next) => {
  try {
    const businesses = await prisma.business.findMany({
      include: { _count: { select: { users: true, products: true, reservations: true } } },
      orderBy: { createdAt: "desc" }
    });
    res.json(businesses);
  } catch (err) { next(err); }
});

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

superAdminRouter.post("/businesses", requireSuperAdmin, async (req, res, next) => {
  try {
    const schema = z.object({
      name: z.string(),
      slug: z.string(),
      adminEmail: z.string().email(),
      adminPassword: z.string().min(6),
    });
    const { name, slug, adminEmail, adminPassword } = schema.parse(req.body);

    const existing = await prisma.business.findUnique({ where: { slug } });
    if (existing) return res.status(400).json({ error: "Este link (slug) já está em uso." });

    const passwordHash = await hashPassword(adminPassword);

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
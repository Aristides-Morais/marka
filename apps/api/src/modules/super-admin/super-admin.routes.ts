
import { Router } from "express";
import { z } from "zod";
import { timingSafeEqual } from "node:crypto";
import { prisma } from "../../lib/prisma.js";
import { hashPassword } from "../../lib/argon.js";
import { signToken, verifyToken } from "../../lib/jwt.js";
import { env } from "../../config/env.js";

export const superAdminRouter = Router();

function safeCompare(a: string, b: string): boolean {
  const bufferA = Buffer.from(a);
  const bufferB = Buffer.from(b);

  if (bufferA.length !== bufferB.length) {
    return false;
  }

  return timingSafeEqual(bufferA, bufferB);
}

function requireSuperAdmin(req: any, res: any, next: any) {
  const authorization = req.headers.authorization;
  const token = authorization?.startsWith("Bearer ")
    ? authorization.slice(7)
    : null;

  if (!token) {
    return res.status(401).json({
      error: "Acesso negado. Token em falta."
    });
  }

  try {
    const decoded = verifyToken(token);

    if (
      decoded.role !== "SUPER_ADMIN" ||
      decoded.sub !== "super-admin" ||
      decoded.businessId !== "system"
    ) {
      return res.status(403).json({
        error: "Acesso reservado ao Super Admin."
      });
    }

    next();
  } catch {
    return res.status(401).json({
      error: "Token inválido ou expirado."
    });
  }
}

superAdminRouter.post("/login", async (req, res, next) => {
  try {
    const schema = z.object({
      email: z.string().trim().email(),
      password: z.string().min(1)
    });

    const { email, password } = schema.parse(req.body);

    if (!env.SUPER_ADMIN_EMAIL || !env.SUPER_ADMIN_PASSWORD) {
      res.status(503).json({
        error: "O acesso do Super Admin não está configurado."
      });
      return;
    }

    const validEmail = safeCompare(
      email,
      env.SUPER_ADMIN_EMAIL
    );

    const validPassword = safeCompare(
      password,
      env.SUPER_ADMIN_PASSWORD
    );

    if (!validEmail || !validPassword) {
      res.status(401).json({
        error: "Credenciais de Super Admin inválidas."
      });
      return;
    }

    const token = signToken({
      sub: "super-admin",
      email: env.SUPER_ADMIN_EMAIL,
      role: "SUPER_ADMIN",
      businessId: "system"
    });

    res.json({ token });
  } catch (err) {
    next(err);
  }
});

superAdminRouter.get(
  "/businesses",
  requireSuperAdmin,
  async (_req, res, next) => {
    try {
      const businesses = await prisma.business.findMany({
        include: {
          _count: {
            select: {
              users: true,
              products: true,
              reservations: true
            }
          }
        },
        orderBy: { createdAt: "desc" }
      });

      res.json(businesses);
    } catch (err) {
      next(err);
    }
  }
);

superAdminRouter.patch(
  "/businesses/:id/toggle",
  requireSuperAdmin,
  async (req, res, next) => {
    try {
      const business = await prisma.business.findUnique({
        where: { id: String(req.params.id) }
      });

      if (!business) {
        res.status(404).json({
          error: "Negócio não encontrado."
        });
        return;
      }

      const updated = await prisma.business.update({
        where: { id: business.id },
        data: { active: !business.active }
      });

      res.json(updated);
    } catch (err) {
      next(err);
    }
  }
);

superAdminRouter.post(
  "/businesses",
  requireSuperAdmin,
  async (req, res, next) => {
    try {
      const schema = z.object({
        name: z.string().trim().min(2),
        slug: z.string()
          .trim()
          .toLowerCase()
          .regex(
            /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
            "O slug só pode conter letras minúsculas, números e hífen."
          ),
        adminEmail: z.string().trim().email(),
        adminPassword: z.string().min(8)
      });

      const { name, slug, adminEmail, adminPassword } =
        schema.parse(req.body);

      const existing = await prisma.business.findUnique({
        where: { slug }
      });

      if (existing) {
        res.status(409).json({
          error: "Este link já está a ser utilizado."
        });
        return;
      }

      const passwordHash = await hashPassword(adminPassword);

      const newBusiness = await prisma.business.create({
        data: {
          name,
          slug,
          primaryColor: "#1A4D2E",
          active: true,
          users: {
            create: {
              name: `Admin ${name}`,
              email: adminEmail,
              passwordHash,
              role: "ADMIN"
            }
          }
        }
      });

      res.status(201).json(newBusiness);
    } catch (err) {
      next(err);
    }
  }
);

import { Router } from "express";
import { z } from "zod";
import { timingSafeEqual } from "node:crypto";
import { prisma } from "../../lib/prisma.js";
import { hashPassword } from "../../lib/argon.js";
import { signToken, verifyToken } from "../../lib/jwt.js";
import { env } from "../../config/env.js";

export const superAdminRouter = Router();

const hexColorSchema = z.string().regex(
  /^#[0-9A-Fa-f]{6}$/,
  "A cor deve estar no formato HEX, por exemplo #173B67."
);

const templateSchema = z.enum([
  "restaurante",
  "comercio",
  "beleza",
  "hotel",
  "saude",
  "imobiliario",
  "automovel",
  "educacao",
  "eventos",
  "servicos",
  "institucional",
]);

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
      error: "Acesso negado. Token em falta.",
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
        error: "Acesso reservado ao Super Admin.",
      });
    }

    next();
  } catch {
    return res.status(401).json({
      error: "Token inválido ou expirado.",
    });
  }
}

superAdminRouter.post("/login", async (req, res, next) => {
  try {
    const schema = z.object({
      email: z.string().trim().email(),
      password: z.string().min(1),
    });

    const { email, password } = schema.parse(req.body);

    if (!env.SUPER_ADMIN_EMAIL || !env.SUPER_ADMIN_PASSWORD) {
      res.status(503).json({
        error: "O acesso do Super Admin não está configurado.",
      });
      return;
    }

    const validEmail = safeCompare(email, env.SUPER_ADMIN_EMAIL);
    const validPassword = safeCompare(password, env.SUPER_ADMIN_PASSWORD);

    if (!validEmail || !validPassword) {
      res.status(401).json({
        error: "Credenciais de Super Admin inválidas.",
      });
      return;
    }

    const token = signToken({
      sub: "super-admin",
      email: env.SUPER_ADMIN_EMAIL,
      role: "SUPER_ADMIN",
      businessId: "system",
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
              reservations: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
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
      const id = String(req.params.id);

      const business = await prisma.business.findUnique({
        where: { id },
      });

      if (!business) {
        res.status(404).json({
          error: "Negócio não encontrado.",
        });
        return;
      }

      const updated = await prisma.business.update({
        where: { id: business.id },
        data: { active: !business.active },
      });

      res.json(updated);
    } catch (err) {
      next(err);
    }
  }
);

/**
 * Actualizar nome, actividade, template e cores de um negócio existente.
 * O slug e as contas de administrador não são alterados por esta rota.
 */
superAdminRouter.patch(
  "/businesses/:id",
  requireSuperAdmin,
  async (req, res, next) => {
    try {
      const schema = z.object({
        name: z.string().trim().min(2).max(120).optional(),
        type: z.string().trim().min(2).max(80).optional(),
        template: templateSchema.optional(),
        primaryColor: hexColorSchema.optional(),
        secondaryColor: hexColorSchema.optional(),
        accentColor: hexColorSchema.optional(),
      }).strict();

      const data = schema.parse(req.body);
      const id = String(req.params.id);

      const existing = await prisma.business.findUnique({
        where: { id },
      });

      if (!existing) {
        res.status(404).json({
          error: "Negócio não encontrado.",
        });
        return;
      }

      if (Object.keys(data).length === 0) {
        res.status(400).json({
          error: "Não foram enviados dados para actualizar.",
        });
        return;
      }

      const updated = await prisma.business.update({
        where: { id },
        data,
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
        name: z.string().trim().min(2).max(120),
        slug: z.string()
          .trim()
          .toLowerCase()
          .regex(
            /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
            "O slug só pode conter letras minúsculas, números e hífen."
          ),
        adminEmail: z.string().trim().email(),
        adminPassword: z.string().min(8),
        type: z.string().trim().min(2).max(80).default("loja"),
        template: templateSchema.default("comercio"),
        primaryColor: hexColorSchema.default("#173B67"),
        secondaryColor: hexColorSchema.default("#F2A900"),
        accentColor: hexColorSchema.default("#F7F9FC"),
      });

      const {
        name,
        slug,
        adminEmail,
        adminPassword,
        type,
        template,
        primaryColor,
        secondaryColor,
        accentColor,
      } = schema.parse(req.body);

      const existing = await prisma.business.findUnique({
        where: { slug },
      });

      if (existing) {
        res.status(409).json({
          error: "Este link já está a ser utilizado.",
        });
        return;
      }

      const passwordHash = await hashPassword(adminPassword);

      const newBusiness = await prisma.business.create({
        data: {
          name,
          slug,
          type,
          template,
          primaryColor,
          secondaryColor,
          accentColor,
          active: true,
          users: {
            create: {
              name: `Admin ${name}`,
              email: adminEmail,
              passwordHash,
              role: "ADMIN",
            },
          },
        },
      });

      res.status(201).json(newBusiness);
    } catch (err) {
      next(err);
    }
  }
);

/**
 * Gestão global dos conteúdos dos sites pelo Super Admin.
 * Estas rotas ficam protegidas pelo token SUPER_ADMIN.
 */

// Consultar os conteúdos de um negócio.
superAdminRouter.get(
  "/businesses/:id/site-content",
  requireSuperAdmin,
  async (req, res, next) => {
    try {
      const businessId = String(req.params.id);

      const business = await prisma.business.findUnique({
        where: { id: businessId },
        select: { id: true, name: true, slug: true },
      });

      if (!business) {
        res.status(404).json({ error: "Negócio não encontrado." });
        return;
      }

      const siteContent = await prisma.siteContent.findUnique({
        where: { businessId },
      });

      res.json({
        business,
        content: siteContent?.draft ?? {},
        isPublished: siteContent?.isPublished ?? false,
        publishedAt: siteContent?.publishedAt ?? null,
      });
    } catch (error) {
      next(error);
    }
  }
);

// Guardar o rascunho.
superAdminRouter.put(
  "/businesses/:id/site-content/draft",
  requireSuperAdmin,
  async (req, res, next) => {
    try {
      const businessId = String(req.params.id);
      const schema = z.object({
        content: z.record(z.string(), z.unknown()),
      });

      const { content } = schema.parse(req.body);

      const business = await prisma.business.findUnique({
        where: { id: businessId },
        select: { id: true },
      });

      if (!business) {
        res.status(404).json({ error: "Negócio não encontrado." });
        return;
      }

      const saved = await prisma.siteContent.upsert({
        where: { businessId },
        create: {
          businessId,
          draft: content as any,
        },
        update: {
          draft: content as any,
        },
      });

      res.json({
        message: "Rascunho guardado com sucesso.",
        content: saved.draft,
        isPublished: saved.isPublished,
      });
    } catch (error) {
      next(error);
    }
  }
);

// Publicar o rascunho.
superAdminRouter.post(
  "/businesses/:id/site-content/publish",
  requireSuperAdmin,
  async (req, res, next) => {
    try {
      const businessId = String(req.params.id);

      const current = await prisma.siteContent.findUnique({
        where: { businessId },
      });

      if (!current) {
        res.status(400).json({
          error: "Guarde primeiro os conteúdos do site.",
        });
        return;
      }

      const published = await prisma.siteContent.update({
        where: { businessId },
        data: {
          published: current.draft as any,
          isPublished: true,
          publishedAt: new Date(),
        },
      });

      res.json({
        message: "Site publicado com sucesso.",
        isPublished: published.isPublished,
        publishedAt: published.publishedAt,
      });
    } catch (error) {
      next(error);
    }
  }
);

// Retirar a publicação sem apagar o conteúdo.
superAdminRouter.post(
  "/businesses/:id/site-content/unpublish",
  requireSuperAdmin,
  async (req, res, next) => {
    try {
      const businessId = String(req.params.id);

      const result = await prisma.siteContent.updateMany({
        where: { businessId },
        data: { isPublished: false },
      });

      if (result.count === 0) {
        res.status(404).json({
          error: "Este negócio ainda não tem conteúdos guardados.",
        });
        return;
      }

      res.json({
        message: "Publicação desactivada.",
        isPublished: false,
      });
    } catch (error) {
      next(error);
    }
  }
);

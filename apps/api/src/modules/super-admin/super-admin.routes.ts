import { Router } from "express";
import { z } from "zod";
import { timingSafeEqual } from "node:crypto";
import { prisma } from "../../lib/prisma.js";
import { hashPassword } from "../../lib/argon.js";
import { signToken, verifyToken } from "../../lib/jwt.js";
import { env } from "../../config/env.js";
import rateLimit from "express-rate-limit";

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
});

export const superAdminRouter = Router();

const superAdminLoginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: {
    error: {
      code: "TOO_MANY_REQUESTS",
      message: "Demasiadas tentativas de acesso. Tente novamente mais tarde.",
    },
  },
  standardHeaders: true,
  legacyHeaders: false,
});

const hexColorSchema = z.string().regex(/^#[0-9A-Fa-f]{6}$/, "A cor deve estar no formato HEX, por exemplo #173B67.");

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

// NOVO - As 12 animações que o Super Admin pode escolher
const animationExperienceSchema = z.enum([
  "classic",
  "store-3d",
  "immersive",
  "beauty",
  "real-estate",
  "corporate",
  "color-theme",
  "drag-3d",
  "fade-up",
  "zoom-hero",
  "slide-cards",
  "parallax-forte",
]);

const animationSchema = z.object({
  enabled: z.boolean().default(true),
  experience: animationExperienceSchema.default("classic"),
  intensity: z.enum(["subtle", "normal", "bold"]).default("normal"),
  duration: z.number().min(200).max(2000).default(800),
  stagger: z.number().min(0).max(400).default(90),
  parallax: z.boolean().default(true),
  hover: z.boolean().default(true),
});

const themeSchema = z.object({
  animation: animationSchema.optional(),
}).passthrough().optional();

const DEFAULT_MODULES = ["website", "store", "booking"];

function safeCompare(a: string, b: string): boolean {
  const bufferA = Buffer.from(a);
  const bufferB = Buffer.from(b);
  if (bufferA.length !== bufferB.length) return false;
  return timingSafeEqual(bufferA, bufferB);
}

function requireSuperAdmin(req: any, res: any, next: any) {
  const authorization = req.headers.authorization;
  const token = authorization?.startsWith("Bearer ") ? authorization.slice(7) : null;
  if (!token) return res.status(401).json({ error: "Acesso negado. Token em falta." });
  try {
    const decoded = verifyToken(token);
    if (decoded.role !== "SUPER_ADMIN" || decoded.sub !== "super-admin" || decoded.businessId !== "system") {
      return res.status(403).json({ error: "Acesso reservado ao Super Admin." });
    }
    next();
  } catch {
    return res.status(401).json({ error: "Token inválido ou expirado." });
  }
}

// LOGIN DO SUPER ADMIN
superAdminRouter.post("/login", superAdminLoginLimiter, async (req, res, next) => {
  try {
    const schema = z.object({ email: z.string().trim().email(), password: z.string().min(1) });
    const { email, password } = schema.parse(req.body);
    if (!env.SUPER_ADMIN_EMAIL || !env.SUPER_ADMIN_PASSWORD) {
      res.status(503).json({ error: "O acesso do Super Admin não está configurado." });
      return;
    }
    const validEmail = safeCompare(email, env.SUPER_ADMIN_EMAIL);
    const validPassword = safeCompare(password, env.SUPER_ADMIN_PASSWORD);
    if (!validEmail || !validPassword) {
      res.status(401).json({ error: "Credenciais de Super Admin inválidas." });
      return;
    }
    const token = signToken({ sub: "super-admin", email: env.SUPER_ADMIN_EMAIL, role: "SUPER_ADMIN", businessId: "system" });
    res.json({ token });
  } catch (err) { next(err); }
});

// LISTAR NEGÓCIOS
superAdminRouter.get("/businesses", requireSuperAdmin, async (_req, res, next) => {
  try {
    const businesses = await prisma.business.findMany({
      include: { _count: { select: { users: true, products: true, reservations: true } } },
      orderBy: { createdAt: "desc" },
    });
    res.json(businesses);
  } catch (err) { next(err); }
});

// ACTIVAR OU DESACTIVAR NEGÓCIO
superAdminRouter.patch("/businesses/:id/toggle", requireSuperAdmin, async (req, res, next) => {
  try {
    const id = String(req.params.id);
    const business = await prisma.business.findUnique({ where: { id } });
    if (!business) { res.status(404).json({ error: "Negócio não encontrado." }); return; }
    const updated = await prisma.business.update({ where: { id: business.id }, data: { active: !business.active } });
    res.json(updated);
  } catch (err) { next(err); }
});

// ACTUALIZAR DADOS DO NEGÓCIO - AGORA ACEITA theme.animation
superAdminRouter.patch("/businesses/:id", requireSuperAdmin, async (req, res, next) => {
  try {
    const schema = z.object({
      name: z.string().trim().min(2).max(120).optional(),
      type: z.string().trim().min(2).max(80).optional(),
      template: templateSchema.optional(),
      primaryColor: hexColorSchema.optional(),
      secondaryColor: hexColorSchema.optional(),
      accentColor: hexColorSchema.optional(),
      theme: themeSchema,
    });

    const data = schema.parse(req.body);
    const id = String(req.params.id);
    const existing = await prisma.business.findUnique({ where: { id } });
    if (!existing) { res.status(404).json({ error: "Negócio não encontrado." }); return; }
    if (Object.keys(data).length === 0) { res.status(400).json({ error: "Não foram enviados dados para actualizar." }); return; }

    const updated = await prisma.business.update({ where: { id }, data: data as any });
    res.json(updated);
  } catch (err) { next(err); }
});

// CRIAR NEGÓCIO COM WEBSITE, LOJA E RESERVAS - AGORA ACEITA theme.animation
superAdminRouter.post("/businesses", requireSuperAdmin, async (req, res, next) => {
  try {
    const schema = z.object({
      name: z.string().trim().min(2).max(120),
      slug: z.string().trim().toLowerCase().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "O slug só pode conter letras minúsculas, números e hífen."),
      adminEmail: z.string().trim().email(),
      adminPassword: z.string().min(8),
      type: z.string().trim().min(2).max(80).default("loja"),
      template: templateSchema.default("comercio"),
      primaryColor: hexColorSchema.default("#173B67"),
      secondaryColor: hexColorSchema.default("#F2A900"),
      accentColor: hexColorSchema.default("#F7F9FC"),
      theme: themeSchema,
    });

    const { name, slug, adminEmail, adminPassword, type, template, primaryColor, secondaryColor, accentColor, theme } = schema.parse(req.body);

    const existing = await prisma.business.findUnique({ where: { slug } });
    if (existing) { res.status(409).json({ error: "Este link já está a ser utilizado." }); return; }

    const existingAdmin = await prisma.user.findFirst({ where: { email: adminEmail } });
    if (existingAdmin) { res.status(409).json({ error: "Este email já está associado a uma conta." }); return; }

    const passwordHash = await hashPassword(adminPassword);

    const initialContent = {
      heroTitle: name,
      heroSubtitle: `Bem-vindo à ${name}.`,
      buttonText: "Conhecer a loja",
      description: `Conheça a ${name} e descubra os nossos produtos e serviços.`,
      aboutTitle: `Sobre ${name}`,
      aboutText: `Conheça melhor a ${name}. Estamos aqui para lhe oferecer a melhor experiência.`,
      gallery: [],
    };

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
        theme: (theme ?? { animation: { enabled: true, experience: "classic", intensity: "normal", duration: 800, stagger: 90, parallax: true, hover: true } }) as any,
        modules: DEFAULT_MODULES,
        users: { create: { name: `Admin ${name}`, email: adminEmail, passwordHash, role: "ADMIN" } },
        siteContent: { create: { draft: initialContent as any, published: initialContent as any, isPublished: true, publishedAt: new Date() } },
      },
      include: { _count: { select: { users: true, products: true, reservations: true } } },
    });

    res.status(201).json({ message: "Negócio criado com Website, Loja e Reservas.", business: newBusiness, modules: DEFAULT_MODULES });
  } catch (err) { next(err); }
});

// CONSULTAR CONTEÚDO DO WEBSITE
superAdminRouter.get("/businesses/:id/site-content", requireSuperAdmin, async (req, res, next) => {
  try {
    const businessId = String(req.params.id);
    const business = await prisma.business.findUnique({ where: { id: businessId }, select: { id: true, name: true, slug: true } });
    if (!business) { res.status(404).json({ error: "Negócio não encontrado." }); return; }
    const siteContent = await prisma.siteContent.findUnique({ where: { businessId } });
    res.json({ business, content: siteContent?.draft ?? {}, isPublished: siteContent?.isPublished ?? false, publishedAt: siteContent?.publishedAt ?? null });
  } catch (error) { next(error); }
});

// GUARDAR RASCUNHO
superAdminRouter.put("/businesses/:id/site-content/draft", requireSuperAdmin, async (req, res, next) => {
  try {
    const businessId = String(req.params.id);
    const schema = z.object({ content: z.record(z.string(), z.unknown()) });
    const { content } = schema.parse(req.body);
    const business = await prisma.business.findUnique({ where: { id: businessId }, select: { id: true } });
    if (!business) { res.status(404).json({ error: "Negócio não encontrado." }); return; }
    const saved = await prisma.siteContent.upsert({ where: { businessId }, create: { businessId, draft: content as any }, update: { draft: content as any } });
    res.json({ message: "Rascunho guardado com sucesso.", content: saved.draft, isPublished: saved.isPublished });
  } catch (error) { next(error); }
});

// PUBLICAR WEBSITE
superAdminRouter.post("/businesses/:id/site-content/publish", requireSuperAdmin, async (req, res, next) => {
  try {
    const businessId = String(req.params.id);
    const current = await prisma.siteContent.findUnique({ where: { businessId } });
    if (!current) { res.status(400).json({ error: "Guarde primeiro os conteúdos do site." }); return; }
    const published = await prisma.siteContent.update({ where: { businessId }, data: { published: current.draft as any, isPublished: true, publishedAt: new Date() } });
    res.json({ message: "Site publicado com sucesso.", isPublished: published.isPublished, publishedAt: published.publishedAt });
  } catch (error) { next(error); }
});

// RETIRAR PUBLICAÇÃO SEM APAGAR CONTEÚDO
superAdminRouter.post("/businesses/:id/site-content/unpublish", requireSuperAdmin, async (req, res, next) => {
  try {
    const businessId = String(req.params.id);
    const result = await prisma.siteContent.updateMany({ where: { businessId }, data: { isPublished: false } });
    if (result.count === 0) { res.status(404).json({ error: "Este negócio ainda não tem conteúdos guardados." }); return; }
    res.json({ message: "Publicação desactivada.", isPublished: false });
  } catch (error) { next(error); }
});

import { Router } from "express";
import { z } from "zod";
import { prisma } from "../../lib/prisma.js";
import { requireAuth } from "../../middleware/auth.middleware.js";

export const siteContentRouter = Router();

const contentSchema = z.record(z.string(), z.unknown());

const bodySchema = z.object({
  content: contentSchema,
});

// Conteúdo público: só devolve a versão publicada.
siteContentRouter.get("/", async (req, res, next) => {
  try {
    const content = await prisma.siteContent.findUnique({
      where: { businessId: req.business!.id },
      select: {
        published: true,
        isPublished: true,
        publishedAt: true,
      },
    });

    if (!content || !content.isPublished) {
      res.json({
        isPublished: false,
        content: null,
      });
      return;
    }

    res.json({
      isPublished: true,
      content: content.published,
      publishedAt: content.publishedAt,
    });
  } catch (error) {
    next(error);
  }
});

// Consulta o rascunho: apenas o administrador do negócio.
siteContentRouter.get("/draft", requireAuth, async (req, res, next) => {
  try {
    const content = await prisma.siteContent.findUnique({
      where: { businessId: req.business!.id },
    });

    res.json({
      content: content?.draft ?? {},
      isPublished: content?.isPublished ?? false,
      publishedAt: content?.publishedAt ?? null,
    });
  } catch (error) {
    next(error);
  }
});

// Guarda alterações sem as publicar.
siteContentRouter.put("/draft", requireAuth, async (req, res, next) => {
  try {
    const { content } = bodySchema.parse(req.body);

    const saved = await prisma.siteContent.upsert({
      where: { businessId: req.business!.id },
      create: {
        businessId: req.business!.id,
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
});

// Publica o rascunho actual.
siteContentRouter.post("/publish", requireAuth, async (req, res, next) => {
  try {
    const current = await prisma.siteContent.findUnique({
      where: { businessId: req.business!.id },
    });

    if (!current) {
      res.status(400).json({
        error: { message: "Guarde primeiro os conteúdos do site." },
      });
      return;
    }

    const published = await prisma.siteContent.update({
      where: { businessId: req.business!.id },
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
});

// Retira o site do estado publicado, sem apagar os conteúdos.
siteContentRouter.post("/unpublish", requireAuth, async (req, res, next) => {
  try {
    await prisma.siteContent.update({
      where: { businessId: req.business!.id },
      data: {
        isPublished: false,
      },
    });

    res.json({
      message: "Publicação desactivada.",
      isPublished: false,
    });
  } catch (error) {
    next(error);
  }
});

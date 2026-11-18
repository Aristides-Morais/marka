import { Request, Response, NextFunction } from "express";
import { prisma } from "../lib/prisma.js"; // ← ajusta este caminho se o teu prisma estiver noutro sítio

export async function identifyBusiness(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    // Pega o slug da URL (ex: /api/sara/services → "sara")
    const slug = req.params.slug;

    if (!slug) {
      return res.status(400).json({
        error: "Slug do negócio não foi informado",
      });
    }

    const business = await prisma.business.findUnique({
      where: {
        slug: slug.toLowerCase(),
      },
    });

    if (!business) {
      return res.status(404).json({
        error: "Negócio não encontrado",
      });
    }

    if (!business.active) {
      return res.status(403).json({
        error: "Este negócio está desativado",
      });
    }

    // Guarda o negócio no request para usar depois nas rotas
    (req as any).business = business;

    next();
  } catch (error) {
    console.error("Erro no middleware identifyBusiness:", error);
    return res.status(500).json({
      error: "Erro interno ao identificar o negócio",
    });
  }
}
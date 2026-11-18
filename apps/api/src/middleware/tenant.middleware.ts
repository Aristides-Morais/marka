import { Request, Response, NextFunction } from "express";
import { prisma } from "../lib/prisma.js"; // <--- AQUI ESTÁ A CORREÇÃO (Usa o teu lib/prisma)

export async function tenantMiddleware(req: Request, res: Response, next: NextFunction) {
  try {
    // 1. O frontend envia o slug no header (ex: 'x-business-slug': 'sara')
    const slug = req.headers["x-business-slug"] as string;

    if (!slug) {
      return res.status(400).json({ error: "Negócio não especificado (x-business-slug ausente)." });
    }

    // 2. Procurar o negócio no banco de dados
    const business = await prisma.business.findUnique({
      where: { slug },
    });

    if (!business) {
      return res.status(404).json({ error: "Negócio não encontrado." });
    }

    if (!business.active) {
      return res.status(403).json({ error: "Este negócio está inativo." });
    }

    // 3. INJEÇÃO SEGURA: Anexar o negócio à requisição
    req.business = business;

    // 4. Seguir para a rota
    next();
  } catch (error) {
    console.error("Erro no Tenant Middleware:", error);
    return res.status(500).json({ error: "Erro interno ao validar o negócio." });
  }
}
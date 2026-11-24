import { Request, Response, NextFunction } from "express";
import { prisma } from "../lib/prisma.js";

type ModuleName = "website" | "store" | "booking";

function normalizeModules(value: unknown): ModuleName[] {
  if (!Array.isArray(value)) {
    return ["website", "store", "booking"];
  }

  const normalized = value
    .filter((item): item is string => typeof item === "string")
    .map((item) => item.trim().toLowerCase())
    .map((item) => {
      if (item === "site") return "website";
      if (item === "loja") return "store";
      if (item === "reservas" || item === "reservation") return "booking";
      return item;
    })
    .filter(
      (item): item is ModuleName =>
        item === "website" || item === "store" || item === "booking"
    );

  // Compatibilidade com negócios antigos que tinham o valor
  // ["Website"] como valor predefinido do Prisma.
  if (
    normalized.length === 1 &&
    normalized[0] === "website" &&
    value.length === 1 &&
    String(value[0]).toLowerCase() === "website"
  ) {
    return ["website", "store", "booking"];
  }

  return [...new Set(normalized)];
}

function getRequiredModule(url: string): ModuleName | null {
  const pathname = url.split("?")[0];

  if (/^\/api\/v1\/business\/info\/?$/.test(pathname)) {
    return "website";
  }

  if (/^\/api\/v1\/site-content(\/|$)/.test(pathname)) {
    return "website";
  }

  if (/^\/api\/v1\/(products|orders)(\/|$)/.test(pathname)) {
    return "store";
  }

  if (/^\/api\/v1\/reservations(\/|$)/.test(pathname)) {
    return "booking";
  }

  return null;
}

export async function tenantMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const slugHeader = req.headers["x-business-slug"];
    const slug = Array.isArray(slugHeader)
      ? slugHeader[0]
      : slugHeader;

    if (!slug) {
      return res.status(400).json({
        error: "Negócio não especificado (x-business-slug ausente).",
      });
    }

    const business = await prisma.business.findUnique({
      where: { slug },
    });

    if (!business) {
      return res.status(404).json({
        error: "Negócio não encontrado.",
      });
    }

    if (!business.active) {
      return res.status(403).json({
        error: "Este negócio está inactivo.",
      });
    }

    const modules = normalizeModules(business.modules);
    const requiredModule = getRequiredModule(req.originalUrl);

    if (requiredModule && !modules.includes(requiredModule)) {
      return res.status(403).json({
        error: {
          code: "MODULE_DISABLED",
          message: "Esta funcionalidade não está activa neste negócio.",
          module: requiredModule,
        },
      });
    }

    req.business = business;
    return next();
  } catch (error) {
    console.error("Erro no Tenant Middleware:", error);

    return res.status(500).json({
      error: "Erro interno ao validar o negócio.",
    });
  }
}
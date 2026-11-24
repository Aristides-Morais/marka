import { Router } from "express";
import { z } from "zod";
import { prisma } from "../../lib/prisma.js";
import { verifyToken } from "../../lib/jwt.js";

export const businessModulesRouter = Router();

function requireSuperAdmin(req: any, res: any, next: any) {
  const authorization = req.headers.authorization;
  const token = authorization?.startsWith("Bearer ")
    ? authorization.slice(7)
    : null;

  if (!token) {
    return res.status(401).json({ error: "Token em falta." });
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

    return next();
  } catch {
    return res.status(401).json({
      error: "Token inválido ou expirado.",
    });
  }
}

businessModulesRouter.patch(
  "/businesses/:id/modules",
  requireSuperAdmin,
  async (req, res, next) => {
    try {
      const schema = z.object({
        modules: z.array(
          z.enum(["website", "store", "booking"])
        ).max(3),
      }).strict();

      const { modules } = schema.parse(req.body);
      const uniqueModules = [...new Set(modules)];
      const id = String(req.params.id);

      const existing = await prisma.business.findUnique({
        where: { id },
        select: { id: true },
      });

      if (!existing) {
        return res.status(404).json({
          error: "Negócio não encontrado.",
        });
      }

      const updated = await prisma.business.update({
        where: { id },
        data: { modules: uniqueModules },
        select: {
          id: true,
          name: true,
          slug: true,
          modules: true,
        },
      });

      return res.json({
        message: "Módulos actualizados com sucesso.",
        business: updated,
      });
    } catch (error) {
      return next(error);
    }
  }
);
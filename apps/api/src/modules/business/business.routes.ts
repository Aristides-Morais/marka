import { Router } from "express";
import { z } from "zod";
import { prisma } from "../../lib/prisma.js";
import { requireAuth } from "../../middleware/auth.middleware.js";

export const businessRouter = Router();

businessRouter.get("/info", (req, res) => {
  res.json({
    name: req.business!.name,
    logoUrl: req.business!.logoUrl,
    primaryColor: req.business!.primaryColor,
    phone: req.business!.phone,
    iban: req.business!.iban,
    expressNumber: req.business!.expressNumber,
  });
});

businessRouter.patch("/info", requireAuth, async (req, res, next) => {
  try {
    const schema = z.object({
      name: z.string().min(2),
      logoUrl: z.string().nullable().optional(),
      primaryColor: z.string().regex(/^#[0-9A-F]{6}$/i, "Cor inválida"),
      phone: z.string().nullable().optional(),
      iban: z.string().nullable().optional(),
      expressNumber: z.string().nullable().optional(),
    });
    const data = schema.parse(req.body);

    const updated = await prisma.business.update({
      where: { id: req.business!.id },
      data: {
        name: data.name,
        logoUrl: data.logoUrl || null,
        primaryColor: data.primaryColor,
        phone: data.phone || null,
        iban: data.iban || null,
        expressNumber: data.expressNumber || null,
      },
    });
    res.json(updated);
  } catch (err) {
    next(err);
  }
});
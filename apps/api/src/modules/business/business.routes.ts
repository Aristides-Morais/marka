import { Router } from "express";
import { z } from "zod";
import { prisma } from "../../lib/prisma.js";
import { requireAuth } from "../../middleware/auth.middleware.js";

export const businessRouter = Router();

businessRouter.get("/info", (req, res) => {
  const b = req.business as any;
  res.json({
    name: b.name,
    logoUrl: b.logoUrl,
    primaryColor: b.primaryColor,
    phone: b.phone,
    iban: b.iban,
    expressNumber: b.expressNumber,
    bankName: b.bankName ?? null,
    feedbackPhone: b.feedbackPhone ?? null,
    storeBgColor: b.storeBgColor ?? null,
    storeBgImage: b.storeBgImage ?? null,
    bookingBgColor: b.bookingBgColor ?? null,
    bookingBgImage: b.bookingBgImage ?? null,
  });
});

const hex = z.string().regex(/^#[0-9A-F]{6}$/i, "Cor inválida");
const optText = z.string().nullable().optional();

businessRouter.patch("/info", requireAuth, async (req, res, next) => {
  try {
    const schema = z.object({
      name: z.string().min(2),
      logoUrl: optText,
      primaryColor: hex,
      phone: optText,
      iban: optText,
      expressNumber: optText,
      bankName: optText,
      feedbackPhone: optText,
      storeBgColor: hex.nullable().optional().or(z.literal("")),
      storeBgImage: optText,
      bookingBgColor: hex.nullable().optional().or(z.literal("")),
      bookingBgImage: optText,
    });
    const data = schema.parse(req.body);

    // undefined = não mexe; vazio = limpa
    const val = (v: string | null | undefined) => (v === undefined ? undefined : v || null);

    const updated = await prisma.business.update({
      where: { id: req.business!.id },
      data: {
        name: data.name,
        primaryColor: data.primaryColor,
        logoUrl: val(data.logoUrl),
        phone: val(data.phone),
        iban: val(data.iban),
        expressNumber: val(data.expressNumber),
        bankName: val(data.bankName),
        feedbackPhone: val(data.feedbackPhone),
        storeBgColor: val(data.storeBgColor),
        storeBgImage: val(data.storeBgImage),
        bookingBgColor: val(data.bookingBgColor),
        bookingBgImage: val(data.bookingBgImage),
      },
    });
    res.json(updated);
  } catch (err) {
    next(err);
  }
});
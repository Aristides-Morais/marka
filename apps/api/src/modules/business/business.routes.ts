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
    address: b.address ?? null,
    storeBgColor: b.storeBgColor ?? null,
    storeBgImage: b.storeBgImage ?? null,
    storeHeroTitle: b.storeHeroTitle ?? null,
    storeHeroSubtitle: b.storeHeroSubtitle ?? null,
    storeHeroImage: b.storeHeroImage ?? null,
    bookingBgColor: b.bookingBgColor ?? null,
    bookingBgImage: b.bookingBgImage ?? null,
    fontFamily: b.fontFamily ?? null,
    heroTitle: b.heroTitle ?? null,
    heroSubtitle: b.heroSubtitle ?? null,
    mapsUrl: b.mapsUrl ?? null,
    links: Array.isArray(b.links) ? b.links : [],
  });
});

const hex = z.string().regex(/^#[0-9A-F]{6}$/i, "Cor inválida");
const txt = z.string().nullable().optional();
const linksSchema = z
  .array(z.object({ label: z.string().trim().min(1).max(30), url: z.string().trim().min(1).max(500) }))
  .max(12);

businessRouter.patch("/info", requireAuth, async (req, res, next) => {
  try {
    const schema = z.object({
      name: z.string().min(2).optional(),
      primaryColor: hex.optional(),
      logoUrl: txt,
      phone: txt,
      iban: txt,
      expressNumber: txt,
      bankName: txt,
      feedbackPhone: txt,
      address: txt,
      storeBgColor: hex.nullable().optional().or(z.literal("")),
      storeBgImage: txt,
      storeHeroTitle: txt,
      storeHeroSubtitle: txt,
      storeHeroImage: txt,
      bookingBgColor: hex.nullable().optional().or(z.literal("")),
      bookingBgImage: txt,
      fontFamily: txt,
      heroTitle: txt,
      heroSubtitle: txt,
      mapsUrl: txt,
      links: linksSchema.nullable().optional(),
    });
    const data = schema.parse(req.body);

    // Perfil: "" limpa o campo
    const val = (v: string | null | undefined) => (v === undefined ? undefined : v || null);
    // Aparência: undefined ignora, ""/null limpa
    const theme = (v: string | null | undefined) => (v === undefined ? undefined : v || null);

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
        address: val(data.address),
        storeBgColor: theme(data.storeBgColor),
        storeBgImage: theme(data.storeBgImage),
        storeHeroTitle: theme(data.storeHeroTitle),
        storeHeroSubtitle: theme(data.storeHeroSubtitle),
        storeHeroImage: theme(data.storeHeroImage),
        bookingBgColor: theme(data.bookingBgColor),
        bookingBgImage: theme(data.bookingBgImage),
        fontFamily: theme(data.fontFamily),
        heroTitle: theme(data.heroTitle),
        heroSubtitle: theme(data.heroSubtitle),
        mapsUrl: theme(data.mapsUrl),
        links: data.links === undefined ? undefined : data.links ?? [],
      },
    });
    res.json(updated);
  } catch (err) {
    next(err);
  }
});
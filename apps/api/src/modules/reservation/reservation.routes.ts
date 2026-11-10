import { Router } from "express";
import { z } from "zod";
import { prisma } from "../../lib/prisma.js";
import { requireAuth } from "../../middleware/auth.middleware.js";
import { createReservationSchema, createServiceSchema } from "./reservation.schemas.js";
import { createReservation, createService, getReservations, listServices } from "./reservation.service.js";

export const reservationRouter = Router();

reservationRouter.get("/hours", async (req, res, next) => {
  try {
    const admin = await prisma.user.findFirst();
    res.json({ openTime: admin?.openTime || "08:00", closeTime: admin?.closeTime || "18:00" });
  } catch (err) { next(err); }
});

reservationRouter.patch("/hours", requireAuth, async (req, res, next) => {
  try {
    const schema = z.object({
      openTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/),
      closeTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/),
    });
    const { openTime, closeTime } = schema.parse(req.body);
    const admin = await prisma.user.findFirst();
    const updated = await prisma.user.update({ where: { id: admin!.id }, data: { openTime, closeTime } });
    res.json({ openTime: updated.openTime, closeTime: updated.closeTime });
  } catch (err) { next(err); }
});

reservationRouter.get("/services", async (req, res, next) => {
  try { res.json(await listServices()); } catch (err) { next(err); }
});

reservationRouter.post("/services", requireAuth, async (req, res, next) => {
  try {
    const input = createServiceSchema.parse(req.body);
    res.status(201).json(await createService(input));
  } catch (err) { next(err); }
});

// NOVO: Apagar serviço
reservationRouter.delete("/services/:id", requireAuth, async (req, res, next) => {
  try {
    await prisma.service.update({ where: { id: req.params.id }, data: { active: false } });
    res.status(204).send();
  } catch (err) { next(err); }
});

reservationRouter.get("/", requireAuth, async (req, res, next) => {
  try { res.json(await getReservations(req.query.date as string | undefined)); } catch (err) { next(err); }
});

reservationRouter.post("/", async (req, res, next) => {
  try {
    const input = createReservationSchema.parse(req.body);
    res.status(201).json(await createReservation(input));
  } catch (err) { next(err); }
});

// NOVO: Cancelar reserva
reservationRouter.patch("/:id/cancel", requireAuth, async (req, res, next) => {
  try {
    await prisma.reservation.update({ where: { id: req.params.id }, data: { status: "CANCELLED" } });
    res.json({ ok: true });
  } catch (err) { next(err); }
});
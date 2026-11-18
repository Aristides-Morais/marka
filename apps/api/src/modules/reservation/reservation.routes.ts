import { Router } from "express";
import { z } from "zod";
import { prisma } from "../../lib/prisma.js";
import { requireAuth } from "../../middleware/auth.middleware.js";
import { createReservationSchema, createServiceSchema } from "./reservation.schemas.js";
import { createReservation, createService, getReservations, listServices } from "./reservation.service.js";

export const reservationRouter = Router();

// Rota de Horas (Pública)
reservationRouter.get("/hours", async (req, res, next) => {
  try {
    // Usamos o negócio injetado pelo middleware!
    if (!req.business) return res.status(400).json({ error: "Negócio não encontrado" });
    res.json({ openTime: req.business.openTime, closeTime: req.business.closeTime });
  } catch (err) { next(err); }
});

// Rota de Serviços (Pública)
reservationRouter.get("/services", async (req, res, next) => {
  try { 
    // O listServices precisa de receber o ID do negócio
    res.json(await listServices(req.business!.id)); 
  } catch (err) { next(err); }
});

// Criar Reserva (Pública)
reservationRouter.post("/", async (req, res, next) => {
  try {
    const input = createReservationSchema.parse(req.body);
    // A reserva precisa de saber a que negócio pertence
    res.status(201).json(await createReservation(input, req.business!.id));
  } catch (err) { next(err); }
});

// --- ROTAS PROTEGIDAS (Admin) ---

reservationRouter.post("/services", requireAuth, async (req, res, next) => {
  try {
    const input = createServiceSchema.parse(req.body);
    // O serviço criado vai para o negócio do admin logado
    res.status(201).json(await createService(input, req.business!.id));
  } catch (err) { next(err); }
});

reservationRouter.delete("/services/:id", requireAuth, async (req, res, next) => {
  try {
    // Apaga apenas se o serviço pertencer ao negócio!
    await prisma.service.update({ 
      where: { id: req.params.id, businessId: req.business!.id }, 
      data: { active: false } 
    });
    res.status(204).send();
  } catch (err) { next(err); }
});

reservationRouter.get("/", requireAuth, async (req, res, next) => {
  try { 
    res.json(await getReservations(req.query.date as string | undefined, req.business!.id)); 
  } catch (err) { next(err); }
});

reservationRouter.patch("/:id/cancel", requireAuth, async (req, res, next) => {
  try {
    await prisma.reservation.update({ 
      where: { id: req.params.id, businessId: req.business!.id }, 
      data: { status: "CANCELLED" } 
    });
    res.json({ ok: true });
  } catch (err) { next(err); }
});
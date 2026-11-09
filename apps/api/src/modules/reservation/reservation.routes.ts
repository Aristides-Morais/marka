import { Router } from "express";
import { createReservationSchema, createServiceSchema } from "./reservation.schemas.js";
import { cancelReservation, createReservation, createService, getReservations, listServices } from "./reservation.service.js";
import { requireAuth } from "../../middleware/auth.middleware.js";
import { reservationLimiter } from "../../middleware/rateLimit.middleware.js"; // <-- NOVO

export const reservationRouter = Router();

// --- ROTAS PÚBLICAS (Clientes) ---
reservationRouter.get("/services", async (req, res, next) => {
  try { res.json(await listServices()); } catch (err) { next(err); }
});

// Criação de reserva (Com Rate Limiting para evitar bots)
reservationRouter.post("/", reservationLimiter, async (req, res, next) => { // <-- NOVO: reservationLimiter
  try {
    const input = createReservationSchema.parse(req.body);
    res.status(201).json(await createReservation(input));
  } catch (err) { next(err); }
});

// --- ROTAS PRIVADAS (Admin) ---
reservationRouter.get("/", requireAuth, async (req, res, next) => {
  try { res.json(await getReservations(req.query.date as string | undefined)); } catch (err) { next(err); }
});

reservationRouter.post("/services", requireAuth, async (req, res, next) => {
  try {
    const input = createServiceSchema.parse(req.body);
    res.status(201).json(await createService(input));
  } catch (err) { next(err); }
});

reservationRouter.patch("/:id/cancel", requireAuth, async (req, res, next) => {
  try { res.json(await cancelReservation(req.params.id)); } catch (err) { next(err); }
});
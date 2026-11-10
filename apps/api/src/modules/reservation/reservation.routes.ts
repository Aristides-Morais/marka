import { Router } from "express";
import { z } from "zod";
import { prisma } from "../../lib/prisma.js";
import { requireAuth } from "../../middleware/auth.middleware.js";
// ... (resto dos imports)

export const reservationRouter = Router();

// Rota pública para o frontend saber o horário de funcionamento
reservationRouter.get("/hours", async (req, res, next) => {
  try {
    const admin = await prisma.user.findFirst();
    res.json({ openTime: admin?.openTime || "08:00", closeTime: admin?.closeTime || "18:00" });
  } catch (err) { next(err); }
});

// Rota privada para atualizar o horário
reservationRouter.patch("/hours", requireAuth, async (req, res, next) => {
  try {
    const schema = z.object({
      openTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/),
      closeTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/),
    });
    const { openTime, closeTime } = schema.parse(req.body);
    
    const admin = await prisma.user.findFirst();
    if (!admin) throw new Error("Admin não encontrado");

    const updated = await prisma.user.update({
      where: { id: admin.id },
      data: { openTime, closeTime },
    });

    res.json({ openTime: updated.openTime, closeTime: updated.closeTime });
  } catch (err) { next(err); }
});

// ... (as rotas de serviços e reservas que já tinhas mantêm-se abaixo)
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
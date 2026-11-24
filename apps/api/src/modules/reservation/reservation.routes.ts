import { Router } from "express";
import { z } from "zod";
import { prisma } from "../../lib/prisma.js";
import { requireAuth } from "../../middleware/auth.middleware.js";
import { createReservationSchema, createServiceSchema } from "./reservation.schemas.js";
import {
  BookingError,
  createReservation,
  createService,
  getBusySlots,
  getReservations,
  listServices,
  setReservationStatus,
} from "./reservation.service.js";

export const reservationRouter = Router();

// Horário de funcionamento (público)
reservationRouter.get("/hours", async (req, res, next) => {
  try {
    if (!req.business) return res.status(400).json({ error: { message: "Negócio não encontrado" } });
    res.json({ openTime: req.business.openTime, closeTime: req.business.closeTime });
  } catch (err) {
    next(err);
  }
});

// Serviços (público)
reservationRouter.get("/services", async (req, res, next) => {
  try {
    res.json(await listServices(req.business!.id));
  } catch (err) {
    next(err);
  }
});

// Horários ocupados num dia (público)
reservationRouter.get("/busy", async (req, res, next) => {
  try {
    const date = z.string().regex(/^\d{4}-\d{2}-\d{2}$/).parse(req.query.date);
    res.json(await getBusySlots(date, req.business!.id));
  } catch (err) {
    next(err);
  }
});

// Criar reserva (público)
reservationRouter.post("/", async (req, res, next) => {
  try {
    const input = createReservationSchema.parse(req.body);
    res.status(201).json(await createReservation(input, req.business!.id));
  } catch (err) {
    if (err instanceof BookingError) {
      return res.status(err.status).json({ error: { code: err.code, message: err.message } });
    }
    next(err);
  }
});

// --- ROTAS PROTEGIDAS (Admin) ---

reservationRouter.patch("/hours", requireAuth, async (req, res, next) => {
  try {
    const schema = z.object({
      openTime: z.string().regex(
        /^(?:[01]\d|2[0-3]):[0-5]\d$/,
        "Hora de abertura inválida."
      ),
      closeTime: z.string().regex(
        /^(?:[01]\d|2[0-3]):[0-5]\d$/,
        "Hora de fecho inválida."
      ),
    }).strict();

    const { openTime, closeTime } = schema.parse(req.body);

    const toMinutes = (value: string) => {
      const [hours, minutes] = value.split(":").map(Number);
      return hours * 60 + minutes;
    };

    if (toMinutes(closeTime) <= toMinutes(openTime)) {
      res.status(400).json({
        error: {
          code: "INVALID_BUSINESS_HOURS",
          message: "A hora de fecho deve ser posterior à hora de abertura.",
        },
      });
      return;
    }

    await prisma.business.update({
      where: { id: req.business!.id },
      data: { openTime, closeTime },
    });

    res.json({ openTime, closeTime });
  } catch (err) {
    next(err);
  }
});

reservationRouter.post("/services", requireAuth, async (req, res, next) => {
  try {
    const input = createServiceSchema.parse(req.body);
    res.status(201).json(await createService(input, req.business!.id));
  } catch (err) {
    next(err);
  }
});

reservationRouter.delete("/services/:id", requireAuth, async (req, res, next) => {
  try {
    await prisma.service.updateMany({
      where: { id: String(req.params.id), businessId: req.business!.id },
      data: { active: false },
    });
    res.status(204).send();
  } catch (err) {
    next(err);
  }
});

reservationRouter.get("/", requireAuth, async (req, res, next) => {
  try {
    res.json(await getReservations(req.query.date as string | undefined, req.business!.id));
  } catch (err) {
    next(err);
  }
});

// Marcar como Feita ou voltar a Pendente
reservationRouter.patch("/:id/status", requireAuth, async (req, res, next) => {
  try {
    const { status } = z.object({ status: z.enum(["PENDING", "DONE"]) }).parse(req.body);
    const count = await setReservationStatus(String(req.params.id), req.business!.id, status);
    if (count === 0) return res.status(404).json({ error: { message: "Reserva não encontrada" } });
    res.json({ ok: true, status });
  } catch (err) {
    next(err);
  }
});


reservationRouter.patch("/:id/cancel", requireAuth, async (req, res, next) => {
  try {
    const result = await prisma.reservation.updateMany({
      where: {
        id: String(req.params.id),
        businessId: req.business!.id,
        status: { not: "CANCELLED" },
      },
      data: { status: "CANCELLED" },
    });

    if (result.count === 0) {
      res.status(404).json({
        error: {
          code: "RESERVATION_NOT_FOUND",
          message: "Reserva não encontrada ou já cancelada.",
        },
      });
      return;
    }

    res.json({ ok: true, status: "CANCELLED" });
  } catch (err) {
    next(err);
  }
});

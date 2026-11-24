
import { z } from "zod";

export const createServiceSchema = z.object({
  name: z.string().trim().min(2).max(120),
  durationMin: z.number().int().min(5).max(720),
  price: z.number().min(0),
}).strict();

export const createReservationSchema = z.object({
  serviceId: z.string().trim().min(1).max(100),
  clientName: z.string().trim().min(2).max(120),
  clientPhone: z.string().trim().min(6).max(30),
  startTime: z.string().datetime({ offset: true }),
  notes: z.string().trim().max(1000).optional(),
}).strict();

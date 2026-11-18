import { z } from "zod";

export const createServiceSchema = z.object({
  name: z.string(),
  durationMin: z.number().int().positive(),
  price: z.number().positive(),
});

export const createReservationSchema = z.object({
  serviceId: z.string(),
  clientName: z.string(),
  clientPhone: z.string(),
  startTime: z.string(),
  notes: z.string().optional(), // <--- ADICIONADO AQUI
});
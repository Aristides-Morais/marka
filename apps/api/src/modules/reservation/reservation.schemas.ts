import { z } from "zod";

export const createServiceSchema = z.object({
  name: z.string().trim().min(2, "Nome muito curto").max(100),
  durationMin: z.coerce.number().int().min(5, "Mínimo 5 min").max(480, "Máximo 8 horas"),
  price: z.coerce.number().min(0, "Preço inválido"),
});

export const createReservationSchema = z.object({
  serviceId: z.string().min(1),
  clientName: z.string().trim().min(2, "Nome do cliente muito curto"),
  clientPhone: z.string().trim().min(9, "Telefone inválido"),
  startTime: z.string().datetime("Data/hora inválida"),
});

export type CreateServiceInput = z.infer<typeof createServiceSchema>;
export type CreateReservationInput = z.infer<typeof createReservationSchema>;
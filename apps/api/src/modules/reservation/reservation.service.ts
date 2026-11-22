import { prisma } from "../../lib/prisma.js";
import { createReservationSchema, createServiceSchema } from "./reservation.schemas.js";
import { z } from "zod";

type CreateServiceInput = z.infer<typeof createServiceSchema>;
type CreateReservationInput = z.infer<typeof createReservationSchema>;

// Angola = UTC+1. As horas são guardadas como o cliente as escolheu (em UTC).
const TZ_OFFSET_MIN = 60;

export class BookingError extends Error {
  status: number;
  code: string;
  constructor(status: number, code: string, message: string) {
    super(message);
    this.status = status;
    this.code = code;
  }
}

function toMinutes(hhmm: string) {
  const [h, m] = hhmm.split(":").map(Number);
  return h * 60 + (m || 0);
}

export async function listServices(businessId: string) {
  return prisma.service.findMany({
    where: { businessId, active: true },
    orderBy: { createdAt: "asc" },
  });
}

export async function createService(input: CreateServiceInput, businessId: string) {
  return prisma.service.create({
    data: { ...input, businessId },
  });
}

export async function getReservations(date: string | undefined, businessId: string) {
  const whereClause: any = { businessId };

  if (date) {
    whereClause.startTime = {
      gte: new Date(`${date}T00:00:00.000Z`),
      lte: new Date(`${date}T23:59:59.999Z`),
    };
  }

  return prisma.reservation.findMany({
    where: whereClause,
    include: { service: true },
    orderBy: { startTime: "asc" },
  });
}

// Horários já ocupados num dia (público, só devolve horas, sem dados de clientes)
export async function getBusySlots(date: string, businessId: string) {
  const rows = await prisma.reservation.findMany({
    where: {
      businessId,
      status: { not: "CANCELLED" },
      startTime: {
        gte: new Date(`${date}T00:00:00.000Z`),
        lte: new Date(`${date}T23:59:59.999Z`),
      },
    },
    select: { startTime: true, endTime: true },
    orderBy: { startTime: "asc" },
  });
  return rows.map((r) => ({
    start: r.startTime.toISOString().slice(11, 16),
    end: r.endTime.toISOString().slice(11, 16),
  }));
}

export async function createReservation(input: CreateReservationInput, businessId: string) {
  const [service, business] = await Promise.all([
    prisma.service.findFirst({ where: { id: input.serviceId, businessId, active: true } }),
    prisma.business.findUnique({ where: { id: businessId }, select: { openTime: true, closeTime: true } }),
  ]);

  if (!service || !business) {
    throw new BookingError(404, "SERVICE_NOT_FOUND", "Serviço não encontrado ou inativo neste negócio.");
  }

  const startTime = new Date(input.startTime);
  if (isNaN(startTime.getTime())) {
    throw new BookingError(400, "INVALID_DATE", "Data ou hora inválida.");
  }
  const endTime = new Date(startTime.getTime() + service.durationMin * 60000);

  const startMin = startTime.getUTCHours() * 60 + startTime.getUTCMinutes();
  const endMin = startMin + service.durationMin;
  if (startMin < toMinutes(business.openTime) || endMin > toMinutes(business.closeTime)) {
    throw new BookingError(
      400,
      "OUTSIDE_HOURS",
      `Fora do horário de funcionamento (${business.openTime} às ${business.closeTime}).`
    );
  }

  if (startTime.getTime() < Date.now() + TZ_OFFSET_MIN * 60000) {
    throw new BookingError(400, "PAST_TIME", "Essa hora já passou. Escolha outra.");
  }

  return prisma.$transaction(async (tx) => {
    // Só um pedido de cada vez por negócio, para não haver duas reservas à mesma hora
    await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtext(${businessId}))`;

    const conflict = await tx.reservation.findFirst({
      where: {
        businessId,
        status: { not: "CANCELLED" },
        startTime: { lt: endTime },
        endTime: { gt: startTime },
      },
    });
    if (conflict) {
      throw new BookingError(409, "SLOT_TAKEN", "Esse horário já está reservado. Escolha outro horário.");
    }

    return tx.reservation.create({
      data: {
        clientName: input.clientName,
        clientPhone: input.clientPhone,
        startTime,
        endTime,
        notes: input.notes,
        status: "PENDING",
        serviceId: service.id,
        businessId,
      },
    });
  });
}

export async function setReservationStatus(id: string, businessId: string, status: "PENDING" | "DONE") {
  const r = await prisma.reservation.updateMany({
    where: { id, businessId, status: { not: "CANCELLED" } },
    data: { status },
  });
  return r.count;
}
import { prisma } from "../../lib/prisma.js";
import type { CreateServiceInput, CreateReservationInput } from "./reservation.schemas.js";

export class ReservationError extends Error {
  constructor(public code: string, message: string, public statusCode = 400) {
    super(message);
    this.name = "ReservationError";
  }
}

export async function createService(input: CreateServiceInput) {
  return prisma.service.create({ data: input });
}

export async function listServices() {
  return prisma.service.findMany({ where: { active: true }, orderBy: { name: "asc" } });
}

export async function getReservations(date?: string) {
  let where: any = {};
  
  if (date) {
    const start = new Date(`${date}T00:00:00.000Z`);
    const end = new Date(`${date}T23:59:59.999Z`);
    where.startTime = { gte: start, lte: end };
  }

  return prisma.reservation.findMany({
    where,
    include: { service: { select: { name: true } } },
    orderBy: { startTime: "asc" },
  });
}

export async function createReservation(input: CreateReservationInput) {
  const service = await prisma.service.findFirst({
    where: { id: input.serviceId, active: true },
  });

  if (!service) throw new ReservationError("SERVICE_NOT_FOUND", "Serviço não encontrado", 404);

  const startTime = new Date(input.startTime);
  const endTime = new Date(startTime.getTime() + service.durationMin * 60000);

  if (startTime < new Date()) {
    throw new ReservationError("INVALID_DATE", "Não é possível agendar no passado", 400);
  }

  // --- NOVA REGRA: VERIFICAR HORÁRIO DE FUNCIONAMENTO ---
  const admin = await prisma.user.findFirst();
  if (admin) {
    const [openHour, openMin] = admin.openTime.split(":").map(Number);
    const [closeHour, closeMin] = admin.closeTime.split(":").map(Number);

    const startInMinutes = startTime.getHours() * 60 + startTime.getMinutes();
    const endInMinutes = endTime.getHours() * 60 + endTime.getMinutes();
    const openInMinutes = openHour * 60 + openMin;
    const closeInMinutes = closeHour * 60 + closeMin;

    if (startInMinutes < openInMinutes || endInMinutes > closeInMinutes) {
      throw new ReservationError(
        "OUTSIDE_HOURS", 
        `A loja funciona apenas entre as ${admin.openTime} e as ${admin.closeTime}`, 
        400
      );
    }
  }
  // -----------------------------------------------------

  return prisma.$transaction(async (tx) => {
    const conflictingReservation = await tx.reservation.findFirst({
      where: {
        status: { not: "CANCELLED" },
        OR: [
          { startTime: { lte: startTime }, endTime: { gt: startTime } },
          { startTime: { gte: startTime }, endTime: { lte: endTime } },
          { startTime: { lt: endTime }, endTime: { gte: endTime } },
        ],
      },
    });

    if (conflictingReservation) {
      throw new ReservationError("TIME_CONFLICT", "Este horário já está ocupado por outra reserva.", 409);
    }

    return tx.reservation.create({
      data: {
        serviceId: input.serviceId,
        clientName: input.clientName,
        clientPhone: input.clientPhone,
        startTime,
        endTime,
      },
      include: { service: true },
    });
  });
}

export async function cancelReservation(id: string) {
  return prisma.reservation.update({
    where: { id },
    data: { status: "CANCELLED" },
  });
}
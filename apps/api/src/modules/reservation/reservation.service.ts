import { prisma } from "../../lib/prisma.js";
import { createReservationSchema, createServiceSchema } from "./reservation.schemas.js";
import { z } from "zod";

type CreateServiceInput = z.infer<typeof createServiceSchema>;
type CreateReservationInput = z.infer<typeof createReservationSchema>;

export async function listServices(businessId: string) {
  return prisma.service.findMany({
    where: { 
      businessId, 
      active: true 
    },
    orderBy: { createdAt: "asc" },
  });
}

export async function createService(input: CreateServiceInput, businessId: string) {
  return prisma.service.create({
    data: {
      ...input,
      businessId, 
    },
  });
}

export async function getReservations(date: string | undefined, businessId: string) {
  const whereClause: any = { 
    businessId, 
  };

  if (date) {
    const startOfDay = new Date(`${date}T00:00:00.000Z`);
    const endOfDay = new Date(`${date}T23:59:59.999Z`);
    whereClause.startTime = {
      gte: startOfDay,
      lte: endOfDay,
    };
  }

  return prisma.reservation.findMany({
    where: whereClause,
    include: {
      service: true, 
    },
    orderBy: { startTime: "asc" },
  });
}

export async function createReservation(input: CreateReservationInput, businessId: string) {
  const service = await prisma.service.findFirst({
    where: { 
      id: input.serviceId,
      businessId, 
      active: true
    },
  });

  if (!service) {
    throw new Error("Serviço não encontrado ou inativo neste negócio.");
  }

  const startTime = new Date(input.startTime);
  const endTime = new Date(startTime.getTime() + service.durationMin * 60000);

  return prisma.reservation.create({
    data: {
      clientName: input.clientName,
      clientPhone: input.clientPhone,
      startTime,
      endTime,
      notes: input.notes, 
      status: "CONFIRMED",
      serviceId: service.id,
      businessId, 
    },
  });
}
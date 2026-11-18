import { prisma } from "../../lib/prisma.js";
import { createReservationSchema, createServiceSchema } from "./reservation.schemas.js";
import { z } from "zod";

type CreateServiceInput = z.infer<typeof createServiceSchema>;
type CreateReservationInput = z.infer<typeof createReservationSchema>;

// ================= LISTAR SERVIÇOS =================
export async function listServices(businessId: string) {
  return prisma.service.findMany({
    where: { 
      businessId, // <--- ISOLAMENTO: Apenas serviços DESTE negócio
      active: true 
    },
    orderBy: { createdAt: "asc" },
  });
}

// ================= CRIAR SERVIÇO =================
export async function createService(input: CreateServiceInput, businessId: string) {
  return prisma.service.create({
    data: {
      ...input,
      businessId, // <--- ISOLAMENTO: Força o serviço a pertencer a este negócio
    },
  });
}

// ================= LISTAR RESERVAS =================
export async function getReservations(date: string | undefined, businessId: string) {
  const whereClause: any = { 
    businessId, // <--- ISOLAMENTO: O admin só vê reservas do seu negócio
  };

  // Se o admin filtrar por data, aplicamos o filtro
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
      service: true, // Traz os detalhes do serviço (nome, preço)
    },
    orderBy: { startTime: "asc" },
  });
}

// ================= CRIAR RESERVA (PÚBLICA) =================
export async function createReservation(input: CreateReservationInput, businessId: string) {
  // 1. Verificar se o serviço existe e PERTENCE a este negócio
  // Isto impede que alguém tente agendar um serviço do Hashtag na página da Sara
  const service = await prisma.service.findFirst({
    where: { 
      id: input.serviceId,
      businessId, // <--- CRÍTICO DE SEGURANÇA
      active: true
    },
  });

  if (!service) {
    throw new Error("Serviço não encontrado ou inativo neste negócio.");
  }

  // 2. Calcular a hora de fim com base na duração do serviço
  const startTime = new Date(input.startTime);
  const endTime = new Date(startTime.getTime() + service.durationMin * 60000);

  // 3. Criar a reserva
  return prisma.reservation.create({
    data: {
      clientName: input.clientName,
      clientPhone: input.clientPhone,
      startTime,
      endTime,
      notes: input.notes,
      status: "CONFIRMED",
      serviceId: service.id,
      businessId, // <--- ISOLAMENTO: Amarra a reserva a este negócio
    },
  });
}

import { prisma } from "../../lib/prisma.js";
import {
  createReservationSchema,
  createServiceSchema,
} from "./reservation.schemas.js";
import { z } from "zod";

type CreateServiceInput = z.infer<typeof createServiceSchema>;
type CreateReservationInput = z.infer<typeof createReservationSchema>;

// Angola utiliza UTC+1 durante todo o ano.
const ANGOLA_OFFSET_MINUTES = 60;

export class BookingError extends Error {
  status: number;
  code: string;

  constructor(status: number, code: string, message: string) {
    super(message);
    this.status = status;
    this.code = code;
  }
}

function toMinutes(value: string) {
  const [hours, minutes] = value.split(":").map(Number);
  return hours * 60 + minutes;
}

function parseDate(date: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    throw new BookingError(400, "INVALID_DATE", "Data inválida.");
  }

  const [year, month, day] = date.split("-").map(Number);
  const parsed = new Date(Date.UTC(year, month - 1, day));

  if (
    parsed.getUTCFullYear() !== year ||
    parsed.getUTCMonth() !== month - 1 ||
    parsed.getUTCDate() !== day
  ) {
    throw new BookingError(400, "INVALID_DATE", "Data inválida.");
  }

  return { year, month, day };
}

// Converte meia-noite em Angola para o instante UTC correspondente.
function angolaDayBounds(date: string) {
  const { year, month, day } = parseDate(date);

  const start = new Date(
    Date.UTC(year, month - 1, day, -1, 0, 0, 0)
  );

  const end = new Date(start.getTime() + 24 * 60 * 60 * 1000);

  return { start, end };
}

// Devolve a hora local de Angola a partir de um instante UTC.
function angolaMinutes(date: Date) {
  const utcMinutes =
    date.getUTCHours() * 60 + date.getUTCMinutes();

  return (utcMinutes + ANGOLA_OFFSET_MINUTES) % (24 * 60);
}

function formatAngolaTime(date: Date) {
  const minutes = angolaMinutes(date);
  const hours = Math.floor(minutes / 60);
  const remainder = minutes % 60;

  return `${String(hours).padStart(2, "0")}:${String(remainder).padStart(2, "0")}`;
}

export async function listServices(businessId: string) {
  return prisma.service.findMany({
    where: { businessId, active: true },
    orderBy: { createdAt: "asc" },
  });
}

export async function createService(
  input: CreateServiceInput,
  businessId: string
) {
  return prisma.service.create({
    data: { ...input, businessId },
  });
}

export async function getReservations(
  date: string | undefined,
  businessId: string
) {
  const whereClause: any = { businessId };

  if (date) {
    const { start, end } = angolaDayBounds(date);

    whereClause.startTime = {
      gte: start,
      lt: end,
    };
  }

  return prisma.reservation.findMany({
    where: whereClause,
    include: { service: true },
    orderBy: { startTime: "asc" },
  });
}

export async function getBusySlots(
  date: string,
  businessId: string
) {
  const { start, end } = angolaDayBounds(date);

  const rows = await prisma.reservation.findMany({
    where: {
      businessId,
      status: { not: "CANCELLED" },
      startTime: {
        gte: start,
        lt: end,
      },
    },
    select: {
      startTime: true,
      endTime: true,
    },
    orderBy: { startTime: "asc" },
  });

  return rows.map((reservation) => ({
    start: formatAngolaTime(reservation.startTime),
    end: formatAngolaTime(reservation.endTime),
  }));
}

export async function createReservation(
  input: CreateReservationInput,
  businessId: string
) {
  const [service, business] = await Promise.all([
    prisma.service.findFirst({
      where: {
        id: input.serviceId,
        businessId,
        active: true,
      },
    }),
    prisma.business.findUnique({
      where: { id: businessId },
      select: {
        openTime: true,
        closeTime: true,
      },
    }),
  ]);

  if (!service || !business) {
    throw new BookingError(
      404,
      "SERVICE_NOT_FOUND",
      "Serviço não encontrado ou inactivo neste negócio."
    );
  }

  const startTime = new Date(input.startTime);

  if (Number.isNaN(startTime.getTime())) {
    throw new BookingError(
      400,
      "INVALID_DATE",
      "Data ou hora inválida."
    );
  }

  const endTime = new Date(
    startTime.getTime() + service.durationMin * 60_000
  );

  const startMin = angolaMinutes(startTime);
  const endMin = startMin + service.durationMin;

  if (
    endMin > 24 * 60 ||
    startMin < toMinutes(business.openTime) ||
    endMin > toMinutes(business.closeTime)
  ) {
    throw new BookingError(
      400,
      "OUTSIDE_HOURS",
      `Fora do horário de funcionamento (${business.openTime} às ${business.closeTime}).`
    );
  }

  if (startTime.getTime() <= Date.now()) {
    throw new BookingError(
      400,
      "PAST_TIME",
      "Essa hora já passou. Escolha outra."
    );
  }

  return prisma.$transaction(async (tx) => {
    await tx.$executeRaw`
      SELECT pg_advisory_xact_lock(hashtext(${businessId}))
    `;

    const conflict = await tx.reservation.findFirst({
      where: {
        businessId,
        status: { not: "CANCELLED" },
        startTime: { lt: endTime },
        endTime: { gt: startTime },
      },
    });

    if (conflict) {
      throw new BookingError(
        409,
        "SLOT_TAKEN",
        "Esse horário já está reservado. Escolha outro horário."
      );
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

export async function setReservationStatus(
  id: string,
  businessId: string,
  status: "PENDING" | "DONE"
) {
  const result = await prisma.reservation.updateMany({
    where: {
      id,
      businessId,
      status: { not: "CANCELLED" },
    },
    data: { status },
  });

  return result.count;
}

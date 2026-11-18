import { prisma } from "../../lib/prisma.js";

export async function listProducts(businessId: string) {
  return prisma.product.findMany({
    where: { 
      businessId, // <--- ISOLAMENTO: Apenas produtos DESTE negócio
      active: true 
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function createProduct(data: { name: string; description?: string; price: number; imageUrl?: string; stock?: number }, businessId: string) {
  return prisma.product.create({
    data: {
      ...data,
      businessId, // <--- ISOLAMENTO
    },
  });
}
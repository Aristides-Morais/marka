
import { prisma } from "../../lib/prisma.js";

export class OrderError extends Error {
  status: number;
  code: string;

  constructor(status: number, code: string, message: string) {
    super(message);
    this.status = status;
    this.code = code;
  }
}

type CreateOrderInput = {
  customerName: string;
  customerPhone: string;
  customerAddress: string;
  items: { productId: string; quantity: number }[];
};

export async function createOrder(data: CreateOrderInput, businessId: string) {
  const quantities = new Map<string, number>();

  for (const item of data.items) {
    quantities.set(
      item.productId,
      (quantities.get(item.productId) ?? 0) + item.quantity
    );
  }

  return prisma.$transaction(async (tx) => {
    const products = await tx.product.findMany({
      where: {
        id: { in: [...quantities.keys()] },
        businessId,
        active: true,
      },
    });

    if (products.length !== quantities.size) {
      throw new OrderError(
        400,
        "INVALID_PRODUCT",
        "Um ou mais produtos não existem ou estão indisponíveis."
      );
    }

    let total = 0;
    const orderItemsData = [];

    for (const product of products) {
      const quantity = quantities.get(product.id)!;

      if (product.stock !== null) {
        const updated = await tx.product.updateMany({
          where: {
            id: product.id,
            businessId,
            active: true,
            stock: { gte: quantity },
          },
          data: {
            stock: { decrement: quantity },
          },
        });

        if (updated.count !== 1) {
          throw new OrderError(
            409,
            "INSUFFICIENT_STOCK",
            `Stock insuficiente para ${product.name}.`
          );
        }
      }

      const price = Number(product.price);
      total += price * quantity;

      orderItemsData.push({
        productId: product.id,
        quantity,
        price: product.price,
      });
    }

    return tx.order.create({
      data: {
        businessId,
        clientName: data.customerName,
        clientPhone: data.customerPhone,
        notes: `Endereço de entrega: ${data.customerAddress}`,
        total,
        status: "PENDING",
        items: {
          create: orderItemsData,
        },
      },
      include: {
        items: true,
      },
    });
  });
}

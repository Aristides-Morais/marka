import { prisma } from "../../lib/prisma.js";

export async function createOrder(data: { 
  customerName: string; 
  customerPhone: string; 
  customerAddress: string;
  items: { productId: string; quantity: number }[] 
}, businessId: string) {
  
  let total = 0;
  const orderItemsData = [];

  for (const item of data.items) {
    const product = await prisma.product.findUnique({
      where: { id: item.productId, businessId }
    });

    if (!product) throw new Error(`Produto ${item.productId} não encontrado.`);
    
    // Correção do TS18047: Verificar se o stock não é nulo antes de comparar
    if (product.stock !== null && product.stock < item.quantity) {
      throw new Error(`Stock insuficiente para ${product.name}.`);
    }

    total += Number(product.price) * item.quantity;
    orderItemsData.push({
      productId: product.id,
      quantity: item.quantity,
      price: product.price
    });
  }

  return prisma.order.create({
    data: {
      businessId,
      clientName: data.customerName,
      clientPhone: data.customerPhone,
      notes: `Endereço de entrega: ${data.customerAddress}`,
      total,
      status: "PENDING",
      items: {
        create: orderItemsData
      }
    },
    include: { items: true }
  });
}
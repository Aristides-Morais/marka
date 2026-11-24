
import { Router } from "express";
import { z } from "zod";
import { createOrder, OrderError } from "./order.service.js";

export const orderRouter = Router();

const createOrderSchema = z.object({
  customerName: z.string().trim().min(2).max(120),
  customerPhone: z.string().trim().min(6).max(30),
  customerAddress: z.string().trim().min(3).max(500),
  items: z.array(
    z.object({
      productId: z.string().min(1),
      quantity: z.number().int().min(1).max(1000),
    }).strict()
  ).min(1).max(100),
}).strict();

async function enviarNotificacaoWhatsApp(
  pedido: any,
  businessName: string
) {
  const token = process.env.WHATSAPP_TOKEN;
  const phoneId = process.env.WHATSAPP_PHONE_NUMBER_ID;
  const adminPhone = process.env.ADMIN_PHONE;

  if (!token || !phoneId || !adminPhone) return;

  const mensagem =
    `🔔 *Novo Pedido - ${businessName}*\n\n` +
    `Cliente: ${pedido.clientName}\n` +
    `Telefone: ${pedido.clientPhone}\n` +
    `Total: ${Number(pedido.total).toLocaleString("pt-AO")} Kz\n\n` +
    `Verifique o painel para mais detalhes.`;

  try {
    const response = await fetch(
      `https://graph.facebook.com/v20.0/${phoneId}/messages`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messaging_product: "whatsapp",
          to: adminPhone,
          type: "text",
          text: { body: mensagem },
        }),
      }
    );

    if (!response.ok) {
      const details = await response.text();
      console.error("WhatsApp API recusou a notificação:", details);
    }
  } catch (error) {
    console.error("Falha na notificação WhatsApp:", error);
  }
}

orderRouter.post("/", async (req, res, next) => {
  try {
    if (!req.business) {
      res.status(400).json({
        error: { message: "Negócio não identificado." },
      });
      return;
    }

    const input = createOrderSchema.parse(req.body);
    const order = await createOrder(input, req.business.id);

    void enviarNotificacaoWhatsApp(order, req.business.name);

    res.status(201).json(order);
  } catch (err) {
    if (err instanceof OrderError) {
      res.status(err.status).json({
        error: {
          code: err.code,
          message: err.message,
        },
      });
      return;
    }

    next(err);
  }
});

import { Router } from "express";
import { z } from "zod";
import { createOrder } from "./order.service.js";

export const orderRouter = Router();

// Função para enviar a notificação
async function enviarNotificacaoWhatsApp(pedido: any, businessName: string) {
  const token = process.env.WHATSAPP_TOKEN;
  const phoneId = process.env.WHATSAPP_PHONE_NUMBER_ID;
  const adminPhone = process.env.ADMIN_PHONE;

  if (!token || !phoneId || !adminPhone) {
    console.log("Credenciais do WhatsApp não configuradas.");
    return;
  }

  const mensagem = `🔔 *Novo Pedido - ${businessName}*\n\nCliente: ${pedido.clientName}\nTelefone: ${pedido.clientPhone}\nTotal: ${Number(pedido.total).toLocaleString("pt-AO")} Kz\n\nVerifique o painel para mais detalhes.`;

  try {
    await fetch(`https://graph.facebook.com/v20.0/${phoneId}/messages`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        to: adminPhone,
        type: "text",
        text: { body: mensagem },
      }),
    });
    console.log("Notificação enviada com sucesso!");
  } catch (error) {
    console.error("Erro ao enviar notificação:", error);
  }
}

orderRouter.post("/", async (req, res, next) => {
  try {
    const schema = z.object({
      customerName: z.string(),
      customerPhone: z.string(),
      customerAddress: z.string(),
      items: z.array(z.object({
        productId: z.string(),
        quantity: z.number().int().positive()
      }))
    });
    
    const input = schema.parse(req.body);
    const order = await createOrder(input, req.business!.id);
    
    // Dispara a notificação para o admin
    await enviarNotificacaoWhatsApp(order, req.business!.name);

    res.status(201).json(order);
  } catch (err: any) { 
    res.status(400).json({ error: { message: err.message } });
  }
});
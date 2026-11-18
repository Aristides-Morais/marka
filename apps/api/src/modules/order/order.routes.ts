import { Router } from "express";
import { z } from "zod";
import { createOrder } from "./order.service.js";

export const orderRouter = Router();

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
    const order = await createOrder(input, req.business!.id); // Usa o tenant injetado
    res.status(201).json(order);
  } catch (err: any) { 
    res.status(400).json({ error: { message: err.message } });
  }
});
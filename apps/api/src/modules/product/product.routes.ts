import { Router } from "express";
import { z } from "zod";
import { prisma } from "../../lib/prisma.js";
import { requireAuth } from "../../middleware/auth.middleware.js";
import { listProducts, createProduct } from "./product.service.js";

export const productRouter = Router();

productRouter.get("/", async (req, res, next) => {
  try { res.json(await listProducts(req.business!.id)); } catch (err) { next(err); }
});

productRouter.post("/", requireAuth, async (req, res, next) => {
  try {
    const schema = z.object({
      name: z.string(), description: z.string().optional(), price: z.number().positive(),
      imageUrl: z.string().optional(), stock: z.number().int().optional(),
    });
    const input = schema.parse(req.body);
    res.status(201).json(await createProduct(input, req.business!.id));
  } catch (err) { next(err); }
});

// CORRIGIDO: usar deleteMany em vez de delete
productRouter.delete("/:id", requireAuth, async (req, res, next) => {
  try {
    const deleted = await prisma.product.deleteMany({
      where: { id: req.params.id, businessId: req.business!.id }
    });
    if (deleted.count === 0) {
      return res.status(404).json({ message: "Produto não encontrado" });
    }
    res.status(204).send();
  } catch (err) { next(err); }
});
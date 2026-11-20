import { Router } from "express";
import { z } from "zod";
import { prisma } from "../../lib/prisma";
import { requireAuth } from "../../middleware/auth.middleware";

export const productRouter = Router();

const productSchema = z.object({
  name: z.string().min(1, "Nome obrigatório"),
  description: z.string().optional().nullable(),
  price: z.number().min(0),
  imageUrl: z.string().optional().nullable(),
  active: z.boolean().optional(),
  categoryId: z.string().optional().nullable(),
});

// LISTAR - só mostra os ativos
productRouter.get("/", async (req, res, next) => {
  try {
    const products = await prisma.product.findMany({
      where: { businessId: req.business!.id, active: true },
      orderBy: { createdAt: "desc" },
    });
    res.json(products);
  } catch (err) { next(err); }
});

// CRIAR
productRouter.post("/", requireAuth, async (req, res, next) => {
  try {
    const data = productSchema.parse(req.body);
    const product = await prisma.product.create({
      data: {
        name: data.name,
        description: data.description ?? null,
        price: data.price,
        imageUrl: data.imageUrl ?? null,
        active: data.active ?? true,
        categoryId: data.categoryId ?? null,
        businessId: req.business!.id,
      },
    });
    res.status(201).json(product);
  } catch (err) { next(err); }
});

// EDITAR
productRouter.patch("/:id", requireAuth, async (req, res, next) => {
  try {
    const data = productSchema.partial().parse(req.body);
    const product = await prisma.product.updateMany({
      where: { id: req.params.id, businessId: req.business!.id },
      data,
    });
    if (product.count === 0) {
      return res.status(404).json({ error: { message: "Produto não encontrado" } });
    }
    const updated = await prisma.product.findFirst({
      where: { id: req.params.id, businessId: req.business!.id },
    });
    res.json(updated);
  } catch (err) { next(err); }
});

// APAGAR - NÃO apaga mesmo, só esconde. Assim não quebra as encomendas.
productRouter.delete("/:id", requireAuth, async (req, res, next) => {
  try {
    const updated = await prisma.product.updateMany({
      where: { id: req.params.id, businessId: req.business!.id },
      data: { active: false },
    });
    if (updated.count === 0) {
      return res.status(404).json({ error: { message: "Produto não encontrado" } });
    }
    res.status(204).send();
  } catch (err) { next(err); }
});
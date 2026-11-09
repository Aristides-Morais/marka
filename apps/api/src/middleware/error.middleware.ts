import type { NextFunction, Request, Response } from "express";
import { ZodError } from "zod";

export function notFoundHandler(_req: Request, res: Response) {
  res.status(404).json({ error: { code: "NOT_FOUND", message: "Rota não encontrada" } });
}

export function errorHandler(err: unknown, _req: Request, res: Response, _next: NextFunction) {
  if (err instanceof ZodError) {
    res.status(422).json({
      error: { code: "VALIDATION_ERROR", message: "Dados inválidos", details: err.flatten().fieldErrors },
    });
    return;
  }
  
  if (err instanceof Error && "statusCode" in err) {
    res.status((err as any).statusCode).json({
      error: { code: (err as any).code || "ERROR", message: err.message },
    });
    return;
  }

  console.error("[unhandled error]", err);
  res.status(500).json({ error: { code: "INTERNAL_ERROR", message: "Erro interno do servidor" } });
}
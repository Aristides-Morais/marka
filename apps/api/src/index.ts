import express from "express";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import { env } from "./config/env.js";

import { authRouter } from "./modules/auth/auth.routes.js";
import { reservationRouter } from "./modules/reservation/reservation.routes.js";
import { productRouter } from "./modules/product/product.routes.js";
import { orderRouter } from "./modules/order/order.routes.js";
import { businessRouter } from "./modules/business/business.routes.js";
import { uploadRouter } from "./modules/upload/upload.routes.js";
import { superAdminRouter } from "./modules/super-admin/super-admin.routes.js"; // <-- NOVO

import { errorHandler, notFoundHandler } from "./middleware/error.middleware.js";
import { tenantMiddleware } from "./middleware/tenant.middleware.js";

// 1. Cria a app PRIMEIRO
const app = express();

// 2. Configurações de segurança
app.set("trust proxy", 1);
app.use(helmet({ crossOriginResourcePolicy: { policy: "cross-origin" } }));
app.use(cors({ origin: env.CORS_ORIGIN, credentials: true }));
app.use(express.json());
app.use(cookieParser());

// 3. Health Check
app.get("/api/v1/health", (_req, res) => {
  res.json({ status: "ok", service: "marka-api-unificado", time: new Date().toISOString() });
});

// 4. Super Admin (Antes do escudo multi-tenant)
app.use("/api/v1/super-admin", superAdminRouter);

// 5. O ESCUDO MULTI-TENANT ENTRA AQUI
app.use(tenantMiddleware);

// 6. Rotas do Sistema (Clientes)
app.use("/api/v1/auth", authRouter);
app.use("/api/v1/reservations", reservationRouter);
app.use("/api/v1/products", productRouter);
app.use("/api/v1/orders", orderRouter);
app.use("/api/v1/business", businessRouter);
app.use("/api/v1/upload", uploadRouter);

// 7. Gestão de Erros
app.use(notFoundHandler);
app.use(errorHandler);

// 8. Arranque
app.listen(env.PORT, "0.0.0.0", () => {
  console.log(`🚀 Marka + Kanda API unificada a correr na porta ${env.PORT}`);
});
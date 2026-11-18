import express from "express";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import path from "path"; // <--- NOVO
import { env } from "./config/env.js";

import { authRouter } from "./modules/auth/auth.routes.js";
import { reservationRouter } from "./modules/reservation/reservation.routes.js";
import { productRouter } from "./modules/product/product.routes.js";
import { orderRouter } from "./modules/order/order.routes.js";
import { businessRouter } from "./modules/business/business.routes.js";
import { uploadRouter } from "./modules/upload/upload.routes.js"; // <--- NOVO

import { errorHandler, notFoundHandler } from "./middleware/error.middleware.js";
import { tenantMiddleware } from "./middleware/tenant.middleware.js";

const app = express();

app.set('trust proxy', 1);
// Configuração do Helmet para permitir imagens de outros domínios (como localhost)
app.use(helmet({ crossOriginResourcePolicy: { policy: "cross-origin" } })); 
app.use(cors({ origin: env.CORS_ORIGIN, credentials: true }));
app.use(express.json());
app.use(cookieParser());

// Torna a pasta "public" acessível na web (para as imagens aparecerem)
app.use("/uploads", express.static(path.join(process.cwd(), "public", "uploads"))); // <--- NOVO

app.get("/api/v1/health", (_req, res) => {
  res.json({ status: "ok", service: "marka-api-unificado", time: new Date().toISOString() });
});

app.use(tenantMiddleware);

app.use("/api/v1/auth", authRouter);
app.use("/api/v1/reservations", reservationRouter);
app.use("/api/v1/products", productRouter);
app.use("/api/v1/orders", orderRouter);
app.use("/api/v1/business", businessRouter);
app.use("/api/v1/upload", uploadRouter); // <--- NOVO

app.use(notFoundHandler);
app.use(errorHandler);

app.listen(env.PORT, "0.0.0.0", () => {
  console.log(`🚀 Marka + Kanda API unificada a correr na porta ${env.PORT}`);
});
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
import { superAdminRouter } from "./modules/super-admin/super-admin.routes.js";
import { businessModulesRouter } from "./modules/super-admin/business-modules.routes.js";

import { errorHandler, notFoundHandler } from "./middleware/error.middleware.js";
import { tenantMiddleware } from "./middleware/tenant.middleware.js";
import { siteContentRouter } from "./modules/site-content/site-content.routes.js";

const app = express();

app.set("trust proxy", 1);
app.use(helmet({ crossOriginResourcePolicy: { policy: "cross-origin" } }));
app.use(cors({ origin: env.CORS_ORIGIN, credentials: true }));
app.use(express.json());
app.use(cookieParser());

app.get("/api/v1/health", (_req, res) => {
  res.json({
    status: "ok",
    service: "marka-api-unificado",
    time: new Date().toISOString(),
  });
});

// Rotas centrais do Super Admin, sem middleware de tenant.
app.use("/api/v1/super-admin", superAdminRouter);
app.use("/api/v1/super-admin", businessModulesRouter);

// Validação do negócio e dos módulos.
app.use(tenantMiddleware);

app.use("/api/v1/auth", authRouter);
app.use("/api/v1/reservations", reservationRouter);
app.use("/api/v1/products", productRouter);
app.use("/api/v1/orders", orderRouter);
app.use("/api/v1/business", businessRouter);
app.use("/api/v1/upload", uploadRouter);
app.use("/api/v1/site-content", siteContentRouter);

app.use(notFoundHandler);
app.use(errorHandler);

app.listen(env.PORT, "0.0.0.0", () => {
  console.log(
    `🚀 Marka + Kanda API unificada a correr na porta ${env.PORT}`
  );
});
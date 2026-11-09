import express from "express";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser"; // <-- NOVO
import { env } from "./config/env.js";
import { reservationRouter } from "./modules/reservation/reservation.routes.js";
import { authRouter } from "./modules/auth/auth.routes.js"; // <-- NOVO
import { errorHandler, notFoundHandler } from "./middleware/error.middleware.js";

const app = express();

app.use(helmet());
app.use(cors({ origin: env.CORS_ORIGIN, credentials: true }));
app.use(express.json());
app.use(cookieParser()); // <-- NOVO: Para ler os cookies de autenticação

app.get("/api/v1/health", (_req, res) => {
  res.json({ status: "ok", service: "marka-api", time: new Date().toISOString() });
});

// Rotas de Autenticação (Login do Admin)
app.use("/api/v1/auth", authRouter);

// Rotas de Reservas (Públicas para os clientes e Privadas para o Admin)
app.use("/api/v1/reservations", reservationRouter);

app.use(notFoundHandler);
app.use(errorHandler);

app.listen(env.PORT, "0.0.0.0", () => {
  console.log(`Marka API a correr na porta ${env.PORT}`);
});
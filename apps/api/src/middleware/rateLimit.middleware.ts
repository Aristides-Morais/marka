import rateLimit from "express-rate-limit";

// Limite para o Login (Previne força bruta)
export const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 10, // 10 tentativas por IP
  message: { error: { code: "TOO_MANY_REQUESTS", message: "Demasiadas tentativas. Tente mais tarde." } },
  standardHeaders: true,
  legacyHeaders: false,
});

// Limite para Reservas (Previne bots a criar reservas falsas)
export const reservationLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hora
  max: 20, // 20 reservas por hora por IP
  message: { error: { code: "TOO_MANY_REQUESTS", message: "Muitas reservas criadas. Tente mais tarde." } },
  standardHeaders: true,
  legacyHeaders: false,
});
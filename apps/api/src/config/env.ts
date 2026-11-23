
import "dotenv/config";
import { z } from "zod";

const optionalString = z.preprocess(
  (value) => value === "" ? undefined : value,
  z.string().optional()
);

const envSchema = z.object({
  NODE_ENV: z.enum([
    "development",
    "production",
    "test"
  ]).default("development"),

  PORT: z.coerce.number().default(4001),

  DATABASE_URL: z.string().min(1),

  CORS_ORIGIN: z.string().default("http://localhost:5175"),

  JWT_SECRET: z.string().min(32),

  JWT_REFRESH_SECRET: z.string().min(32),

  ACCESS_TOKEN_TTL: z.string().default("15m"),

  REFRESH_TOKEN_TTL: z.string().default("7d"),

  SUPER_ADMIN_EMAIL: optionalString.pipe(
    z.string().email().optional()
  ),

  SUPER_ADMIN_PASSWORD: optionalString.pipe(
    z.string().min(8).optional()
  )
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error(
    "❌ Variáveis de ambiente inválidas:",
    parsed.error.flatten().fieldErrors
  );

  process.exit(1);
}

export const env = parsed.data;

import { defineConfig } from 'prisma/config';
import 'dotenv/config'; // ou como estiveres a carregar as variáveis de ambiente

export default defineConfig({
  // ... (mantém o que já tens aqui, como o schema e o datasource)

  migrations: {
    seed: 'tsx prisma/seed.ts', // <--- ADICIONA ESTA LINHA
  },

  datasource: {
    url: process.env.DATABASE_URL,
  },
});
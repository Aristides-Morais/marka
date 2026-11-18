import { Business } from '@prisma/client'; // Ou de onde o teu client estiver a ser gerado

declare global {
  namespace Express {
    interface Request {
      business?: Business; // O "?" significa que pode ser opcional (ex: na rota de login)
    }
  }
}
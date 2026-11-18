import { prisma } from "../src/lib/prisma.js"; // <--- Usa a tua ligação existente!
import { hash } from "@node-rs/argon2";

async function main() {
  // 1. Criar o negócio de teste
  const business = await prisma.business.upsert({
    where: { slug: "sara" },
    update: {},
    create: {
      slug: "sara",
      name: "Sara La Belle Salão das Bonitas",
      primaryColor: "#d946ef",
      phone: "929700688",
      address: "Camama / Casseque / Luanda Sul",
      openTime: "09:00",
      closeTime: "17:30",
      modules: ["booking", "store"],
      active: true,
    },
  });

  console.log("Negócio criado:", business.name);

  // 2. Criar o admin deste negócio
  const passwordHash = await hash("123456"); // senha temporária

  const admin = await prisma.user.upsert({
    where: {
      email_businessId: {
        email: "admin@sara.com",
        businessId: business.id,
      },
    },
    update: {},
    create: {
      email: "admin@sara.com",
      passwordHash,
      name: "Admin Sara",
      role: "ADMIN",
      businessId: business.id,
    },
  });

  console.log("Admin criado:", admin.email);
  console.log("Senha: 123456");

  // 3. Criar um Serviço de Teste (Para conseguires agendar!)
  const service = await prisma.service.create({
    data: {
      name: "Corte de Cabelo (Teste)",
      durationMin: 45,
      price: 5000,
      businessId: business.id,
    },
  });

  console.log("Serviço criado:", service.name);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
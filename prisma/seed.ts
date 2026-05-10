import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

async function main() {
  await prisma.plan.upsert({
    where: { id: 1 },
    update: {},
    create: { id: 1, nome: "Básico", descricao: "1 tela, slides padrão" },
  });
  await prisma.plan.upsert({
    where: { id: 2 },
    update: {},
    create: { id: 2, nome: "Pro", descricao: "Telas ilimitadas + vídeo" },
  });
  console.log("Seed concluído.");
}

main().finally(() => prisma.$disconnect());

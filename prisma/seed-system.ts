import "dotenv/config";
import { PrismaClient } from "@/app/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { seedSystemTemplates } from "./system-templates";

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
});

async function main() {
  console.log("📚 Seeding system data...");
  await seedSystemTemplates(prisma);
  console.log("✅ System seed complete.");
}

main()
  .catch((e) => {
    console.error("❌ System seed failed:");
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
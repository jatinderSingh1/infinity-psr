import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient({
  adapter: new PrismaPg({
    connectionString:
      "postgresql://postgres.pvxaksjuzwveyileijgw:baqnuj-Gadwa3-tucjit@aws-1-ca-central-1.pooler.supabase.com:5432/postgres",
  }),
});

async function main() {
  const password = await bcrypt.hash("admin123", 10);

  await prisma.user.upsert({
    where: { email: "admin@infinitypsr.com" },
    update: {},
    create: {
      name: "Admin",
      email: "admin@infinitypsr.com",
      password,
      role: "ADMIN",
    },
  });

  console.log("Seeded admin user: admin@infinitypsr.com / admin123");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());

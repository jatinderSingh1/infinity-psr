import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

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

  console.log("Seeded: admin@infinitypsr.com / admin123");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());

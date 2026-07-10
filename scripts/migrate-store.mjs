import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const statements = [
  `ALTER TABLE "Product" ADD COLUMN IF NOT EXISTS "isPublic" BOOLEAN NOT NULL DEFAULT false`,
  `ALTER TABLE "Product" ADD COLUMN IF NOT EXISTS "showPrice" BOOLEAN NOT NULL DEFAULT true`,
  `ALTER TABLE "Order" ADD COLUMN IF NOT EXISTS "publicToken" TEXT`,
  `ALTER TABLE "Order" ADD COLUMN IF NOT EXISTS "confirmedAt" TIMESTAMP(3)`,
  `CREATE UNIQUE INDEX IF NOT EXISTS "Order_publicToken_key" ON "Order"("publicToken")`,
  `CREATE TABLE IF NOT EXISTS "StoreSetting" (
    "id" TEXT NOT NULL DEFAULT 'store',
    "storeName" TEXT NOT NULL DEFAULT 'Infinity Aura',
    "tagline" TEXT,
    "whatsapp" TEXT,
    "email" TEXT,
    "about" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "StoreSetting_pkey" PRIMARY KEY ("id")
  )`,
];

async function main() {
  for (const [i, sql] of statements.entries()) {
    await prisma.$executeRawUnsafe(sql);
    console.log(`[${i + 1}/${statements.length}] ok`);
  }
  console.log("Store migration complete!");
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e);
    prisma.$disconnect();
    process.exit(1);
  });

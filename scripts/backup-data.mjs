import { PrismaClient } from "@prisma/client";
import fs from "fs";

const prisma = new PrismaClient();
const outPath = process.argv[2] ?? "data-backup.json";

async function main() {
  const models = {
    users: prisma.user,
    industries: prisma.industry,
    contactTypes: prisma.contactType,
    contacts: prisma.contact,
    contactRoles: prisma.contactRole,
    deals: prisma.deal,
    activities: prisma.activity,
    clients: prisma.client,
    candidates: prisma.candidate,
    jobOrders: prisma.jobOrder,
    applications: prisma.application,
  };

  const out = {};
  for (const [name, model] of Object.entries(models)) {
    out[name] = await model.findMany();
    console.log(`${name}: ${out[name].length} rows`);
  }

  fs.writeFileSync(outPath, JSON.stringify(out, null, 2));
  console.log(`\nSaved to ${outPath}`);
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e);
    prisma.$disconnect();
    process.exit(1);
  });

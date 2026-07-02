import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

function toSlug(name: string) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

const INDUSTRIES = [
  {
    name: "Staffing",
    slug: "staffing",
    icon: "👔",
    color: "#4f46e5",
    description: "Staffing, recruitment, and employment services",
    types: ["Employee", "Employer", "Contractor", "Freelancer", "Intern"],
  },
  {
    name: "Real Estate",
    slug: "real-estate",
    icon: "🏠",
    color: "#059669",
    description: "Property buying, selling, rental, and investment",
    types: ["Buyer", "Seller", "Owner/Operator", "Rental Agent", "Tenant", "Investor", "Developer"],
  },
  {
    name: "Textile",
    slug: "textile",
    icon: "🧵",
    color: "#d97706",
    description: "Fabric, clothing, and textile trade",
    types: ["Buyer", "Seller", "Wholesaler", "Brand", "Manufacturer", "Retailer", "Importer", "Exporter"],
  },
  {
    name: "Shoes",
    slug: "shoes",
    icon: "👟",
    color: "#dc2626",
    description: "Footwear brands, trade, and retail",
    types: ["Brand", "Local Maker", "Buyer", "Seller", "Retailer", "Wholesaler", "Distributor"],
  },
  {
    name: "Services",
    slug: "services",
    icon: "✂️",
    color: "#7c3aed",
    description: "Beauty, hair, and personal care services",
    types: [
      "Beauty Customer",
      "Beauty Provider",
      "Hair Customer",
      "Hair Stylist",
      "Spa Customer",
      "Spa Provider",
      "Makeup Artist",
      "Nail Technician",
    ],
  },
  {
    name: "Watches",
    slug: "watches",
    icon: "⌚",
    color: "#0891b2",
    description: "Watch trading, collecting, and retail",
    types: ["Buyer", "Seller", "Collector", "Dealer", "Repair Technician", "Brand Rep"],
  },
  {
    name: "Handicraft",
    slug: "handicraft",
    icon: "🏺",
    color: "#b45309",
    description: "Handmade goods, crafts, and artisan products",
    types: ["Buyer", "Seller", "Artisan", "Wholesaler", "Exporter", "Gallery Owner"],
  },
  {
    name: "Local Artists",
    slug: "local-artists",
    icon: "🎨",
    color: "#be185d",
    description: "Art, creative work, and cultural expression",
    types: ["Buyer", "Seller", "Artist", "Gallery Owner", "Curator", "Art Agent", "Collector"],
  },
];

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

  for (let i = 0; i < INDUSTRIES.length; i++) {
    const { name, slug, icon, color, description, types } = INDUSTRIES[i];

    const industry = await prisma.industry.upsert({
      where: { slug },
      update: { name, icon, color, description, order: i },
      create: { name, slug, icon, color, description, isSystem: true, order: i },
    });

    for (let j = 0; j < types.length; j++) {
      const typeName = types[j];
      const typeSlug = toSlug(typeName);
      await prisma.contactType.upsert({
        where: { industryId_slug: { industryId: industry.id, slug: typeSlug } },
        update: { name: typeName, order: j },
        create: {
          name: typeName,
          slug: typeSlug,
          industryId: industry.id,
          isSystem: true,
          order: j,
        },
      });
    }
  }

  console.log("✓ Admin user: admin@infinitypsr.com / admin123");
  console.log(`✓ Seeded ${INDUSTRIES.length} industries with contact types`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());

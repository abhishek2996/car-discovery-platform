import { PrismaClient } from "../src/generated/prisma";
import { PrismaNeon } from "@prisma/adapter-neon";
import { hash } from "bcryptjs";
import "dotenv/config";

const adapter = new PrismaNeon({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

async function main() {
  const brands = [
    { name: "Maruti Suzuki", slug: "maruti-suzuki", country: "India" },
    { name: "Hyundai", slug: "hyundai", country: "South Korea" },
    { name: "Tata", slug: "tata", country: "India" },
    { name: "Mahindra", slug: "mahindra", country: "India" },
    { name: "Honda", slug: "honda", country: "Japan" },
    { name: "Toyota", slug: "toyota", country: "Japan" },
    { name: "Kia", slug: "kia", country: "South Korea" },
  ];

  for (const b of brands) {
    await prisma.carBrand.upsert({
      where: { slug: b.slug },
      update: {},
      create: b,
    });
  }

  const maruti = await prisma.carBrand.findUnique({ where: { slug: "maruti-suzuki" } });
  if (maruti) {
    await prisma.carModel.upsert({
      where: { brandId_slug: { brandId: maruti.id, slug: "swift" } },
      update: {},
      create: {
        brandId: maruti.id,
        name: "Swift",
        slug: "swift",
        bodyType: "HATCHBACK",
        segment: "compact",
        minPrice: 599000,
        maxPrice: 899000,
      },
    });
  }

  const passwordHash = await hash("password123", 10);
  await prisma.user.upsert({
    where: { email: "admin@example.com" },
    update: {},
    create: {
      email: "admin@example.com",
      name: "Admin User",
      password: passwordHash,
      role: "ADMIN",
    },
  });
  await prisma.user.upsert({
    where: { email: "buyer@example.com" },
    update: {},
    create: {
      email: "buyer@example.com",
      name: "Buyer User",
      password: passwordHash,
      role: "BUYER",
    },
  });

  console.log("Seed complete: brands, reference data, and test users (admin@example.com, buyer@example.com / password123).");
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });

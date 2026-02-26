import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

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

  console.log("Seed complete: brands and minimal reference data.");
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

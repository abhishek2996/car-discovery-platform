import { prisma } from "@/lib/db";

export async function getAllBrands() {
  return prisma.carBrand.findMany({
    include: { _count: { select: { models: true } } },
    orderBy: { name: "asc" },
  });
}

export async function getBrandBySlug(slug: string) {
  return prisma.carBrand.findUnique({
    where: { slug },
    include: { _count: { select: { models: true } } },
  });
}

export async function getPopularBrands(limit = 12) {
  return prisma.carBrand.findMany({
    include: { _count: { select: { models: true } } },
    orderBy: { models: { _count: "desc" } },
    take: limit,
  });
}

import { prisma } from "@/lib/db";

export async function searchDealers(params: {
  city?: string;
  brand?: string;
  page?: number;
  pageSize?: number;
}) {
  const { city, brand, page = 1, pageSize = 12 } = params;

  const where: Record<string, unknown> = { status: "ACTIVE" };

  if (city) {
    where.city = { equals: city, mode: "insensitive" };
  }

  if (brand) {
    where.dealerBrands = {
      some: { brand: { slug: brand } },
    };
  }

  const [dealers, total] = await Promise.all([
    prisma.dealer.findMany({
      where: where as never,
      include: {
        dealerBrands: {
          include: { brand: { select: { id: true, name: true, slug: true, logoUrl: true } } },
        },
        _count: { select: { inventoryItems: true, leads: true, reviews: true } },
      },
      orderBy: { name: "asc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.dealer.count({ where: where as never }),
  ]);

  return { dealers, total, page, pageSize, totalPages: Math.ceil(total / pageSize) };
}

export async function getDealerBySlug(slug: string) {
  return prisma.dealer.findUnique({
    where: { slug },
    include: {
      dealerBrands: {
        include: { brand: true },
      },
      inventoryItems: {
        where: { visibility: "VISIBLE" },
        include: {
          variant: {
            include: {
              model: { include: { brand: true } },
            },
          },
        },
        take: 12,
      },
      reviews: {
        orderBy: { createdAt: "desc" },
        take: 10,
        include: {
          author: { select: { id: true, name: true, image: true } },
        },
      },
      _count: { select: { inventoryItems: true, reviews: true } },
    },
  });
}

export async function getDealersForCar(brandSlug: string, city?: string) {
  return prisma.dealer.findMany({
    where: {
      status: "ACTIVE",
      dealerBrands: { some: { brand: { slug: brandSlug } } },
      ...(city ? { city: { equals: city, mode: "insensitive" as const } } : {}),
    },
    select: {
      id: true,
      name: true,
      slug: true,
      city: true,
      phone: true,
      logoUrl: true,
    },
    take: 10,
  });
}

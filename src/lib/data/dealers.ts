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

/** Dealers that have at least one variant of the given model in inventory (for test drive). */
export async function getDealersWithModelInventory(modelId: string) {
  const items = await prisma.dealerInventoryItem.findMany({
    where: {
      visibility: "VISIBLE",
      variant: { modelId },
    },
    select: {
      dealerId: true,
      variantId: true,
      dealer: {
        select: { id: true, name: true, slug: true },
      },
      variant: {
        select: {
          id: true,
          name: true,
          model: { select: { name: true, brand: { select: { name: true } } } },
        },
      },
    },
  });

  const byDealer = new Map<
    string,
    { dealer: { id: string; name: string; slug: string }; variants: { id: string; name: string }[] }
  >();
  for (const item of items) {
    const existing = byDealer.get(item.dealerId);
    const variant = { id: item.variant.id, name: item.variant.name };
    if (!existing) {
      byDealer.set(item.dealerId, {
        dealer: item.dealer,
        variants: [variant],
      });
    } else if (!existing.variants.some((v) => v.id === variant.id)) {
      existing.variants.push(variant);
    }
  }
  return Array.from(byDealer.values());
}

/** Platform dealer used for test drive requests when no dealer has this model in inventory (team books manually on official dealer site). */
const PLATFORM_TEST_DRIVE_SLUG = "test-drive-requests";

export async function getPlatformDealerForTestDrive(): Promise<{ id: string; name: string } | null> {
  const byId = process.env.PLATFORM_DEALER_ID;
  if (byId) {
    const dealer = await prisma.dealer.findUnique({
      where: { id: byId },
      select: { id: true, name: true },
    });
    if (dealer) return dealer;
  }
  const bySlug = await prisma.dealer.findUnique({
    where: { slug: PLATFORM_TEST_DRIVE_SLUG },
    select: { id: true, name: true },
  });
  return bySlug;
}

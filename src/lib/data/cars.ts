import { prisma } from "@/lib/db";
import { PAGE_SIZE } from "@/lib/constants";
import type { CarSearchParams } from "@/lib/validations/car-search";
import type {
  BodyType,
  FuelType,
  TransmissionType,
  Prisma,
} from "@/generated/prisma";

function buildWhere(params: CarSearchParams): Prisma.CarModelWhereInput {
  const where: Prisma.CarModelWhereInput = {};

  if (params.brand) {
    where.brand = { slug: params.brand };
  }

  if (params.bodyType) {
    where.bodyType = params.bodyType as BodyType;
  }

  if (params.minPrice || params.maxPrice) {
    if (params.maxPrice) {
      where.minPrice = { lte: params.maxPrice };
    }
    if (params.minPrice) {
      where.maxPrice = { gte: params.minPrice };
    }
  }

  if (params.q) {
    where.OR = [
      { name: { contains: params.q, mode: "insensitive" } },
      { brand: { name: { contains: params.q, mode: "insensitive" } } },
    ];
  }

  const variantFilter: Prisma.CarVariantWhereInput = {};
  let hasVariantFilter = false;

  if (params.fuel) {
    variantFilter.fuelType = params.fuel as FuelType;
    hasVariantFilter = true;
  }
  if (params.transmission) {
    variantFilter.transmission = params.transmission as TransmissionType;
    hasVariantFilter = true;
  }
  if (params.seating) {
    variantFilter.seating = params.seating;
    hasVariantFilter = true;
  }

  if (hasVariantFilter) {
    where.variants = { some: variantFilter };
  }

  return where;
}

function buildOrderBy(
  sort: string,
): Prisma.CarModelOrderByWithRelationInput | Prisma.CarModelOrderByWithRelationInput[] {
  switch (sort) {
    case "price_asc":
      return { minPrice: { sort: "asc", nulls: "last" } };
    case "price_desc":
      return { minPrice: { sort: "desc", nulls: "last" } };
    case "newest":
      return { createdAt: "desc" };
    default:
      return [{ variants: { _count: "desc" } }, { name: "asc" }];
  }
}

export async function searchCars(params: CarSearchParams) {
  const where = buildWhere(params);
  const orderBy = buildOrderBy(params.sort);
  const page = params.page;
  const skip = (page - 1) * PAGE_SIZE;

  const [cars, total] = await Promise.all([
    prisma.carModel.findMany({
      where,
      include: {
        brand: true,
        variants: {
          take: 1,
          orderBy: { exShowroomPrice: "asc" },
          select: {
            id: true,
            name: true,
            fuelType: true,
            transmission: true,
            seating: true,
          },
        },
        _count: { select: { variants: true } },
      },
      orderBy,
      skip,
      take: PAGE_SIZE,
    }),
    prisma.carModel.count({ where }),
  ]);

  return {
    cars,
    total,
    page,
    pageSize: PAGE_SIZE,
    totalPages: Math.ceil(total / PAGE_SIZE),
  };
}

/** Popular/new cars for home page "most searched" style section (new cars only). */
export async function getPopularModels(limit = 12) {
  const orderBy = buildOrderBy("popularity");
  return prisma.carModel.findMany({
    include: {
      brand: true,
      variants: {
        take: 1,
        orderBy: { exShowroomPrice: "asc" },
        select: {
          id: true,
          name: true,
          fuelType: true,
          transmission: true,
          seating: true,
        },
      },
      _count: { select: { variants: true } },
    },
    orderBy,
    take: limit,
  });
}

/** Newly launched models for hero carousel (newest first, e.g. by createdAt). */
export async function getNewlyLaunchedModels(limit = 4) {
  return prisma.carModel.findMany({
    include: {
      brand: true,
      variants: {
        take: 1,
        orderBy: { exShowroomPrice: "asc" },
        select: {
          id: true,
          name: true,
          fuelType: true,
          transmission: true,
          seating: true,
        },
      },
      _count: { select: { variants: true } },
    },
    orderBy: { createdAt: "desc" },
    take: limit,
  });
}

export async function getCarModelBySlug(brandSlug: string, modelSlug: string) {
  return prisma.carModel.findFirst({
    where: {
      slug: modelSlug,
      brand: { slug: brandSlug },
    },
    include: {
      brand: true,
      variants: { orderBy: { exShowroomPrice: "asc" } },
    },
  });
}

export async function getCarModelWithDetails(brandSlug: string, modelSlug: string) {
  return prisma.carModel.findFirst({
    where: {
      slug: modelSlug,
      brand: { slug: brandSlug },
    },
    include: {
      brand: true,
      variants: {
        orderBy: { exShowroomPrice: "asc" },
        include: {
          reviews: {
            where: { type: "USER" },
            orderBy: { createdAt: "desc" },
            take: 10,
            include: { author: { select: { id: true, name: true, image: true } } },
          },
          _count: { select: { reviews: true } },
        },
      },
    },
  });
}

export async function getExpertReviewsForModel(modelId: string) {
  return prisma.review.findMany({
    where: {
      carVariant: { modelId },
      type: "EXPERT",
    },
    include: {
      author: { select: { id: true, name: true, image: true } },
      carVariant: { select: { id: true, name: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 5,
  });
}

export async function getSimilarCars(modelId: string, bodyType: string | null, segment: string | null) {
  const where: Prisma.CarModelWhereInput = {
    id: { not: modelId },
    OR: [],
  };

  if (bodyType) (where.OR as Prisma.CarModelWhereInput[]).push({ bodyType: bodyType as BodyType });
  if (segment) (where.OR as Prisma.CarModelWhereInput[]).push({ segment });

  if (!(where.OR as Prisma.CarModelWhereInput[]).length) {
    delete where.OR;
  }

  return prisma.carModel.findMany({
    where,
    include: {
      brand: true,
      variants: {
        take: 1,
        orderBy: { exShowroomPrice: "asc" },
        select: { id: true, name: true, fuelType: true, transmission: true, seating: true },
      },
      _count: { select: { variants: true } },
    },
    take: 6,
  });
}

export async function getVariantsForComparison(variantIds: string[]) {
  return prisma.carVariant.findMany({
    where: { id: { in: variantIds } },
    include: {
      model: {
        include: { brand: true },
      },
    },
  });
}

export async function getAllModelsForComparison() {
  return prisma.carModel.findMany({
    include: {
      brand: true,
      variants: {
        orderBy: { exShowroomPrice: "asc" },
        select: { id: true, name: true, exShowroomPrice: true },
      },
    },
    orderBy: [{ brand: { name: "asc" } }, { name: "asc" }],
  });
}

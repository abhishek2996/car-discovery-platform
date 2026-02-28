import { prisma } from "@/lib/db";
import type { Prisma } from "@/generated/prisma";

export async function searchUpcomingCars(params: {
  brand?: string;
  bodyType?: string;
  page?: number;
  pageSize?: number;
}) {
  const { brand, bodyType, page = 1, pageSize = 12 } = params;

  const where: Prisma.UpcomingCarWhereInput = {};

  if (brand) {
    where.brand = { slug: brand };
  }

  if (bodyType) {
    where.model = { bodyType: bodyType as never };
  }

  const [cars, total] = await Promise.all([
    prisma.upcomingCar.findMany({
      where,
      include: {
        brand: true,
        model: true,
      },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.upcomingCar.count({ where }),
  ]);

  return { cars, total, page, pageSize, totalPages: Math.ceil(total / pageSize) };
}

export async function getUpcomingCarById(id: string) {
  return prisma.upcomingCar.findUnique({
    where: { id },
    include: {
      brand: true,
      model: {
        include: {
          variants: { take: 1, orderBy: { exShowroomPrice: "asc" } },
        },
      },
    },
  });
}

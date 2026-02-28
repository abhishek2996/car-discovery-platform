import { prisma } from "@/lib/db";

export async function getBuyerEnquiries(userId: string) {
  return prisma.lead.findMany({
    where: { buyerId: userId },
    include: {
      dealer: { select: { id: true, name: true, slug: true, city: true } },
      carModel: { select: { id: true, name: true, slug: true, brand: { select: { name: true, slug: true } } } },
      carVariant: { select: { id: true, name: true } },
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function getBuyerTestDrives(userId: string) {
  return prisma.testDriveSlot.findMany({
    where: { buyerId: userId },
    include: {
      dealer: { select: { id: true, name: true, slug: true, city: true } },
      variant: {
        select: {
          id: true,
          name: true,
          model: {
            select: {
              id: true,
              name: true,
              slug: true,
              brand: { select: { name: true, slug: true } },
            },
          },
        },
      },
    },
    orderBy: { slotAt: "desc" },
  });
}

export async function getBuyerSavedComparisons(userId: string) {
  return prisma.savedComparison.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
  });
}

export async function getBuyerProfile(userId: string) {
  return prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      name: true,
      phone: true,
      image: true,
    },
  });
}

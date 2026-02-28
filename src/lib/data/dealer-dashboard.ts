import { prisma } from "@/lib/db";
import type { LeadStatus, Prisma } from "@/generated/prisma";

const DEALER_PAGE_SIZE = 20;

// ── Overview stats ──────────────────────────────────────────────

export async function getDealerOverview(dealerId: string) {
  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  const [
    totalInventory,
    visibleInventory,
    totalLeads,
    newLeads,
    leadsLast30,
    upcomingTestDrives,
    recentLeads,
  ] = await Promise.all([
    prisma.dealerInventoryItem.count({ where: { dealerId } }),
    prisma.dealerInventoryItem.count({
      where: { dealerId, visibility: "VISIBLE" },
    }),
    prisma.lead.count({ where: { dealerId } }),
    prisma.lead.count({ where: { dealerId, status: "NEW" } }),
    prisma.lead.count({
      where: { dealerId, createdAt: { gte: thirtyDaysAgo } },
    }),
    prisma.testDriveSlot.count({
      where: {
        dealerId,
        slotAt: { gte: now },
        status: { in: ["REQUESTED", "CONFIRMED"] },
      },
    }),
    prisma.lead.findMany({
      where: { dealerId },
      include: {
        buyer: { select: { id: true, name: true, email: true, phone: true } },
        carModel: { select: { id: true, name: true, brand: { select: { name: true } } } },
        carVariant: { select: { id: true, name: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
  ]);

  return {
    totalInventory,
    visibleInventory,
    totalLeads,
    newLeads,
    leadsLast30,
    upcomingTestDrives,
    recentLeads,
  };
}

// ── Inventory ───────────────────────────────────────────────────

export interface InventoryFilters {
  search?: string;
  stockStatus?: string;
  visibility?: string;
  sort?: string;
  page?: number;
}

export async function getDealerInventory(
  dealerId: string,
  filters: InventoryFilters = {},
) {
  const page = filters.page ?? 1;
  const skip = (page - 1) * DEALER_PAGE_SIZE;

  const where: Prisma.DealerInventoryItemWhereInput = { dealerId };

  if (filters.stockStatus) {
    where.stockStatus = filters.stockStatus;
  }
  if (filters.visibility) {
    where.visibility = filters.visibility as "DRAFT" | "VISIBLE" | "HIDDEN";
  }
  if (filters.search) {
    where.variant = {
      OR: [
        { name: { contains: filters.search, mode: "insensitive" } },
        { model: { name: { contains: filters.search, mode: "insensitive" } } },
        {
          model: {
            brand: { name: { contains: filters.search, mode: "insensitive" } },
          },
        },
      ],
    };
  }

  let orderBy: Prisma.DealerInventoryItemOrderByWithRelationInput =
    { updatedAt: "desc" };
  if (filters.sort === "price_asc") orderBy = { onRoadPrice: { sort: "asc", nulls: "last" } };
  if (filters.sort === "price_desc") orderBy = { onRoadPrice: { sort: "desc", nulls: "last" } };
  if (filters.sort === "name") orderBy = { variant: { name: "asc" } };

  const [items, total] = await Promise.all([
    prisma.dealerInventoryItem.findMany({
      where,
      include: {
        variant: {
          include: {
            model: { include: { brand: true } },
          },
        },
      },
      orderBy,
      skip,
      take: DEALER_PAGE_SIZE,
    }),
    prisma.dealerInventoryItem.count({ where }),
  ]);

  return {
    items,
    total,
    page,
    pageSize: DEALER_PAGE_SIZE,
    totalPages: Math.ceil(total / DEALER_PAGE_SIZE),
  };
}

export async function getDealerInventoryItem(dealerId: string, itemId: string) {
  return prisma.dealerInventoryItem.findFirst({
    where: { id: itemId, dealerId },
    include: {
      variant: {
        include: {
          model: { include: { brand: true } },
        },
      },
    },
  });
}

export async function getAvailableVariantsForDealer(dealerId: string) {
  const dealer = await prisma.dealer.findUnique({
    where: { id: dealerId },
    include: {
      dealerBrands: { select: { brandId: true } },
    },
  });

  if (!dealer) return [];

  const brandIds = dealer.dealerBrands.map((db) => db.brandId);

  return prisma.carVariant.findMany({
    where: {
      model: { brandId: { in: brandIds } },
    },
    include: {
      model: { include: { brand: true } },
    },
    orderBy: [
      { model: { brand: { name: "asc" } } },
      { model: { name: "asc" } },
      { name: "asc" },
    ],
  });
}

// ── Leads ───────────────────────────────────────────────────────

export interface LeadFilters {
  status?: LeadStatus;
  type?: "ENQUIRY" | "TEST_DRIVE";
  search?: string;
  sort?: string;
  page?: number;
}

export async function getDealerLeads(
  dealerId: string,
  filters: LeadFilters = {},
) {
  const page = filters.page ?? 1;
  const skip = (page - 1) * DEALER_PAGE_SIZE;

  const where: Prisma.LeadWhereInput = { dealerId };

  if (filters.status) where.status = filters.status;
  if (filters.type) where.type = filters.type;
  if (filters.search) {
    where.OR = [
      { buyer: { name: { contains: filters.search, mode: "insensitive" } } },
      { buyer: { email: { contains: filters.search, mode: "insensitive" } } },
      {
        carModel: { name: { contains: filters.search, mode: "insensitive" } },
      },
    ];
  }

  let orderBy: Prisma.LeadOrderByWithRelationInput = { createdAt: "desc" };
  if (filters.sort === "oldest") orderBy = { createdAt: "asc" };
  if (filters.sort === "status") orderBy = { status: "asc" };

  const [leads, total, statusCounts] = await Promise.all([
    prisma.lead.findMany({
      where,
      include: {
        buyer: {
          select: { id: true, name: true, email: true, phone: true },
        },
        carModel: {
          select: {
            id: true,
            name: true,
            brand: { select: { name: true } },
          },
        },
        carVariant: { select: { id: true, name: true } },
      },
      orderBy,
      skip,
      take: DEALER_PAGE_SIZE,
    }),
    prisma.lead.count({ where }),
    prisma.lead.groupBy({
      by: ["status"],
      where: { dealerId },
      _count: true,
    }),
  ]);

  const counts = Object.fromEntries(
    statusCounts.map((s) => [s.status, s._count]),
  ) as Record<string, number>;

  return {
    leads,
    total,
    page,
    pageSize: DEALER_PAGE_SIZE,
    totalPages: Math.ceil(total / DEALER_PAGE_SIZE),
    statusCounts: counts,
  };
}

export async function getDealerLeadDetail(dealerId: string, leadId: string) {
  return prisma.lead.findFirst({
    where: { id: leadId, dealerId },
    include: {
      buyer: {
        select: { id: true, name: true, email: true, phone: true, image: true },
      },
      carModel: {
        select: {
          id: true,
          name: true,
          slug: true,
          imageUrl: true,
          brand: { select: { name: true, slug: true } },
        },
      },
      carVariant: {
        select: {
          id: true,
          name: true,
          fuelType: true,
          transmission: true,
          exShowroomPrice: true,
        },
      },
      dealer: { select: { id: true, name: true } },
    },
  });
}

// ── Test Drives ─────────────────────────────────────────────────

export interface TestDriveFilters {
  status?: string;
  upcoming?: boolean;
  page?: number;
}

export async function getDealerTestDrives(
  dealerId: string,
  filters: TestDriveFilters = {},
) {
  const page = filters.page ?? 1;
  const skip = (page - 1) * DEALER_PAGE_SIZE;

  const where: Prisma.TestDriveSlotWhereInput = { dealerId };

  if (filters.status) {
    where.status = filters.status as
      | "REQUESTED"
      | "CONFIRMED"
      | "COMPLETED"
      | "CANCELLED"
      | "NO_SHOW";
  }
  if (filters.upcoming) {
    where.slotAt = { gte: new Date() };
    where.status = { in: ["REQUESTED", "CONFIRMED"] };
  }

  const [slots, total] = await Promise.all([
    prisma.testDriveSlot.findMany({
      where,
      include: {
        buyer: {
          select: { id: true, name: true, email: true, phone: true },
        },
        variant: {
          include: {
            model: { include: { brand: true } },
          },
        },
      },
      orderBy: { slotAt: "asc" },
      skip,
      take: DEALER_PAGE_SIZE,
    }),
    prisma.testDriveSlot.count({ where }),
  ]);

  return {
    slots,
    total,
    page,
    pageSize: DEALER_PAGE_SIZE,
    totalPages: Math.ceil(total / DEALER_PAGE_SIZE),
  };
}

// ── Analytics ───────────────────────────────────────────────────

export async function getDealerAnalytics(dealerId: string) {
  const now = new Date();
  const ninetyDaysAgo = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);

  const [
    leadsOverTime,
    leadsBySource,
    leadsByStatus,
    testDrivesByStatus,
    inventoryItems,
  ] = await Promise.all([
    prisma.lead.findMany({
      where: { dealerId, createdAt: { gte: ninetyDaysAgo } },
      select: { createdAt: true, type: true, status: true, source: true },
      orderBy: { createdAt: "asc" },
    }),
    prisma.lead.groupBy({
      by: ["source"],
      where: { dealerId },
      _count: true,
    }),
    prisma.lead.groupBy({
      by: ["status"],
      where: { dealerId },
      _count: true,
    }),
    prisma.testDriveSlot.groupBy({
      by: ["status"],
      where: { dealerId },
      _count: true,
    }),
    prisma.dealerInventoryItem.findMany({
      where: { dealerId },
      include: {
        variant: {
          include: {
            model: { include: { brand: true } },
            _count: { select: { leads: true } },
          },
        },
      },
    }),
  ]);

  return {
    leadsOverTime,
    leadsBySource: leadsBySource.map((s) => ({
      source: s.source ?? "Unknown",
      count: s._count,
    })),
    leadsByStatus: leadsByStatus.map((s) => ({
      status: s.status,
      count: s._count,
    })),
    testDrivesByStatus: testDrivesByStatus.map((s) => ({
      status: s.status,
      count: s._count,
    })),
    inventoryItems,
  };
}

// ── Dealer Profile ──────────────────────────────────────────────

export async function getDealerProfile(dealerId: string) {
  return prisma.dealer.findUnique({
    where: { id: dealerId },
    include: {
      user: { select: { id: true, name: true, email: true, phone: true } },
      dealerBrands: { include: { brand: true } },
    },
  });
}

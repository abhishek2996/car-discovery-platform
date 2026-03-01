import { prisma } from "@/lib/db";
import type { Prisma, LeadStatus, DealerStatus, UserRole, ContentArticleType } from "@/generated/prisma";

const ADMIN_PAGE_SIZE = 20;

// ── Platform overview ───────────────────────────────────────────

export async function getAdminOverview() {
  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  const [
    totalLeads,
    leadsLast30,
    activeDealers,
    pendingDealers,
    totalBuyers,
    activeListings,
    totalBrands,
    totalModels,
  ] = await Promise.all([
    prisma.lead.count(),
    prisma.lead.count({ where: { createdAt: { gte: thirtyDaysAgo } } }),
    prisma.dealer.count({ where: { status: "ACTIVE" } }),
    prisma.dealer.count({ where: { status: "PENDING" } }),
    prisma.user.count({ where: { role: "BUYER" } }),
    prisma.dealerInventoryItem.count({ where: { visibility: "VISIBLE" } }),
    prisma.carBrand.count(),
    prisma.carModel.count(),
  ]);

  return {
    totalLeads,
    leadsLast30,
    activeDealers,
    pendingDealers,
    totalBuyers,
    activeListings,
    totalBrands,
    totalModels,
  };
}

// ── Platform analytics ──────────────────────────────────────────

export async function getAdminAnalytics() {
  const ninetyDaysAgo = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);

  const [leadsOverTime, leadsBySource, leadsByCity, popularBrands] =
    await Promise.all([
      prisma.lead.findMany({
        where: { createdAt: { gte: ninetyDaysAgo } },
        select: { createdAt: true, type: true, source: true },
        orderBy: { createdAt: "asc" },
      }),
      prisma.lead.groupBy({
        by: ["source"],
        _count: true,
      }),
      prisma.dealer.groupBy({
        by: ["city"],
        _count: true,
        orderBy: { _count: { city: "desc" } },
      }),
      prisma.carModel.findMany({
        include: {
          brand: true,
          _count: { select: { leads: true, variants: true } },
        },
        orderBy: { leads: { _count: "desc" } },
        take: 10,
      }),
    ]);

  return { leadsOverTime, leadsBySource, leadsByCity, popularBrands };
}

// ── Car catalog ─────────────────────────────────────────────────

export async function getAdminBrands(search?: string) {
  const where: Prisma.CarBrandWhereInput = search
    ? { name: { contains: search, mode: "insensitive" } }
    : {};
  return prisma.carBrand.findMany({
    where,
    include: { _count: { select: { models: true, dealerBrands: true } } },
    orderBy: { name: "asc" },
  });
}

export async function getAdminBrand(id: string) {
  return prisma.carBrand.findUnique({
    where: { id },
    include: { models: { include: { _count: { select: { variants: true } } } } },
  });
}

export interface AdminModelFilters {
  brandId?: string;
  search?: string;
  page?: number;
}

export async function getAdminModels(filters: AdminModelFilters = {}) {
  const page = filters.page ?? 1;
  const where: Prisma.CarModelWhereInput = {};
  if (filters.brandId) where.brandId = filters.brandId;
  if (filters.search) {
    where.OR = [
      { name: { contains: filters.search, mode: "insensitive" } },
      { brand: { name: { contains: filters.search, mode: "insensitive" } } },
    ];
  }

  const [models, total] = await Promise.all([
    prisma.carModel.findMany({
      where,
      include: {
        brand: true,
        _count: { select: { variants: true, leads: true } },
      },
      orderBy: [{ brand: { name: "asc" } }, { name: "asc" }],
      skip: (page - 1) * ADMIN_PAGE_SIZE,
      take: ADMIN_PAGE_SIZE,
    }),
    prisma.carModel.count({ where }),
  ]);

  return { models, total, page, totalPages: Math.ceil(total / ADMIN_PAGE_SIZE) };
}

export async function getAdminModel(id: string) {
  return prisma.carModel.findUnique({
    where: { id },
    include: {
      brand: true,
      variants: { orderBy: { exShowroomPrice: "asc" } },
    },
  });
}

export async function getAdminVariant(id: string) {
  return prisma.carVariant.findUnique({
    where: { id },
    include: { model: { include: { brand: true } } },
  });
}

// ── Dealers ─────────────────────────────────────────────────────

export interface AdminDealerFilters {
  status?: DealerStatus;
  city?: string;
  search?: string;
  page?: number;
}

export async function getAdminDealers(filters: AdminDealerFilters = {}) {
  const page = filters.page ?? 1;
  const where: Prisma.DealerWhereInput = {};
  if (filters.status) where.status = filters.status;
  if (filters.city) where.city = filters.city;
  if (filters.search) {
    where.OR = [
      { name: { contains: filters.search, mode: "insensitive" } },
      { email: { contains: filters.search, mode: "insensitive" } },
      { city: { contains: filters.search, mode: "insensitive" } },
    ];
  }

  const [dealers, total, countPending, countActive, countSuspended] =
    await Promise.all([
      prisma.dealer.findMany({
        where,
        include: {
          user: { select: { email: true, name: true } },
          _count: { select: { leads: true, inventoryItems: true } },
          dealerBrands: { include: { brand: { select: { name: true } } } },
        },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * ADMIN_PAGE_SIZE,
        take: ADMIN_PAGE_SIZE,
      }),
      prisma.dealer.count({ where }),
      prisma.dealer.count({ where: { ...where, status: "PENDING" } }),
      prisma.dealer.count({ where: { ...where, status: "ACTIVE" } }),
      prisma.dealer.count({ where: { ...where, status: "SUSPENDED" } }),
    ]);

  const statusCounts: Record<string, number> = {
    PENDING: countPending,
    ACTIVE: countActive,
    SUSPENDED: countSuspended,
  };

  return {
    dealers,
    total,
    page,
    totalPages: Math.ceil(total / ADMIN_PAGE_SIZE),
    statusCounts,
  };
}

export async function getAdminDealer(id: string) {
  return prisma.dealer.findUnique({
    where: { id },
    include: {
      user: { select: { id: true, email: true, name: true, phone: true, createdAt: true } },
      dealerBrands: { include: { brand: true } },
      _count: { select: { leads: true, inventoryItems: true, testDriveSlots: true, reviews: true } },
    },
  });
}

// ── Users ───────────────────────────────────────────────────────

export interface AdminUserFilters {
  role?: UserRole;
  search?: string;
  page?: number;
}

export async function getAdminUsers(filters: AdminUserFilters = {}) {
  const page = filters.page ?? 1;
  const where: Prisma.UserWhereInput = {};
  if (filters.role) where.role = filters.role;
  if (filters.search) {
    where.OR = [
      { name: { contains: filters.search, mode: "insensitive" } },
      { email: { contains: filters.search, mode: "insensitive" } },
    ];
  }

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where,
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        phone: true,
        createdAt: true,
        dealer: { select: { id: true, name: true, status: true } },
        _count: { select: { leadsAsBuyer: true, reviews: true } },
      },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * ADMIN_PAGE_SIZE,
      take: ADMIN_PAGE_SIZE,
    }),
    prisma.user.count({ where }),
  ]);

  return { users, total, page, totalPages: Math.ceil(total / ADMIN_PAGE_SIZE) };
}

// ── Leads (global) ──────────────────────────────────────────────

export interface AdminLeadFilters {
  status?: LeadStatus;
  dealerId?: string;
  source?: string;
  search?: string;
  page?: number;
}

export async function getAdminLeads(filters: AdminLeadFilters = {}) {
  const page = filters.page ?? 1;
  const where: Prisma.LeadWhereInput = {};
  if (filters.status) where.status = filters.status;
  if (filters.dealerId) where.dealerId = filters.dealerId;
  if (filters.source) where.source = filters.source;
  if (filters.search) {
    where.OR = [
      { buyer: { name: { contains: filters.search, mode: "insensitive" } } },
      { buyer: { email: { contains: filters.search, mode: "insensitive" } } },
      { dealer: { name: { contains: filters.search, mode: "insensitive" } } },
    ];
  }

  const [leads, total] = await Promise.all([
    prisma.lead.findMany({
      where,
      include: {
        buyer: { select: { id: true, name: true, email: true } },
        dealer: { select: { id: true, name: true } },
        carModel: { select: { id: true, name: true, brand: { select: { name: true } } } },
        carVariant: { select: { id: true, name: true } },
      },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * ADMIN_PAGE_SIZE,
      take: ADMIN_PAGE_SIZE,
    }),
    prisma.lead.count({ where }),
  ]);

  return { leads, total, page, totalPages: Math.ceil(total / ADMIN_PAGE_SIZE) };
}

// ── Content ─────────────────────────────────────────────────────

export interface AdminContentFilters {
  type?: ContentArticleType;
  search?: string;
  page?: number;
}

export async function getAdminArticles(filters: AdminContentFilters = {}) {
  const page = filters.page ?? 1;
  const where: Prisma.ContentArticleWhereInput = {};
  if (filters.type) where.type = filters.type;
  if (filters.search) {
    where.OR = [
      { title: { contains: filters.search, mode: "insensitive" } },
      { slug: { contains: filters.search, mode: "insensitive" } },
    ];
  }

  const [articles, total] = await Promise.all([
    prisma.contentArticle.findMany({
      where,
      include: { author: { select: { name: true } } },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * ADMIN_PAGE_SIZE,
      take: ADMIN_PAGE_SIZE,
    }),
    prisma.contentArticle.count({ where }),
  ]);

  return { articles, total, page, totalPages: Math.ceil(total / ADMIN_PAGE_SIZE) };
}

export async function getAdminArticle(id: string) {
  return prisma.contentArticle.findUnique({
    where: { id },
    include: { author: { select: { name: true, email: true } } },
  });
}

export async function getAdminUpcomingCars(search?: string) {
  const where: Prisma.UpcomingCarWhereInput = search
    ? { name: { contains: search, mode: "insensitive" } }
    : {};
  return prisma.upcomingCar.findMany({
    where,
    include: { brand: true },
    orderBy: { createdAt: "desc" },
  });
}

export async function getAllDealersForSelect() {
  return prisma.dealer.findMany({
    where: { status: "ACTIVE" },
    select: { id: true, name: true, city: true },
    orderBy: { name: "asc" },
  });
}

// ── Hero slides (home page) ────────────────────────────────────

export async function getActiveHeroSlides() {
  try {
    return await prisma.heroSlide.findMany({
      where: { active: true },
      orderBy: { sortOrder: "asc" },
    });
  } catch {
    return [];
  }
}

export async function getAdminHeroSlides() {
  try {
    return await prisma.heroSlide.findMany({
      orderBy: { sortOrder: "asc" },
    });
  } catch {
    return [];
  }
}

export async function getAdminHeroSlide(id: string) {
  try {
    return await prisma.heroSlide.findUnique({ where: { id } });
  } catch {
    return null;
  }
}

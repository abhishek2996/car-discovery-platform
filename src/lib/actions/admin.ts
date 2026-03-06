"use server";

import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import type { UserRole } from "@/generated/prisma";
import { setUserRole } from "@/lib/roles";
import {
  carBrandSchema,
  carModelSchema,
  carVariantSchema,
  dealerApprovalSchema,
  userRoleSchema,
  leadReassignSchema,
  contentArticleSchema,
  upcomingCarSchema,
  heroSlideSchema,
} from "@/lib/validations/admin";
import { slugify, ensureUniqueBrandSlug, ensureUniqueModelSlug, ensureUniqueVariantSlug } from "@/lib/slug";
import { revalidatePath } from "next/cache";
import type { ActionResult } from "@/lib/types";

// ── Car Brand CRUD ──────────────────────────────────────────────

export async function createBrand(_prev: ActionResult | null, formData: FormData): Promise<ActionResult> {
  await requireAdmin();
  const parsed = carBrandSchema.safeParse(Object.fromEntries(formData.entries()));
  if (!parsed.success) return { success: false, message: "Validation failed.", errors: parsed.error.flatten().fieldErrors as Record<string, string[]> };

  let slug: string;
  if (parsed.data.slug) {
    const existing = await prisma.carBrand.findUnique({ where: { slug: parsed.data.slug } });
    if (existing) return { success: false, message: "A brand with this slug already exists." };
    slug = parsed.data.slug;
  } else {
    slug = await ensureUniqueBrandSlug(slugify(parsed.data.name));
  }
  await prisma.carBrand.create({ data: { name: parsed.data.name, slug, country: parsed.data.country || null, logoUrl: parsed.data.logoUrl || null } });
  revalidatePath("/admin/catalog");
  revalidatePath("/");
  revalidatePath("/brands");
  return { success: true, message: "Brand created." };
}

export async function updateBrand(id: string, _prev: ActionResult | null, formData: FormData): Promise<ActionResult> {
  await requireAdmin();
  const parsed = carBrandSchema.safeParse(Object.fromEntries(formData.entries()));
  if (!parsed.success) return { success: false, message: "Validation failed.", errors: parsed.error.flatten().fieldErrors as Record<string, string[]> };

  let slug: string;
  if (parsed.data.slug) {
    const existing = await prisma.carBrand.findFirst({ where: { slug: parsed.data.slug, id: { not: id } } });
    if (existing) return { success: false, message: "A brand with this slug already exists." };
    slug = parsed.data.slug;
  } else {
    slug = await ensureUniqueBrandSlug(slugify(parsed.data.name), id);
  }
  await prisma.carBrand.update({ where: { id }, data: { name: parsed.data.name, slug, country: parsed.data.country || null, logoUrl: parsed.data.logoUrl || null } });
  revalidatePath("/admin/catalog");
  revalidatePath("/");
  revalidatePath("/brands");
  return { success: true, message: "Brand updated." };
}

export async function deleteBrand(id: string): Promise<ActionResult> {
  await requireAdmin();
  const brand = await prisma.carBrand.findUnique({ where: { id }, include: { _count: { select: { models: true } } } });
  if (!brand) return { success: false, message: "Brand not found." };
  if (brand._count.models > 0) return { success: false, message: "Cannot delete a brand that has models. Remove all models first." };

  await prisma.carBrand.delete({ where: { id } });
  revalidatePath("/admin/catalog");
  revalidatePath("/");
  revalidatePath("/brands");
  return { success: true, message: "Brand deleted." };
}

// ── Car Model CRUD ──────────────────────────────────────────────

export async function createModel(_prev: ActionResult | null, formData: FormData): Promise<ActionResult> {
  await requireAdmin();
  const parsed = carModelSchema.safeParse(Object.fromEntries(formData.entries()));
  if (!parsed.success) return { success: false, message: "Validation failed.", errors: parsed.error.flatten().fieldErrors as Record<string, string[]> };

  let slug: string;
  if (parsed.data.slug) {
    const existing = await prisma.carModel.findFirst({ where: { brandId: parsed.data.brandId, slug: parsed.data.slug } });
    if (existing) return { success: false, message: "A model with this slug already exists for this brand." };
    slug = parsed.data.slug;
  } else {
    slug = await ensureUniqueModelSlug(parsed.data.brandId, slugify(parsed.data.name));
  }

  const imageUrlsRaw = parsed.data.imageUrls?.trim();
  let imageUrlsArr: string[] = [];
  if (imageUrlsRaw) {
    try {
      const arr = JSON.parse(imageUrlsRaw) as unknown;
      imageUrlsArr = Array.isArray(arr) ? arr.filter((u): u is string => typeof u === "string") : [];
    } catch {
      imageUrlsArr = [];
    }
  }
  const primaryUrl = imageUrlsArr[0] ?? (parsed.data.imageUrl || null);

  await prisma.carModel.create({
    data: {
      brand: { connect: { id: parsed.data.brandId } },
      name: parsed.data.name,
      slug,
      bodyType: (parsed.data.bodyType || null) as never,
      segment: parsed.data.segment || null,
      minPrice: parsed.data.minPrice ?? null,
      maxPrice: parsed.data.maxPrice ?? null,
      imageUrl: primaryUrl,
      imageUrls: imageUrlsArr.length > 0 ? JSON.stringify(imageUrlsArr) : null,
    },
  });
  revalidatePath("/admin/catalog");
  return { success: true, message: "Model created." };
}

export async function updateModel(id: string, _prev: ActionResult | null, formData: FormData): Promise<ActionResult> {
  await requireAdmin();
  const parsed = carModelSchema.safeParse(Object.fromEntries(formData.entries()));
  if (!parsed.success) return { success: false, message: "Validation failed.", errors: parsed.error.flatten().fieldErrors as Record<string, string[]> };

  let slug: string;
  if (parsed.data.slug) {
    const existing = await prisma.carModel.findFirst({ where: { brandId: parsed.data.brandId, slug: parsed.data.slug, id: { not: id } } });
    if (existing) return { success: false, message: "A model with this slug already exists for this brand." };
    slug = parsed.data.slug;
  } else {
    slug = await ensureUniqueModelSlug(parsed.data.brandId, slugify(parsed.data.name), id);
  }

  const imageUrlsRaw = parsed.data.imageUrls?.trim();
  let imageUrlsArr: string[] = [];
  if (imageUrlsRaw) {
    try {
      const arr = JSON.parse(imageUrlsRaw) as unknown;
      imageUrlsArr = Array.isArray(arr) ? arr.filter((u): u is string => typeof u === "string") : [];
    } catch {
      imageUrlsArr = [];
    }
  }
  const primaryUrl = imageUrlsArr[0] ?? (parsed.data.imageUrl || null);

  await prisma.carModel.update({
    where: { id },
    data: {
      brand: { connect: { id: parsed.data.brandId } },
      name: parsed.data.name,
      slug,
      bodyType: (parsed.data.bodyType || null) as never,
      segment: parsed.data.segment || null,
      minPrice: parsed.data.minPrice ?? null,
      maxPrice: parsed.data.maxPrice ?? null,
      imageUrl: primaryUrl,
      imageUrls: imageUrlsArr.length > 0 ? JSON.stringify(imageUrlsArr) : null,
    },
  });
  revalidatePath("/admin/catalog");
  return { success: true, message: "Model updated." };
}

export async function deleteModel(id: string): Promise<ActionResult> {
  await requireAdmin();
  const model = await prisma.carModel.findUnique({ where: { id }, include: { _count: { select: { variants: true } } } });
  if (!model) return { success: false, message: "Model not found." };
  if (model._count.variants > 0) return { success: false, message: "Cannot delete a model that has variants. Remove all variants first." };

  await prisma.carModel.delete({ where: { id } });
  revalidatePath("/admin/catalog");
  return { success: true, message: "Model deleted." };
}

// ── Car Variant CRUD ────────────────────────────────────────────

const variantDimensionsData = (p: {
  length?: number | null;
  width?: number | null;
  height?: number | null;
  wheelbase?: number | null;
  bootCapacity?: number | null;
  fuelTank?: number | null;
  seating?: number | null;
}) => ({
  length: p.length ?? null,
  width: p.width ?? null,
  height: p.height ?? null,
  wheelbase: p.wheelbase ?? null,
  bootCapacity: p.bootCapacity ?? null,
  fuelTank: p.fuelTank ?? null,
  seating: p.seating ?? null,
});

export async function createVariant(_prev: ActionResult | null, formData: FormData): Promise<ActionResult> {
  await requireAdmin();
  const parsed = carVariantSchema.safeParse(Object.fromEntries(formData.entries()));
  if (!parsed.success) return { success: false, message: "Validation failed.", errors: parsed.error.flatten().fieldErrors as Record<string, string[]> };

  let slug: string;
  if (parsed.data.slug) {
    const existing = await prisma.carVariant.findFirst({ where: { modelId: parsed.data.modelId, slug: parsed.data.slug } });
    if (existing) return { success: false, message: "A variant with this slug already exists for this model." };
    slug = parsed.data.slug;
  } else {
    slug = await ensureUniqueVariantSlug(parsed.data.modelId, slugify(parsed.data.name));
  }

  const dims = variantDimensionsData(parsed.data);

  await prisma.carVariant.create({
    data: {
      modelId: parsed.data.modelId,
      name: parsed.data.name,
      slug,
      fuelType: (parsed.data.fuelType || null) as never,
      transmission: (parsed.data.transmission || null) as never,
      engine: parsed.data.engine || null,
      power: parsed.data.power || null,
      torque: parsed.data.torque || null,
      mileage: parsed.data.mileage || null,
      ...dims,
      exShowroomPrice: parsed.data.exShowroomPrice ?? null,
    },
  });

  if (parsed.data.applyDimensionsToAllVariants) {
    await prisma.carVariant.updateMany({
      where: { modelId: parsed.data.modelId },
      data: dims,
    });
  }

  revalidatePath("/admin/catalog");
  return { success: true, message: "Variant created." };
}

export async function updateVariant(id: string, _prev: ActionResult | null, formData: FormData): Promise<ActionResult> {
  await requireAdmin();
  const parsed = carVariantSchema.safeParse(Object.fromEntries(formData.entries()));
  if (!parsed.success) return { success: false, message: "Validation failed.", errors: parsed.error.flatten().fieldErrors as Record<string, string[]> };

  let slug: string;
  if (parsed.data.slug) {
    const existing = await prisma.carVariant.findFirst({ where: { modelId: parsed.data.modelId, slug: parsed.data.slug, id: { not: id } } });
    if (existing) return { success: false, message: "A variant with this slug already exists for this model." };
    slug = parsed.data.slug;
  } else {
    slug = await ensureUniqueVariantSlug(parsed.data.modelId, slugify(parsed.data.name), id);
  }

  const dims = variantDimensionsData(parsed.data);

  await prisma.carVariant.update({
    where: { id },
    data: {
      modelId: parsed.data.modelId,
      name: parsed.data.name,
      slug,
      fuelType: (parsed.data.fuelType || null) as never,
      transmission: (parsed.data.transmission || null) as never,
      engine: parsed.data.engine || null,
      power: parsed.data.power || null,
      torque: parsed.data.torque || null,
      mileage: parsed.data.mileage || null,
      ...dims,
      exShowroomPrice: parsed.data.exShowroomPrice ?? null,
    },
  });

  if (parsed.data.applyDimensionsToAllVariants) {
    await prisma.carVariant.updateMany({
      where: { modelId: parsed.data.modelId },
      data: dims,
    });
  }

  revalidatePath("/admin/catalog");
  return { success: true, message: "Variant updated." };
}

export async function deleteVariant(id: string): Promise<ActionResult> {
  await requireAdmin();
  await prisma.carVariant.delete({ where: { id } });
  revalidatePath("/admin/catalog");
  return { success: true, message: "Variant deleted." };
}

// ── Dealer management ───────────────────────────────────────────

export async function updateDealerStatus(formData: FormData): Promise<ActionResult> {
  await requireAdmin();
  const parsed = dealerApprovalSchema.safeParse(Object.fromEntries(formData.entries()));
  if (!parsed.success) return { success: false, message: "Invalid data." };

  const statusMap: Record<string, "ACTIVE" | "SUSPENDED" | "PENDING"> = {
    APPROVE: "ACTIVE",
    RESTORE: "ACTIVE",
    REJECT: "SUSPENDED",
    SUSPEND: "SUSPENDED",
  };

  const newStatus = statusMap[parsed.data.action];
  if (!newStatus) return { success: false, message: "Invalid action." };

  await prisma.dealer.update({ where: { id: parsed.data.dealerId }, data: { status: newStatus } });
  revalidatePath("/admin/dealers");
  return { success: true, message: `Dealer ${parsed.data.action.toLowerCase()}d.` };
}

// ── User role management ────────────────────────────────────────

export async function updateUserRole(formData: FormData): Promise<ActionResult> {
  await requireAdmin();
  const parsed = userRoleSchema.safeParse(Object.fromEntries(formData.entries()));
  if (!parsed.success) return { success: false, message: "Invalid data." };

  await setUserRole(parsed.data.userId, parsed.data.role as UserRole);
  await prisma.user.update({ where: { id: parsed.data.userId }, data: { role: parsed.data.role as never } });
  revalidatePath("/admin/users");
  return { success: true, message: `User role updated to ${parsed.data.role}.` };
}

// ── Lead reassignment ───────────────────────────────────────────

export async function reassignLead(formData: FormData): Promise<ActionResult> {
  await requireAdmin();
  const parsed = leadReassignSchema.safeParse(Object.fromEntries(formData.entries()));
  if (!parsed.success) return { success: false, message: "Invalid data.", errors: parsed.error.flatten().fieldErrors as Record<string, string[]> };

  await prisma.lead.update({ where: { id: parsed.data.leadId }, data: { dealerId: parsed.data.dealerId } });
  revalidatePath("/admin/leads");
  return { success: true, message: "Lead reassigned." };
}

export async function updateLeadStatusAdmin(formData: FormData): Promise<ActionResult> {
  await requireAdmin();
  const leadId = formData.get("leadId") as string;
  const status = formData.get("status") as string;
  if (!leadId || !status) return { success: false, message: "Missing fields." };

  await prisma.lead.update({ where: { id: leadId }, data: { status: status as never } });
  revalidatePath("/admin/leads");
  return { success: true, message: `Lead status updated to ${status.replace("_", " ").toLowerCase()}.` };
}

// ── Content articles ────────────────────────────────────────────

export async function createArticle(_prev: ActionResult | null, formData: FormData): Promise<ActionResult> {
  const user = await requireAdmin();
  const parsed = contentArticleSchema.safeParse(Object.fromEntries(formData.entries()));
  if (!parsed.success) return { success: false, message: "Validation failed.", errors: parsed.error.flatten().fieldErrors as Record<string, string[]> };

  const existing = await prisma.contentArticle.findUnique({ where: { slug: parsed.data.slug } });
  if (existing) return { success: false, message: "An article with this slug already exists." };

  await prisma.contentArticle.create({
    data: {
      type: parsed.data.type as never,
      title: parsed.data.title,
      slug: parsed.data.slug,
      body: parsed.data.body,
      heroMediaUrl: parsed.data.heroMediaUrl || null,
      tags: parsed.data.tags || null,
      authorId: user.id,
      publishedAt: parsed.data.publishNow ? new Date() : null,
    },
  });
  revalidatePath("/admin/content");
  return { success: true, message: "Article created." };
}

export async function updateArticle(id: string, _prev: ActionResult | null, formData: FormData): Promise<ActionResult> {
  await requireAdmin();
  const parsed = contentArticleSchema.safeParse(Object.fromEntries(formData.entries()));
  if (!parsed.success) return { success: false, message: "Validation failed.", errors: parsed.error.flatten().fieldErrors as Record<string, string[]> };

  await prisma.contentArticle.update({
    where: { id },
    data: {
      type: parsed.data.type as never,
      title: parsed.data.title,
      slug: parsed.data.slug,
      body: parsed.data.body,
      heroMediaUrl: parsed.data.heroMediaUrl || null,
      tags: parsed.data.tags || null,
      publishedAt: parsed.data.publishNow ? new Date() : null,
    },
  });
  revalidatePath("/admin/content");
  return { success: true, message: "Article updated." };
}

export async function deleteArticle(id: string): Promise<ActionResult> {
  await requireAdmin();
  await prisma.contentArticle.delete({ where: { id } });
  revalidatePath("/admin/content");
  return { success: true, message: "Article deleted." };
}

export async function toggleArticlePublish(id: string): Promise<ActionResult> {
  await requireAdmin();
  const article = await prisma.contentArticle.findUnique({ where: { id } });
  if (!article) return { success: false, message: "Article not found." };

  await prisma.contentArticle.update({
    where: { id },
    data: { publishedAt: article.publishedAt ? null : new Date() },
  });
  revalidatePath("/admin/content");
  return { success: true, message: article.publishedAt ? "Article unpublished." : "Article published." };
}

// ── Upcoming cars ───────────────────────────────────────────────

export async function createUpcomingCar(_prev: ActionResult | null, formData: FormData): Promise<ActionResult> {
  await requireAdmin();
  const parsed = upcomingCarSchema.safeParse(Object.fromEntries(formData.entries()));
  if (!parsed.success) return { success: false, message: "Validation failed.", errors: parsed.error.flatten().fieldErrors as Record<string, string[]> };

  await prisma.upcomingCar.create({
    data: {
      brandId: parsed.data.brandId,
      name: parsed.data.name,
      expectedLaunch: parsed.data.expectedLaunch || null,
      estimatedPrice: parsed.data.estimatedPrice || null,
      keyHighlights: parsed.data.keyHighlights || null,
      imageUrl: parsed.data.imageUrl || null,
    },
  });
  revalidatePath("/admin/content");
  return { success: true, message: "Upcoming car created." };
}

export async function updateUpcomingCar(id: string, _prev: ActionResult | null, formData: FormData): Promise<ActionResult> {
  await requireAdmin();
  const parsed = upcomingCarSchema.safeParse(Object.fromEntries(formData.entries()));
  if (!parsed.success) return { success: false, message: "Validation failed.", errors: parsed.error.flatten().fieldErrors as Record<string, string[]> };

  await prisma.upcomingCar.update({
    where: { id },
    data: {
      brandId: parsed.data.brandId,
      name: parsed.data.name,
      expectedLaunch: parsed.data.expectedLaunch || null,
      estimatedPrice: parsed.data.estimatedPrice || null,
      keyHighlights: parsed.data.keyHighlights || null,
      imageUrl: parsed.data.imageUrl || null,
    },
  });
  revalidatePath("/admin/content");
  return { success: true, message: "Upcoming car updated." };
}

export async function deleteUpcomingCar(id: string): Promise<ActionResult> {
  await requireAdmin();
  await prisma.upcomingCar.delete({ where: { id } });
  revalidatePath("/admin/content");
  return { success: true, message: "Upcoming car deleted." };
}

// ── Hero slides ──────────────────────────────────────────────────

function parseLocationsJson(raw: string): string | null {
  const s = raw?.trim();
  if (!s) return null;
  try {
    const parsed = JSON.parse(s) as unknown;
    if (Array.isArray(parsed)) return JSON.stringify(parsed);
  } catch {
    // Try "Name, Phone" per line
    const lines = s.split(/\n/).map((l) => l.trim()).filter(Boolean);
    const arr = lines.map((line) => {
      const idx = line.lastIndexOf(",");
      if (idx === -1) return { name: line, phone: "" };
      return { name: line.slice(0, idx).trim(), phone: line.slice(idx + 1).trim() };
    });
    if (arr.length) return JSON.stringify(arr);
  }
  return null;
}

export async function createHeroSlide(_prev: ActionResult | null, formData: FormData): Promise<ActionResult> {
  await requireAdmin();
  const parsed = heroSlideSchema.safeParse(Object.fromEntries(formData.entries()));
  if (!parsed.success) return { success: false, message: "Validation failed.", errors: parsed.error.flatten().fieldErrors as Record<string, string[]> };

  const locationsJson = parseLocationsJson(parsed.data.locationsJson ?? "");

  await prisma.heroSlide.create({
    data: {
      title: parsed.data.title,
      subtitle: parsed.data.subtitle || null,
      benefitText: parsed.data.benefitText || null,
      dealerName: parsed.data.dealerName || null,
      locationsJson,
      imageUrl: parsed.data.imageUrl || null,
      sortOrder: parsed.data.sortOrder,
      active: parsed.data.active,
    },
  });
  revalidatePath("/admin/content");
  revalidatePath("/");
  return { success: true, message: "Hero slide created." };
}

export async function updateHeroSlide(id: string, _prev: ActionResult | null, formData: FormData): Promise<ActionResult> {
  await requireAdmin();
  const parsed = heroSlideSchema.safeParse(Object.fromEntries(formData.entries()));
  if (!parsed.success) return { success: false, message: "Validation failed.", errors: parsed.error.flatten().fieldErrors as Record<string, string[]> };

  const locationsJson = parseLocationsJson(parsed.data.locationsJson ?? "");

  await prisma.heroSlide.update({
    where: { id },
    data: {
      title: parsed.data.title,
      subtitle: parsed.data.subtitle || null,
      benefitText: parsed.data.benefitText || null,
      dealerName: parsed.data.dealerName || null,
      locationsJson,
      imageUrl: parsed.data.imageUrl || null,
      sortOrder: parsed.data.sortOrder,
      active: parsed.data.active,
    },
  });
  revalidatePath("/admin/content");
  revalidatePath("/");
  return { success: true, message: "Hero slide updated." };
}

export async function deleteHeroSlide(id: string): Promise<ActionResult> {
  await requireAdmin();
  await prisma.heroSlide.delete({ where: { id } });
  revalidatePath("/admin/content");
  revalidatePath("/");
  return { success: true, message: "Hero slide deleted." };
}

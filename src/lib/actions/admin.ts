"use server";

import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import {
  carBrandSchema,
  carModelSchema,
  carVariantSchema,
  dealerApprovalSchema,
  userRoleSchema,
  leadReassignSchema,
  contentArticleSchema,
  upcomingCarSchema,
} from "@/lib/validations/admin";
import { revalidatePath } from "next/cache";

export type ActionResult = {
  success: boolean;
  message: string;
  errors?: Record<string, string[]>;
};

// ── Car Brand CRUD ──────────────────────────────────────────────

export async function createBrand(_prev: ActionResult | null, formData: FormData): Promise<ActionResult> {
  await requireAdmin();
  const parsed = carBrandSchema.safeParse(Object.fromEntries(formData.entries()));
  if (!parsed.success) return { success: false, message: "Validation failed.", errors: parsed.error.flatten().fieldErrors as Record<string, string[]> };

  const existing = await prisma.carBrand.findUnique({ where: { slug: parsed.data.slug } });
  if (existing) return { success: false, message: "A brand with this slug already exists." };

  await prisma.carBrand.create({ data: { name: parsed.data.name, slug: parsed.data.slug, country: parsed.data.country || null, logoUrl: parsed.data.logoUrl || null } });
  revalidatePath("/admin/catalog");
  return { success: true, message: "Brand created." };
}

export async function updateBrand(id: string, _prev: ActionResult | null, formData: FormData): Promise<ActionResult> {
  await requireAdmin();
  const parsed = carBrandSchema.safeParse(Object.fromEntries(formData.entries()));
  if (!parsed.success) return { success: false, message: "Validation failed.", errors: parsed.error.flatten().fieldErrors as Record<string, string[]> };

  await prisma.carBrand.update({ where: { id }, data: { name: parsed.data.name, slug: parsed.data.slug, country: parsed.data.country || null, logoUrl: parsed.data.logoUrl || null } });
  revalidatePath("/admin/catalog");
  return { success: true, message: "Brand updated." };
}

export async function deleteBrand(id: string): Promise<ActionResult> {
  await requireAdmin();
  const brand = await prisma.carBrand.findUnique({ where: { id }, include: { _count: { select: { models: true } } } });
  if (!brand) return { success: false, message: "Brand not found." };
  if (brand._count.models > 0) return { success: false, message: "Cannot delete a brand that has models. Remove all models first." };

  await prisma.carBrand.delete({ where: { id } });
  revalidatePath("/admin/catalog");
  return { success: true, message: "Brand deleted." };
}

// ── Car Model CRUD ──────────────────────────────────────────────

export async function createModel(_prev: ActionResult | null, formData: FormData): Promise<ActionResult> {
  await requireAdmin();
  const parsed = carModelSchema.safeParse(Object.fromEntries(formData.entries()));
  if (!parsed.success) return { success: false, message: "Validation failed.", errors: parsed.error.flatten().fieldErrors as Record<string, string[]> };

  await prisma.carModel.create({
    data: {
      brandId: parsed.data.brandId,
      name: parsed.data.name,
      slug: parsed.data.slug,
      bodyType: (parsed.data.bodyType || null) as never,
      segment: parsed.data.segment || null,
      minPrice: parsed.data.minPrice ?? null,
      maxPrice: parsed.data.maxPrice ?? null,
      imageUrl: parsed.data.imageUrl || null,
    },
  });
  revalidatePath("/admin/catalog");
  return { success: true, message: "Model created." };
}

export async function updateModel(id: string, _prev: ActionResult | null, formData: FormData): Promise<ActionResult> {
  await requireAdmin();
  const parsed = carModelSchema.safeParse(Object.fromEntries(formData.entries()));
  if (!parsed.success) return { success: false, message: "Validation failed.", errors: parsed.error.flatten().fieldErrors as Record<string, string[]> };

  await prisma.carModel.update({
    where: { id },
    data: {
      brandId: parsed.data.brandId,
      name: parsed.data.name,
      slug: parsed.data.slug,
      bodyType: (parsed.data.bodyType || null) as never,
      segment: parsed.data.segment || null,
      minPrice: parsed.data.minPrice ?? null,
      maxPrice: parsed.data.maxPrice ?? null,
      imageUrl: parsed.data.imageUrl || null,
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

export async function createVariant(_prev: ActionResult | null, formData: FormData): Promise<ActionResult> {
  await requireAdmin();
  const parsed = carVariantSchema.safeParse(Object.fromEntries(formData.entries()));
  if (!parsed.success) return { success: false, message: "Validation failed.", errors: parsed.error.flatten().fieldErrors as Record<string, string[]> };

  await prisma.carVariant.create({
    data: {
      modelId: parsed.data.modelId,
      name: parsed.data.name,
      slug: parsed.data.slug,
      fuelType: (parsed.data.fuelType || null) as never,
      transmission: (parsed.data.transmission || null) as never,
      engine: parsed.data.engine || null,
      power: parsed.data.power || null,
      torque: parsed.data.torque || null,
      mileage: parsed.data.mileage || null,
      seating: parsed.data.seating ?? null,
      exShowroomPrice: parsed.data.exShowroomPrice ?? null,
    },
  });
  revalidatePath("/admin/catalog");
  return { success: true, message: "Variant created." };
}

export async function updateVariant(id: string, _prev: ActionResult | null, formData: FormData): Promise<ActionResult> {
  await requireAdmin();
  const parsed = carVariantSchema.safeParse(Object.fromEntries(formData.entries()));
  if (!parsed.success) return { success: false, message: "Validation failed.", errors: parsed.error.flatten().fieldErrors as Record<string, string[]> };

  await prisma.carVariant.update({
    where: { id },
    data: {
      modelId: parsed.data.modelId,
      name: parsed.data.name,
      slug: parsed.data.slug,
      fuelType: (parsed.data.fuelType || null) as never,
      transmission: (parsed.data.transmission || null) as never,
      engine: parsed.data.engine || null,
      power: parsed.data.power || null,
      torque: parsed.data.torque || null,
      mileage: parsed.data.mileage || null,
      seating: parsed.data.seating ?? null,
      exShowroomPrice: parsed.data.exShowroomPrice ?? null,
    },
  });
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

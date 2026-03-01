"use server";

import { prisma } from "@/lib/db";
import { requireDealer } from "@/lib/auth";
import {
  inventoryItemSchema,
  leadStatusSchema,
  testDriveStatusSchema,
  dealerSettingsSchema,
  offerSchema,
} from "@/lib/validations/dealer";
import { revalidatePath } from "next/cache";
import {
  sendEmail,
  testDriveUpdateEmail,
  newDealerSignupEmail,
} from "@/lib/email";
import type { ActionResult } from "@/lib/types";

// ── Inventory ───────────────────────────────────────────────────

export async function addInventoryItem(
  _prev: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  const user = await requireDealer();
  const dealerId = user.dealerId!;

  const raw = Object.fromEntries(formData.entries());
  const parsed = inventoryItemSchema.safeParse(raw);

  if (!parsed.success) {
    return {
      success: false,
      message: "Please fix the errors below.",
      errors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
    };
  }

  const existing = await prisma.dealerInventoryItem.findUnique({
    where: {
      dealerId_variantId: {
        dealerId,
        variantId: parsed.data.variantId,
      },
    },
  });

  if (existing) {
    return {
      success: false,
      message: "You already have this variant in your inventory.",
    };
  }

  await prisma.dealerInventoryItem.create({
    data: {
      dealerId,
      variantId: parsed.data.variantId,
      onRoadPrice: parsed.data.onRoadPrice ?? null,
      stockStatus: parsed.data.stockStatus,
      visibility: parsed.data.visibility as "DRAFT" | "VISIBLE" | "HIDDEN",
      colorOptions: parsed.data.colorOptions ?? null,
      offers: parsed.data.offers ?? null,
      imageUrls: parsed.data.imageUrls ?? null,
    },
  });

  revalidatePath("/dealer/inventory");
  return { success: true, message: "Inventory item added successfully." };
}

export async function updateInventoryItem(
  itemId: string,
  _prev: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  const user = await requireDealer();
  const dealerId = user.dealerId!;

  const item = await prisma.dealerInventoryItem.findFirst({
    where: { id: itemId, dealerId },
  });
  if (!item) {
    return { success: false, message: "Inventory item not found." };
  }

  const raw = Object.fromEntries(formData.entries());
  const parsed = inventoryItemSchema.safeParse(raw);

  if (!parsed.success) {
    return {
      success: false,
      message: "Please fix the errors below.",
      errors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
    };
  }

  await prisma.dealerInventoryItem.update({
    where: { id: itemId },
    data: {
      variantId: parsed.data.variantId,
      onRoadPrice: parsed.data.onRoadPrice ?? null,
      stockStatus: parsed.data.stockStatus,
      visibility: parsed.data.visibility as "DRAFT" | "VISIBLE" | "HIDDEN",
      colorOptions: parsed.data.colorOptions ?? null,
      offers: parsed.data.offers ?? null,
      imageUrls: parsed.data.imageUrls ?? null,
    },
  });

  revalidatePath("/dealer/inventory");
  revalidatePath(`/dealer/inventory/${itemId}/edit`);
  return { success: true, message: "Inventory item updated successfully." };
}

export async function deleteInventoryItem(
  itemId: string,
): Promise<ActionResult> {
  const user = await requireDealer();
  const dealerId = user.dealerId!;

  const item = await prisma.dealerInventoryItem.findFirst({
    where: { id: itemId, dealerId },
  });
  if (!item) {
    return { success: false, message: "Inventory item not found." };
  }

  await prisma.dealerInventoryItem.delete({ where: { id: itemId } });

  revalidatePath("/dealer/inventory");
  return { success: true, message: "Inventory item deleted." };
}

// ── Lead status ─────────────────────────────────────────────────

export async function updateLeadStatus(
  formData: FormData,
): Promise<ActionResult> {
  const user = await requireDealer();
  const dealerId = user.dealerId!;

  const raw = Object.fromEntries(formData.entries());
  const parsed = leadStatusSchema.safeParse(raw);

  if (!parsed.success) {
    return {
      success: false,
      message: "Invalid data.",
      errors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
    };
  }

  const lead = await prisma.lead.findFirst({
    where: { id: parsed.data.leadId, dealerId },
  });
  if (!lead) {
    return { success: false, message: "Lead not found." };
  }

  await prisma.lead.update({
    where: { id: parsed.data.leadId },
    data: {
      status: parsed.data.status as
        | "NEW"
        | "CONTACTED"
        | "IN_PROGRESS"
        | "COMPLETED"
        | "DROPPED",
    },
  });

  revalidatePath("/dealer/leads");
  revalidatePath(`/dealer/leads/${parsed.data.leadId}`);
  return { success: true, message: `Lead marked as ${parsed.data.status.toLowerCase().replace("_", " ")}.` };
}

// ── Test drive status ───────────────────────────────────────────

export async function updateTestDriveStatus(
  formData: FormData,
): Promise<ActionResult> {
  const user = await requireDealer();
  const dealerId = user.dealerId!;

  const raw = Object.fromEntries(formData.entries());
  const parsed = testDriveStatusSchema.safeParse(raw);

  if (!parsed.success) {
    return {
      success: false,
      message: "Invalid data.",
      errors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
    };
  }

  const slot = await prisma.testDriveSlot.findFirst({
    where: { id: parsed.data.slotId, dealerId },
  });
  if (!slot) {
    return { success: false, message: "Test drive slot not found." };
  }

  await prisma.testDriveSlot.update({
    where: { id: parsed.data.slotId },
    data: {
      status: parsed.data.status as
        | "REQUESTED"
        | "CONFIRMED"
        | "COMPLETED"
        | "CANCELLED"
        | "NO_SHOW",
      notes: parsed.data.notes ?? slot.notes,
    },
  });

  const [buyer, variant, dealer] = await Promise.all([
    prisma.user.findUnique({ where: { id: slot.buyerId }, select: { name: true, email: true } }),
    prisma.carVariant.findUnique({
      where: { id: slot.variantId },
      select: { name: true, model: { select: { name: true, brand: { select: { name: true } } } } },
    }),
    prisma.dealer.findUnique({ where: { id: dealerId }, select: { name: true } }),
  ]);

  if (buyer?.email && variant && dealer) {
    const carName = `${variant.model.brand.name} ${variant.model.name} ${variant.name}`;
    sendEmail({
      to: buyer.email,
      subject: `Test drive update – ${carName}`,
      html: testDriveUpdateEmail(buyer.name || "", carName, parsed.data.status, dealer.name),
    }).catch(() => {});
  }

  revalidatePath("/dealer/test-drives");
  return {
    success: true,
    message: `Test drive ${parsed.data.status.toLowerCase().replace("_", " ")}.`,
  };
}

// ── Offers ──────────────────────────────────────────────────────

export async function createOffer(
  _prev: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  const user = await requireDealer();
  const dealerId = user.dealerId!;

  const raw = Object.fromEntries(formData.entries());
  const parsed = offerSchema.safeParse(raw);

  if (!parsed.success) {
    return {
      success: false,
      message: "Please fix the errors below.",
      errors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
    };
  }

  const item = await prisma.dealerInventoryItem.findFirst({
    where: { id: parsed.data.inventoryItemId, dealerId },
  });
  if (!item) {
    return { success: false, message: "Inventory item not found." };
  }

  const offerData = {
    title: parsed.data.title,
    description: parsed.data.description || "",
    discountType: parsed.data.discountType,
    discountAmount: parsed.data.discountAmount,
    validFrom: parsed.data.validFrom,
    validTo: parsed.data.validTo,
    isHighlighted: parsed.data.isHighlighted,
  };

  const existingOffers = item.offers ? JSON.parse(item.offers) : [];
  existingOffers.push({ ...offerData, id: crypto.randomUUID(), createdAt: new Date().toISOString() });

  await prisma.dealerInventoryItem.update({
    where: { id: parsed.data.inventoryItemId },
    data: { offers: JSON.stringify(existingOffers) },
  });

  revalidatePath("/dealer/offers");
  revalidatePath("/dealer/inventory");
  return { success: true, message: "Offer created successfully." };
}

export async function deleteOffer(
  inventoryItemId: string,
  offerId: string,
): Promise<ActionResult> {
  const user = await requireDealer();
  const dealerId = user.dealerId!;

  const item = await prisma.dealerInventoryItem.findFirst({
    where: { id: inventoryItemId, dealerId },
  });
  if (!item || !item.offers) {
    return { success: false, message: "Offer not found." };
  }

  const offers = JSON.parse(item.offers).filter(
    (o: { id: string }) => o.id !== offerId,
  );

  await prisma.dealerInventoryItem.update({
    where: { id: inventoryItemId },
    data: { offers: offers.length ? JSON.stringify(offers) : null },
  });

  revalidatePath("/dealer/offers");
  return { success: true, message: "Offer removed." };
}

// ── Dealer settings ─────────────────────────────────────────────

export async function updateDealerSettings(
  _prev: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  const user = await requireDealer();
  const dealerId = user.dealerId!;

  const raw = Object.fromEntries(formData.entries());
  const parsed = dealerSettingsSchema.safeParse(raw);

  if (!parsed.success) {
    return {
      success: false,
      message: "Please fix the errors below.",
      errors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
    };
  }

  await prisma.dealer.update({
    where: { id: dealerId },
    data: {
      name: parsed.data.name,
      city: parsed.data.city,
      address: parsed.data.address,
      phone: parsed.data.phone || null,
      email: parsed.data.email || null,
      description: parsed.data.description || null,
    },
  });

  revalidatePath("/dealer/settings");
  revalidatePath("/dealer");
  return { success: true, message: "Settings updated successfully." };
}

// ── Dealer signup (public) ──────────────────────────────────────

export async function dealerSignup(
  _prev: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  const { dealerSignupSchema } = await import("@/lib/validations/dealer");
  const { hash } = await import("bcryptjs");

  const raw = {
    ...Object.fromEntries(formData.entries()),
    brandIds: formData.getAll("brandIds"),
  };
  const parsed = dealerSignupSchema.safeParse(raw);

  if (!parsed.success) {
    return {
      success: false,
      message: "Please fix the errors below.",
      errors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
    };
  }

  const existingUser = await prisma.user.findUnique({
    where: { email: parsed.data.contactEmail.toLowerCase() },
  });
  if (existingUser) {
    return {
      success: false,
      message: "An account with this email already exists.",
    };
  }

  const slug = parsed.data.name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

  const existingSlug = await prisma.dealer.findUnique({ where: { slug } });
  if (existingSlug) {
    return {
      success: false,
      message: "A dealer with a similar name already exists. Please choose a different name.",
    };
  }

  const hashedPassword = await hash(parsed.data.contactPassword, 12);

  await prisma.user.create({
    data: {
      email: parsed.data.contactEmail.toLowerCase(),
      password: hashedPassword,
      name: parsed.data.contactName,
      phone: parsed.data.phone,
      role: "DEALER",
      dealer: {
        create: {
          name: parsed.data.name,
          slug,
          city: parsed.data.city,
          address: parsed.data.address,
          phone: parsed.data.phone,
          email: parsed.data.email,
          description: parsed.data.description || null,
          status: "PENDING",
          dealerBrands: {
            create: parsed.data.brandIds.map((brandId) => ({ brandId })),
          },
        },
      },
    },
  });

  const adminUsers = await prisma.user.findMany({
    where: { role: "ADMIN" },
    select: { email: true },
  });

  const adminEmails = adminUsers.map((u) => u.email).filter(Boolean);
  if (adminEmails.length > 0) {
    sendEmail({
      to: adminEmails,
      subject: `New dealer application: ${parsed.data.name}`,
      html: newDealerSignupEmail(parsed.data.name, parsed.data.city, parsed.data.contactEmail),
    }).catch(() => {});
  }

  return {
    success: true,
    message:
      "Your dealer application has been submitted. You will be notified once approved by our admin team.",
  };
}

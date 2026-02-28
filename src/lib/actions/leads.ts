"use server";

import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { enquiryFormSchema, testDriveFormSchema, reviewFormSchema } from "@/lib/validations/lead";

export type ActionResult = {
  success: boolean;
  message: string;
  errors?: Record<string, string[]>;
};

export async function submitEnquiry(_prev: ActionResult | null, formData: FormData): Promise<ActionResult> {
  const session = await getSession();
  if (!session?.user?.id) {
    return { success: false, message: "You must be signed in to submit an enquiry." };
  }

  const raw = Object.fromEntries(formData.entries());
  const parsed = enquiryFormSchema.safeParse(raw);

  if (!parsed.success) {
    return {
      success: false,
      message: "Please fix the errors below.",
      errors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
    };
  }

  const { dealerId, carModelId, carVariantId, message, source } = parsed.data;

  await prisma.lead.create({
    data: {
      buyerId: session.user.id,
      dealerId,
      type: "ENQUIRY",
      status: "NEW",
      source: source || "car_detail",
      carModelId: carModelId || null,
      carVariantId: carVariantId || null,
      message,
    },
  });

  return { success: true, message: "Your enquiry has been submitted. The dealer will contact you soon." };
}

export async function submitTestDriveRequest(_prev: ActionResult | null, formData: FormData): Promise<ActionResult> {
  const session = await getSession();
  if (!session?.user?.id) {
    return { success: false, message: "You must be signed in to request a test drive." };
  }

  const raw = Object.fromEntries(formData.entries());
  const parsed = testDriveFormSchema.safeParse(raw);

  if (!parsed.success) {
    return {
      success: false,
      message: "Please fix the errors below.",
      errors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
    };
  }

  const { dealerId, variantId, preferredDate, preferredTime } = parsed.data;

  const slotAt = new Date(`${preferredDate}T${preferredTime}:00`);

  await prisma.$transaction([
    prisma.lead.create({
      data: {
        buyerId: session.user.id,
        dealerId,
        type: "TEST_DRIVE",
        status: "NEW",
        source: parsed.data.source || "car_detail",
        carVariantId: variantId,
        message: parsed.data.message || null,
      },
    }),
    prisma.testDriveSlot.create({
      data: {
        dealerId,
        variantId,
        buyerId: session.user.id,
        slotAt,
        status: "REQUESTED",
        notes: parsed.data.message || null,
      },
    }),
  ]);

  return { success: true, message: "Your test drive request has been submitted. The dealer will confirm shortly." };
}

export async function submitReview(_prev: ActionResult | null, formData: FormData): Promise<ActionResult> {
  const session = await getSession();
  if (!session?.user?.id) {
    return { success: false, message: "You must be signed in to submit a review." };
  }

  const raw = {
    carVariantId: formData.get("carVariantId") as string,
    rating: Number(formData.get("rating")),
    title: formData.get("title") as string,
    content: formData.get("content") as string,
  };

  const parsed = reviewFormSchema.safeParse(raw);

  if (!parsed.success) {
    return {
      success: false,
      message: "Please fix the errors below.",
      errors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
    };
  }

  await prisma.review.create({
    data: {
      type: "USER",
      authorId: session.user.id,
      carVariantId: parsed.data.carVariantId,
      rating: parsed.data.rating,
      title: parsed.data.title,
      content: parsed.data.content,
    },
  });

  return { success: true, message: "Your review has been published. Thank you!" };
}

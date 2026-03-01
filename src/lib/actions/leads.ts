"use server";

import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { enquiryFormSchema, testDriveFormSchema, reviewFormSchema } from "@/lib/validations/lead";
import {
  sendEmail,
  enquiryConfirmationEmail,
  testDriveConfirmationEmail,
  newLeadNotificationEmail,
  testDriveBookingEmail,
} from "@/lib/email";
import type { ActionResult } from "@/lib/types";

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

  const [dealer, buyer, carModel] = await Promise.all([
    prisma.dealer.findUnique({ where: { id: dealerId }, select: { name: true, email: true } }),
    prisma.user.findUnique({ where: { id: session.user.id }, select: { name: true, email: true } }),
    carModelId
      ? prisma.carModel.findUnique({
          where: { id: carModelId },
          select: { name: true, brand: { select: { name: true } } },
        })
      : null,
  ]);

  const carName = carModel ? `${carModel.brand.name} ${carModel.name}` : undefined;

  if (buyer?.email) {
    sendEmail({
      to: buyer.email,
      subject: "Your enquiry has been received – CarDiscovery",
      html: enquiryConfirmationEmail(buyer.name || "", dealer?.name || "the dealer", carName),
    }).catch(() => {});
  }

  if (dealer?.email) {
    sendEmail({
      to: dealer.email,
      subject: `New enquiry from ${buyer?.name || "a customer"}`,
      html: newLeadNotificationEmail(
        dealer.name,
        buyer?.name || "",
        buyer?.email || "",
        "ENQUIRY",
        carName,
        message,
      ),
      replyTo: buyer?.email,
    }).catch(() => {});
  }

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

  const [dealer, buyer, variant] = await Promise.all([
    prisma.dealer.findUnique({ where: { id: dealerId }, select: { name: true, email: true } }),
    prisma.user.findUnique({ where: { id: session.user.id }, select: { name: true, email: true } }),
    prisma.carVariant.findUnique({
      where: { id: variantId },
      select: { name: true, model: { select: { name: true, brand: { select: { name: true } } } } },
    }),
  ]);

  const carName = variant
    ? `${variant.model.brand.name} ${variant.model.name} ${variant.name}`
    : "your selected car";

  if (buyer?.email) {
    sendEmail({
      to: buyer.email,
      subject: "Test drive request received – CarDiscovery",
      html: testDriveConfirmationEmail(
        buyer.name || "",
        dealer?.name || "the dealer",
        carName,
        preferredDate,
        preferredTime,
      ),
    }).catch(() => {});
  }

  if (dealer?.email) {
    sendEmail({
      to: dealer.email,
      subject: `New test drive request from ${buyer?.name || "a customer"}`,
      html: testDriveBookingEmail(
        dealer.name,
        buyer?.name || "",
        carName,
        preferredDate,
        preferredTime,
      ),
      replyTo: buyer?.email,
    }).catch(() => {});
  }

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

"use server";

import { prisma } from "@/lib/db";
import { alertMeSchema } from "@/lib/validations/lead";

export type ActionResult = {
  success: boolean;
  message: string;
  errors?: Record<string, string[]>;
};

export async function subscribeToAlert(_prev: ActionResult | null, formData: FormData): Promise<ActionResult> {
  const raw = Object.fromEntries(formData.entries());
  const parsed = alertMeSchema.safeParse(raw);

  if (!parsed.success) {
    return {
      success: false,
      message: "Please fix the errors below.",
      errors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
    };
  }

  const { upcomingCarId, email, name } = parsed.data;

  const car = await prisma.upcomingCar.findUnique({ where: { id: upcomingCarId } });
  if (!car) {
    return { success: false, message: "Upcoming car not found." };
  }

  const existing = await prisma.savedSearch.findFirst({
    where: {
      user: { email },
      filters: { contains: upcomingCarId },
    },
  });

  if (existing) {
    return { success: true, message: "You're already subscribed to alerts for this car." };
  }

  let user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    user = await prisma.user.create({
      data: {
        email,
        name: name || null,
        role: "BUYER",
      },
    });
  }

  await prisma.savedSearch.create({
    data: {
      userId: user.id,
      name: `Alert: ${car.name}`,
      filters: JSON.stringify({ type: "launch_alert", upcomingCarId }),
    },
  });

  return {
    success: true,
    message: "We'll email you when this car launches. Stay tuned!",
  };
}

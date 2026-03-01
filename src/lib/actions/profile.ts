"use server";

import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { profileSchema } from "@/lib/validations/profile";
import type { ActionResult } from "@/lib/types";

export async function updateProfile(_prev: ActionResult | null, formData: FormData): Promise<ActionResult> {
  const user = await requireUser();

  const raw = Object.fromEntries(formData.entries());
  const parsed = profileSchema.safeParse(raw);

  if (!parsed.success) {
    return {
      success: false,
      message: "Please fix the errors below.",
      errors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
    };
  }

  await prisma.user.update({
    where: { id: user.id },
    data: {
      name: parsed.data.name || null,
      phone: parsed.data.phone || null,
    },
  });

  return { success: true, message: "Profile updated successfully." };
}

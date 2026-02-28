"use server";

import { z } from "zod";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/auth";

export type ActionResult = {
  success: boolean;
  message: string;
  errors?: Record<string, string[]>;
};

const profileSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(100).optional().or(z.literal("")),
  phone: z.string().min(10, "Phone must be at least 10 digits").max(20).optional().or(z.literal("")),
});

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

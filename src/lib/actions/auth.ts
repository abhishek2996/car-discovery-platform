"use server";

import { signIn } from "@/auth";
import { AuthError } from "next-auth";
import { prisma } from "@/lib/db";

export async function loginAction(
  _prev: { error: string | null },
  formData: FormData,
): Promise<{ error: string | null }> {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const callbackUrl = (formData.get("callbackUrl") as string) || "/";

  try {
    await signIn("credentials", {
      email,
      password,
      redirect: false,
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return { error: error.type === "CredentialsSignin" ? "Invalid email or password." : "Sign in failed. Try again." };
    }
    return { error: "An unexpected error occurred." };
  }

  const { redirect: nextRedirect } = await import("next/navigation");
  return nextRedirect(callbackUrl);
}

export async function registerAction(
  _prev: { error: string | null },
  formData: FormData,
): Promise<{ error: string | null }> {
  const email = (formData.get("email") as string)?.toLowerCase()?.trim();
  const password = formData.get("password") as string;
  const name = (formData.get("name") as string)?.trim() || null;
  const callbackUrl = (formData.get("callbackUrl") as string) || "/";

  if (!email || !password) {
    return { error: "Email and password are required." };
  }
  if (password.length < 8) {
    return { error: "Password must be at least 8 characters." };
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return { error: "An account with this email already exists." };
  }

  const { hash } = await import("bcryptjs");
  const hashedPassword = await hash(password, 12);

  await prisma.user.create({
    data: {
      email,
      password: hashedPassword,
      name: name || null,
      role: "BUYER",
    },
  });

  try {
    await signIn("credentials", {
      email,
      password,
      redirect: false,
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return { error: "Account created. Please sign in." };
    }
    return { error: "Account created. Please sign in." };
  }

  const { redirect: nextRedirect } = await import("next/navigation");
  return nextRedirect(callbackUrl);
}

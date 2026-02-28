"use server";

import { signIn } from "@/auth";
import { AuthError } from "next-auth";

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

import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { userId } = await auth();
  const sp = await searchParams;
  const callbackUrl = typeof sp.callbackUrl === "string" ? sp.callbackUrl : "/";

  if (userId) redirect(callbackUrl);

  redirect(`/sign-in?redirect_url=${encodeURIComponent(callbackUrl)}`);
}

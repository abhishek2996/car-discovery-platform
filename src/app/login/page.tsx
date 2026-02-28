import { auth } from "@/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { LoginForm } from "@/components/public/login-form";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ callbackUrl?: string; error?: string }>;
}) {
  const session = await auth();
  const params = await searchParams;
  const callbackUrl = params.callbackUrl ?? "/";
  const error = params.error;

  if (session?.user) redirect(callbackUrl);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-background text-foreground">
      <div className="w-full max-w-sm space-y-6">
        <h1 className="text-2xl font-semibold text-center">Sign in</h1>
        {error && (
          <p className="text-sm text-destructive text-center">
            {error === "CredentialsSignin"
              ? "Invalid email or password."
              : "Sign in failed. Try again."}
          </p>
        )}
        <LoginForm callbackUrl={callbackUrl} />
        <p className="text-sm text-muted-foreground text-center">
          <Link href="/" className="underline hover:text-foreground">
            Back to home
          </Link>
        </p>
      </div>
    </div>
  );
}

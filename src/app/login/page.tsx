import { auth } from "@/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { signIn } from "@/auth";

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
        <form
          action={async (formData: FormData) => {
            "use server";
            await signIn("credentials", {
              email: formData.get("email") as string,
              password: formData.get("password") as string,
              callbackUrl,
            });
          }}
          className="space-y-4"
        >
          <div>
            <label htmlFor="email" className="block text-sm font-medium mb-1">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              className="w-full px-3 py-2 rounded-md border border-border bg-background text-foreground"
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium mb-1">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              className="w-full px-3 py-2 rounded-md border border-border bg-background text-foreground"
            />
          </div>
          <button
            type="submit"
            className="w-full py-2 rounded-md bg-primary text-primary-foreground hover:opacity-90"
          >
            Sign in
          </button>
        </form>
        <p className="text-sm text-muted-foreground text-center">
          <Link href="/" className="underline hover:text-foreground">
            Back to home
          </Link>
        </p>
      </div>
    </div>
  );
}

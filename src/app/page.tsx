import { auth } from "@/auth";
import Link from "next/link";

export default async function HomePage() {
  const session = await auth();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-background text-foreground">
      <h1 className="text-2xl font-semibold mb-4">Car Discovery</h1>
      {session?.user ? (
        <div className="flex flex-col gap-2 text-center">
          <p className="text-muted-foreground">
            Signed in as {session.user.email} ({session.user.role})
          </p>
          <div className="flex gap-3 justify-center">
            {session.user.role === "DEALER" && (
              <Link
                href="/dealer"
                className="px-4 py-2 rounded-md bg-primary text-primary-foreground hover:opacity-90"
              >
                Dealer dashboard
              </Link>
            )}
            {session.user.role === "ADMIN" && (
              <>
                <Link
                  href="/dealer"
                  className="px-4 py-2 rounded-md bg-primary text-primary-foreground hover:opacity-90"
                >
                  Dealer dashboard
                </Link>
                <Link
                  href="/admin"
                  className="px-4 py-2 rounded-md border border-border hover:bg-muted"
                >
                  Admin dashboard
                </Link>
              </>
            )}
            <form
              action={async () => {
                "use server";
                const { signOut } = await import("@/auth");
                await signOut();
              }}
            >
              <button
                type="submit"
                className="px-4 py-2 rounded-md border border-border hover:bg-muted"
              >
                Sign out
              </button>
            </form>
          </div>
        </div>
      ) : (
        <Link
          href="/login"
          className="px-4 py-2 rounded-md bg-primary text-primary-foreground hover:opacity-90"
        >
          Sign in
        </Link>
      )}
    </div>
  );
}

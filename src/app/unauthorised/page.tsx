import Link from "next/link";

export default function UnauthorisedPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4 text-foreground">
      <div className="min-h-[40vh] flex flex-col items-center justify-center gap-4 p-4 text-center max-w-md">
        <h1 className="text-2xl font-semibold">You don&apos;t have access to this page</h1>
        <p className="text-muted-foreground">
          Your account doesn&apos;t have permission to view this content. If you believe this is an error, please contact support.
        </p>
        <div className="flex gap-3">
          <Link
            href="/"
            className="px-4 py-2 rounded-md bg-primary text-primary-foreground hover:opacity-90"
          >
            Go home
          </Link>
          <Link
            href="/sign-in"
            className="px-4 py-2 rounded-md border border-border hover:bg-muted"
          >
            Sign in
          </Link>
        </div>
      </div>
    </div>
  );
}

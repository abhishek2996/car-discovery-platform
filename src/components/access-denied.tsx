import Link from "next/link";

export function AccessDenied() {
  return (
    <div className="min-h-[40vh] flex flex-col items-center justify-center gap-4 p-4 text-center">
      <h2 className="text-xl font-semibold">Access denied</h2>
      <p className="text-muted-foreground max-w-md">
        You don&apos;t have permission to view this content.
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
  );
}

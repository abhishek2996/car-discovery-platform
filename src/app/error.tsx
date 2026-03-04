"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function RootError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Route error:", error);
  }, [error]);

  const isDbError =
    error.message?.includes("DATABASE_URL") ||
    error.message?.includes("Prisma") ||
    error.message?.includes("connect") ||
    error.message?.includes("Connection");

  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4 px-4">
      <h1 className="text-xl font-semibold">
        {isDbError ? "Database connection issue" : "Something went wrong"}
      </h1>
      <p className="max-w-md text-center text-muted-foreground">
        {isDbError ? (
          <>
            Check that <code className="rounded bg-muted px-1">.env</code> has a
            valid <code className="rounded bg-muted px-1">DATABASE_URL</code> and
            that you&apos;ve run <code className="rounded bg-muted px-1">npm run db:migrate</code> and{" "}
            <code className="rounded bg-muted px-1">npm run db:generate</code>.
          </>
        ) : (
          "Try refreshing the page or going back home."
        )}
      </p>
      {typeof window !== "undefined" && process.env.NODE_ENV === "development" && (
        <pre className="max-w-2xl overflow-auto rounded-lg border bg-muted p-3 text-xs">
          {error.message}
        </pre>
      )}
      <div className="flex gap-2">
        <Button variant="outline" onClick={reset}>
          Try again
        </Button>
        <Button asChild>
          <Link href="/">Go home</Link>
        </Button>
      </div>
    </div>
  );
}

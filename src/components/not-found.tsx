import Link from "next/link";

interface NotFoundProps {
  title?: string;
  message?: string;
}

export function NotFound({ title = "Not found", message }: NotFoundProps) {
  return (
    <div className="min-h-[40vh] flex flex-col items-center justify-center gap-4 p-4 text-center">
      <h2 className="text-xl font-semibold">{title}</h2>
      <p className="text-muted-foreground max-w-md">
        {message ?? "The requested resource doesn't exist or has been moved."}
      </p>
      <Link
        href="/"
        className="px-4 py-2 rounded-md bg-primary text-primary-foreground hover:opacity-90"
      >
        Go home
      </Link>
    </div>
  );
}

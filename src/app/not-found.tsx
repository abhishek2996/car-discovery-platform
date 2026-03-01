import { NotFound } from "@/components/not-found";

export default function NotFoundPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4 text-foreground">
      <NotFound
        title="Page not found"
        message="The page you're looking for doesn't exist or has been moved."
      />
    </div>
  );
}

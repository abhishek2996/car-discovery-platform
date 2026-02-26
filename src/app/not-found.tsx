import { NotFound } from "@/components/not-found";

export default function NotFoundPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-background text-foreground">
      <NotFound
        title="Page not found"
        message="The page you're looking for doesn't exist or has been moved."
      />
    </div>
  );
}

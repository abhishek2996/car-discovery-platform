import { AccessDenied } from "@/components/access-denied";

export default function AccessDeniedPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4 text-foreground">
      <AccessDenied />
    </div>
  );
}

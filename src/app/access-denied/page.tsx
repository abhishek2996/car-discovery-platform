import { AccessDenied } from "@/components/access-denied";

export default function AccessDeniedPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-background text-foreground">
      <AccessDenied />
    </div>
  );
}

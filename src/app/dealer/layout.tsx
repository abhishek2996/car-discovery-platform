import { requireDealer } from "@/lib/auth";

export default async function DealerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireDealer();
  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border px-4 py-3">
        <h1 className="font-semibold">Dealer dashboard</h1>
      </header>
      <main className="p-4">{children}</main>
    </div>
  );
}

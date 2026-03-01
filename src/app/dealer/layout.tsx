import { requireDealer } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { redirect } from "next/navigation";
import { DealerSidebar } from "@/components/dealer/dealer-sidebar";
import { DealerHeader } from "@/components/dealer/dealer-header";

export default async function DealerLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const user = await requireDealer();

  let dealer: { name: string; status: string } | null = null;
  if (user.dealerId) {
    dealer = await prisma.dealer.findUnique({
      where: { id: user.dealerId },
      select: { name: true, status: true },
    });
  }
  if (!dealer && user.role === "ADMIN") {
    const first = await prisma.dealer.findFirst({
      select: { name: true, status: true },
    });
    dealer = first;
  }
  if (!dealer) redirect("/unauthorised");

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      <aside className="hidden border-r bg-card md:flex md:w-64 lg:w-72">
        <DealerSidebar dealerName={dealer.name} />
      </aside>

      <div className="flex min-h-screen flex-1 flex-col">
        <DealerHeader
          dealerName={dealer.name}
          dealerStatus={dealer.status}
          userName={user.name}
        />
        <main className="flex-1 px-4 py-6 lg:px-8">{children}</main>
      </div>
    </div>
  );
}

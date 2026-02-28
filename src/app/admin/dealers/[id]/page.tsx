import { getAdminDealer } from "@/lib/data/admin-dashboard";
import { PageHeader } from "@/ui/app-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DealerStatusActions } from "@/components/admin/dealer-status-actions";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Inbox, Package, CalendarDays, Star } from "lucide-react";

type tParams = Promise<{ id: string }>;

interface PageProps {
  params: tParams;
}

export default async function AdminDealerDetailPage({ params }: PageProps) {
  const { id } = await params;
  const dealer = await getAdminDealer(id);
  if (!dealer) notFound();

  const statusVariant: Record<string, "default" | "secondary" | "destructive"> =
    {
      ACTIVE: "default",
      PENDING: "secondary",
      SUSPENDED: "destructive",
    };

  return (
    <>
      <PageHeader
        title={dealer.name}
        description={`Dealer in ${dealer.city}`}
        actions={
          <Button asChild size="sm" variant="outline">
            <Link href="/admin/dealers">
              <ArrowLeft className="mr-1 h-4 w-4" />
              Back to dealers
            </Link>
          </Button>
        }
      />

      <div className="mt-4 grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Dealer Information</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2">
              <InfoRow label="Name" value={dealer.name} />
              <InfoRow label="Slug" value={dealer.slug} />
              <InfoRow label="City" value={dealer.city} />
              <InfoRow label="Address" value={dealer.address ?? "—"} />
              <InfoRow label="Phone" value={dealer.phone ?? "—"} />
              <InfoRow
                label="Email"
                value={dealer.email ?? dealer.user?.email ?? "—"}
              />
              {dealer.description && (
                <div className="sm:col-span-2">
                  <p className="text-xs font-medium text-muted-foreground">
                    Description
                  </p>
                  <p className="mt-1 text-sm">{dealer.description}</p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Brands</CardTitle>
            </CardHeader>
            <CardContent>
              {dealer.dealerBrands.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No brands associated.
                </p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {dealer.dealerBrands.map((db) => (
                    <Badge key={db.brand.id} variant="secondary">
                      {db.brand.name}
                    </Badge>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Stats</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                <StatItem
                  label="Leads"
                  value={dealer._count.leads}
                  icon={<Inbox className="h-4 w-4 text-muted-foreground" />}
                />
                <StatItem
                  label="Inventory"
                  value={dealer._count.inventoryItems}
                  icon={<Package className="h-4 w-4 text-muted-foreground" />}
                />
                <StatItem
                  label="Test Drives"
                  value={dealer._count.testDriveSlots}
                  icon={
                    <CalendarDays className="h-4 w-4 text-muted-foreground" />
                  }
                />
                <StatItem
                  label="Reviews"
                  value={dealer._count.reviews}
                  icon={<Star className="h-4 w-4 text-muted-foreground" />}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        <div>
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-xs font-medium text-muted-foreground">
                  Current Status
                </p>
                <Badge
                  variant={statusVariant[dealer.status] ?? "secondary"}
                  className="mt-1"
                >
                  {dealer.status}
                </Badge>
              </div>
              <DealerStatusActions
                dealerId={dealer.id}
                status={dealer.status}
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs font-medium text-muted-foreground">{label}</p>
      <p className="mt-0.5 text-sm">{value}</p>
    </div>
  );
}

function StatItem({
  label,
  value,
  icon,
}: {
  label: string;
  value: number;
  icon: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-3 rounded-md border p-3">
      {icon}
      <div>
        <p className="text-lg font-semibold">{value}</p>
        <p className="text-xs text-muted-foreground">{label}</p>
      </div>
    </div>
  );
}

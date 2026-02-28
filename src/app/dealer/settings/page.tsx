import { requireDealer } from "@/lib/auth";
import { getDealerProfile } from "@/lib/data/dealer-dashboard";
import { PageHeader } from "@/ui/app-shell";
import { notFound } from "next/navigation";
import { DealerSettingsForm } from "@/components/dealer/dealer-settings-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default async function DealerSettingsPage() {
  const user = await requireDealer();
  const dealer = await getDealerProfile(user.dealerId!);

  if (!dealer) notFound();

  return (
    <>
      <PageHeader title="Settings" description="Manage your dealership profile" />

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <DealerSettingsForm
            defaultValues={{
              name: dealer.name,
              city: dealer.city,
              address: dealer.address ?? "",
              phone: dealer.phone ?? "",
              email: dealer.email ?? "",
              description: dealer.description ?? "",
            }}
          />
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Account</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="text-xs text-muted-foreground">Status</p>
                <Badge
                  variant={
                    dealer.status === "ACTIVE"
                      ? "default"
                      : dealer.status === "PENDING"
                        ? "secondary"
                        : "destructive"
                  }
                  className="mt-1"
                >
                  {dealer.status}
                </Badge>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Slug</p>
                <p className="text-sm font-mono">{dealer.slug}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Registered</p>
                <p className="text-sm">
                  {new Date(dealer.createdAt).toLocaleDateString("en-GB", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </p>
              </div>
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
                    <Badge key={db.id} variant="outline">
                      {db.brand.name}
                    </Badge>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Contact Person</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div>
                <p className="text-xs text-muted-foreground">Name</p>
                <p className="text-sm">{dealer.user.name || "—"}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Email</p>
                <p className="text-sm">{dealer.user.email}</p>
              </div>
              {dealer.user.phone && (
                <div>
                  <p className="text-xs text-muted-foreground">Phone</p>
                  <p className="text-sm">{dealer.user.phone}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}

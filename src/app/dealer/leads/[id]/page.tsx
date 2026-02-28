import { requireDealer } from "@/lib/auth";
import { getDealerLeadDetail } from "@/lib/data/dealer-dashboard";
import { PageHeader } from "@/ui/app-shell";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { notFound } from "next/navigation";
import { formatPrice } from "@/lib/constants";
import { FUEL_TYPE_LABELS, TRANSMISSION_LABELS } from "@/lib/constants";
import { User, Mail, Phone, Car, Calendar } from "lucide-react";
import { LeadStatusActions } from "@/components/dealer/lead-status-actions";
import Link from "next/link";
import { Button } from "@/components/ui/button";

type tParams = Promise<{ id: string }>;

interface PageProps {
  params: tParams;
}

export default async function LeadDetailPage({ params }: PageProps) {
  const { id } = await params;
  const user = await requireDealer();
  const lead = await getDealerLeadDetail(user.dealerId!, id);

  if (!lead) notFound();

  return (
    <>
      <PageHeader
        title="Lead Detail"
        actions={
          <Button asChild variant="outline" size="sm">
            <Link href="/dealer/leads">Back to leads</Link>
          </Button>
        }
      />

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          {/* Buyer info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <User className="h-4 w-4" />
                Buyer Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <p className="text-xs text-muted-foreground">Name</p>
                  <p className="font-medium">{lead.buyer.name || "—"}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Email</p>
                  <p className="flex items-center gap-1 font-medium">
                    <Mail className="h-3 w-3" />
                    <a
                      href={`mailto:${lead.buyer.email}`}
                      className="text-primary hover:underline"
                    >
                      {lead.buyer.email}
                    </a>
                  </p>
                </div>
                {lead.buyer.phone && (
                  <div>
                    <p className="text-xs text-muted-foreground">Phone</p>
                    <p className="flex items-center gap-1 font-medium">
                      <Phone className="h-3 w-3" />
                      <a
                        href={`tel:${lead.buyer.phone}`}
                        className="text-primary hover:underline"
                      >
                        {lead.buyer.phone}
                      </a>
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Car info */}
          {lead.carModel && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Car className="h-4 w-4" />
                  Car Interest
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid gap-3 sm:grid-cols-2">
                  <div>
                    <p className="text-xs text-muted-foreground">Model</p>
                    <p className="font-medium">
                      {lead.carModel.brand.name} {lead.carModel.name}
                    </p>
                  </div>
                  {lead.carVariant && (
                    <>
                      <div>
                        <p className="text-xs text-muted-foreground">Variant</p>
                        <p className="font-medium">{lead.carVariant.name}</p>
                      </div>
                      {lead.carVariant.exShowroomPrice && (
                        <div>
                          <p className="text-xs text-muted-foreground">
                            Ex-showroom Price
                          </p>
                          <p className="font-medium">
                            {formatPrice(lead.carVariant.exShowroomPrice.toString())}
                          </p>
                        </div>
                      )}
                      {lead.carVariant.fuelType && (
                        <div>
                          <p className="text-xs text-muted-foreground">Fuel</p>
                          <p className="font-medium">
                            {FUEL_TYPE_LABELS[lead.carVariant.fuelType] ??
                              lead.carVariant.fuelType}
                          </p>
                        </div>
                      )}
                      {lead.carVariant.transmission && (
                        <div>
                          <p className="text-xs text-muted-foreground">
                            Transmission
                          </p>
                          <p className="font-medium">
                            {TRANSMISSION_LABELS[lead.carVariant.transmission] ??
                              lead.carVariant.transmission}
                          </p>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Message */}
          {lead.message && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Message</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="whitespace-pre-wrap text-sm">{lead.message}</p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar: status & actions */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Status & Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-xs text-muted-foreground">Current Status</p>
                <LeadStatusBadge status={lead.status} />
              </div>

              <div>
                <p className="text-xs text-muted-foreground">Type</p>
                <Badge
                  variant={
                    lead.type === "TEST_DRIVE" ? "default" : "secondary"
                  }
                >
                  {lead.type === "TEST_DRIVE" ? "Test Drive" : "Enquiry"}
                </Badge>
              </div>

              <div>
                <p className="text-xs text-muted-foreground">Source</p>
                <p className="text-sm capitalize">
                  {lead.source?.replace(/_/g, " ") ?? "Unknown"}
                </p>
              </div>

              <div>
                <p className="text-xs text-muted-foreground">Created</p>
                <p className="flex items-center gap-1 text-sm">
                  <Calendar className="h-3 w-3" />
                  {new Date(lead.createdAt).toLocaleDateString("en-GB", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>

              <div>
                <p className="text-xs text-muted-foreground">Last Updated</p>
                <p className="text-sm">
                  {new Date(lead.updatedAt).toLocaleDateString("en-GB", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>

              <LeadStatusActions leadId={lead.id} currentStatus={lead.status} />
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}

function LeadStatusBadge({ status }: { status: string }) {
  const map: Record<string, "default" | "secondary" | "destructive" | "outline"> =
    {
      NEW: "default",
      CONTACTED: "secondary",
      IN_PROGRESS: "secondary",
      COMPLETED: "outline",
      DROPPED: "destructive",
    };
  return (
    <Badge variant={map[status] ?? "secondary"} className="mt-1">
      {status.replace("_", " ")}
    </Badge>
  );
}

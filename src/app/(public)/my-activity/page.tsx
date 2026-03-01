import Link from "next/link";
import { redirect } from "next/navigation";
import {
  Mail,
  CalendarDays,
  Store,
  Car,
  Clock,
  CheckCircle,
  XCircle,
  ArrowRight,
  User,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getSession } from "@/lib/auth";
import {
  getBuyerEnquiries,
  getBuyerTestDrives,
  getBuyerSavedComparisons,
  getBuyerProfile,
} from "@/lib/data/buyer";
import { ProfileForm } from "@/components/public/profile-form";

export const metadata = {
  title: "My Activity | CarDiscovery",
  description: "View your enquiries, test drive bookings, and saved comparisons.",
};

const LEAD_STATUS_CONFIG: Record<string, { label: string; variant: "default" | "secondary" | "outline" | "destructive" }> = {
  NEW: { label: "New", variant: "default" },
  CONTACTED: { label: "Contacted", variant: "secondary" },
  IN_PROGRESS: { label: "In Progress", variant: "secondary" },
  COMPLETED: { label: "Completed", variant: "outline" },
  DROPPED: { label: "Dropped", variant: "destructive" },
};

const TD_STATUS_CONFIG: Record<string, { label: string; variant: "default" | "secondary" | "outline" | "destructive" }> = {
  REQUESTED: { label: "Requested", variant: "default" },
  CONFIRMED: { label: "Confirmed", variant: "secondary" },
  COMPLETED: { label: "Completed", variant: "outline" },
  CANCELLED: { label: "Cancelled", variant: "destructive" },
  NO_SHOW: { label: "No Show", variant: "destructive" },
};

export default async function MyActivityPage() {
  const session = await getSession();
  if (!session?.user?.id) redirect("/sign-in");

  const [enquiries, testDrives, savedComparisons, profile] = await Promise.all([
    getBuyerEnquiries(session.user.id),
    getBuyerTestDrives(session.user.id),
    getBuyerSavedComparisons(session.user.id),
    getBuyerProfile(session.user.id),
  ]);

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">My Activity</h1>
        <p className="mt-1 text-muted-foreground">
          Track your enquiries, test drives, and saved items.
        </p>
      </div>

      <Tabs defaultValue="enquiries" className="space-y-6">
        <TabsList>
          <TabsTrigger value="enquiries">
            Enquiries ({enquiries.length})
          </TabsTrigger>
          <TabsTrigger value="test-drives">
            Test Drives ({testDrives.length})
          </TabsTrigger>
          <TabsTrigger value="saved">
            Saved ({savedComparisons.length})
          </TabsTrigger>
          <TabsTrigger value="profile">Profile</TabsTrigger>
        </TabsList>

        {/* Enquiries */}
        <TabsContent value="enquiries">
          {enquiries.length > 0 ? (
            <div className="space-y-3">
              {enquiries.map((lead) => {
                const statusConf = LEAD_STATUS_CONFIG[lead.status] ?? { label: lead.status, variant: "outline" as const };
                return (
                  <Card key={lead.id}>
                    <CardContent className="flex items-center justify-between p-4">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <Badge variant={statusConf.variant} className="text-[10px]">
                            {statusConf.label}
                          </Badge>
                          <Badge variant="outline" className="text-[10px]">
                            {lead.type === "ENQUIRY" ? "Enquiry" : "Test Drive"}
                          </Badge>
                        </div>
                        <div className="mt-2 flex items-center gap-3">
                          {lead.carModel && (
                            <span className="flex items-center gap-1 text-sm font-medium">
                              <Car className="size-3.5" />
                              {lead.carModel.brand.name} {lead.carModel.name}
                              {lead.carVariant && ` – ${lead.carVariant.name}`}
                            </span>
                          )}
                        </div>
                        <div className="mt-1 flex items-center gap-3 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Store className="size-3" />
                            {lead.dealer.name}, {lead.dealer.city}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="size-3" />
                            {new Date(lead.createdAt).toLocaleDateString("en-GB", {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            })}
                          </span>
                        </div>
                        {lead.message && (
                          <p className="mt-2 text-xs text-muted-foreground line-clamp-2">
                            {lead.message}
                          </p>
                        )}
                      </div>
                      {lead.carModel && (
                        <Link
                          href={`/new-cars/${lead.carModel.brand.slug}/${lead.carModel.slug}`}
                          className="ml-4 shrink-0"
                        >
                          <ArrowRight className="size-4 text-muted-foreground hover:text-primary" />
                        </Link>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          ) : (
            <EmptyState icon={Mail} text="No enquiries yet. Start exploring cars and get in touch with dealers." />
          )}
        </TabsContent>

        {/* Test Drives */}
        <TabsContent value="test-drives">
          {testDrives.length > 0 ? (
            <div className="space-y-3">
              {testDrives.map((td) => {
                const statusConf = TD_STATUS_CONFIG[td.status] ?? { label: td.status, variant: "outline" as const };
                return (
                  <Card key={td.id}>
                    <CardContent className="flex items-center justify-between p-4">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <Badge variant={statusConf.variant} className="text-[10px]">
                            {statusConf.label}
                          </Badge>
                        </div>
                        <p className="mt-2 text-sm font-medium">
                          {td.variant.model.brand.name} {td.variant.model.name} – {td.variant.name}
                        </p>
                        <div className="mt-1 flex items-center gap-3 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Store className="size-3" />
                            {td.dealer.name}, {td.dealer.city}
                          </span>
                          <span className="flex items-center gap-1">
                            <CalendarDays className="size-3" />
                            {new Date(td.slotAt).toLocaleDateString("en-GB", {
                              weekday: "short",
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            })}{" "}
                            at{" "}
                            {new Date(td.slotAt).toLocaleTimeString("en-GB", {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                        </div>
                        {td.notes && (
                          <p className="mt-2 text-xs text-muted-foreground line-clamp-2">
                            {td.notes}
                          </p>
                        )}
                      </div>
                      <Link
                        href={`/new-cars/${td.variant.model.brand.slug}/${td.variant.model.slug}`}
                        className="ml-4 shrink-0"
                      >
                        <ArrowRight className="size-4 text-muted-foreground hover:text-primary" />
                      </Link>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          ) : (
            <EmptyState icon={CalendarDays} text="No test drives booked yet. Find a car you love and schedule a test drive." />
          )}
        </TabsContent>

        {/* Saved */}
        <TabsContent value="saved">
          {savedComparisons.length > 0 ? (
            <div className="space-y-3">
              {savedComparisons.map((comp) => {
                const ids = JSON.parse(comp.variantIds) as string[];
                return (
                  <Card key={comp.id}>
                    <CardContent className="flex items-center justify-between p-4">
                      <div>
                        <p className="text-sm font-medium">
                          {comp.name || "Saved Comparison"}
                        </p>
                        <p className="mt-0.5 text-xs text-muted-foreground">
                          {ids.length} variants · saved{" "}
                          {new Date(comp.createdAt).toLocaleDateString("en-GB", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })}
                        </p>
                      </div>
                      <Link
                        href={`/compare?variants=${ids.join(",")}`}
                        className="shrink-0"
                      >
                        <ArrowRight className="size-4 text-muted-foreground hover:text-primary" />
                      </Link>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          ) : (
            <EmptyState icon={Car} text="No saved comparisons yet. Compare cars and save your favourites." />
          )}
        </TabsContent>

        {/* Profile */}
        <TabsContent value="profile">
          <Card>
            <CardContent className="p-6">
              <h3 className="mb-1 text-lg font-semibold">Your Profile</h3>
              <p className="mb-6 text-sm text-muted-foreground">
                Manage your account information.
              </p>
              {profile && <ProfileForm profile={profile} />}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function EmptyState({ icon: Icon, text }: { icon: React.ElementType; text: string }) {
  return (
    <div className="text-center py-16">
      <Icon className="mx-auto size-12 text-muted-foreground/20" />
      <p className="mt-4 max-w-sm mx-auto text-sm text-muted-foreground">{text}</p>
    </div>
  );
}

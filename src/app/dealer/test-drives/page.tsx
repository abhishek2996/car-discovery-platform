import { requireDealer } from "@/lib/auth";
import { getDealerTestDrives } from "@/lib/data/dealer-dashboard";
import { PageHeader } from "@/ui/app-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, Clock, User, Car } from "lucide-react";
import { TestDriveActions } from "@/components/dealer/test-drive-actions";
import Link from "next/link";

type tSearchParams = Promise<Record<string, string | string[] | undefined>>;

interface PageProps {
  params: Promise<Record<string, never>>;
  searchParams: tSearchParams;
}

const STATUS_FILTERS = [
  { value: "all", label: "All" },
  { value: "upcoming", label: "Upcoming" },
  { value: "REQUESTED", label: "Requested" },
  { value: "CONFIRMED", label: "Confirmed" },
  { value: "COMPLETED", label: "Completed" },
  { value: "CANCELLED", label: "Cancelled" },
  { value: "NO_SHOW", label: "No Show" },
];

export default async function TestDrivesPage({ searchParams }: PageProps) {
  const user = await requireDealer();
  const sp = await searchParams;
  const statusParam = typeof sp.status === "string" ? sp.status : "upcoming";

  const filters = {
    status: statusParam !== "all" && statusParam !== "upcoming" ? statusParam : undefined,
    upcoming: statusParam === "upcoming",
    page:
      typeof sp.page === "string"
        ? Math.max(1, parseInt(sp.page, 10) || 1)
        : 1,
  };

  const { slots, total, page, totalPages } = await getDealerTestDrives(
    user.dealerId!,
    filters,
  );

  return (
    <>
      <PageHeader
        title="Test Drives"
        description={`${total} test drive${total !== 1 ? "s" : ""}`}
      />

      <div className="flex flex-wrap gap-2 border-b pb-3">
        {STATUS_FILTERS.map((f) => (
          <Link
            key={f.value}
            href={`/dealer/test-drives${f.value === "upcoming" ? "" : `?status=${f.value}`}`}
          >
            <Badge
              variant={
                (f.value === "upcoming" && statusParam === "upcoming") ||
                statusParam === f.value
                  ? "default"
                  : "outline"
              }
              className="cursor-pointer px-3 py-1"
            >
              {f.label}
            </Badge>
          </Link>
        ))}
      </div>

      {slots.length === 0 ? (
        <p className="mt-8 text-center text-muted-foreground">
          No test drives found.
        </p>
      ) : (
        <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {slots.map((slot) => {
            const slotDate = new Date(slot.slotAt);
            const isPast = slotDate < new Date();
            return (
              <Card
                key={slot.id}
                className={isPast && slot.status !== "COMPLETED" ? "opacity-75" : ""}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-sm font-medium">
                      {slot.variant.model.brand.name}{" "}
                      {slot.variant.model.name} – {slot.variant.name}
                    </CardTitle>
                    <TestDriveStatusBadge status={slot.status} />
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                    {slotDate.toLocaleDateString("en-GB", {
                      weekday: "short",
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                    {slotDate.toLocaleTimeString("en-GB", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <User className="h-3.5 w-3.5 text-muted-foreground" />
                    <span>{slot.buyer.name || slot.buyer.email}</span>
                  </div>
                  {slot.buyer.phone && (
                    <p className="text-xs text-muted-foreground">
                      Phone: {slot.buyer.phone}
                    </p>
                  )}
                  {slot.notes && (
                    <p className="text-xs text-muted-foreground">
                      Note: {slot.notes}
                    </p>
                  )}

                  <TestDriveActions
                    slotId={slot.id}
                    currentStatus={slot.status}
                  />
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {totalPages > 1 && (
        <div className="mt-6 flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Page {page} of {totalPages}
          </p>
          <div className="flex gap-2">
            {page > 1 && (
              <Button asChild size="sm" variant="outline">
                <Link
                  href={`/dealer/test-drives?status=${statusParam}&page=${page - 1}`}
                >
                  Previous
                </Link>
              </Button>
            )}
            {page < totalPages && (
              <Button asChild size="sm" variant="outline">
                <Link
                  href={`/dealer/test-drives?status=${statusParam}&page=${page + 1}`}
                >
                  Next
                </Link>
              </Button>
            )}
          </div>
        </div>
      )}
    </>
  );
}

function TestDriveStatusBadge({ status }: { status: string }) {
  const map: Record<string, "default" | "secondary" | "destructive" | "outline"> =
    {
      REQUESTED: "default",
      CONFIRMED: "secondary",
      COMPLETED: "outline",
      CANCELLED: "destructive",
      NO_SHOW: "destructive",
    };
  return (
    <Badge variant={map[status] ?? "secondary"} className="text-xs">
      {status.replace("_", " ")}
    </Badge>
  );
}

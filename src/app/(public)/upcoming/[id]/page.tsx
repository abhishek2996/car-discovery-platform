import { notFound } from "next/navigation";
import Link from "next/link";
import { Calendar, ChevronRight, Car } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { getUpcomingCarById } from "@/lib/data/upcoming";
import { AlertMeForm } from "@/components/public/alert-me-form";

type PageParams = Promise<{ id: string }>;

export async function generateMetadata({ params }: { params: PageParams }) {
  const { id } = await params;
  const car = await getUpcomingCarById(id);
  if (!car) return { title: "Upcoming Car Not Found" };
  return {
    title: `${car.brand.name} ${car.name} – Upcoming | CarDiscovery`,
    description: `${car.brand.name} ${car.name} expected ${car.expectedLaunch ?? "soon"}. ${car.estimatedPrice ? `Estimated price: ${car.estimatedPrice}.` : ""} Get launch alerts.`,
  };
}

export default async function UpcomingCarDetailPage({ params }: { params: PageParams }) {
  const { id } = await params;
  const car = await getUpcomingCarById(id);
  if (!car) notFound();

  const highlights = car.keyHighlights
    ? (car.keyHighlights.startsWith("[")
        ? JSON.parse(car.keyHighlights) as string[]
        : car.keyHighlights.split("\n").filter(Boolean))
    : [];

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      {/* Breadcrumb */}
      <nav className="mb-6 flex items-center gap-1.5 text-sm text-muted-foreground">
        <Link href="/" className="hover:text-foreground">Home</Link>
        <ChevronRight className="size-3.5" />
        <Link href="/upcoming" className="hover:text-foreground">Upcoming Cars</Link>
        <ChevronRight className="size-3.5" />
        <span className="font-medium text-foreground">{car.name}</span>
      </nav>

      <div className="grid gap-8 lg:grid-cols-5">
        {/* Image */}
        <div className="lg:col-span-3">
          {car.imageUrl ? (
            <img
              src={car.imageUrl}
              alt={car.name}
              className="aspect-[16/10] w-full rounded-xl border object-cover"
            />
          ) : (
            <div className="flex aspect-[16/10] w-full items-center justify-center rounded-xl border bg-muted">
              <Car className="size-16 text-muted-foreground/30" />
            </div>
          )}
        </div>

        {/* Details */}
        <div className="space-y-6 lg:col-span-2">
          <div>
            <Badge className="mb-2">Upcoming</Badge>
            <p className="text-sm font-medium text-muted-foreground">{car.brand.name}</p>
            <h1 className="text-3xl font-bold tracking-tight">{car.name}</h1>
          </div>

          <Card>
            <CardContent className="space-y-4 p-5">
              {car.estimatedPrice && (
                <div>
                  <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    Estimated Price
                  </p>
                  <p className="mt-0.5 text-xl font-bold">{car.estimatedPrice}</p>
                </div>
              )}
              {car.expectedLaunch && (
                <div className="flex items-center gap-2">
                  <Calendar className="size-4 text-muted-foreground" />
                  <div>
                    <p className="text-xs text-muted-foreground">Expected Launch</p>
                    <p className="text-sm font-semibold">{car.expectedLaunch}</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {highlights.length > 0 && (
            <Card>
              <CardContent className="p-5">
                <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                  Key Highlights
                </h3>
                <ul className="space-y-2">
                  {highlights.map((h: string, i: number) => (
                    <li key={i} className="flex items-start gap-2 text-sm">
                      <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-primary" />
                      {h}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {/* Alert me form */}
          <Card>
            <CardContent className="p-5">
              <h3 className="mb-3 text-sm font-semibold">Get Launch Alert</h3>
              <p className="mb-4 text-xs text-muted-foreground">
                Be the first to know when the {car.brand.name} {car.name} launches.
              </p>
              <AlertMeForm upcomingCarId={car.id} />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

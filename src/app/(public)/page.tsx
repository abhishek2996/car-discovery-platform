import { Suspense } from "react";
import Link from "next/link";
import { ArrowRight, Car, Shield, GitCompareArrows, Star } from "lucide-react";
import { HeroSearch } from "@/components/public/hero-search";
import { BrandGrid } from "@/components/public/brand-grid";
import { getPopularBrands } from "@/lib/data/brands";
import { BODY_TYPE_LABELS } from "@/lib/constants";

export const metadata = {
  title: "CarDiscovery – Find Your Perfect New Car in the UK",
  description:
    "Compare prices, specs, and reviews across hundreds of new car models from top brands in the United Kingdom.",
};

const FEATURES = [
  {
    icon: Car,
    title: "Extensive Catalog",
    description: "Browse hundreds of new car models from all major brands sold in the UK.",
  },
  {
    icon: GitCompareArrows,
    title: "Side-by-Side Comparison",
    description: "Compare up to 3 cars with detailed spec breakdowns to find your best match.",
  },
  {
    icon: Star,
    title: "Expert Reviews",
    description: "Read in-depth reviews and ratings from our team of automotive experts.",
  },
  {
    icon: Shield,
    title: "Trusted Dealers",
    description: "Connect with verified dealers near you for the best prices and offers.",
  },
];

export default async function HomePage() {
  const brands = await getPopularBrands(12);

  return (
    <>
      {/* Hero */}
      <Suspense fallback={null}>
        <HeroSearch brands={brands} />
      </Suspense>

      {/* Browse by body type */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <h2 className="mb-6 text-2xl font-bold tracking-tight">
          Browse by Body Type
        </h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {Object.entries(BODY_TYPE_LABELS).map(([key, label]) => (
            <Link
              key={key}
              href={`/new-cars?bodyType=${key}`}
              className="group flex flex-col items-center gap-2 rounded-xl border bg-card p-4 text-center transition-all hover:shadow-md hover:border-primary/20"
            >
              <div className="flex size-12 items-center justify-center rounded-full bg-primary/10 transition-colors group-hover:bg-primary/20">
                <Car className="size-5 text-primary" />
              </div>
              <span className="text-sm font-medium group-hover:text-primary">
                {label}
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* Popular brands */}
      <section className="mx-auto max-w-7xl px-4 pb-16 sm:px-6 lg:px-8">
        <BrandGrid brands={brands} title="Popular Brands" showViewAll />
      </section>

      {/* Features */}
      <section className="border-t bg-muted/30 py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-2xl font-bold tracking-tight">
              Why CarDiscovery?
            </h2>
            <p className="mt-2 text-muted-foreground">
              Everything you need to make an informed car buying decision.
            </p>
          </div>
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {FEATURES.map((f) => {
              const Icon = f.icon;
              return (
                <div
                  key={f.title}
                  className="rounded-xl border bg-card p-6 text-center"
                >
                  <div className="mx-auto mb-4 flex size-12 items-center justify-center rounded-full bg-primary/10">
                    <Icon className="size-5 text-primary" />
                  </div>
                  <h3 className="mb-2 text-sm font-semibold">{f.title}</h3>
                  <p className="text-sm text-muted-foreground">{f.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="rounded-2xl bg-primary p-8 text-center text-primary-foreground sm:p-12">
          <h2 className="text-2xl font-bold sm:text-3xl">
            Ready to find your next car?
          </h2>
          <p className="mx-auto mt-3 max-w-md text-primary-foreground/80">
            Explore our full catalog of new cars, compare models, and connect
            with dealers across the UK.
          </p>
          <Link
            href="/new-cars"
            className="mt-6 inline-flex items-center gap-2 rounded-lg bg-background px-6 py-3 text-sm font-semibold text-foreground transition-opacity hover:opacity-90"
          >
            Browse All Cars
            <ArrowRight className="size-4" />
          </Link>
        </div>
      </section>
    </>
  );
}

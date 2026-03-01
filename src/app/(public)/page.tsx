import { Suspense } from "react";
import Link from "next/link";
import { ArrowRight, Car, Shield, GitCompareArrows, Star, Clock, Search } from "lucide-react";
import { HomeHero } from "@/components/public/home-hero";
import { NewlyLaunchedCarousel } from "@/components/public/newly-launched-carousel";
import { BrandGrid } from "@/components/public/brand-grid";
import { CarCard } from "@/components/public/car-card";
import { getPopularBrands } from "@/lib/data/brands";
import { getActiveHeroSlides } from "@/lib/data/admin-dashboard";
import { getPopularModels } from "@/lib/data/cars";
import { getNewlyLaunchedModels } from "@/lib/data/cars";
import { searchUpcomingCars } from "@/lib/data/upcoming";
import { BODY_TYPE_LABELS } from "@/lib/constants";
import { Skeleton } from "@/components/ui/skeleton";

export const metadata = {
  title: "CarDiscovery – New Cars, Prices & Reviews in the UK",
  description:
    "Compare prices, specs, and reviews across hundreds of new car models from top brands in the United Kingdom. Find your perfect new car.",
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

async function HomeHeroSection() {
  try {
    const [brands, heroSlides] = await Promise.all([
      getPopularBrands(12),
      getActiveHeroSlides(),
    ]);
    return <HomeHero brands={brands} slides={heroSlides} />;
  } catch {
    return <HomeHero brands={[]} slides={[]} />;
  }
}

async function NewlyLaunchedSection() {
  try {
    const newlyLaunched = await getNewlyLaunchedModels(4);
    return (
      <NewlyLaunchedCarousel
        cars={newlyLaunched.map((car) => ({
          id: car.id,
          name: car.name,
          slug: car.slug,
          bodyType: car.bodyType,
          segment: car.segment,
          minPrice: car.minPrice != null ? String(car.minPrice) : null,
          maxPrice: car.maxPrice != null ? String(car.maxPrice) : null,
          imageUrl: car.imageUrl,
          createdAt: car.createdAt,
          updatedAt: car.updatedAt,
          brand: car.brand,
          variants: car.variants,
          _count: car._count,
        }))}
      />
    );
  } catch {
    return null;
  }
}

async function PopularCarsSection() {
  try {
    const popularCars = await getPopularModels(12);
    if (popularCars.length === 0) return null;
    return (
      <section className="mx-auto max-w-7xl px-4 pb-12 sm:px-6 lg:px-8">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold tracking-tight">Popular new cars</h2>
          <Link
            href="/new-cars"
            className="text-sm font-medium text-primary hover:underline"
          >
            View all new cars
          </Link>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {popularCars.map((car) => (
            <CarCard
              key={car.id}
              car={{
                ...car,
                minPrice: car.minPrice ? String(car.minPrice) : null,
                maxPrice: car.maxPrice ? String(car.maxPrice) : null,
              }}
            />
          ))}
        </div>
      </section>
    );
  } catch {
    return null;
  }
}

async function BrandsSection() {
  try {
    const brands = await getPopularBrands(12);
    return <BrandGrid brands={brands} title="Popular Brands" showViewAll />;
  } catch {
    return <BrandGrid brands={[]} title="Popular Brands" showViewAll />;
  }
}

async function UpcomingSection() {
  try {
    const upcomingResult = await searchUpcomingCars({ pageSize: 4 });
    if (upcomingResult.cars.length === 0) return null;
    return (
      <section className="border-t bg-muted/20 py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-2xl font-bold tracking-tight">Upcoming cars</h2>
            <Link
              href="/upcoming"
              className="text-sm font-medium text-primary hover:underline"
            >
              View all upcoming
            </Link>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {upcomingResult.cars.map((uc) => (
              <Link
                key={uc.id}
                href={`/upcoming/${uc.id}`}
                className="group rounded-xl border bg-card p-4 transition-all hover:shadow-md hover:border-primary/20"
              >
                <p className="text-xs font-medium text-muted-foreground">
                  {uc.brand.name}
                </p>
                <p className="mt-1 font-semibold group-hover:text-primary">
                  {uc.model?.name ?? uc.name}
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  {uc.estimatedPrice ?? "Price TBA"}
                </p>
                <span className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-primary">
                  <Clock className="size-3" />
                  Alert me when launched
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>
    );
  } catch {
    return null;
  }
}

function PopularCarsSkeleton() {
  return (
    <section className="mx-auto max-w-7xl px-4 pb-12 sm:px-6 lg:px-8">
      <div className="mb-6 flex items-center justify-between">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-24" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <Skeleton key={i} className="h-[200px] w-full rounded-xl" />
        ))}
      </div>
    </section>
  );
}

export default function HomePage() {
  return (
    <>
      <Suspense fallback={<div className="min-h-[280px] w-full bg-muted" />}>
        <HomeHeroSection />
      </Suspense>

      <Suspense fallback={null}>
        <NewlyLaunchedSection />
      </Suspense>

      {/* Body type pills + search (static, shows immediately) */}
      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <h2 className="mb-4 text-2xl font-bold tracking-tight">
          The most searched new cars
        </h2>
        <div className="flex flex-wrap items-center gap-2">
          {(["SUV", "HATCHBACK", "SEDAN", "MUV", "LUXURY"] as const)
            .filter((k) => BODY_TYPE_LABELS[k])
            .map((key) => (
              <Link
                key={key}
                href={`/new-cars?bodyType=${key}`}
                className="rounded-full border bg-muted/50 px-4 py-2 text-sm font-medium transition-colors hover:border-primary hover:bg-primary/10 hover:text-primary"
              >
                {BODY_TYPE_LABELS[key]}
              </Link>
            ))}
          <Link
            href="/new-cars"
            className="ml-2 inline-flex items-center gap-1.5 rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            <Search className="size-4" />
            Search
          </Link>
        </div>
      </section>

      <Suspense fallback={<PopularCarsSkeleton />}>
        <PopularCarsSection />
      </Suspense>

      {/* Browse by Body Type (static) */}
      <section className="border-t bg-muted/20 py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
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
        </div>
      </section>

      <Suspense
        fallback={
          <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
            <Skeleton className="mb-6 h-8 w-40" />
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                <Skeleton key={i} className="h-24 rounded-lg" />
              ))}
            </div>
          </section>
        }
      >
        <BrandsSection />
      </Suspense>

      <Suspense fallback={null}>
        <UpcomingSection />
      </Suspense>

      {/* Compare CTA (static) */}
      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="rounded-2xl border bg-card p-8 text-center sm:p-12">
          <div className="mx-auto flex size-16 items-center justify-center rounded-full bg-primary/10">
            <GitCompareArrows className="size-8 text-primary" />
          </div>
          <h2 className="mt-4 text-2xl font-bold tracking-tight">
            Compare to buy the right car
          </h2>
          <p className="mx-auto mt-2 max-w-md text-muted-foreground">
            Compare up to 3 new cars side by side. Specs, price, and key features in one view.
          </p>
          <Link
            href="/compare"
            className="mt-6 inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
          >
            Compare cars
            <ArrowRight className="size-4" />
          </Link>
        </div>
      </section>

      {/* Why CarDiscovery (static) */}
      <section className="border-t bg-muted/30 py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-2xl font-bold tracking-tight">
              Why CarDiscovery?
            </h2>
            <p className="mt-2 text-muted-foreground">
              Everything you need to make an informed new car buying decision.
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

      {/* CTA (static) */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="rounded-2xl bg-primary p-8 text-center text-primary-foreground sm:p-12">
          <h2 className="text-2xl font-bold sm:text-3xl">
            Ready to find your next new car?
          </h2>
          <p className="mx-auto mt-3 max-w-md text-primary-foreground/80">
            Explore our full catalog of new cars, compare models, and connect
            with dealers across the UK.
          </p>
          <Link
            href="/new-cars"
            className="mt-6 inline-flex items-center gap-2 rounded-lg bg-background px-6 py-3 text-sm font-semibold text-foreground transition-opacity hover:opacity-90"
          >
            Browse All New Cars
            <ArrowRight className="size-4" />
          </Link>
        </div>
      </section>
    </>
  );
}

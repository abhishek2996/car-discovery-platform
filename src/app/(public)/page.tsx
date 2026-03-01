import { Suspense } from "react";
import Link from "next/link";
import { ArrowRight, Car, Shield, GitCompareArrows, Star, Clock } from "lucide-react";
import { HomeHero } from "@/components/public/home-hero";
import { HomeCarouselSection } from "@/components/public/home-carousel-section";
import { MostSearchedCarousel } from "@/components/public/most-searched-carousel";
import type { MostSearchedCar, MostSearchedTab } from "@/components/public/most-searched-carousel";
import { CarCard } from "@/components/public/car-card";
import { ArticleStoryCard } from "@/components/public/article-story-card";
import { getPopularBrands } from "@/lib/data/brands";
import { getActiveHeroSlides } from "@/lib/data/admin-dashboard";
import { getPopularModels, getNewlyLaunchedModels, getElectricModels, getHybridModels, getPopularModelsByBodyType } from "@/lib/data/cars";
import { searchUpcomingCars } from "@/lib/data/upcoming";
import { searchArticles } from "@/lib/data/content";
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

async function MostSearchedSection() {
  // "All" first, then every body type from constants so all categories are visible (scroll the tab row)
  const bodyEntries = Object.entries(BODY_TYPE_LABELS);
  const tabs: MostSearchedTab[] = [
    { key: "ALL", label: "All" },
    ...bodyEntries.map(([key, label]) => ({ key, label })),
  ];
  const tabKeys = tabs.map((t) => t.key);

  try {
    const [allCars, ...bodyResults] = await Promise.all([
      getPopularModels(10),
      ...bodyEntries.map(([key]) => getPopularModelsByBodyType(key, 10)),
    ]);

    const toSerializable = (list: Awaited<ReturnType<typeof getPopularModelsByBodyType>>): MostSearchedCar[] =>
      list.map((car) => ({
        ...car,
        minPrice: car.minPrice != null ? Number(car.minPrice) : null,
        maxPrice: car.maxPrice != null ? Number(car.maxPrice) : null,
      }));

    const carsByTab: Record<string, MostSearchedCar[]> = {
      ALL: toSerializable(allCars),
    };
    bodyEntries.forEach(([key], i) => {
      carsByTab[key] = toSerializable(bodyResults[i]);
    });

    const hasAny = tabKeys.some((k) => (carsByTab[k]?.length ?? 0) > 0);
    if (!hasAny) return null;

    return <MostSearchedCarousel tabs={tabs} carsByTab={carsByTab} />;
  } catch {
    return null;
  }
}

async function ElectricCarsSection() {
  try {
    const cars = await getElectricModels(8);
    return (
      <HomeCarouselSection
        title="Electric cars"
        viewAllHref="/new-cars?fuel=ELECTRIC"
        viewAllLabel="View All Electric Cars"
        className="border-t bg-muted/20"
      >
        {cars.length === 0 ? (
          <div className="flex shrink-0 items-center justify-center rounded-xl border border-dashed bg-muted/30 px-8 py-12 text-sm text-muted-foreground w-[280px] sm:w-[300px]">
            No electric cars in this category yet
          </div>
        ) : (
          cars.map((car) => (
            <div
              key={car.id}
              className="flex shrink-0 flex-col sm:w-[300px] w-[280px]"
              style={{ minHeight: 360 }}
            >
              <CarCard
                car={{
                  ...car,
                  minPrice: car.minPrice ? String(car.minPrice) : null,
                  maxPrice: car.maxPrice ? String(car.maxPrice) : null,
                }}
                showGetOffersButton
              />
            </div>
          ))
        )}
      </HomeCarouselSection>
    );
  } catch {
    return (
      <HomeCarouselSection
        title="Electric cars"
        viewAllHref="/new-cars?fuel=ELECTRIC"
        viewAllLabel="View All Electric Cars"
        className="border-t bg-muted/20"
      >
        <div className="flex shrink-0 items-center justify-center rounded-xl border border-dashed bg-muted/30 px-8 py-12 text-sm text-muted-foreground w-[280px] sm:w-[300px]">
          No electric cars in this category yet
        </div>
      </HomeCarouselSection>
    );
  }
}

async function HybridCarsSection() {
  try {
    const cars = await getHybridModels(8);
    return (
      <HomeCarouselSection
        title="Hybrid cars"
        viewAllHref="/new-cars?fuel=HYBRID"
        viewAllLabel="View All Hybrid Cars"
        className="border-t"
      >
        {cars.length === 0 ? (
          <div className="flex shrink-0 items-center justify-center rounded-xl border border-dashed bg-muted/30 px-8 py-12 text-sm text-muted-foreground w-[280px] sm:w-[300px]">
            No hybrid cars in this category yet
          </div>
        ) : (
          cars.map((car) => (
            <div
              key={car.id}
              className="flex shrink-0 flex-col sm:w-[300px] w-[280px]"
              style={{ minHeight: 360 }}
            >
              <CarCard
                car={{
                  ...car,
                  minPrice: car.minPrice ? String(car.minPrice) : null,
                  maxPrice: car.maxPrice ? String(car.maxPrice) : null,
                }}
                showGetOffersButton
              />
            </div>
          ))
        )}
      </HomeCarouselSection>
    );
  } catch {
    return (
      <HomeCarouselSection
        title="Hybrid cars"
        viewAllHref="/new-cars?fuel=HYBRID"
        viewAllLabel="View All Hybrid Cars"
        className="border-t"
      >
        <div className="flex shrink-0 items-center justify-center rounded-xl border border-dashed bg-muted/30 px-8 py-12 text-sm text-muted-foreground w-[280px] sm:w-[300px]">
          No hybrid cars in this category yet
        </div>
      </HomeCarouselSection>
    );
  }
}

async function UpcomingCarsSection() {
  try {
    const { cars } = await searchUpcomingCars({ pageSize: 8 });
    return (
      <HomeCarouselSection
        title="Upcoming cars"
        viewAllHref="/upcoming"
        viewAllLabel="View All Upcoming Cars"
        className="border-t"
      >
        {cars.length === 0 ? (
          <div className="flex shrink-0 items-center justify-center rounded-xl border border-dashed bg-muted/30 px-8 py-12 text-sm text-muted-foreground w-[260px] sm:w-[280px]">
            No upcoming cars at the moment
          </div>
        ) : (
          cars.map((uc) => (
            <Link
              key={uc.id}
              href={`/upcoming/${uc.id}`}
              className="group flex shrink-0 w-[260px] flex-col rounded-xl border bg-card transition-all hover:shadow-md hover:border-primary/20 sm:w-[280px]"
            >
              <div className="relative aspect-[16/10] bg-muted">
                {uc.imageUrl ? (
                  <img
                    src={uc.imageUrl}
                    alt={uc.model?.name ?? uc.name}
                    className="h-full w-full object-cover transition-transform group-hover:scale-105"
                  />
                ) : null}
                {uc.expectedLaunch && (
                  <span className="absolute left-2 top-2 rounded bg-primary px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-primary-foreground">
                    Expected launch {uc.expectedLaunch}
                  </span>
                )}
              </div>
              <div className="flex flex-1 flex-col p-4">
                <p className="text-xs font-medium text-muted-foreground">{uc.brand.name}</p>
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
              </div>
            </Link>
          ))
        )}
      </HomeCarouselSection>
    );
  } catch {
    return (
      <HomeCarouselSection
        title="Upcoming cars"
        viewAllHref="/upcoming"
        viewAllLabel="View All Upcoming Cars"
        className="border-t"
      >
        <div className="flex shrink-0 items-center justify-center rounded-xl border border-dashed bg-muted/30 px-8 py-12 text-sm text-muted-foreground w-[260px] sm:w-[280px]">
          No upcoming cars at the moment
        </div>
      </HomeCarouselSection>
    );
  }
}

async function LatestCarsSection() {
  try {
    const cars = await getNewlyLaunchedModels(8);
    return (
      <HomeCarouselSection
        title="Latest cars"
        viewAllHref="/new-cars?sort=newest"
        viewAllLabel="View All Latest Cars"
        className="border-t"
      >
        {cars.length === 0 ? (
          <div className="flex shrink-0 items-center justify-center rounded-xl border border-dashed bg-muted/30 px-8 py-12 text-sm text-muted-foreground w-[280px] sm:w-[300px]">
            No latest cars to show yet
          </div>
        ) : (
          cars.map((car) => (
            <div
              key={car.id}
              className="relative flex shrink-0 flex-col sm:w-[300px] w-[280px]"
              style={{ minHeight: 360 }}
            >
              <CarCard
                car={{
                  ...car,
                  minPrice: car.minPrice ? String(car.minPrice) : null,
                  maxPrice: car.maxPrice ? String(car.maxPrice) : null,
                }}
                showGetOffersButton
              />
              {car.createdAt && (
                <span className="absolute left-2 top-2 z-10 rounded bg-primary px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-primary-foreground">
                  Launched on{" "}
                  {new Date(car.createdAt).toLocaleDateString("en-GB", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
                </span>
              )}
            </div>
          ))
        )}
      </HomeCarouselSection>
    );
  } catch {
    return (
      <HomeCarouselSection
        title="Latest cars"
        viewAllHref="/new-cars?sort=newest"
        viewAllLabel="View All Latest Cars"
        className="border-t"
      >
        <div className="flex shrink-0 items-center justify-center rounded-xl border border-dashed bg-muted/30 px-8 py-12 text-sm text-muted-foreground w-[280px] sm:w-[300px]">
          No latest cars to show yet
        </div>
      </HomeCarouselSection>
    );
  }
}

async function PopularBrandsCarouselSection() {
  try {
    const brands = await getPopularBrands(12);

    function BrandInitial({ name }: { name: string }) {
      const initials = name
        .split(/[\s-]+/)
        .slice(0, 2)
        .map((w) => w[0])
        .join("")
        .toUpperCase();
      return (
        <div className="flex size-14 items-center justify-center rounded-xl bg-primary/10 text-lg font-bold text-primary">
          {initials}
        </div>
      );
    }

    return (
      <HomeCarouselSection
        title="Popular brands"
        viewAllHref="/brands"
        viewAllLabel="View All Brands"
        className="border-t bg-muted/20"
      >
        {brands.length === 0 ? (
          <div className="flex shrink-0 items-center justify-center rounded-xl border border-dashed bg-muted/30 px-8 py-12 text-sm text-muted-foreground w-[140px] sm:w-[160px]">
            No brands yet
          </div>
        ) : (
          brands.map((brand) => (
            <Link
              key={brand.id}
              href={`/new-cars?brand=${brand.slug}`}
              className="group flex shrink-0 w-[140px] flex-col items-center gap-3 rounded-xl border bg-card p-4 transition-all hover:shadow-md hover:border-primary/20 sm:w-[160px]"
            >
              {brand.logoUrl ? (
                <img
                  src={brand.logoUrl}
                  alt={brand.name}
                  className="size-14 object-contain"
                />
              ) : (
                <BrandInitial name={brand.name} />
              )}
              <p className="text-center text-sm font-semibold group-hover:text-primary">{brand.name}</p>
            </Link>
          ))
        )}
      </HomeCarouselSection>
    );
  } catch {
    return (
      <HomeCarouselSection
        title="Popular brands"
        viewAllHref="/brands"
        viewAllLabel="View All Brands"
        className="border-t bg-muted/20"
      >
        <div className="flex shrink-0 items-center justify-center rounded-xl border border-dashed bg-muted/30 px-8 py-12 text-sm text-muted-foreground w-[140px] sm:w-[160px]">
          No brands yet
        </div>
      </HomeCarouselSection>
    );
  }
}

async function CarStoriesSection() {
  try {
    const { articles } = await searchArticles({ pageSize: 8 });
    return (
      <HomeCarouselSection
        title="Car visual stories"
        viewAllHref="/reviews"
        viewAllLabel="View All Car Visual Stories"
        className="border-t"
      >
        {articles.length === 0 ? (
          <div className="flex shrink-0 items-center justify-center rounded-xl border border-dashed bg-muted/30 px-8 py-12 text-sm text-muted-foreground w-[260px] sm:w-[280px]">
            No stories yet
          </div>
        ) : (
          articles.map((a) => (
            <ArticleStoryCard
              key={a.id}
              title={a.title}
              slug={a.slug}
              heroMediaUrl={a.heroMediaUrl}
            />
          ))
        )}
      </HomeCarouselSection>
    );
  } catch {
    return (
      <HomeCarouselSection
        title="Car visual stories"
        viewAllHref="/reviews"
        viewAllLabel="View All Car Visual Stories"
        className="border-t"
      >
        <div className="flex shrink-0 items-center justify-center rounded-xl border border-dashed bg-muted/30 px-8 py-12 text-sm text-muted-foreground w-[260px] sm:w-[280px]">
          No stories yet
        </div>
      </HomeCarouselSection>
    );
  }
}

function CarouselSkeleton() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <Skeleton className="mb-4 h-8 w-56" />
      <div className="flex gap-4 overflow-hidden">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-[220px] w-[280px] shrink-0 rounded-xl" />
        ))}
      </div>
      <div className="mt-3 flex items-center justify-between">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="size-9 rounded-full" />
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

      <Suspense fallback={<CarouselSkeleton />}>
        <MostSearchedSection />
      </Suspense>

      <Suspense fallback={<CarouselSkeleton />}>
        <ElectricCarsSection />
      </Suspense>

      <Suspense fallback={<CarouselSkeleton />}>
        <HybridCarsSection />
      </Suspense>

      <Suspense fallback={<CarouselSkeleton />}>
        <UpcomingCarsSection />
      </Suspense>

      <Suspense fallback={<CarouselSkeleton />}>
        <LatestCarsSection />
      </Suspense>

      <Suspense fallback={<CarouselSkeleton />}>
        <PopularBrandsCarouselSection />
      </Suspense>

      <Suspense fallback={<CarouselSkeleton />}>
        <CarStoriesSection />
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

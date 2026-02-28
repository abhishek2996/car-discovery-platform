import { notFound } from "next/navigation";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { getCarModelWithDetails, getExpertReviewsForModel, getSimilarCars } from "@/lib/data/cars";
import { ImageGallery } from "@/components/public/car-detail/image-gallery";
import { PriceSummary } from "@/components/public/car-detail/price-summary";
import { KeyHighlights } from "@/components/public/car-detail/key-highlights";
import { SpecificationsSection } from "@/components/public/car-detail/specifications";
import { VariantSelector } from "@/components/public/car-detail/variant-selector";
import { ExpertReviewSummary } from "@/components/public/car-detail/expert-reviews";
import { UserReviews } from "@/components/public/car-detail/user-reviews";
import { SimilarCars } from "@/components/public/car-detail/similar-cars";

type PageParams = Promise<{ brandSlug: string; modelSlug: string }>;

export async function generateMetadata({ params }: { params: PageParams }) {
  const { brandSlug, modelSlug } = await params;
  const car = await getCarModelWithDetails(brandSlug, modelSlug);
  if (!car) return { title: "Car Not Found" };
  return {
    title: `${car.brand.name} ${car.name} – Price, Specs & Reviews | CarDiscovery`,
    description: `View ${car.brand.name} ${car.name} prices starting from ${car.minPrice ? `£${Number(car.minPrice).toLocaleString()}` : "TBA"}. Compare variants, specs, and read expert reviews.`,
  };
}

export default async function CarDetailPage({ params }: { params: PageParams }) {
  const { brandSlug, modelSlug } = await params;
  const car = await getCarModelWithDetails(brandSlug, modelSlug);
  if (!car) notFound();

  const [expertReviews, similarCars] = await Promise.all([
    getExpertReviewsForModel(car.id),
    getSimilarCars(car.id, car.bodyType, car.segment),
  ]);

  const allUserReviews = car.variants.flatMap((v) =>
    v.reviews.map((r) => ({ ...r, variantName: v.name }))
  );
  const avgRating =
    allUserReviews.length > 0
      ? allUserReviews.reduce((sum, r) => sum + r.rating, 0) / allUserReviews.length
      : null;
  const totalReviewCount = car.variants.reduce((sum, v) => sum + v._count.reviews, 0);

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      {/* Breadcrumb */}
      <nav className="mb-6 flex items-center gap-1.5 text-sm text-muted-foreground">
        <Link href="/" className="hover:text-foreground">Home</Link>
        <ChevronRight className="size-3.5" />
        <Link href="/new-cars" className="hover:text-foreground">New Cars</Link>
        <ChevronRight className="size-3.5" />
        <Link href={`/new-cars?brand=${brandSlug}`} className="hover:text-foreground">
          {car.brand.name}
        </Link>
        <ChevronRight className="size-3.5" />
        <span className="font-medium text-foreground">{car.name}</span>
      </nav>

      {/* Top section: Gallery + Price/Highlights */}
      <div className="grid gap-8 lg:grid-cols-5">
        <div className="lg:col-span-3">
          <ImageGallery
            mainImage={car.imageUrl}
            brandName={car.brand.name}
            modelName={car.name}
            variantImages={car.variants.map((v) => v.imageUrl).filter(Boolean) as string[]}
          />
        </div>
        <div className="space-y-6 lg:col-span-2">
          <div>
            <p className="text-sm font-medium text-muted-foreground">{car.brand.name}</p>
            <h1 className="text-3xl font-bold tracking-tight">{car.name}</h1>
            {avgRating !== null && (
              <div className="mt-1 flex items-center gap-2 text-sm">
                <span className="inline-flex items-center gap-1 rounded-md bg-green-100 px-2 py-0.5 font-semibold text-green-800">
                  {avgRating.toFixed(1)} ★
                </span>
                <span className="text-muted-foreground">
                  {totalReviewCount} {totalReviewCount === 1 ? "review" : "reviews"}
                </span>
              </div>
            )}
          </div>
          <PriceSummary
            minPrice={car.minPrice ? Number(car.minPrice) : null}
            maxPrice={car.maxPrice ? Number(car.maxPrice) : null}
            variantCount={car.variants.length}
          />
          <KeyHighlights variants={car.variants} bodyType={car.bodyType} segment={car.segment} />
        </div>
      </div>

      {/* Variant selector */}
      <section className="mt-12" id="variants">
        <VariantSelector variants={car.variants} brandName={car.brand.name} modelName={car.name} />
      </section>

      {/* Full specifications */}
      <section className="mt-12" id="specifications">
        <SpecificationsSection variants={car.variants} />
      </section>

      {/* Expert reviews */}
      {expertReviews.length > 0 && (
        <section className="mt-12" id="expert-reviews">
          <ExpertReviewSummary reviews={expertReviews} />
        </section>
      )}

      {/* User reviews */}
      <section className="mt-12" id="reviews">
        <UserReviews
          reviews={allUserReviews}
          variants={car.variants.map((v) => ({ id: v.id, name: v.name }))}
          avgRating={avgRating}
          totalCount={totalReviewCount}
        />
      </section>

      {/* Similar cars */}
      {similarCars.length > 0 && (
        <section className="mt-12" id="similar">
          <SimilarCars cars={similarCars} />
        </section>
      )}
    </div>
  );
}

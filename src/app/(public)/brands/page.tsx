import { BrandGrid } from "@/components/public/brand-grid";
import { getAllBrands } from "@/lib/data/brands";

export const metadata = {
  title: "All Car Brands – CarDiscovery",
  description:
    "Browse all car brands available in the UK. Find models, prices, and reviews for every manufacturer.",
};

export default async function BrandsPage() {
  const brands = await getAllBrands();

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">All Brands</h1>
        <p className="mt-2 text-muted-foreground">
          Explore {brands.length} car brands available in the United Kingdom.
        </p>
      </div>
      <BrandGrid brands={brands} title="" />
    </div>
  );
}

import { Suspense } from "react";
import { getAllModelsForComparison, getVariantsForComparison } from "@/lib/data/cars";
import { ComparisonPage } from "@/components/public/comparison/comparison-page";

export const metadata = {
  title: "Compare Cars – Side by Side | CarDiscovery",
  description:
    "Compare up to 3 cars side by side. Detailed spec comparison across engine, dimensions, features, and pricing.",
};

type PageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function ComparePage({ searchParams }: PageProps) {
  const raw = await searchParams;
  const variantParam = typeof raw.variants === "string" ? raw.variants : "";
  const variantIds = variantParam
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  const [allModels, selectedVariants] = await Promise.all([
    getAllModelsForComparison(),
    variantIds.length > 0 ? getVariantsForComparison(variantIds) : Promise.resolve([]),
  ]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Compare Cars</h1>
        <p className="mt-1 text-muted-foreground">
          Select up to 3 car variants to compare specifications side by side.
        </p>
      </div>
      <Suspense fallback={null}>
        <ComparisonPage allModels={allModels} initialVariants={selectedVariants} />
      </Suspense>
    </div>
  );
}

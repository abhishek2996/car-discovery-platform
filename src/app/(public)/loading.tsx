import { Skeleton } from "@/components/ui/skeleton";

export default function PublicLoading() {
  return (
    <div className="flex flex-1 flex-col">
      {/* Hero skeleton */}
      <div className="relative h-[280px] sm:h-[320px] lg:h-[400px] w-full overflow-hidden bg-muted">
        <div className="absolute inset-0 flex items-center justify-center">
          <Skeleton className="h-12 w-64 rounded-lg" />
        </div>
      </div>
      {/* Pills + content skeleton */}
      <div className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <Skeleton className="mb-4 h-8 w-64" />
        <div className="flex flex-wrap gap-2">
          {[1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={i} className="h-9 w-24 rounded-full" />
          ))}
        </div>
      </div>
      <div className="mx-auto w-full max-w-7xl px-4 pb-12 sm:px-6 lg:px-8">
        <Skeleton className="mb-6 h-8 w-48" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Skeleton key={i} className="h-[200px] w-full rounded-xl" />
          ))}
        </div>
      </div>
    </div>
  );
}

import { PageHeaderSkeleton } from "@/components/ui/page-skeleton";
import { CardGridSkeleton } from "@/components/ui/card-skeleton";

export default function Loading() {
  return (
    <>
      <PageHeaderSkeleton />
      <CardGridSkeleton count={6} />
    </>
  );
}

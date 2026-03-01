import { PageHeaderSkeleton } from "@/components/ui/page-skeleton";
import { TableSkeleton } from "@/components/ui/table-skeleton";

export default function Loading() {
  return (
    <>
      <PageHeaderSkeleton />
      <TableSkeleton rows={8} columns={10} />
    </>
  );
}

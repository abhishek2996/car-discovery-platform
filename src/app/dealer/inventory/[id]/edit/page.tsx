import { requireDealer } from "@/lib/auth";
import {
  getDealerInventoryItem,
  getAvailableVariantsForDealer,
} from "@/lib/data/dealer-dashboard";
import { PageHeader } from "@/ui/app-shell";
import { InventoryForm } from "@/components/dealer/inventory-form";
import { notFound } from "next/navigation";

type tParams = Promise<{ id: string }>;

interface PageProps {
  params: tParams;
}

export default async function EditInventoryPage({ params }: PageProps) {
  const { id } = await params;
  const user = await requireDealer();

  const [item, variants] = await Promise.all([
    getDealerInventoryItem(user.dealerId!, id),
    getAvailableVariantsForDealer(user.dealerId!),
  ]);

  if (!item) notFound();

  const defaultValues = {
    id: item.id,
    variantId: item.variantId,
    onRoadPrice: item.onRoadPrice?.toString() ?? "",
    stockStatus: item.stockStatus ?? "IN_STOCK",
    visibility: item.visibility,
    colorOptions: item.colorOptions ?? "",
    offers: item.offers ?? "",
    imageUrls: item.imageUrls ?? "",
  };

  return (
    <>
      <PageHeader
        title="Edit Inventory Item"
        description={`${item.variant.model.brand.name} ${item.variant.model.name} – ${item.variant.name}`}
      />
      <InventoryForm variants={variants} defaultValues={defaultValues} />
    </>
  );
}

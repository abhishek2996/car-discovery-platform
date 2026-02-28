import { requireDealer } from "@/lib/auth";
import { getAvailableVariantsForDealer } from "@/lib/data/dealer-dashboard";
import { PageHeader } from "@/ui/app-shell";
import { InventoryForm } from "@/components/dealer/inventory-form";

export default async function NewInventoryPage() {
  const user = await requireDealer();
  const variants = await getAvailableVariantsForDealer(user.dealerId!);

  return (
    <>
      <PageHeader
        title="Add Inventory Item"
        description="Add a new car variant to your inventory"
      />
      <InventoryForm variants={variants} />
    </>
  );
}

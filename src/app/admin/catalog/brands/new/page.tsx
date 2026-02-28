import { PageHeader } from "@/ui/app-shell";
import { BrandForm } from "@/components/admin/brand-form";
import { createBrand } from "@/lib/actions/admin";

export default function NewBrandPage() {
  return (
    <>
      <PageHeader title="Add Brand" description="Create a new car brand" />
      <BrandForm action={createBrand} />
    </>
  );
}

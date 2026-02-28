import { getAdminBrands } from "@/lib/data/admin-dashboard";
import { createModel } from "@/lib/actions/admin";
import { PageHeader } from "@/ui/app-shell";
import { ModelForm } from "@/components/admin/model-form";

export default async function NewModelPage() {
  const brands = await getAdminBrands();

  return (
    <>
      <PageHeader title="Add Model" description="Create a new car model" />
      <ModelForm
        action={createModel}
        brands={brands.map((b) => ({ id: b.id, name: b.name }))}
      />
    </>
  );
}

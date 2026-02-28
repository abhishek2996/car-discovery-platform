import { notFound } from "next/navigation";
import { getAdminModel } from "@/lib/data/admin-dashboard";
import { createVariant } from "@/lib/actions/admin";
import { PageHeader } from "@/ui/app-shell";
import { VariantForm } from "@/components/admin/variant-form";

type tParams = Promise<{ id: string }>;
interface PageProps {
  params: tParams;
}

export default async function NewVariantPage(props: PageProps) {
  const { id } = await props.params;
  const model = await getAdminModel(id);
  if (!model) notFound();

  return (
    <>
      <PageHeader
        title={`Add Variant — ${model.brand.name} ${model.name}`}
        description="Create a new variant for this model"
      />
      <VariantForm
        action={createVariant}
        modelId={id}
        backHref={`/admin/catalog/models/${id}/variants`}
      />
    </>
  );
}

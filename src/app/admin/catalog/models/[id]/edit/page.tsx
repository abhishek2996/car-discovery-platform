import { notFound } from "next/navigation";
import { getAdminModel, getAdminBrands } from "@/lib/data/admin-dashboard";
import { updateModel } from "@/lib/actions/admin";
import { PageHeader } from "@/ui/app-shell";
import { ModelForm } from "@/components/admin/model-form";

type tParams = Promise<{ id: string }>;
interface PageProps {
  params: tParams;
}

export default async function EditModelPage(props: PageProps) {
  const { id } = await props.params;
  const [model, allBrands] = await Promise.all([
    getAdminModel(id),
    getAdminBrands(),
  ]);
  if (!model) notFound();

  const action = updateModel.bind(null, id);

  return (
    <>
      <PageHeader
        title={`Edit ${model.brand.name} ${model.name}`}
        description="Update model details"
      />
      <ModelForm
        action={action}
        brands={allBrands.map((b) => ({ id: b.id, name: b.name }))}
        defaultValues={{
          brandId: model.brandId,
          name: model.name,
          slug: model.slug,
          bodyType: model.bodyType,
          segment: model.segment,
          minPrice: model.minPrice != null ? Number(model.minPrice) : null,
          maxPrice: model.maxPrice != null ? Number(model.maxPrice) : null,
          imageUrl: model.imageUrl,
        }}
      />
    </>
  );
}

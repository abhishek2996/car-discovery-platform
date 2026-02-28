import { notFound } from "next/navigation";
import { getAdminVariant } from "@/lib/data/admin-dashboard";
import { updateVariant } from "@/lib/actions/admin";
import { PageHeader } from "@/ui/app-shell";
import { VariantForm } from "@/components/admin/variant-form";

type tParams = Promise<{ id: string; variantId: string }>;
interface PageProps {
  params: tParams;
}

export default async function EditVariantPage(props: PageProps) {
  const { id, variantId } = await props.params;
  const variant = await getAdminVariant(variantId);
  if (!variant || variant.modelId !== id) notFound();

  const action = updateVariant.bind(null, variantId);

  return (
    <>
      <PageHeader
        title={`Edit ${variant.name}`}
        description={`${variant.model.brand.name} ${variant.model.name}`}
      />
      <VariantForm
        action={action}
        modelId={id}
        backHref={`/admin/catalog/models/${id}/variants`}
        defaultValues={{
          name: variant.name,
          slug: variant.slug,
          fuelType: variant.fuelType,
          transmission: variant.transmission,
          engine: variant.engine,
          power: variant.power,
          torque: variant.torque,
          mileage: variant.mileage,
          seating: variant.seating,
          exShowroomPrice: variant.exShowroomPrice != null ? Number(variant.exShowroomPrice) : null,
        }}
      />
    </>
  );
}

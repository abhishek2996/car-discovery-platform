import { notFound } from "next/navigation";
import { getAdminBrand } from "@/lib/data/admin-dashboard";
import { updateBrand } from "@/lib/actions/admin";
import { PageHeader } from "@/ui/app-shell";
import { BrandForm } from "@/components/admin/brand-form";

type tParams = Promise<{ id: string }>;
interface PageProps {
  params: tParams;
}

export default async function EditBrandPage(props: PageProps) {
  const { id } = await props.params;
  const brand = await getAdminBrand(id);
  if (!brand) notFound();

  const action = updateBrand.bind(null, id);

  return (
    <>
      <PageHeader title={`Edit ${brand.name}`} description="Update brand details" />
      <BrandForm
        action={action}
        defaultValues={{
          name: brand.name,
          slug: brand.slug,
          country: brand.country,
          logoUrl: brand.logoUrl,
        }}
      />
    </>
  );
}

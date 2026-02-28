import { requireAdmin } from "@/lib/auth";
import { getAdminBrands } from "@/lib/data/admin-dashboard";
import { createUpcomingCar } from "@/lib/actions/admin";
import { PageHeader } from "@/ui/app-shell";
import { UpcomingCarForm } from "@/components/admin/upcoming-car-form";

export default async function NewUpcomingCarPage() {
  await requireAdmin();
  const brands = await getAdminBrands();

  return (
    <>
      <PageHeader
        title="Add Upcoming Car"
        description="Add a new upcoming car to the catalogue"
      />
      <UpcomingCarForm
        brands={brands.map((b) => ({ id: b.id, name: b.name }))}
        action={createUpcomingCar}
      />
    </>
  );
}

import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { getAdminBrands } from "@/lib/data/admin-dashboard";
import { prisma } from "@/lib/db";
import { updateUpcomingCar } from "@/lib/actions/admin";
import { PageHeader } from "@/ui/app-shell";
import { UpcomingCarForm } from "@/components/admin/upcoming-car-form";

type tParams = Promise<{ id: string }>;

export default async function EditUpcomingCarPage({
  params,
}: {
  params: tParams;
}) {
  await requireAdmin();
  const { id } = await params;

  const [upcomingCar, brands] = await Promise.all([
    prisma.upcomingCar.findUnique({
      where: { id },
      include: { brand: true },
    }),
    getAdminBrands(),
  ]);

  if (!upcomingCar) notFound();

  const action = updateUpcomingCar.bind(null, id);

  return (
    <>
      <PageHeader
        title="Edit Upcoming Car"
        description={`Editing "${upcomingCar.name}"`}
      />
      <UpcomingCarForm
        brands={brands.map((b) => ({ id: b.id, name: b.name }))}
        action={action}
        defaultValues={{
          brandId: upcomingCar.brandId,
          name: upcomingCar.name,
          expectedLaunch: upcomingCar.expectedLaunch,
          estimatedPrice: upcomingCar.estimatedPrice,
          keyHighlights: upcomingCar.keyHighlights,
          imageUrl: upcomingCar.imageUrl,
        }}
      />
    </>
  );
}

import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { getAdminHeroSlide } from "@/lib/data/admin-dashboard";
import { updateHeroSlide } from "@/lib/actions/admin";
import { PageHeader } from "@/ui/app-shell";
import { HeroSlideForm } from "@/components/admin/hero-slide-form";

type tParams = Promise<{ id: string }>;

export default async function EditHeroSlidePage({
  params,
}: {
  params: tParams;
}) {
  await requireAdmin();
  const { id } = await params;

  const slide = await getAdminHeroSlide(id);
  if (!slide) notFound();

  const action = updateHeroSlide.bind(null, id);

  return (
    <>
      <PageHeader
        title="Edit hero slide"
        description={`Editing "${slide.title}"`}
      />
      <HeroSlideForm
        action={action}
        defaultValues={{
          title: slide.title,
          subtitle: slide.subtitle,
          benefitText: slide.benefitText,
          dealerName: slide.dealerName,
          locationsJson: slide.locationsJson,
          imageUrl: slide.imageUrl,
          sortOrder: slide.sortOrder,
          active: slide.active,
        }}
      />
    </>
  );
}

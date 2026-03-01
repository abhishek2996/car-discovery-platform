import { requireAdmin } from "@/lib/auth";
import { createHeroSlide } from "@/lib/actions/admin";
import { PageHeader } from "@/ui/app-shell";
import { HeroSlideForm } from "@/components/admin/hero-slide-form";

export default async function NewHeroSlidePage() {
  await requireAdmin();

  return (
    <>
      <PageHeader
        title="Add hero slide"
        description="New slide for the home page hero slider"
      />
      <HeroSlideForm action={createHeroSlide} />
    </>
  );
}

import { prisma } from "@/lib/db";
import { DealerSignupForm } from "@/components/public/dealer-signup-form";

export const metadata = {
  title: "Become a Dealer Partner | CarDiscovery",
  description:
    "Register your dealership on CarDiscovery and reach thousands of car buyers across the UK.",
};

export default async function DealerSignupPage() {
  const brands = await prisma.carBrand.findMany({
    orderBy: { name: "asc" },
    select: { id: true, name: true },
  });

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold tracking-tight">
          Become a Dealer Partner
        </h1>
        <p className="mt-2 text-muted-foreground">
          Register your dealership and start receiving leads from thousands of
          buyers across the UK. Our admin team will review your application
          within 24–48 hours.
        </p>
      </div>

      <DealerSignupForm brands={brands} />
    </div>
  );
}

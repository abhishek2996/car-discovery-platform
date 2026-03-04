import { SiteHeader } from "@/components/public/site-header";
import { SiteFooter } from "@/components/public/site-footer";
import { HomePageContent } from "@/components/public/home-page-content";

export const metadata = {
  title: "CarDiscovery – New Cars, Prices & Reviews in the UK",
  description:
    "Compare prices, specs, and reviews across hundreds of new car models from top brands in the United Kingdom. Find your perfect new car.",
};

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex-1">
        <HomePageContent />
      </main>
      <SiteFooter />
    </div>
  );
}

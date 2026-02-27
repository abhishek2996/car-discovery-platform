import Link from "next/link";
import { Car } from "lucide-react";
import { Separator } from "@/components/ui/separator";

const BRAND_LINKS = [
  { label: "BMW", href: "/new-cars?brand=bmw" },
  { label: "Mercedes-Benz", href: "/new-cars?brand=mercedes-benz" },
  { label: "Audi", href: "/new-cars?brand=audi" },
  { label: "Volkswagen", href: "/new-cars?brand=volkswagen" },
  { label: "Ford", href: "/new-cars?brand=ford" },
  { label: "Toyota", href: "/new-cars?brand=toyota" },
  { label: "Hyundai", href: "/new-cars?brand=hyundai" },
  { label: "Kia", href: "/new-cars?brand=kia" },
  { label: "Nissan", href: "/new-cars?brand=nissan" },
  { label: "Volvo", href: "/new-cars?brand=volvo" },
];

const BODY_TYPE_LINKS = [
  { label: "Hatchback", href: "/new-cars?bodyType=HATCHBACK" },
  { label: "Saloon", href: "/new-cars?bodyType=SEDAN" },
  { label: "SUV", href: "/new-cars?bodyType=SUV" },
  { label: "Estate", href: "/new-cars?bodyType=WAGON" },
  { label: "MPV", href: "/new-cars?bodyType=MUV" },
  { label: "Coupé", href: "/new-cars?bodyType=COUPÉ" },
  { label: "Convertible", href: "/new-cars?bodyType=CONVERTIBLE" },
];

const CITY_LINKS = [
  { label: "London", href: "/new-cars?city=London" },
  { label: "Birmingham", href: "/new-cars?city=Birmingham" },
  { label: "Manchester", href: "/new-cars?city=Manchester" },
  { label: "Edinburgh", href: "/new-cars?city=Edinburgh" },
  { label: "Glasgow", href: "/new-cars?city=Glasgow" },
  { label: "Bristol", href: "/new-cars?city=Bristol" },
  { label: "Leeds", href: "/new-cars?city=Leeds" },
  { label: "Cardiff", href: "/new-cars?city=Cardiff" },
];

const INFO_LINKS = [
  { label: "About Us", href: "/about" },
  { label: "Contact", href: "/contact" },
  { label: "Careers", href: "/careers" },
  { label: "Privacy Policy", href: "/privacy" },
  { label: "Terms of Service", href: "/terms" },
];

function FooterSection({
  title,
  links,
}: {
  title: string;
  links: { label: string; href: string }[];
}) {
  return (
    <div>
      <h3 className="mb-3 text-sm font-semibold">{title}</h3>
      <ul className="space-y-2">
        {links.map((link) => (
          <li key={link.href}>
            <Link
              href={link.href}
              className="text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function SiteFooter() {
  return (
    <footer className="border-t bg-muted/30">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4 lg:grid-cols-5">
          {/* Brand column */}
          <div className="col-span-2 md:col-span-1 lg:col-span-1">
            <Link href="/" className="mb-4 flex items-center gap-2">
              <div className="flex size-8 items-center justify-center rounded-lg bg-primary">
                <Car className="size-4 text-primary-foreground" />
              </div>
              <span className="text-lg font-bold tracking-tight">CarDiscovery</span>
            </Link>
            <p className="mt-3 text-sm text-muted-foreground">
              Your trusted companion for finding the perfect new car in the United
              Kingdom. Compare prices, read reviews, and connect with dealers.
            </p>
          </div>

          <FooterSection title="Popular Brands" links={BRAND_LINKS} />
          <FooterSection title="Body Types" links={BODY_TYPE_LINKS} />
          <FooterSection title="Cars by City" links={CITY_LINKS} />
          <FooterSection title="Company" links={INFO_LINKS} />
        </div>

        <Separator className="my-8" />

        <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
          <p className="text-xs text-muted-foreground">
            &copy; {new Date().getFullYear()} CarDiscovery. All rights reserved.
          </p>
          <div className="flex gap-4">
            <Link
              href="/sitemap"
              className="text-xs text-muted-foreground hover:text-foreground"
            >
              Sitemap
            </Link>
            <Link
              href="/privacy"
              className="text-xs text-muted-foreground hover:text-foreground"
            >
              Privacy
            </Link>
            <Link
              href="/terms"
              className="text-xs text-muted-foreground hover:text-foreground"
            >
              Terms
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

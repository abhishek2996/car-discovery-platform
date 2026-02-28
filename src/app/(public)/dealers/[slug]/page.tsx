import { notFound } from "next/navigation";
import Link from "next/link";
import { ChevronRight, MapPin, Phone, Mail, Store, Star, Car } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getDealerBySlug } from "@/lib/data/dealers";
import { formatPrice } from "@/lib/constants";
import { EnquiryFormWrapper } from "@/components/public/enquiry-form";
import { TestDriveFormWrapper } from "@/components/public/test-drive-form";

type PageParams = Promise<{ slug: string }>;

export async function generateMetadata({ params }: { params: PageParams }) {
  const { slug } = await params;
  const dealer = await getDealerBySlug(slug);
  if (!dealer) return { title: "Dealer Not Found" };
  return {
    title: `${dealer.name} – ${dealer.city} | CarDiscovery`,
    description: `Visit ${dealer.name} in ${dealer.city}. Browse inventory, read reviews, and contact the dealer.`,
  };
}

export default async function DealerDetailPage({ params }: { params: PageParams }) {
  const { slug } = await params;
  const dealer = await getDealerBySlug(slug);
  if (!dealer) notFound();

  const avgRating =
    dealer.reviews.length > 0
      ? dealer.reviews.reduce((sum, r) => sum + r.rating, 0) / dealer.reviews.length
      : null;

  const variantsForTestDrive = dealer.inventoryItems.map((item) => ({
    id: item.variant.id,
    name: `${item.variant.model.brand.name} ${item.variant.model.name} – ${item.variant.name}`,
  }));

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      {/* Breadcrumb */}
      <nav className="mb-6 flex items-center gap-1.5 text-sm text-muted-foreground">
        <Link href="/" className="hover:text-foreground">Home</Link>
        <ChevronRight className="size-3.5" />
        <Link href="/dealers" className="hover:text-foreground">Dealers</Link>
        <ChevronRight className="size-3.5" />
        <span className="font-medium text-foreground">{dealer.name}</span>
      </nav>

      {/* Header */}
      <div className="mb-8">
        {dealer.bannerUrl && (
          <img
            src={dealer.bannerUrl}
            alt={dealer.name}
            className="mb-6 h-48 w-full rounded-xl object-cover sm:h-64"
          />
        )}
        <div className="flex items-start gap-4">
          {dealer.logoUrl ? (
            <img src={dealer.logoUrl} alt={dealer.name} className="size-16 rounded-xl border object-contain" />
          ) : (
            <div className="flex size-16 items-center justify-center rounded-xl bg-primary/10">
              <Store className="size-8 text-primary" />
            </div>
          )}
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{dealer.name}</h1>
            <div className="mt-1 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <MapPin className="size-3.5" />
                {dealer.city}{dealer.state ? `, ${dealer.state}` : ""}
              </span>
              {dealer.phone && (
                <a href={`tel:${dealer.phone}`} className="flex items-center gap-1 hover:text-primary">
                  <Phone className="size-3.5" />
                  {dealer.phone}
                </a>
              )}
              {dealer.email && (
                <a href={`mailto:${dealer.email}`} className="flex items-center gap-1 hover:text-primary">
                  <Mail className="size-3.5" />
                  {dealer.email}
                </a>
              )}
            </div>
            {avgRating !== null && (
              <div className="mt-2 flex items-center gap-2 text-sm">
                <span className="inline-flex items-center gap-1 rounded-md bg-green-100 px-2 py-0.5 font-semibold text-green-800">
                  {avgRating.toFixed(1)} ★
                </span>
                <span className="text-muted-foreground">
                  {dealer._count.reviews} {dealer._count.reviews === 1 ? "review" : "reviews"}
                </span>
              </div>
            )}
          </div>
        </div>

        {dealer.dealerBrands.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-1.5">
            {dealer.dealerBrands.map((db) => (
              <Badge key={db.id} variant="secondary">
                {db.brand.name}
              </Badge>
            ))}
          </div>
        )}

        {dealer.description && (
          <p className="mt-4 text-sm text-muted-foreground leading-relaxed">{dealer.description}</p>
        )}
      </div>

      <Tabs defaultValue="inventory" className="space-y-6">
        <TabsList>
          <TabsTrigger value="inventory">
            Inventory ({dealer._count.inventoryItems})
          </TabsTrigger>
          <TabsTrigger value="reviews">
            Reviews ({dealer._count.reviews})
          </TabsTrigger>
          <TabsTrigger value="enquiry">Send Enquiry</TabsTrigger>
          <TabsTrigger value="test-drive">Book Test Drive</TabsTrigger>
        </TabsList>

        {/* Inventory */}
        <TabsContent value="inventory">
          {dealer.inventoryItems.length > 0 ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {dealer.inventoryItems.map((item) => (
                <Link
                  key={item.id}
                  href={`/new-cars/${item.variant.model.brand.slug}/${item.variant.model.slug}`}
                >
                  <Card className="group h-full transition-all hover:shadow-md hover:border-primary/20">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Car className="size-4 text-muted-foreground" />
                        <p className="text-xs text-muted-foreground">
                          {item.variant.model.brand.name}
                        </p>
                      </div>
                      <h4 className="text-sm font-semibold group-hover:text-primary">
                        {item.variant.model.name} – {item.variant.name}
                      </h4>
                      {item.onRoadPrice && (
                        <p className="mt-1 text-sm font-bold">
                          {formatPrice(Number(item.onRoadPrice))}
                          <span className="text-xs font-normal text-muted-foreground"> on-road</span>
                        </p>
                      )}
                      <div className="mt-2 flex items-center gap-2">
                        {item.stockStatus && (
                          <Badge
                            variant={item.stockStatus === "IN_STOCK" ? "default" : "secondary"}
                            className="text-[10px]"
                          >
                            {item.stockStatus.replace("_", " ")}
                          </Badge>
                        )}
                        {item.offers && (
                          <Badge variant="outline" className="text-[10px] text-green-700">
                            Offer
                          </Badge>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Car className="mx-auto size-10 text-muted-foreground/30" />
              <p className="mt-3 text-sm text-muted-foreground">
                No inventory listed yet.
              </p>
            </div>
          )}
        </TabsContent>

        {/* Reviews */}
        <TabsContent value="reviews">
          {dealer.reviews.length > 0 ? (
            <div className="space-y-4">
              {dealer.reviews.map((review) => (
                <Card key={review.id}>
                  <CardContent className="p-5">
                    <div className="flex items-start gap-3">
                      <Avatar className="size-9">
                        <AvatarImage src={review.author?.image ?? undefined} />
                        <AvatarFallback>
                          {review.author?.name?.charAt(0) ?? "U"}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-semibold">
                            {review.author?.name ?? "Anonymous"}
                          </p>
                          <div className="flex items-center gap-0.5">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <Star
                                key={i}
                                className={`size-3.5 ${i < review.rating ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground/30"}`}
                              />
                            ))}
                          </div>
                        </div>
                        {review.title && (
                          <h4 className="mt-1 text-sm font-semibold">{review.title}</h4>
                        )}
                        {review.content && (
                          <p className="mt-1 text-sm text-muted-foreground">{review.content}</p>
                        )}
                        <p className="mt-2 text-xs text-muted-foreground">
                          {new Date(review.createdAt).toLocaleDateString("en-GB", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Star className="mx-auto size-10 text-muted-foreground/30" />
              <p className="mt-3 text-sm text-muted-foreground">No reviews yet.</p>
            </div>
          )}
        </TabsContent>

        {/* Enquiry Form */}
        <TabsContent value="enquiry">
          <Card>
            <CardContent className="p-6">
              <h3 className="mb-1 text-lg font-semibold">Send an Enquiry</h3>
              <p className="mb-6 text-sm text-muted-foreground">
                Reach out to {dealer.name} with your questions.
              </p>
              <EnquiryFormWrapper dealerId={dealer.id} source="dealer_page" />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Test Drive Form */}
        <TabsContent value="test-drive">
          <Card>
            <CardContent className="p-6">
              <h3 className="mb-1 text-lg font-semibold">Book a Test Drive</h3>
              <p className="mb-6 text-sm text-muted-foreground">
                Schedule a test drive at {dealer.name}.
              </p>
              <TestDriveFormWrapper
                dealerId={dealer.id}
                variants={variantsForTestDrive}
                source="dealer_page"
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

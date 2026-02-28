import { requireDealer } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { PageHeader } from "@/ui/app-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Tag, Calendar, Percent, PoundSterling } from "lucide-react";
import { formatPrice } from "@/lib/constants";
import { AddOfferDialog } from "@/components/dealer/add-offer-dialog";
import { DeleteOfferButton } from "@/components/dealer/delete-offer-button";

interface ParsedOffer {
  id: string;
  title: string;
  description?: string;
  discountType: "PERCENTAGE" | "FLAT";
  discountAmount: number;
  validFrom: string;
  validTo: string;
  isHighlighted: boolean;
  createdAt: string;
}

export default async function OffersPage() {
  const user = await requireDealer();
  const dealerId = user.dealerId!;

  const inventoryItems = await prisma.dealerInventoryItem.findMany({
    where: { dealerId },
    include: {
      variant: {
        include: { model: { include: { brand: true } } },
      },
    },
    orderBy: { updatedAt: "desc" },
  });

  const itemsWithOffers = inventoryItems
    .map((item) => ({
      ...item,
      parsedOffers: item.offers
        ? (JSON.parse(item.offers) as ParsedOffer[])
        : [],
    }))
    .filter((item) => item.parsedOffers.length > 0);

  const allOffers = itemsWithOffers.flatMap((item) =>
    item.parsedOffers.map((offer) => ({
      ...offer,
      inventoryItemId: item.id,
      car: `${item.variant.model.brand.name} ${item.variant.model.name} – ${item.variant.name}`,
    })),
  );

  const inventoryOptions = inventoryItems.map((item) => ({
    id: item.id,
    label: `${item.variant.model.brand.name} ${item.variant.model.name} – ${item.variant.name}`,
  }));

  return (
    <>
      <PageHeader
        title="Offers"
        description={`${allOffers.length} active offer${allOffers.length !== 1 ? "s" : ""}`}
        actions={<AddOfferDialog inventoryOptions={inventoryOptions} />}
      />

      {allOffers.length === 0 ? (
        <div className="mt-8 text-center">
          <Tag className="mx-auto h-12 w-12 text-muted-foreground" />
          <p className="mt-4 text-muted-foreground">
            No offers yet. Create your first offer to attract buyers.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {allOffers.map((offer) => {
            const now = new Date();
            const validFrom = new Date(offer.validFrom);
            const validTo = new Date(offer.validTo);
            const isActive = now >= validFrom && now <= validTo;
            const isExpired = now > validTo;

            return (
              <Card key={offer.id}>
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-2">
                    <CardTitle className="text-sm font-medium">
                      {offer.title}
                    </CardTitle>
                    {offer.isHighlighted && (
                      <Badge variant="default" className="shrink-0 text-xs">
                        Featured
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">{offer.car}</p>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-2 text-sm">
                    {offer.discountType === "PERCENTAGE" ? (
                      <Percent className="h-3.5 w-3.5 text-muted-foreground" />
                    ) : (
                      <PoundSterling className="h-3.5 w-3.5 text-muted-foreground" />
                    )}
                    <span className="font-semibold">
                      {offer.discountType === "PERCENTAGE"
                        ? `${offer.discountAmount}% off`
                        : `${formatPrice(offer.discountAmount)} off`}
                    </span>
                  </div>

                  {offer.description && (
                    <p className="text-xs text-muted-foreground">
                      {offer.description}
                    </p>
                  )}

                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Calendar className="h-3 w-3" />
                    {new Date(offer.validFrom).toLocaleDateString("en-GB")} –{" "}
                    {new Date(offer.validTo).toLocaleDateString("en-GB")}
                  </div>

                  <div className="flex items-center justify-between">
                    <Badge
                      variant={
                        isActive
                          ? "default"
                          : isExpired
                            ? "destructive"
                            : "secondary"
                      }
                      className="text-xs"
                    >
                      {isActive ? "Active" : isExpired ? "Expired" : "Upcoming"}
                    </Badge>
                    <DeleteOfferButton
                      inventoryItemId={offer.inventoryItemId}
                      offerId={offer.id}
                    />
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </>
  );
}

"use client";

import { useState, useEffect } from "react";
import { useActionState } from "react";
import { CheckCircle, CalendarDays, FileText, Tag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { UK_CITIES, COUNTRY_CODES } from "@/lib/constants";
import { submitOfferOrBrochureRequest } from "@/lib/actions/leads";
import { TestDriveFormWrapper } from "@/components/public/test-drive-form";
import { getCityCookie } from "@/components/public/city-selector";

export type DealerWithVariants = {
  dealerId: string;
  dealerName: string;
  variants: { id: string; name: string }[];
  isPlatformFallback?: boolean;
};

interface CarDetailActionsProps {
  carModelId: string;
  brandSlug: string;
  carName: string;
  dealersWithVariants: DealerWithVariants[];
}

export function CarDetailActions({
  carModelId,
  brandSlug,
  carName,
  dealersWithVariants,
}: CarDetailActionsProps) {
  const [offerOpen, setOfferOpen] = useState(false);
  const [brochureOpen, setBrochureOpen] = useState(false);
  const [testDriveOpen, setTestDriveOpen] = useState(false);
  const [selectedDealerId, setSelectedDealerId] = useState<string | null>(
    dealersWithVariants.length === 1 ? dealersWithVariants[0].dealerId : null
  );

  const [offerState, offerAction, offerPending] = useActionState(submitOfferOrBrochureRequest, null);

  const [offerCity, setOfferCity] = useState("");

  useEffect(() => {
    if (offerOpen || brochureOpen) {
      const fromCookie = getCityCookie();
      const valid = fromCookie && UK_CITIES.includes(fromCookie as (typeof UK_CITIES)[number]);
      setOfferCity(valid ? fromCookie : "");
    }
  }, [offerOpen, brochureOpen]);

  const selectedDealer = dealersWithVariants.find((d) => d.dealerId === selectedDealerId);
  const canSubmitTestDrive = selectedDealer && selectedDealer.variants.length > 0;
  const isPlatformFallback = selectedDealer?.isPlatformFallback === true;

  const showOfferSuccess = offerState?.success && (offerOpen || brochureOpen);

  return (
    <>
      <div className="flex flex-col gap-2">
        <div className="flex gap-2">
          <Button
            type="button"
            onClick={() => setOfferOpen(true)}
            className="flex-1 min-w-0 bg-primary text-primary-foreground hover:bg-primary/90"
          >
            <Tag className="mr-2 size-4 shrink-0" />
            Get offer
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => setBrochureOpen(true)}
            className="flex-1 min-w-0 border-input bg-background"
          >
            <FileText className="mr-2 size-4 shrink-0" />
            Request brochure
          </Button>
        </div>
        <Button
          type="button"
          onClick={() => setTestDriveOpen(true)}
          className="w-full sm:w-auto bg-primary text-primary-foreground hover:bg-primary/90"
        >
          <CalendarDays className="mr-2 size-4" />
          Schedule Test Drive
        </Button>
      </div>

      {/* Get offer / Request brochure modal – slightly transparent */}
      <Dialog
        open={offerOpen || brochureOpen}
        onOpenChange={(open) => {
          if (!open) {
            setOfferOpen(false);
            setBrochureOpen(false);
            setOfferCity("");
          }
        }}
      >
        <DialogContent
          className="sm:max-w-md bg-background/95 backdrop-blur-sm border shadow-lg"
          style={{ backgroundColor: "rgba(255, 255, 255, 0.92)" }}
        >
          <DialogHeader>
            <DialogTitle>
              {offerOpen ? "Get offer" : "Request brochure"}
            </DialogTitle>
          </DialogHeader>
          {showOfferSuccess ? (
            <div className="text-center py-6 space-y-3">
              <CheckCircle className="mx-auto size-12 text-green-500" aria-hidden />
              <h3 className="text-lg font-semibold text-foreground">
                {offerOpen ? "Offer sent" : "Brochure sent"}
              </h3>
              <p className="text-sm text-muted-foreground max-w-sm mx-auto">
                {offerState.message}
              </p>
              <p className="text-xs text-muted-foreground">
                We’ve also notified the dealer. They’ll get in touch if needed.
              </p>
            </div>
          ) : (
            <form action={offerAction} className="space-y-4">
              <input type="hidden" name="carModelId" value={carModelId} />
              <input type="hidden" name="brandSlug" value={brandSlug} />
              <input type="hidden" name="intent" value={offerOpen ? "offer" : "brochure"} />
              {offerState?.message && !offerState.success && (
                <p className="text-sm text-destructive">{offerState.message}</p>
              )}

              <div>
                <Label htmlFor="ob-city">Your city</Label>
                <input type="hidden" name="city" value={offerCity} />
                <Select
                  value={offerCity || undefined}
                  onValueChange={setOfferCity}
                >
                  <SelectTrigger id="ob-city" className="mt-1">
                    <SelectValue placeholder="List of cities" />
                  </SelectTrigger>
                  <SelectContent>
                    {UK_CITIES.map((city) => (
                      <SelectItem key={city} value={city}>
                        {city}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {offerState?.errors?.city && (
                  <p className="mt-1 text-xs text-destructive">{offerState.errors.city[0]}</p>
                )}
              </div>

              <div>
                <Label htmlFor="ob-email">Email id</Label>
                <Input
                  id="ob-email"
                  name="email"
                  type="email"
                  placeholder="Type your email id"
                  required
                  className="mt-1"
                />
                {offerState?.errors?.email && (
                  <p className="mt-1 text-xs text-destructive">{offerState.errors.email[0]}</p>
                )}
              </div>

              <div>
                <Label>Mobile number</Label>
                <div className="mt-1 flex gap-2">
                  <select
                    name="countryCode"
                    required
                    defaultValue="+44"
                    className="flex h-9 w-[110px] shrink-0 rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    {COUNTRY_CODES.map(({ code, country }) => (
                      <option key={code} value={code}>
                        {code} {country}
                      </option>
                    ))}
                  </select>
                  <Input
                    id="ob-phone"
                    name="phoneNumber"
                    type="tel"
                    placeholder="Type your mobile number"
                    required
                    className="flex-1"
                    inputMode="numeric"
                    autoComplete="tel-national"
                  />
                </div>
                {offerState?.errors?.phoneNumber && (
                  <p className="mt-1 text-xs text-destructive">{offerState.errors.phoneNumber[0]}</p>
                )}
                {offerState?.errors?.countryCode && (
                  <p className="mt-1 text-xs text-destructive">{offerState.errors.countryCode[0]}</p>
                )}
              </div>

              <Button
                type="submit"
                disabled={offerPending}
                className="w-full bg-primary text-primary-foreground"
              >
                {offerPending
                  ? "Submitting..."
                  : offerOpen
                    ? "Get offer"
                    : "Request brochure"}
              </Button>
            </form>
          )}
        </DialogContent>
      </Dialog>

      {/* Schedule Test Drive modal – calendar and time */}
      <Dialog open={testDriveOpen} onOpenChange={setTestDriveOpen}>
        <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Schedule Test Drive – {carName}</DialogTitle>
          </DialogHeader>

          {dealersWithVariants.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4">
              No dealers with this car in inventory at the moment. Check back later or browse dealers.
            </p>
          ) : (
            <>
              {isPlatformFallback && (
                <p className="text-sm text-muted-foreground mb-4 rounded-md bg-muted/60 p-3">
                  Our team will manually book your test drive on the official dealer website until dealers are onboarded.
                </p>
              )}
              {dealersWithVariants.length > 1 && (
                <div>
                  <Label>Select dealer</Label>
                  <Select
                    value={selectedDealerId ?? ""}
                    onValueChange={(v) => setSelectedDealerId(v)}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Choose a dealer" />
                    </SelectTrigger>
                    <SelectContent>
                      {dealersWithVariants.map((d) => (
                        <SelectItem key={d.dealerId} value={d.dealerId}>
                          {d.dealerName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {canSubmitTestDrive && selectedDealer && (
                <div className="mt-4 pt-4 border-t">
                  <TestDriveFormWrapper
                    dealerId={selectedDealer.dealerId}
                    variants={selectedDealer.variants}
                    source="car_detail"
                  />
                </div>
              )}
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}

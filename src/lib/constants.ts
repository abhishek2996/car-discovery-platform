export const UK_CITIES = [
  "London",
  "Birmingham",
  "Manchester",
  "Leeds",
  "Liverpool",
  "Sheffield",
  "Bristol",
  "Newcastle",
  "Nottingham",
  "Leicester",
  "Edinburgh",
  "Glasgow",
  "Cardiff",
  "Belfast",
  "Southampton",
  "Oxford",
  "Cambridge",
  "Brighton",
  "Reading",
  "Coventry",
] as const;

export type UKCity = (typeof UK_CITIES)[number];

export const BODY_TYPE_LABELS: Record<string, string> = {
  HATCHBACK: "Hatchback",
  SEDAN: "Saloon",
  SUV: "SUV",
  MUV: "MPV",
  COUPÉ: "Coupé",
  CONVERTIBLE: "Convertible",
  WAGON: "Estate",
  PICKUP: "Pick-up",
  LUXURY: "Luxury",
};

export const FUEL_TYPE_LABELS: Record<string, string> = {
  PETROL: "Petrol",
  DIESEL: "Diesel",
  CNG: "CNG",
  ELECTRIC: "Electric",
  HYBRID: "Hybrid",
  PLUGIN_HYBRID: "Plug-in Hybrid",
};

export const TRANSMISSION_LABELS: Record<string, string> = {
  MANUAL: "Manual",
  AUTOMATIC: "Automatic",
  AMT: "AMT",
  CVT: "CVT",
  DCT: "DCT",
  SINGLE_SPEED: "Single Speed",
  DUAL_CLUTCH: "Dual Clutch",
};

export const BUDGET_RANGES = [
  { label: "Under £10,000", min: 0, max: 10000 },
  { label: "£10,000 – £20,000", min: 10000, max: 20000 },
  { label: "£20,000 – £30,000", min: 20000, max: 30000 },
  { label: "£30,000 – £50,000", min: 30000, max: 50000 },
  { label: "£50,000 – £75,000", min: 50000, max: 75000 },
  { label: "£75,000 – £100,000", min: 75000, max: 100000 },
  { label: "Over £100,000", min: 100000, max: undefined },
] as const;

export const SEATING_OPTIONS = [2, 4, 5, 6, 7, 8] as const;

export const SORT_OPTIONS = [
  { value: "popularity", label: "Popularity" },
  { value: "price_asc", label: "Price: Low to High" },
  { value: "price_desc", label: "Price: High to Low" },
  { value: "newest", label: "Newest First" },
] as const;

export const PAGE_SIZE = 12;

export function formatPrice(price: number | string): string {
  const num = typeof price === "string" ? parseFloat(price) : price;
  if (isNaN(num)) return "TBA";
  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: "GBP",
    maximumFractionDigits: 0,
  }).format(num);
}

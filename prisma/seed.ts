import { PrismaClient } from "../src/generated/prisma";
import { PrismaNeon } from "@prisma/adapter-neon";
import { hash } from "bcryptjs";
import "dotenv/config";

const adapter = new PrismaNeon({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

// Placeholder car images by body type (Unsplash CDN – free to use, no API key)
const BODY_TYPE_IMAGES: Record<string, string> = {
  HATCHBACK:
    "https://images.unsplash.com/photo-1555215695-3004980ad54e?w=800&q=80",
  SEDAN:
    "https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?w=800&q=80",
  SUV: "https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?w=800&q=80",
  MUV: "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=800&q=80",
  COUPÉ:
    "https://images.unsplash.com/photo-1542362567-646918a6428?w=800&q=80",
  CONVERTIBLE:
    "https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=800&q=80",
  WAGON:
    "https://images.unsplash.com/photo-1609521263047-f8f205293f24?w=800&q=80",
  PICKUP:
    "https://images.unsplash.com/photo-1523348837708-15d4a09cfac2?w=800&q=80",
  LUXURY:
    "https://images.unsplash.com/photo-1553440569-bcc63803a83d?w=800&q=80",
};
const DEFAULT_CAR_IMAGE =
  "https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=800&q=80";

function getImageForBodyType(bodyType: string): string {
  return BODY_TYPE_IMAGES[bodyType] ?? DEFAULT_CAR_IMAGE;
}

async function main() {
  // --- Brands ---
  const brandData = [
    { name: "BMW", slug: "bmw", country: "Germany" },
    { name: "Mercedes-Benz", slug: "mercedes-benz", country: "Germany" },
    { name: "Audi", slug: "audi", country: "Germany" },
    { name: "Volkswagen", slug: "volkswagen", country: "Germany" },
    { name: "Ford", slug: "ford", country: "United States" },
    { name: "Toyota", slug: "toyota", country: "Japan" },
    { name: "Hyundai", slug: "hyundai", country: "South Korea" },
    { name: "Kia", slug: "kia", country: "South Korea" },
    { name: "Nissan", slug: "nissan", country: "Japan" },
    { name: "Volvo", slug: "volvo", country: "Sweden" },
    { name: "Vauxhall", slug: "vauxhall", country: "United Kingdom" },
    { name: "Peugeot", slug: "peugeot", country: "France" },
    { name: "Tesla", slug: "tesla", country: "United States" },
    { name: "Land Rover", slug: "land-rover", country: "United Kingdom" },
    { name: "MINI", slug: "mini", country: "United Kingdom" },
    { name: "Honda", slug: "honda", country: "Japan" },
    { name: "Mazda", slug: "mazda", country: "Japan" },
    { name: "Jaguar", slug: "jaguar", country: "United Kingdom" },
    { name: "Škoda", slug: "skoda", country: "Czech Republic" },
    { name: "SEAT", slug: "seat", country: "Spain" },
    { name: "Renault", slug: "renault", country: "France" },
    { name: "Citroën", slug: "citroen", country: "France" },
    { name: "MG", slug: "mg", country: "United Kingdom" },
    { name: "Dacia", slug: "dacia", country: "Romania" },
    { name: "Cupra", slug: "cupra", country: "Spain" },
    { name: "Polestar", slug: "polestar", country: "Sweden" },
    { name: "Lexus", slug: "lexus", country: "Japan" },
    { name: "Suzuki", slug: "suzuki", country: "Japan" },
    { name: "DS", slug: "ds", country: "France" },
  ];

  for (const b of brandData) {
    await prisma.carBrand.upsert({
      where: { slug: b.slug },
      update: {},
      create: b,
    });
  }

  const brand = (slug: string) =>
    prisma.carBrand.findUniqueOrThrow({ where: { slug } });

  // --- Models & Variants ---
  type ModelSeed = {
    brandSlug: string;
    name: string;
    slug: string;
    bodyType: string;
    segment: string;
    minPrice: number;
    maxPrice: number;
    variants: {
      name: string;
      slug: string;
      fuelType: string;
      transmission: string;
      seating: number;
      exShowroomPrice: number;
      engine: string;
      power: string;
      mileage: string;
    }[];
  };

  const models: ModelSeed[] = [
    {
      brandSlug: "volkswagen",
      name: "Golf",
      slug: "golf",
      bodyType: "HATCHBACK",
      segment: "compact",
      minPrice: 26500,
      maxPrice: 40000,
      variants: [
        { name: "Life 1.5 TSI", slug: "life-1-5-tsi", fuelType: "PETROL", transmission: "MANUAL", seating: 5, exShowroomPrice: 26500, engine: "1.5L Turbo Petrol", power: "148 bhp", mileage: "47.1 mpg" },
        { name: "Style 1.5 TSI DSG", slug: "style-1-5-tsi-dsg", fuelType: "PETROL", transmission: "AUTOMATIC", seating: 5, exShowroomPrice: 30000, engine: "1.5L Turbo Petrol", power: "148 bhp", mileage: "44.8 mpg" },
        { name: "R-Line 2.0 TSI DSG", slug: "r-line-2-0-tsi-dsg", fuelType: "PETROL", transmission: "DCT", seating: 5, exShowroomPrice: 35500, engine: "2.0L Turbo Petrol", power: "201 bhp", mileage: "40.9 mpg" },
      ],
    },
    {
      brandSlug: "bmw",
      name: "3 Series",
      slug: "3-series",
      bodyType: "SEDAN",
      segment: "mid-size",
      minPrice: 39300,
      maxPrice: 55000,
      variants: [
        { name: "320i SE", slug: "320i-se", fuelType: "PETROL", transmission: "AUTOMATIC", seating: 5, exShowroomPrice: 39300, engine: "2.0L Turbo Petrol", power: "181 bhp", mileage: "42.2 mpg" },
        { name: "320d M Sport", slug: "320d-m-sport", fuelType: "DIESEL", transmission: "AUTOMATIC", seating: 5, exShowroomPrice: 43500, engine: "2.0L Turbo Diesel", power: "188 bhp", mileage: "55.4 mpg" },
        { name: "330e M Sport", slug: "330e-m-sport", fuelType: "PLUGIN_HYBRID", transmission: "AUTOMATIC", seating: 5, exShowroomPrice: 47900, engine: "2.0L Plug-in Hybrid", power: "288 bhp", mileage: "176.6 mpg" },
      ],
    },
    {
      brandSlug: "tesla",
      name: "Model 3",
      slug: "model-3",
      bodyType: "SEDAN",
      segment: "mid-size",
      minPrice: 38990,
      maxPrice: 52990,
      variants: [
        { name: "Standard Range", slug: "standard-range", fuelType: "ELECTRIC", transmission: "SINGLE_SPEED", seating: 5, exShowroomPrice: 38990, engine: "Single Motor Electric", power: "271 bhp", mileage: "305 miles" },
        { name: "Long Range", slug: "long-range", fuelType: "ELECTRIC", transmission: "SINGLE_SPEED", seating: 5, exShowroomPrice: 47990, engine: "Dual Motor Electric", power: "346 bhp", mileage: "390 miles" },
        { name: "Performance", slug: "performance", fuelType: "ELECTRIC", transmission: "SINGLE_SPEED", seating: 5, exShowroomPrice: 52990, engine: "Dual Motor Electric", power: "510 bhp", mileage: "340 miles" },
      ],
    },
    {
      brandSlug: "ford",
      name: "Puma",
      slug: "puma",
      bodyType: "SUV",
      segment: "compact",
      minPrice: 27200,
      maxPrice: 36000,
      variants: [
        { name: "Titanium 1.0 EcoBoost", slug: "titanium-1-0-ecoboost", fuelType: "PETROL", transmission: "MANUAL", seating: 5, exShowroomPrice: 27200, engine: "1.0L EcoBoost Hybrid", power: "123 bhp", mileage: "52.3 mpg" },
        { name: "ST-Line 1.0 EcoBoost", slug: "st-line-1-0-ecoboost", fuelType: "PETROL", transmission: "AUTOMATIC", seating: 5, exShowroomPrice: 30000, engine: "1.0L EcoBoost Hybrid", power: "153 bhp", mileage: "49.6 mpg" },
        { name: "ST 1.5 EcoBoost", slug: "st-1-5-ecoboost", fuelType: "PETROL", transmission: "MANUAL", seating: 5, exShowroomPrice: 34000, engine: "1.5L EcoBoost", power: "197 bhp", mileage: "40.4 mpg" },
      ],
    },
    {
      brandSlug: "hyundai",
      name: "Tucson",
      slug: "tucson",
      bodyType: "SUV",
      segment: "mid-size",
      minPrice: 32745,
      maxPrice: 44000,
      variants: [
        { name: "SE Connect 1.6 T-GDi", slug: "se-connect-1-6-tgdi", fuelType: "PETROL", transmission: "MANUAL", seating: 5, exShowroomPrice: 32745, engine: "1.6L Turbo Petrol", power: "148 bhp", mileage: "40.9 mpg" },
        { name: "Premium 1.6 T-GDi HEV", slug: "premium-1-6-tgdi-hev", fuelType: "HYBRID", transmission: "AUTOMATIC", seating: 5, exShowroomPrice: 38000, engine: "1.6L Hybrid", power: "227 bhp", mileage: "49.6 mpg" },
        { name: "Ultimate 1.6 T-GDi PHEV", slug: "ultimate-1-6-tgdi-phev", fuelType: "PLUGIN_HYBRID", transmission: "AUTOMATIC", seating: 5, exShowroomPrice: 44000, engine: "1.6L Plug-in Hybrid", power: "261 bhp", mileage: "201.8 mpg" },
      ],
    },
    {
      brandSlug: "toyota",
      name: "Corolla",
      slug: "corolla",
      bodyType: "HATCHBACK",
      segment: "compact",
      minPrice: 29999,
      maxPrice: 36000,
      variants: [
        { name: "Icon 1.8 Hybrid", slug: "icon-1-8-hybrid", fuelType: "HYBRID", transmission: "CVT", seating: 5, exShowroomPrice: 29999, engine: "1.8L Hybrid", power: "138 bhp", mileage: "60.1 mpg" },
        { name: "Design 2.0 Hybrid", slug: "design-2-0-hybrid", fuelType: "HYBRID", transmission: "CVT", seating: 5, exShowroomPrice: 33000, engine: "2.0L Hybrid", power: "194 bhp", mileage: "54.3 mpg" },
        { name: "GR Sport 2.0 Hybrid", slug: "gr-sport-2-0-hybrid", fuelType: "HYBRID", transmission: "CVT", seating: 5, exShowroomPrice: 36000, engine: "2.0L Hybrid", power: "194 bhp", mileage: "52.3 mpg" },
      ],
    },
    {
      brandSlug: "kia",
      name: "Sportage",
      slug: "sportage",
      bodyType: "SUV",
      segment: "mid-size",
      minPrice: 29795,
      maxPrice: 42000,
      variants: [
        { name: "2 1.6 T-GDi", slug: "2-1-6-tgdi", fuelType: "PETROL", transmission: "MANUAL", seating: 5, exShowroomPrice: 29795, engine: "1.6L Turbo Petrol", power: "148 bhp", mileage: "40.4 mpg" },
        { name: "3 1.6 T-GDi HEV", slug: "3-1-6-tgdi-hev", fuelType: "HYBRID", transmission: "AUTOMATIC", seating: 5, exShowroomPrice: 35000, engine: "1.6L Hybrid", power: "227 bhp", mileage: "49.6 mpg" },
        { name: "GT-Line S 1.6 PHEV", slug: "gt-line-s-1-6-phev", fuelType: "PLUGIN_HYBRID", transmission: "AUTOMATIC", seating: 5, exShowroomPrice: 42000, engine: "1.6L Plug-in Hybrid", power: "261 bhp", mileage: "201.8 mpg" },
      ],
    },
    {
      brandSlug: "audi",
      name: "A3",
      slug: "a3",
      bodyType: "HATCHBACK",
      segment: "compact",
      minPrice: 29700,
      maxPrice: 43000,
      variants: [
        { name: "Sport 30 TFSI", slug: "sport-30-tfsi", fuelType: "PETROL", transmission: "MANUAL", seating: 5, exShowroomPrice: 29700, engine: "1.0L Turbo Petrol", power: "109 bhp", mileage: "51.4 mpg" },
        { name: "S Line 35 TFSI S tronic", slug: "s-line-35-tfsi-s-tronic", fuelType: "PETROL", transmission: "DCT", seating: 5, exShowroomPrice: 34000, engine: "1.5L Turbo Petrol", power: "148 bhp", mileage: "47.1 mpg" },
        { name: "Black Edition 35 TDI S tronic", slug: "black-edition-35-tdi-s-tronic", fuelType: "DIESEL", transmission: "DCT", seating: 5, exShowroomPrice: 38000, engine: "2.0L Turbo Diesel", power: "148 bhp", mileage: "57.6 mpg" },
      ],
    },
    {
      brandSlug: "mercedes-benz",
      name: "A-Class",
      slug: "a-class",
      bodyType: "HATCHBACK",
      segment: "compact",
      minPrice: 31500,
      maxPrice: 45000,
      variants: [
        { name: "A 180 Sport", slug: "a-180-sport", fuelType: "PETROL", transmission: "AUTOMATIC", seating: 5, exShowroomPrice: 31500, engine: "1.3L Turbo Petrol", power: "134 bhp", mileage: "45.6 mpg" },
        { name: "A 200 AMG Line", slug: "a-200-amg-line", fuelType: "PETROL", transmission: "DCT", seating: 5, exShowroomPrice: 36000, engine: "1.3L Turbo Petrol", power: "161 bhp", mileage: "44.1 mpg" },
        { name: "A 250e AMG Line", slug: "a-250e-amg-line", fuelType: "PLUGIN_HYBRID", transmission: "DCT", seating: 5, exShowroomPrice: 40000, engine: "1.3L Plug-in Hybrid", power: "215 bhp", mileage: "282.5 mpg" },
      ],
    },
    {
      brandSlug: "volvo",
      name: "XC40",
      slug: "xc40",
      bodyType: "SUV",
      segment: "compact",
      minPrice: 35000,
      maxPrice: 50000,
      variants: [
        { name: "Core B3", slug: "core-b3", fuelType: "PETROL", transmission: "AUTOMATIC", seating: 5, exShowroomPrice: 35000, engine: "1.5L Mild Hybrid", power: "161 bhp", mileage: "41.5 mpg" },
        { name: "Plus B4 AWD", slug: "plus-b4-awd", fuelType: "PETROL", transmission: "AUTOMATIC", seating: 5, exShowroomPrice: 42000, engine: "2.0L Mild Hybrid AWD", power: "194 bhp", mileage: "38.2 mpg" },
        { name: "Recharge Pure Electric", slug: "recharge-pure-electric", fuelType: "ELECTRIC", transmission: "SINGLE_SPEED", seating: 5, exShowroomPrice: 50000, engine: "Dual Motor Electric", power: "402 bhp", mileage: "254 miles" },
      ],
    },
    {
      brandSlug: "nissan",
      name: "Qashqai",
      slug: "qashqai",
      bodyType: "SUV",
      segment: "compact",
      minPrice: 27000,
      maxPrice: 40000,
      variants: [
        { name: "Acenta Premium DIG-T", slug: "acenta-premium-dig-t", fuelType: "PETROL", transmission: "MANUAL", seating: 5, exShowroomPrice: 27000, engine: "1.3L Mild Hybrid", power: "138 bhp", mileage: "44.8 mpg" },
        { name: "N-Connecta e-POWER", slug: "n-connecta-e-power", fuelType: "HYBRID", transmission: "AUTOMATIC", seating: 5, exShowroomPrice: 35000, engine: "1.5L e-POWER Hybrid", power: "187 bhp", mileage: "53.3 mpg" },
        { name: "Tekna+ e-POWER", slug: "tekna-plus-e-power", fuelType: "HYBRID", transmission: "AUTOMATIC", seating: 5, exShowroomPrice: 40000, engine: "1.5L e-POWER Hybrid", power: "187 bhp", mileage: "53.3 mpg" },
      ],
    },
    {
      brandSlug: "land-rover",
      name: "Range Rover Evoque",
      slug: "range-rover-evoque",
      bodyType: "SUV",
      segment: "premium",
      minPrice: 42000,
      maxPrice: 60000,
      variants: [
        { name: "S D165", slug: "s-d165", fuelType: "DIESEL", transmission: "AUTOMATIC", seating: 5, exShowroomPrice: 42000, engine: "2.0L Turbo Diesel", power: "161 bhp", mileage: "42.8 mpg" },
        { name: "Dynamic SE P250", slug: "dynamic-se-p250", fuelType: "PETROL", transmission: "AUTOMATIC", seating: 5, exShowroomPrice: 50000, engine: "2.0L Turbo Petrol", power: "247 bhp", mileage: "33.6 mpg" },
        { name: "Autobiography P300e", slug: "autobiography-p300e", fuelType: "PLUGIN_HYBRID", transmission: "AUTOMATIC", seating: 5, exShowroomPrice: 60000, engine: "1.5L Plug-in Hybrid", power: "305 bhp", mileage: "176.6 mpg" },
      ],
    },
    {
      brandSlug: "mini",
      name: "Cooper",
      slug: "cooper",
      bodyType: "HATCHBACK",
      segment: "sub-compact",
      minPrice: 22000,
      maxPrice: 38000,
      variants: [
        { name: "Classic", slug: "classic", fuelType: "PETROL", transmission: "MANUAL", seating: 4, exShowroomPrice: 22000, engine: "1.5L Turbo Petrol", power: "134 bhp", mileage: "49.6 mpg" },
        { name: "S Exclusive", slug: "s-exclusive", fuelType: "PETROL", transmission: "AUTOMATIC", seating: 4, exShowroomPrice: 29000, engine: "2.0L Turbo Petrol", power: "174 bhp", mileage: "44.1 mpg" },
        { name: "SE Electric", slug: "se-electric", fuelType: "ELECTRIC", transmission: "SINGLE_SPEED", seating: 4, exShowroomPrice: 32000, engine: "Single Motor Electric", power: "181 bhp", mileage: "190 miles" },
      ],
    },
    {
      brandSlug: "vauxhall",
      name: "Corsa",
      slug: "corsa",
      bodyType: "HATCHBACK",
      segment: "sub-compact",
      minPrice: 18000,
      maxPrice: 32000,
      variants: [
        { name: "Design 1.2", slug: "design-1-2", fuelType: "PETROL", transmission: "MANUAL", seating: 5, exShowroomPrice: 18000, engine: "1.2L Petrol", power: "74 bhp", mileage: "52.3 mpg" },
        { name: "GS 1.2 Turbo", slug: "gs-1-2-turbo", fuelType: "PETROL", transmission: "AUTOMATIC", seating: 5, exShowroomPrice: 24000, engine: "1.2L Turbo Petrol", power: "128 bhp", mileage: "47.9 mpg" },
        { name: "Electric GS", slug: "electric-gs", fuelType: "ELECTRIC", transmission: "SINGLE_SPEED", seating: 5, exShowroomPrice: 32000, engine: "Single Motor Electric", power: "134 bhp", mileage: "222 miles" },
      ],
    },
    {
      brandSlug: "peugeot",
      name: "3008",
      slug: "3008",
      bodyType: "SUV",
      segment: "mid-size",
      minPrice: 35000,
      maxPrice: 50000,
      variants: [
        { name: "Allure 1.2 PureTech", slug: "allure-1-2-puretech", fuelType: "PETROL", transmission: "AUTOMATIC", seating: 5, exShowroomPrice: 35000, engine: "1.2L PureTech", power: "128 bhp", mileage: "47.1 mpg" },
        { name: "GT 1.6 Hybrid", slug: "gt-1-6-hybrid", fuelType: "PLUGIN_HYBRID", transmission: "AUTOMATIC", seating: 5, exShowroomPrice: 42000, engine: "1.6L Plug-in Hybrid", power: "221 bhp", mileage: "217.3 mpg" },
        { name: "GT Premium Hybrid 4", slug: "gt-premium-hybrid-4", fuelType: "PLUGIN_HYBRID", transmission: "AUTOMATIC", seating: 5, exShowroomPrice: 50000, engine: "1.6L Plug-in Hybrid AWD", power: "296 bhp", mileage: "188.3 mpg" },
      ],
    },
    {
      brandSlug: "tesla",
      name: "Model Y",
      slug: "model-y",
      bodyType: "SUV",
      segment: "mid-size",
      minPrice: 44990,
      maxPrice: 59990,
      variants: [
        { name: "Standard Range", slug: "standard-range", fuelType: "ELECTRIC", transmission: "SINGLE_SPEED", seating: 5, exShowroomPrice: 44990, engine: "Single Motor Electric", power: "268 bhp", mileage: "283 miles" },
        { name: "Long Range AWD", slug: "long-range-awd", fuelType: "ELECTRIC", transmission: "SINGLE_SPEED", seating: 7, exShowroomPrice: 51990, engine: "Dual Motor Electric AWD", power: "346 bhp", mileage: "331 miles" },
        { name: "Performance AWD", slug: "performance-awd", fuelType: "ELECTRIC", transmission: "SINGLE_SPEED", seating: 5, exShowroomPrice: 59990, engine: "Dual Motor Electric AWD", power: "510 bhp", mileage: "303 miles" },
      ],
    },
    {
      brandSlug: "skoda",
      name: "Octavia",
      slug: "octavia",
      bodyType: "SEDAN",
      segment: "mid-size",
      minPrice: 27000,
      maxPrice: 38000,
      variants: [
        { name: "SE 1.5 TSI", slug: "se-1-5-tsi", fuelType: "PETROL", transmission: "MANUAL", seating: 5, exShowroomPrice: 27000, engine: "1.5L Turbo Petrol", power: "148 bhp", mileage: "49.6 mpg" },
        { name: "SE L 2.0 TDI", slug: "se-l-2-0-tdi", fuelType: "DIESEL", transmission: "AUTOMATIC", seating: 5, exShowroomPrice: 32000, engine: "2.0L Turbo Diesel", power: "148 bhp", mileage: "57.6 mpg" },
        { name: "vRS 2.0 TSI DSG", slug: "vrs-2-0-tsi-dsg", fuelType: "PETROL", transmission: "DCT", seating: 5, exShowroomPrice: 38000, engine: "2.0L Turbo Petrol", power: "241 bhp", mileage: "38.2 mpg" },
      ],
    },
    {
      brandSlug: "mazda",
      name: "CX-5",
      slug: "cx-5",
      bodyType: "SUV",
      segment: "mid-size",
      minPrice: 31000,
      maxPrice: 40000,
      variants: [
        { name: "SE-L 2.0 Skyactiv-G", slug: "se-l-2-0-skyactiv-g", fuelType: "PETROL", transmission: "MANUAL", seating: 5, exShowroomPrice: 31000, engine: "2.0L Skyactiv-G", power: "163 bhp", mileage: "38.7 mpg" },
        { name: "Sport 2.2 Skyactiv-D", slug: "sport-2-2-skyactiv-d", fuelType: "DIESEL", transmission: "AUTOMATIC", seating: 5, exShowroomPrice: 36000, engine: "2.2L Skyactiv-D", power: "181 bhp", mileage: "44.8 mpg" },
        { name: "GT Sport 2.2 Skyactiv-D AWD", slug: "gt-sport-2-2-skyactiv-d-awd", fuelType: "DIESEL", transmission: "AUTOMATIC", seating: 5, exShowroomPrice: 40000, engine: "2.2L Skyactiv-D AWD", power: "181 bhp", mileage: "40.9 mpg" },
      ],
    },
    {
      brandSlug: "ford",
      name: "Kuga",
      slug: "kuga",
      bodyType: "SUV",
      segment: "mid-size",
      minPrice: 30000,
      maxPrice: 43000,
      variants: [
        { name: "Titanium 1.5 EcoBoost", slug: "titanium-1-5-ecoboost", fuelType: "PETROL", transmission: "MANUAL", seating: 5, exShowroomPrice: 30000, engine: "1.5L EcoBoost", power: "148 bhp", mileage: "40.4 mpg" },
        { name: "ST-Line 2.5 FHEV", slug: "st-line-2-5-fhev", fuelType: "HYBRID", transmission: "CVT", seating: 5, exShowroomPrice: 36000, engine: "2.5L Full Hybrid", power: "187 bhp", mileage: "49.6 mpg" },
        { name: "Vignale 2.5 PHEV", slug: "vignale-2-5-phev", fuelType: "PLUGIN_HYBRID", transmission: "AUTOMATIC", seating: 5, exShowroomPrice: 43000, engine: "2.5L Plug-in Hybrid", power: "221 bhp", mileage: "201.8 mpg" },
      ],
    },
    {
      brandSlug: "bmw",
      name: "X1",
      slug: "x1",
      bodyType: "SUV",
      segment: "compact",
      minPrice: 36000,
      maxPrice: 52000,
      variants: [
        { name: "sDrive18i Sport", slug: "sdrive18i-sport", fuelType: "PETROL", transmission: "AUTOMATIC", seating: 5, exShowroomPrice: 36000, engine: "1.5L Turbo Petrol", power: "134 bhp", mileage: "44.8 mpg" },
        { name: "xDrive23i M Sport", slug: "xdrive23i-m-sport", fuelType: "PETROL", transmission: "AUTOMATIC", seating: 5, exShowroomPrice: 43000, engine: "2.0L Turbo Petrol AWD", power: "215 bhp", mileage: "38.7 mpg" },
        { name: "iX1 xDrive30 M Sport", slug: "ix1-xdrive30-m-sport", fuelType: "ELECTRIC", transmission: "SINGLE_SPEED", seating: 5, exShowroomPrice: 52000, engine: "Dual Motor Electric AWD", power: "308 bhp", mileage: "272 miles" },
      ],
    },
    // --- Additional UK-market models ---
    {
      brandSlug: "honda",
      name: "Jazz",
      slug: "jazz",
      bodyType: "HATCHBACK",
      segment: "sub-compact",
      minPrice: 22500,
      maxPrice: 28500,
      variants: [
        { name: "EX 1.5 i-MMD", slug: "ex-1-5-immd", fuelType: "HYBRID", transmission: "CVT", seating: 5, exShowroomPrice: 22500, engine: "1.5L e:HEV Hybrid", power: "107 bhp", mileage: "62.8 mpg" },
        { name: "Crosstar EX 1.5 i-MMD", slug: "crosstar-ex-1-5-immd", fuelType: "HYBRID", transmission: "CVT", seating: 5, exShowroomPrice: 26500, engine: "1.5L e:HEV Hybrid", power: "107 bhp", mileage: "58.9 mpg" },
      ],
    },
    {
      brandSlug: "honda",
      name: "Civic",
      slug: "civic",
      bodyType: "HATCHBACK",
      segment: "compact",
      minPrice: 29950,
      maxPrice: 38500,
      variants: [
        { name: "Sport 2.0 i-MMD", slug: "sport-2-0-immd", fuelType: "HYBRID", transmission: "CVT", seating: 5, exShowroomPrice: 29950, engine: "2.0L e:HEV Hybrid", power: "181 bhp", mileage: "56.5 mpg" },
        { name: "Advance 2.0 i-MMD", slug: "advance-2-0-immd", fuelType: "HYBRID", transmission: "CVT", seating: 5, exShowroomPrice: 35000, engine: "2.0L e:HEV Hybrid", power: "181 bhp", mileage: "56.5 mpg" },
        { name: "Type R", slug: "type-r", fuelType: "PETROL", transmission: "MANUAL", seating: 5, exShowroomPrice: 38500, engine: "2.0L Turbo Petrol", power: "329 bhp", mileage: "31.0 mpg" },
      ],
    },
    {
      brandSlug: "jaguar",
      name: "E-Pace",
      slug: "e-pace",
      bodyType: "SUV",
      segment: "compact",
      minPrice: 38500,
      maxPrice: 52000,
      variants: [
        { name: "P200 R-Dynamic S", slug: "p200-r-dynamic-s", fuelType: "PETROL", transmission: "AUTOMATIC", seating: 5, exShowroomPrice: 38500, engine: "2.0L Turbo Petrol", power: "197 bhp", mileage: "35.8 mpg" },
        { name: "P250 R-Dynamic SE", slug: "p250-r-dynamic-se", fuelType: "PETROL", transmission: "AUTOMATIC", seating: 5, exShowroomPrice: 45000, engine: "2.0L Turbo Petrol", power: "246 bhp", mileage: "33.2 mpg" },
        { name: "P300e R-Dynamic HSE", slug: "p300e-r-dynamic-hse", fuelType: "PLUGIN_HYBRID", transmission: "AUTOMATIC", seating: 5, exShowroomPrice: 52000, engine: "1.5L Plug-in Hybrid", power: "309 bhp", mileage: "141.2 mpg" },
      ],
    },
    {
      brandSlug: "jaguar",
      name: "F-Pace",
      slug: "f-pace",
      bodyType: "SUV",
      segment: "mid-size",
      minPrice: 45000,
      maxPrice: 72000,
      variants: [
        { name: "P250 S", slug: "p250-s", fuelType: "PETROL", transmission: "AUTOMATIC", seating: 5, exShowroomPrice: 45000, engine: "2.0L Turbo Petrol", power: "246 bhp", mileage: "32.1 mpg" },
        { name: "P400 R-Dynamic HSE", slug: "p400-r-dynamic-hse", fuelType: "PETROL", transmission: "AUTOMATIC", seating: 5, exShowroomPrice: 62000, engine: "3.0L Turbo Petrol", power: "395 bhp", mileage: "28.0 mpg" },
        { name: "P400e R-Dynamic", slug: "p400e-r-dynamic", fuelType: "PLUGIN_HYBRID", transmission: "AUTOMATIC", seating: 5, exShowroomPrice: 72000, engine: "2.0L Plug-in Hybrid", power: "404 bhp", mileage: "128.4 mpg" },
      ],
    },
    {
      brandSlug: "seat",
      name: "Ibiza",
      slug: "ibiza",
      bodyType: "HATCHBACK",
      segment: "sub-compact",
      minPrice: 19500,
      maxPrice: 26500,
      variants: [
        { name: "SE 1.0 TSI", slug: "se-1-0-tsi", fuelType: "PETROL", transmission: "MANUAL", seating: 5, exShowroomPrice: 19500, engine: "1.0L Turbo Petrol", power: "94 bhp", mileage: "52.3 mpg" },
        { name: "FR 1.5 TSI", slug: "fr-1-5-tsi", fuelType: "PETROL", transmission: "MANUAL", seating: 5, exShowroomPrice: 23500, engine: "1.5L Turbo Petrol", power: "148 bhp", mileage: "49.6 mpg" },
        { name: "Xcellence 1.0 TSI DSG", slug: "xcellence-1-0-tsi-dsg", fuelType: "PETROL", transmission: "DCT", seating: 5, exShowroomPrice: 26500, engine: "1.0L Turbo Petrol", power: "108 bhp", mileage: "50.4 mpg" },
      ],
    },
    {
      brandSlug: "seat",
      name: "Leon",
      slug: "leon",
      bodyType: "HATCHBACK",
      segment: "compact",
      minPrice: 25500,
      maxPrice: 38000,
      variants: [
        { name: "SE 1.5 TSI", slug: "se-1-5-tsi", fuelType: "PETROL", transmission: "MANUAL", seating: 5, exShowroomPrice: 25500, engine: "1.5L Turbo Petrol", power: "148 bhp", mileage: "49.6 mpg" },
        { name: "FR 2.0 TSI DSG", slug: "fr-2-0-tsi-dsg", fuelType: "PETROL", transmission: "DCT", seating: 5, exShowroomPrice: 32000, engine: "2.0L Turbo Petrol", power: "242 bhp", mileage: "38.7 mpg" },
        { name: "e-Hybrid 1.4 TSI", slug: "e-hybrid-1-4-tsi", fuelType: "PLUGIN_HYBRID", transmission: "DCT", seating: 5, exShowroomPrice: 38000, engine: "1.4L Plug-in Hybrid", power: "201 bhp", mileage: "217.3 mpg" },
      ],
    },
    {
      brandSlug: "renault",
      name: "Clio",
      slug: "clio",
      bodyType: "HATCHBACK",
      segment: "sub-compact",
      minPrice: 19500,
      maxPrice: 27500,
      variants: [
        { name: "Evolution 1.0 TCe", slug: "evolution-1-0-tce", fuelType: "PETROL", transmission: "MANUAL", seating: 5, exShowroomPrice: 19500, engine: "1.0L Turbo Petrol", power: "89 bhp", mileage: "52.3 mpg" },
        { name: "Iconic E-Tech Full Hybrid", slug: "iconic-e-tech-full-hybrid", fuelType: "HYBRID", transmission: "AUTOMATIC", seating: 5, exShowroomPrice: 24500, engine: "1.6L Hybrid", power: "143 bhp", mileage: "62.8 mpg" },
        { name: "Esprit Alpine E-Tech", slug: "esprit-alpine-e-tech", fuelType: "HYBRID", transmission: "AUTOMATIC", seating: 5, exShowroomPrice: 27500, engine: "1.6L Hybrid", power: "143 bhp", mileage: "62.8 mpg" },
      ],
    },
    {
      brandSlug: "renault",
      name: "Captur",
      slug: "captur",
      bodyType: "SUV",
      segment: "sub-compact",
      minPrice: 22500,
      maxPrice: 35000,
      variants: [
        { name: "Evolution 1.0 TCe", slug: "evolution-1-0-tce", fuelType: "PETROL", transmission: "MANUAL", seating: 5, exShowroomPrice: 22500, engine: "1.0L Turbo Petrol", power: "99 bhp", mileage: "48.7 mpg" },
        { name: "Iconic E-Tech Full Hybrid", slug: "iconic-e-tech-full-hybrid", fuelType: "HYBRID", transmission: "AUTOMATIC", seating: 5, exShowroomPrice: 29500, engine: "1.6L Hybrid", power: "143 bhp", mileage: "58.9 mpg" },
        { name: "Esprit Alpine E-Tech", slug: "esprit-alpine-e-tech", fuelType: "HYBRID", transmission: "AUTOMATIC", seating: 5, exShowroomPrice: 35000, engine: "1.6L Hybrid", power: "143 bhp", mileage: "58.9 mpg" },
      ],
    },
    {
      brandSlug: "renault",
      name: "Zoe",
      slug: "zoe",
      bodyType: "HATCHBACK",
      segment: "sub-compact",
      minPrice: 29995,
      maxPrice: 34995,
      variants: [
        { name: "Zen R135", slug: "zen-r135", fuelType: "ELECTRIC", transmission: "SINGLE_SPEED", seating: 5, exShowroomPrice: 29995, engine: "Single Motor Electric", power: "134 bhp", mileage: "239 miles" },
        { name: "Iconic R135", slug: "iconic-r135", fuelType: "ELECTRIC", transmission: "SINGLE_SPEED", seating: 5, exShowroomPrice: 34995, engine: "Single Motor Electric", power: "134 bhp", mileage: "239 miles" },
      ],
    },
    {
      brandSlug: "citroen",
      name: "C3",
      slug: "c3",
      bodyType: "HATCHBACK",
      segment: "sub-compact",
      minPrice: 17500,
      maxPrice: 24500,
      variants: [
        { name: "You 1.2 PureTech", slug: "you-1-2-puretech", fuelType: "PETROL", transmission: "MANUAL", seating: 5, exShowroomPrice: 17500, engine: "1.2L PureTech", power: "82 bhp", mileage: "53.3 mpg" },
        { name: "Max 1.2 PureTech", slug: "max-1-2-puretech", fuelType: "PETROL", transmission: "MANUAL", seating: 5, exShowroomPrice: 21500, engine: "1.2L Turbo Petrol", power: "108 bhp", mileage: "51.4 mpg" },
        { name: "C-Series 1.2 PureTech", slug: "c-series-1-2-puretech", fuelType: "PETROL", transmission: "AUTOMATIC", seating: 5, exShowroomPrice: 24500, engine: "1.2L Turbo Petrol", power: "128 bhp", mileage: "49.6 mpg" },
      ],
    },
    {
      brandSlug: "citroen",
      name: "C4",
      slug: "c4",
      bodyType: "HATCHBACK",
      segment: "compact",
      minPrice: 26500,
      maxPrice: 38000,
      variants: [
        { name: "You 1.2 PureTech", slug: "you-1-2-puretech", fuelType: "PETROL", transmission: "MANUAL", seating: 5, exShowroomPrice: 26500, engine: "1.2L Turbo Petrol", power: "128 bhp", mileage: "49.6 mpg" },
        { name: "Shine 1.2 PureTech", slug: "shine-1-2-puretech", fuelType: "PETROL", transmission: "AUTOMATIC", seating: 5, exShowroomPrice: 31000, engine: "1.2L Turbo Petrol", power: "128 bhp", mileage: "47.9 mpg" },
        { name: "e-C4 50kWh", slug: "e-c4-50kwh", fuelType: "ELECTRIC", transmission: "SINGLE_SPEED", seating: 5, exShowroomPrice: 38000, engine: "Single Motor Electric", power: "134 bhp", mileage: "217 miles" },
      ],
    },
    {
      brandSlug: "mg",
      name: "MG3",
      slug: "mg3",
      bodyType: "HATCHBACK",
      segment: "sub-compact",
      minPrice: 14995,
      maxPrice: 18995,
      variants: [
        { name: "Exclusive", slug: "exclusive", fuelType: "PETROL", transmission: "MANUAL", seating: 5, exShowroomPrice: 14995, engine: "1.5L Petrol", power: "104 bhp", mileage: "48.7 mpg" },
        { name: "Trophy", slug: "trophy", fuelType: "PETROL", transmission: "MANUAL", seating: 5, exShowroomPrice: 18995, engine: "1.5L Petrol", power: "104 bhp", mileage: "48.7 mpg" },
      ],
    },
    {
      brandSlug: "mg",
      name: "ZS",
      slug: "zs",
      bodyType: "SUV",
      segment: "sub-compact",
      minPrice: 19995,
      maxPrice: 31995,
      variants: [
        { name: "Exclusive 1.0 T-GDi", slug: "exclusive-1-0-tgdi", fuelType: "PETROL", transmission: "MANUAL", seating: 5, exShowroomPrice: 19995, engine: "1.0L Turbo Petrol", power: "108 bhp", mileage: "47.9 mpg" },
        { name: "Trophy 1.5 T-GDi", slug: "trophy-1-5-tgdi", fuelType: "PETROL", transmission: "AUTOMATIC", seating: 5, exShowroomPrice: 24995, engine: "1.5L Turbo Petrol", power: "161 bhp", mileage: "42.2 mpg" },
        { name: "EV Trophy Long Range", slug: "ev-trophy-long-range", fuelType: "ELECTRIC", transmission: "SINGLE_SPEED", seating: 5, exShowroomPrice: 31995, engine: "Single Motor Electric", power: "154 bhp", mileage: "273 miles" },
      ],
    },
    {
      brandSlug: "mg",
      name: "4",
      slug: "mg4",
      bodyType: "HATCHBACK",
      segment: "compact",
      minPrice: 26995,
      maxPrice: 36995,
      variants: [
        { name: "SE Standard Range", slug: "se-standard-range", fuelType: "ELECTRIC", transmission: "SINGLE_SPEED", seating: 5, exShowroomPrice: 26995, engine: "Single Motor Electric", power: "168 bhp", mileage: "218 miles" },
        { name: "Trophy Long Range", slug: "trophy-long-range", fuelType: "ELECTRIC", transmission: "SINGLE_SPEED", seating: 5, exShowroomPrice: 31995, engine: "Single Motor Electric", power: "201 bhp", mileage: "281 miles" },
        { name: "XPOWER", slug: "xpower", fuelType: "ELECTRIC", transmission: "SINGLE_SPEED", seating: 5, exShowroomPrice: 36995, engine: "Dual Motor Electric AWD", power: "429 bhp", mileage: "239 miles" },
      ],
    },
    {
      brandSlug: "dacia",
      name: "Sandero",
      slug: "sandero",
      bodyType: "HATCHBACK",
      segment: "sub-compact",
      minPrice: 12995,
      maxPrice: 18995,
      variants: [
        { name: "Essential 1.0 SCe", slug: "essential-1-0-sce", fuelType: "PETROL", transmission: "MANUAL", seating: 5, exShowroomPrice: 12995, engine: "1.0L Petrol", power: "89 bhp", mileage: "52.3 mpg" },
        { name: "Comfort 1.0 TCe", slug: "comfort-1-0-tce", fuelType: "PETROL", transmission: "MANUAL", seating: 5, exShowroomPrice: 15995, engine: "1.0L Turbo Petrol", power: "99 bhp", mileage: "51.4 mpg" },
        { name: "Essential 1.0 TCe LPG", slug: "essential-1-0-tce-lpg", fuelType: "PETROL", transmission: "MANUAL", seating: 5, exShowroomPrice: 18995, engine: "1.0L Turbo Petrol LPG", power: "99 bhp", mileage: "48.7 mpg" },
      ],
    },
    {
      brandSlug: "dacia",
      name: "Duster",
      slug: "duster",
      bodyType: "SUV",
      segment: "compact",
      minPrice: 17995,
      maxPrice: 27995,
      variants: [
        { name: "Essential 1.0 TCe", slug: "essential-1-0-tce", fuelType: "PETROL", transmission: "MANUAL", seating: 5, exShowroomPrice: 17995, engine: "1.0L Turbo Petrol", power: "108 bhp", mileage: "44.8 mpg" },
        { name: "Comfort 1.3 TCe", slug: "comfort-1-3-tce", fuelType: "PETROL", transmission: "MANUAL", seating: 5, exShowroomPrice: 21995, engine: "1.3L Turbo Petrol", power: "148 bhp", mileage: "42.2 mpg" },
        { name: "Prestige 1.6 Hybrid", slug: "prestige-1-6-hybrid", fuelType: "HYBRID", transmission: "AUTOMATIC", seating: 5, exShowroomPrice: 27995, engine: "1.6L Hybrid", power: "141 bhp", mileage: "53.3 mpg" },
      ],
    },
    {
      brandSlug: "cupra",
      name: "Born",
      slug: "born",
      bodyType: "HATCHBACK",
      segment: "compact",
      minPrice: 36970,
      maxPrice: 44970,
      variants: [
        { name: "V 58kWh", slug: "v-58kwh", fuelType: "ELECTRIC", transmission: "SINGLE_SPEED", seating: 5, exShowroomPrice: 36970, engine: "Single Motor Electric", power: "168 bhp", mileage: "264 miles" },
        { name: "VZ 77kWh", slug: "vz-77kwh", fuelType: "ELECTRIC", transmission: "SINGLE_SPEED", seating: 5, exShowroomPrice: 41970, engine: "Single Motor Electric", power: "228 bhp", mileage: "343 miles" },
        { name: "VZ 77kWh e-Boost", slug: "vz-77kwh-e-boost", fuelType: "ELECTRIC", transmission: "SINGLE_SPEED", seating: 5, exShowroomPrice: 44970, engine: "Single Motor Electric", power: "321 bhp", mileage: "335 miles" },
      ],
    },
    {
      brandSlug: "cupra",
      name: "Formentor",
      slug: "formentor",
      bodyType: "SUV",
      segment: "compact",
      minPrice: 35970,
      maxPrice: 58970,
      variants: [
        { name: "V1 1.5 TSI", slug: "v1-1-5-tsi", fuelType: "PETROL", transmission: "MANUAL", seating: 5, exShowroomPrice: 35970, engine: "1.5L Turbo Petrol", power: "148 bhp", mileage: "44.8 mpg" },
        { name: "VZ2 2.0 TSI 4Drive", slug: "vz2-2-0-tsi-4drive", fuelType: "PETROL", transmission: "DCT", seating: 5, exShowroomPrice: 45970, engine: "2.0L Turbo Petrol AWD", power: "306 bhp", mileage: "34.0 mpg" },
        { name: "VZ5 2.5 TSI 4Drive", slug: "vz5-2-5-tsi-4drive", fuelType: "PETROL", transmission: "DCT", seating: 5, exShowroomPrice: 58970, engine: "2.5L Turbo Petrol AWD", power: "386 bhp", mileage: "29.4 mpg" },
      ],
    },
    {
      brandSlug: "polestar",
      name: "Polestar 2",
      slug: "polestar-2",
      bodyType: "SEDAN",
      segment: "mid-size",
      minPrice: 44900,
      maxPrice: 59900,
      variants: [
        { name: "Standard Range Single Motor", slug: "standard-range-single-motor", fuelType: "ELECTRIC", transmission: "SINGLE_SPEED", seating: 5, exShowroomPrice: 44900, engine: "Single Motor Electric", power: "268 bhp", mileage: "339 miles" },
        { name: "Long Range Single Motor", slug: "long-range-single-motor", fuelType: "ELECTRIC", transmission: "SINGLE_SPEED", seating: 5, exShowroomPrice: 49900, engine: "Single Motor Electric", power: "295 bhp", mileage: "406 miles" },
        { name: "Long Range Dual Motor", slug: "long-range-dual-motor", fuelType: "ELECTRIC", transmission: "SINGLE_SPEED", seating: 5, exShowroomPrice: 59900, engine: "Dual Motor Electric AWD", power: "421 bhp", mileage: "367 miles" },
      ],
    },
    {
      brandSlug: "lexus",
      name: "UX",
      slug: "ux",
      bodyType: "SUV",
      segment: "sub-compact",
      minPrice: 32950,
      maxPrice: 46950,
      variants: [
        { name: "UX 250h Takumi", slug: "ux-250h-takumi", fuelType: "HYBRID", transmission: "CVT", seating: 5, exShowroomPrice: 32950, engine: "2.0L Hybrid", power: "181 bhp", mileage: "53.3 mpg" },
        { name: "UX 300e Takumi", slug: "ux-300e-takumi", fuelType: "ELECTRIC", transmission: "SINGLE_SPEED", seating: 5, exShowroomPrice: 46950, engine: "Single Motor Electric", power: "201 bhp", mileage: "273 miles" },
      ],
    },
    {
      brandSlug: "lexus",
      name: "NX",
      slug: "nx",
      bodyType: "SUV",
      segment: "mid-size",
      minPrice: 39950,
      maxPrice: 58950,
      variants: [
        { name: "NX 350h Takumi", slug: "nx-350h-takumi", fuelType: "HYBRID", transmission: "CVT", seating: 5, exShowroomPrice: 39950, engine: "2.5L Hybrid", power: "239 bhp", mileage: "53.3 mpg" },
        { name: "NX 450h+ Takumi", slug: "nx-450h-plus-takumi", fuelType: "PLUGIN_HYBRID", transmission: "CVT", seating: 5, exShowroomPrice: 52950, engine: "2.5L Plug-in Hybrid", power: "302 bhp", mileage: "211.2 mpg" },
        { name: "NX 400h+ F Sport", slug: "nx-400h-plus-f-sport", fuelType: "PLUGIN_HYBRID", transmission: "CVT", seating: 5, exShowroomPrice: 58950, engine: "2.5L Plug-in Hybrid", power: "302 bhp", mileage: "211.2 mpg" },
      ],
    },
    {
      brandSlug: "suzuki",
      name: "Swift",
      slug: "swift",
      bodyType: "HATCHBACK",
      segment: "sub-compact",
      minPrice: 18999,
      maxPrice: 24999,
      variants: [
        { name: "SZ2 1.2 Dualjet", slug: "sz2-1-2-dualjet", fuelType: "PETROL", transmission: "MANUAL", seating: 5, exShowroomPrice: 18999, engine: "1.2L Dualjet", power: "89 bhp", mileage: "56.5 mpg" },
        { name: "SZ5 1.2 Dualjet Hybrid", slug: "sz5-1-2-dualjet-hybrid", fuelType: "HYBRID", transmission: "MANUAL", seating: 5, exShowroomPrice: 24999, engine: "1.2L Mild Hybrid", power: "89 bhp", mileage: "61.4 mpg" },
      ],
    },
    {
      brandSlug: "suzuki",
      name: "Vitara",
      slug: "vitara",
      bodyType: "SUV",
      segment: "compact",
      minPrice: 24999,
      maxPrice: 32999,
      variants: [
        { name: "SZ4 1.4 Boosterjet", slug: "sz4-1-4-boosterjet", fuelType: "PETROL", transmission: "MANUAL", seating: 5, exShowroomPrice: 24999, engine: "1.4L Turbo Petrol", power: "138 bhp", mileage: "47.9 mpg" },
        { name: "SZ5 1.4 Boosterjet AllGrip", slug: "sz5-1-4-boosterjet-allgrip", fuelType: "PETROL", transmission: "MANUAL", seating: 5, exShowroomPrice: 32999, engine: "1.4L Turbo Petrol AWD", power: "138 bhp", mileage: "44.8 mpg" },
      ],
    },
    {
      brandSlug: "nissan",
      name: "Leaf",
      slug: "leaf",
      bodyType: "HATCHBACK",
      segment: "compact",
      minPrice: 28995,
      maxPrice: 36995,
      variants: [
        { name: "Acenta 40kWh", slug: "acenta-40kwh", fuelType: "ELECTRIC", transmission: "SINGLE_SPEED", seating: 5, exShowroomPrice: 28995, engine: "Single Motor Electric", power: "148 bhp", mileage: "168 miles" },
        { name: "e+ Tekna 59kWh", slug: "e-plus-tekna-59kwh", fuelType: "ELECTRIC", transmission: "SINGLE_SPEED", seating: 5, exShowroomPrice: 36995, engine: "Single Motor Electric", power: "214 bhp", mileage: "239 miles" },
      ],
    },
    {
      brandSlug: "nissan",
      name: "Juke",
      slug: "juke",
      bodyType: "SUV",
      segment: "sub-compact",
      minPrice: 22995,
      maxPrice: 31995,
      variants: [
        { name: "Visia 1.0 DIG-T", slug: "visia-1-0-dig-t", fuelType: "PETROL", transmission: "MANUAL", seating: 5, exShowroomPrice: 22995, engine: "1.0L Turbo Petrol", power: "116 bhp", mileage: "47.9 mpg" },
        { name: "N-Connecta 1.0 DIG-T", slug: "n-connecta-1-0-dig-t", fuelType: "PETROL", transmission: "MANUAL", seating: 5, exShowroomPrice: 26995, engine: "1.0L Turbo Petrol", power: "116 bhp", mileage: "47.9 mpg" },
        { name: "Tekna 1.0 DIG-T", slug: "tekna-1-0-dig-t", fuelType: "PETROL", transmission: "AUTOMATIC", seating: 5, exShowroomPrice: 31995, engine: "1.0L Turbo Petrol", power: "116 bhp", mileage: "45.6 mpg" },
      ],
    },
    {
      brandSlug: "ford",
      name: "Focus",
      slug: "focus",
      bodyType: "HATCHBACK",
      segment: "compact",
      minPrice: 26500,
      maxPrice: 36500,
      variants: [
        { name: "Titanium 1.0 EcoBoost", slug: "titanium-1-0-ecoboost", fuelType: "PETROL", transmission: "MANUAL", seating: 5, exShowroomPrice: 26500, engine: "1.0L EcoBoost", power: "123 bhp", mileage: "52.3 mpg" },
        { name: "ST-Line 1.0 EcoBoost", slug: "st-line-1-0-ecoboost", fuelType: "PETROL", transmission: "AUTOMATIC", seating: 5, exShowroomPrice: 30500, engine: "1.0L EcoBoost", power: "153 bhp", mileage: "49.6 mpg" },
        { name: "ST 2.3 EcoBoost", slug: "st-2-3-ecoboost", fuelType: "PETROL", transmission: "MANUAL", seating: 5, exShowroomPrice: 36500, engine: "2.3L EcoBoost", power: "276 bhp", mileage: "34.9 mpg" },
      ],
    },
    {
      brandSlug: "vauxhall",
      name: "Astra",
      slug: "astra",
      bodyType: "HATCHBACK",
      segment: "compact",
      minPrice: 26500,
      maxPrice: 38500,
      variants: [
        { name: "Design 1.2 Turbo", slug: "design-1-2-turbo", fuelType: "PETROL", transmission: "MANUAL", seating: 5, exShowroomPrice: 26500, engine: "1.2L Turbo Petrol", power: "128 bhp", mileage: "49.6 mpg" },
        { name: "GS 1.2 Turbo", slug: "gs-1-2-turbo", fuelType: "PETROL", transmission: "AUTOMATIC", seating: 5, exShowroomPrice: 31000, engine: "1.2L Turbo Petrol", power: "128 bhp", mileage: "47.9 mpg" },
        { name: "Ultimate 1.6 PHEV", slug: "ultimate-1-6-phev", fuelType: "PLUGIN_HYBRID", transmission: "AUTOMATIC", seating: 5, exShowroomPrice: 38500, engine: "1.6L Plug-in Hybrid", power: "178 bhp", mileage: "235.4 mpg" },
      ],
    },
    {
      brandSlug: "vauxhall",
      name: "Mokka",
      slug: "mokka",
      bodyType: "SUV",
      segment: "sub-compact",
      minPrice: 26995,
      maxPrice: 38995,
      variants: [
        { name: "Design 1.2 Turbo", slug: "design-1-2-turbo", fuelType: "PETROL", transmission: "MANUAL", seating: 5, exShowroomPrice: 26995, engine: "1.2L Turbo Petrol", power: "128 bhp", mileage: "47.9 mpg" },
        { name: "GS 1.2 Turbo", slug: "gs-1-2-turbo", fuelType: "PETROL", transmission: "AUTOMATIC", seating: 5, exShowroomPrice: 31995, engine: "1.2L Turbo Petrol", power: "128 bhp", mileage: "46.3 mpg" },
        { name: "Electric GS", slug: "electric-gs", fuelType: "ELECTRIC", transmission: "SINGLE_SPEED", seating: 5, exShowroomPrice: 38995, engine: "Single Motor Electric", power: "134 bhp", mileage: "252 miles" },
      ],
    },
    {
      brandSlug: "volkswagen",
      name: "Polo",
      slug: "polo",
      bodyType: "HATCHBACK",
      segment: "sub-compact",
      minPrice: 21500,
      maxPrice: 28500,
      variants: [
        { name: "Life 1.0 TSI", slug: "life-1-0-tsi", fuelType: "PETROL", transmission: "MANUAL", seating: 5, exShowroomPrice: 21500, engine: "1.0L Turbo Petrol", power: "94 bhp", mileage: "52.3 mpg" },
        { name: "Style 1.0 TSI", slug: "style-1-0-tsi", fuelType: "PETROL", transmission: "MANUAL", seating: 5, exShowroomPrice: 25500, engine: "1.0L Turbo Petrol", power: "108 bhp", mileage: "51.4 mpg" },
        { name: "R-Line 1.0 TSI DSG", slug: "r-line-1-0-tsi-dsg", fuelType: "PETROL", transmission: "DCT", seating: 5, exShowroomPrice: 28500, engine: "1.0L Turbo Petrol", power: "108 bhp", mileage: "50.4 mpg" },
      ],
    },
    {
      brandSlug: "volkswagen",
      name: "ID.3",
      slug: "id3",
      bodyType: "HATCHBACK",
      segment: "compact",
      minPrice: 36990,
      maxPrice: 44990,
      variants: [
        { name: "Life Pro", slug: "life-pro", fuelType: "ELECTRIC", transmission: "SINGLE_SPEED", seating: 5, exShowroomPrice: 36990, engine: "Single Motor Electric", power: "168 bhp", mileage: "266 miles" },
        { name: "Style Pro", slug: "style-pro", fuelType: "ELECTRIC", transmission: "SINGLE_SPEED", seating: 5, exShowroomPrice: 40990, engine: "Single Motor Electric", power: "201 bhp", mileage: "266 miles" },
        { name: "GTX Performance", slug: "gtx-performance", fuelType: "ELECTRIC", transmission: "SINGLE_SPEED", seating: 5, exShowroomPrice: 44990, engine: "Dual Motor Electric AWD", power: "322 bhp", mileage: "330 miles" },
      ],
    },
    {
      brandSlug: "audi",
      name: "A1",
      slug: "a1",
      bodyType: "HATCHBACK",
      segment: "sub-compact",
      minPrice: 24500,
      maxPrice: 32000,
      variants: [
        { name: "Sport 25 TFSI", slug: "sport-25-tfsi", fuelType: "PETROL", transmission: "MANUAL", seating: 5, exShowroomPrice: 24500, engine: "1.0L Turbo Petrol", power: "94 bhp", mileage: "52.3 mpg" },
        { name: "S Line 30 TFSI", slug: "s-line-30-tfsi", fuelType: "PETROL", transmission: "MANUAL", seating: 5, exShowroomPrice: 28500, engine: "1.0L Turbo Petrol", power: "108 bhp", mileage: "51.4 mpg" },
        { name: "Black Edition 35 TFSI S tronic", slug: "black-edition-35-tfsi-s-tronic", fuelType: "PETROL", transmission: "DCT", seating: 5, exShowroomPrice: 32000, engine: "1.5L Turbo Petrol", power: "148 bhp", mileage: "47.9 mpg" },
      ],
    },
    {
      brandSlug: "mercedes-benz",
      name: "C-Class",
      slug: "c-class",
      bodyType: "SEDAN",
      segment: "mid-size",
      minPrice: 42950,
      maxPrice: 59950,
      variants: [
        { name: "C 200 Sport", slug: "c-200-sport", fuelType: "PETROL", transmission: "AUTOMATIC", seating: 5, exShowroomPrice: 42950, engine: "1.5L Turbo Petrol", power: "201 bhp", mileage: "44.8 mpg" },
        { name: "C 300 e AMG Line", slug: "c-300e-amg-line", fuelType: "PLUGIN_HYBRID", transmission: "AUTOMATIC", seating: 5, exShowroomPrice: 52950, engine: "2.0L Plug-in Hybrid", power: "308 bhp", mileage: "470.8 mpg" },
        { name: "C 300 de AMG Line", slug: "c-300de-amg-line", fuelType: "PLUGIN_HYBRID", transmission: "AUTOMATIC", seating: 5, exShowroomPrice: 59950, engine: "2.0L Diesel Plug-in Hybrid", power: "302 bhp", mileage: "403.5 mpg" },
      ],
    },
    {
      brandSlug: "land-rover",
      name: "Defender",
      slug: "defender",
      bodyType: "SUV",
      segment: "mid-size",
      minPrice: 54995,
      maxPrice: 95000,
      variants: [
        { name: "90 D250 S", slug: "90-d250-s", fuelType: "DIESEL", transmission: "AUTOMATIC", seating: 5, exShowroomPrice: 54995, engine: "2.0L Turbo Diesel", power: "246 bhp", mileage: "32.5 mpg" },
        { name: "110 P400 SE", slug: "110-p400-se", fuelType: "PETROL", transmission: "AUTOMATIC", seating: 7, exShowroomPrice: 72000, engine: "3.0L Turbo Petrol", power: "395 bhp", mileage: "26.4 mpg" },
        { name: "110 P510 V8", slug: "110-p510-v8", fuelType: "PETROL", transmission: "AUTOMATIC", seating: 7, exShowroomPrice: 95000, engine: "5.0L V8 Supercharged", power: "518 bhp", mileage: "21.2 mpg" },
      ],
    },
    {
      brandSlug: "skoda",
      name: "Kamiq",
      slug: "kamiq",
      bodyType: "SUV",
      segment: "sub-compact",
      minPrice: 22995,
      maxPrice: 29995,
      variants: [
        { name: "SE 1.0 TSI", slug: "se-1-0-tsi", fuelType: "PETROL", transmission: "MANUAL", seating: 5, exShowroomPrice: 22995, engine: "1.0L Turbo Petrol", power: "108 bhp", mileage: "51.4 mpg" },
        { name: "SE L 1.5 TSI", slug: "se-l-1-5-tsi", fuelType: "PETROL", transmission: "MANUAL", seating: 5, exShowroomPrice: 26995, engine: "1.5L Turbo Petrol", power: "148 bhp", mileage: "49.6 mpg" },
        { name: "Monte Carlo 1.5 TSI DSG", slug: "monte-carlo-1-5-tsi-dsg", fuelType: "PETROL", transmission: "DCT", seating: 5, exShowroomPrice: 29995, engine: "1.5L Turbo Petrol", power: "148 bhp", mileage: "47.9 mpg" },
      ],
    },
    {
      brandSlug: "ds",
      name: "DS 3",
      slug: "ds-3",
      bodyType: "HATCHBACK",
      segment: "sub-compact",
      minPrice: 27995,
      maxPrice: 38995,
      variants: [
        { name: "Bastille 1.2 PureTech", slug: "bastille-1-2-puretech", fuelType: "PETROL", transmission: "MANUAL", seating: 5, exShowroomPrice: 27995, engine: "1.2L Turbo Petrol", power: "128 bhp", mileage: "49.6 mpg" },
        { name: "Performance Line 1.2 PureTech", slug: "performance-line-1-2-puretech", fuelType: "PETROL", transmission: "AUTOMATIC", seating: 5, exShowroomPrice: 32995, engine: "1.2L Turbo Petrol", power: "128 bhp", mileage: "47.9 mpg" },
        { name: "E-Tense 54kWh", slug: "e-tense-54kwh", fuelType: "ELECTRIC", transmission: "SINGLE_SPEED", seating: 5, exShowroomPrice: 38995, engine: "Single Motor Electric", power: "154 bhp", mileage: "250 miles" },
      ],
    },
  ];

  for (const m of models) {
    const b = await brand(m.brandSlug);
    const model = await prisma.carModel.upsert({
      where: { brandId_slug: { brandId: b.id, slug: m.slug } },
      update: {
        minPrice: m.minPrice,
        maxPrice: m.maxPrice,
        imageUrl: getImageForBodyType(m.bodyType),
      },
      create: {
        brandId: b.id,
        name: m.name,
        slug: m.slug,
        bodyType: m.bodyType as never,
        segment: m.segment,
        minPrice: m.minPrice,
        maxPrice: m.maxPrice,
        imageUrl: getImageForBodyType(m.bodyType),
      },
    });

    for (const v of m.variants) {
      await prisma.carVariant.upsert({
        where: { modelId_slug: { modelId: model.id, slug: v.slug } },
        update: { exShowroomPrice: v.exShowroomPrice },
        create: {
          modelId: model.id,
          name: v.name,
          slug: v.slug,
          fuelType: v.fuelType as never,
          transmission: v.transmission as never,
          seating: v.seating,
          exShowroomPrice: v.exShowroomPrice,
          engine: v.engine,
          power: v.power,
          mileage: v.mileage,
        },
      });
    }
  }

  // --- Test users ---
  const passwordHash = await hash("password123", 10);
  await prisma.user.upsert({
    where: { email: "admin@example.com" },
    update: {},
    create: {
      email: "admin@example.com",
      name: "Admin User",
      password: passwordHash,
      role: "ADMIN",
    },
  });
  await prisma.user.upsert({
    where: { email: "buyer@example.com" },
    update: {},
    create: {
      email: "buyer@example.com",
      name: "Buyer User",
      password: passwordHash,
      role: "BUYER",
    },
  });

  // --- Dealer user & dealer records ---
  const dealerUser = await prisma.user.upsert({
    where: { email: "dealer@example.com" },
    update: {},
    create: {
      email: "dealer@example.com",
      name: "London Motors",
      password: passwordHash,
      role: "DEALER",
    },
  });

  const dealerUser2 = await prisma.user.upsert({
    where: { email: "dealer2@example.com" },
    update: {},
    create: {
      email: "dealer2@example.com",
      name: "Manchester Cars",
      password: passwordHash,
      role: "DEALER",
    },
  });

  const dealer1 = await prisma.dealer.upsert({
    where: { slug: "london-motors" },
    update: {},
    create: {
      userId: dealerUser.id,
      name: "London Motors",
      slug: "london-motors",
      city: "London",
      address: "123 Park Lane, Mayfair",
      state: "Greater London",
      pincode: "W1K 1AA",
      phone: "020 7946 0958",
      email: "info@londonmotors.co.uk",
      status: "ACTIVE",
      description: "Premium multi-brand dealership in the heart of London. Authorised dealer for BMW, Mercedes-Benz, and Audi with over 20 years of experience.",
    },
  });

  const dealer2 = await prisma.dealer.upsert({
    where: { slug: "manchester-cars" },
    update: {},
    create: {
      userId: dealerUser2.id,
      name: "Manchester Cars",
      slug: "manchester-cars",
      city: "Manchester",
      address: "456 Deansgate",
      state: "Greater Manchester",
      pincode: "M3 4LY",
      phone: "0161 234 5678",
      email: "info@manchestercars.co.uk",
      status: "ACTIVE",
      description: "Your trusted car dealer in Manchester. Specialists in Volkswagen, Škoda, and SEAT. Comprehensive test drive facility.",
    },
  });

  // Dealer brands
  const bmwBrand = await brand("bmw");
  const mbBrand = await brand("mercedes-benz");
  const audiBrand = await brand("audi");
  const vwBrand = await brand("volkswagen");
  const skodaBrand = await brand("skoda");
  const seatBrand = await brand("seat");

  for (const brandRecord of [bmwBrand, mbBrand, audiBrand]) {
    await prisma.dealerBrand.upsert({
      where: { dealerId_brandId: { dealerId: dealer1.id, brandId: brandRecord.id } },
      update: {},
      create: { dealerId: dealer1.id, brandId: brandRecord.id },
    });
  }

  for (const brandRecord of [vwBrand, skodaBrand, seatBrand]) {
    await prisma.dealerBrand.upsert({
      where: { dealerId_brandId: { dealerId: dealer2.id, brandId: brandRecord.id } },
      update: {},
      create: { dealerId: dealer2.id, brandId: brandRecord.id },
    });
  }

  // Inventory items for dealer1
  const bmw3 = await prisma.carModel.findFirst({ where: { slug: "3-series" }, include: { variants: true } });
  if (bmw3) {
    for (const v of bmw3.variants) {
      await prisma.dealerInventoryItem.upsert({
        where: { dealerId_variantId: { dealerId: dealer1.id, variantId: v.id } },
        update: {},
        create: {
          dealerId: dealer1.id,
          variantId: v.id,
          onRoadPrice: v.exShowroomPrice ? Number(v.exShowroomPrice) * 1.08 : null,
          stockStatus: "IN_STOCK",
          visibility: "VISIBLE",
        },
      });
    }
  }

  const vwGolf = await prisma.carModel.findFirst({ where: { slug: "golf" }, include: { variants: true } });
  if (vwGolf) {
    for (const v of vwGolf.variants) {
      await prisma.dealerInventoryItem.upsert({
        where: { dealerId_variantId: { dealerId: dealer2.id, variantId: v.id } },
        update: {},
        create: {
          dealerId: dealer2.id,
          variantId: v.id,
          onRoadPrice: v.exShowroomPrice ? Number(v.exShowroomPrice) * 1.08 : null,
          stockStatus: "IN_STOCK",
          visibility: "VISIBLE",
        },
      });
    }
  }

  // --- Upcoming cars ---
  const teslaBrand = await brand("tesla");
  const toyotaBrand = await brand("toyota");
  const hyundaiBrand = await brand("hyundai");

  const upcomingCarsData = [
    {
      brandId: teslaBrand.id,
      name: "Tesla Model 2",
      expectedLaunch: "Q3 2026",
      estimatedPrice: "£25,000 – £32,000",
      imageUrl: "https://images.unsplash.com/photo-1593941707882-a5bba14938c7?w=800&q=80",
      keyHighlights: JSON.stringify([
        "Compact hatchback form factor",
        "Estimated 250+ mile range",
        "New LFP battery technology",
        "Full self-driving hardware included",
      ]),
    },
    {
      brandId: toyotaBrand.id,
      name: "Toyota bZ3X",
      expectedLaunch: "Q1 2027",
      estimatedPrice: "£35,000 – £45,000",
      imageUrl: "https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?w=800&q=80",
      keyHighlights: JSON.stringify([
        "All-electric SUV on e-TNGA platform",
        "Dual-motor AWD option",
        "300+ mile range expected",
        "Advanced Toyota Safety Sense 4.0",
      ]),
    },
    {
      brandId: hyundaiBrand.id,
      name: "Hyundai IONIQ 7",
      expectedLaunch: "Q2 2026",
      estimatedPrice: "£55,000 – £70,000",
      imageUrl: "https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?w=800&q=80",
      keyHighlights: JSON.stringify([
        "Full-size electric SUV",
        "Three-row seating for 7",
        "800V ultra-fast charging",
        "Level 3 autonomous capability",
      ]),
    },
    {
      brandId: bmwBrand.id,
      name: "BMW Neue Klasse Saloon",
      expectedLaunch: "Q4 2026",
      estimatedPrice: "£45,000 – £65,000",
      imageUrl: "https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?w=800&q=80",
      keyHighlights: JSON.stringify([
        "All-new electric architecture",
        "Next-gen iDrive with panoramic display",
        "Solid-state battery option",
        "0-60 mph in under 4 seconds",
      ]),
    },
  ];

  for (const uc of upcomingCarsData) {
    const existing = await prisma.upcomingCar.findFirst({ where: { name: uc.name } });
    if (!existing) {
      await prisma.upcomingCar.create({ data: uc });
    } else if (!existing.imageUrl && "imageUrl" in uc) {
      await prisma.upcomingCar.update({
        where: { id: existing.id },
        data: { imageUrl: (uc as { imageUrl: string }).imageUrl },
      });
    }
  }

  // --- Content articles ---
  const adminUser = await prisma.user.findUnique({ where: { email: "admin@example.com" } });

  const articlesData = [
    {
      type: "NEWS" as const,
      title: "Tesla Confirms UK Launch Date for Compact Model 2",
      slug: "tesla-model-2-uk-launch-date",
      body: "Tesla has officially confirmed that the much-anticipated Model 2 compact hatchback will go on sale in the UK in Q3 2026. The entry-level electric vehicle is expected to start at around £25,000, making it one of the most affordable Tesla vehicles ever produced.\n\nThe Model 2 will feature a new LFP battery pack designed for maximum efficiency, offering an estimated range of over 250 miles on a single charge. Tesla CEO Elon Musk stated that the vehicle would include Full Self-Driving hardware as standard, a first for a sub-£30,000 Tesla.\n\nPre-orders are expected to open in early 2026, with first deliveries beginning in the summer. The Model 2 will be manufactured at Tesla's Berlin Gigafactory, specifically targeting European markets.",
      tags: "Tesla,Electric,Compact,Launch",
      publishedAt: new Date("2025-12-15"),
    },
    {
      type: "EXPERT_REVIEW" as const,
      title: "2025 BMW 3 Series Review: The Benchmark Saloon Gets Better",
      slug: "2025-bmw-3-series-review",
      body: "The BMW 3 Series has long been the benchmark for sports saloons, and the 2025 model year continues that tradition with refinements across the range.\n\nStarting from £39,300 for the 320i SE, the 3 Series offers a compelling blend of driving dynamics, technology, and everyday usability. The 320d M Sport remains our pick of the range, delivering an excellent balance of performance and efficiency with 55.4 mpg combined.\n\nFor those seeking electrification, the 330e M Sport plug-in hybrid provides 288 bhp and a real-world electric range of around 35 miles – ideal for urban commutes.\n\nThe interior benefits from BMW's latest iDrive 8 system with a curved display, and the driving dynamics remain class-leading with precise steering and a compliant yet engaging chassis setup.",
      tags: "BMW,3 Series,Saloon,Expert Review",
      publishedAt: new Date("2025-11-20"),
    },
    {
      type: "COMPARISON" as const,
      title: "Electric SUV Shootout: Tesla Model Y vs Volvo XC40 vs BMW iX1",
      slug: "electric-suv-comparison-2025",
      body: "The electric SUV segment is one of the most competitive in the UK market right now. We put three of the best head to head to find out which offers the best overall package.\n\nThe Tesla Model Y remains the benchmark for range and technology, with up to 331 miles from the Long Range AWD variant. Its Supercharger network advantage is undeniable.\n\nThe Volvo XC40 Recharge brings Scandinavian design and premium interior quality, with 402 bhp making it the most powerful of the three. Safety credentials are also class-leading.\n\nThe BMW iX1 xDrive30 offers the most engaging driving experience, with typical BMW dynamics and a well-balanced chassis. At 272 miles of range, it trails the Tesla but is more than adequate for most buyers.\n\nOur verdict: The Tesla Model Y wins on value and range, the Volvo on luxury, and the BMW on driving enjoyment. Your choice depends on your priorities.",
      tags: "Electric,SUV,Comparison,Tesla,Volvo,BMW",
      publishedAt: new Date("2026-01-10"),
    },
    {
      type: "FEATURE" as const,
      title: "The Complete Guide to Plug-in Hybrids in 2026",
      slug: "plug-in-hybrid-guide-2026",
      body: "Plug-in hybrids continue to be a popular choice for UK buyers transitioning to electric. Here's everything you need to know about PHEVs in 2026.\n\nPHEVs combine a petrol engine with an electric motor and battery, offering the flexibility of short electric-only commutes with the security of a petrol engine for longer journeys. Most modern PHEVs offer 30-50 miles of electric range.\n\nKey benefits include reduced company car tax (BIK rates from 2%), zero-emission zone eligibility in many cities, and significantly lower fuel costs compared to pure petrol alternatives.\n\nPopular choices include the BMW 330e, Mercedes A 250e, Hyundai Tucson PHEV, and the Range Rover Evoque P300e. All offer genuine real-world electric range and refined performance.",
      tags: "PHEV,Hybrid,Guide,Electric",
      publishedAt: new Date("2026-02-01"),
    },
  ];

  for (const article of articlesData) {
    await prisma.contentArticle.upsert({
      where: { slug: article.slug },
      update: {},
      create: {
        ...article,
        authorId: adminUser?.id ?? null,
      },
    });
  }

  // --- Reviews ---
  const buyerUser = await prisma.user.findUnique({ where: { email: "buyer@example.com" } });

  if (bmw3 && buyerUser && adminUser) {
    for (const v of bmw3.variants.slice(0, 2)) {
      const existingReview = await prisma.review.findFirst({
        where: { authorId: buyerUser.id, carVariantId: v.id },
      });
      if (!existingReview) {
        await prisma.review.create({
          data: {
            type: "USER",
            rating: 4,
            title: `Great ${v.name} variant`,
            content: `I've been driving the ${v.name} for three months now and it's been excellent. The performance is superb and the interior quality is top-notch. Fuel economy is better than expected.`,
            carVariantId: v.id,
            authorId: buyerUser.id,
          },
        });
      }

      const existingExpert = await prisma.review.findFirst({
        where: { authorId: adminUser.id, carVariantId: v.id, type: "EXPERT" },
      });
      if (!existingExpert) {
        await prisma.review.create({
          data: {
            type: "EXPERT",
            rating: 5,
            title: `${v.name}: A class leader`,
            content: `The BMW ${v.name} sets the standard in its segment. Exceptional driving dynamics, refined powertrain, and a premium interior make this a compelling choice. Our pick of the range.`,
            carVariantId: v.id,
            authorId: adminUser.id,
          },
        });
      }
    }
  }

  console.log(
    "Seed complete: 30 brands, 55+ models (150+ variants), 2 dealers, 4 upcoming cars, 4 articles, reviews, and test users.",
  );
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });

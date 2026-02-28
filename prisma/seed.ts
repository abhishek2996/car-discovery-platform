import { PrismaClient } from "../src/generated/prisma";
import { PrismaNeon } from "@prisma/adapter-neon";
import { hash } from "bcryptjs";
import "dotenv/config";

const adapter = new PrismaNeon({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

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
  ];

  for (const m of models) {
    const b = await brand(m.brandSlug);
    const model = await prisma.carModel.upsert({
      where: { brandId_slug: { brandId: b.id, slug: m.slug } },
      update: { minPrice: m.minPrice, maxPrice: m.maxPrice },
      create: {
        brandId: b.id,
        name: m.name,
        slug: m.slug,
        bodyType: m.bodyType as never,
        segment: m.segment,
        minPrice: m.minPrice,
        maxPrice: m.maxPrice,
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
    "Seed complete: 20 brands, 20 models (60 variants), 2 dealers, 4 upcoming cars, 4 articles, reviews, and test users.",
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

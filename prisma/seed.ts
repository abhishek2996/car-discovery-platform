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

  console.log(
    "Seed complete: 20 brands, 20 models (60 variants), and test users (admin@example.com, buyer@example.com / password123).",
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

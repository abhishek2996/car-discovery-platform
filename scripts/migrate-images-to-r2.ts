/**
 * One-time migration: copy images from Uploadthing URLs to Cloudflare R2 and update DB.
 * Idempotent: skips records that already use the R2 public URL.
 *
 * Usage: npx tsx scripts/migrate-images-to-r2.ts
 * Requires: .env with DATABASE_URL and all CLOUDFLARE_R2_* variables.
 */

import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma";
import { PrismaNeon } from "@prisma/adapter-neon";
import { uploadToR2 } from "../src/lib/r2";

const R2_PUBLIC_URL = process.env.CLOUDFLARE_R2_PUBLIC_URL?.replace(/\/$/, "");

function isUploadthingUrl(url: string | null | undefined): boolean {
  if (!url || typeof url !== "string") return false;
  return (
    url.includes("uploadthing.com") ||
    url.includes("utfs.io") ||
    url.startsWith("https://utfs.io/")
  );
}

function isAlreadyR2(url: string | null | undefined): boolean {
  if (!url || !R2_PUBLIC_URL) return false;
  return url.startsWith(R2_PUBLIC_URL + "/") || url.startsWith(R2_PUBLIC_URL);
}

async function downloadImage(url: string): Promise<Buffer> {
  const res = await fetch(url, { redirect: "follow" });
  if (!res.ok) throw new Error(`HTTP ${res.status}: ${url}`);
  const arrayBuffer = await res.arrayBuffer();
  return Buffer.from(arrayBuffer);
}

function getExtensionFromUrl(url: string): string {
  try {
    const pathname = new URL(url).pathname;
    const ext = pathname.split(".").pop()?.toLowerCase();
    if (ext && ["jpg", "jpeg", "png", "webp", "gif"].includes(ext))
      return ext === "jpeg" ? "jpg" : ext;
  } catch {
    // ignore
  }
  return "jpg";
}

function uniqueFilename(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
}

async function migrateUrl(
  url: string,
  folder: string
): Promise<{ url: string; key: string }> {
  const buffer = await downloadImage(url);
  const ext = getExtensionFromUrl(url);
  const filename = `${uniqueFilename()}.${ext}`;
  return uploadToR2(buffer, folder, filename);
}

async function main() {
  if (!process.env.DATABASE_URL) {
    console.error("DATABASE_URL is required.");
    process.exit(1);
  }
  if (!R2_PUBLIC_URL) {
    console.error("CLOUDFLARE_R2_PUBLIC_URL is required.");
    process.exit(1);
  }

  const adapter = new PrismaNeon({
    connectionString: process.env.DATABASE_URL,
  });
  const prisma = new PrismaClient({ adapter });

  let totalProcessed = 0;
  let totalUpdated = 0;
  let totalSkipped = 0;
  let totalFailed = 0;

  // --- User.image ---
  const users = await prisma.user.findMany({
    where: { image: { not: null } },
    select: { id: true, image: true },
  });
  for (const u of users) {
    if (!u.image) continue;
    totalProcessed++;
    if (isAlreadyR2(u.image)) {
      totalSkipped++;
      continue;
    }
    if (!isUploadthingUrl(u.image)) {
      totalSkipped++;
      continue;
    }
    try {
      const { url } = await migrateUrl(u.image, "users");
      await prisma.user.update({
        where: { id: u.id },
        data: { image: url },
      });
      totalUpdated++;
      console.log("[OK] User.image", u.id, "->", url);
    } catch (err) {
      totalFailed++;
      console.error("[FAIL] User.image", u.id, u.image, err);
    }
  }

  // --- Dealer.logoUrl, bannerUrl ---
  const dealers = await prisma.dealer.findMany({
    select: { id: true, logoUrl: true, bannerUrl: true },
  });
  for (const d of dealers) {
    const updates: { logoUrl?: string; bannerUrl?: string } = {};
    for (const [field, value] of [
      ["logoUrl", d.logoUrl],
      ["bannerUrl", d.bannerUrl],
    ] as const) {
      if (!value || !isUploadthingUrl(value)) continue;
      if (isAlreadyR2(value)) continue;
      totalProcessed++;
      try {
        const { url } = await migrateUrl(value, "dealers");
        updates[field] = url;
        totalUpdated++;
        console.log("[OK] Dealer." + field, d.id, "->", url);
      } catch (err) {
        totalFailed++;
        console.error("[FAIL] Dealer." + field, d.id, value, err);
      }
    }
    if (Object.keys(updates).length > 0) {
      await prisma.dealer.update({
        where: { id: d.id },
        data: updates,
      });
    }
  }

  // --- CarBrand.logoUrl ---
  const brands = await prisma.carBrand.findMany({
    where: { logoUrl: { not: null } },
    select: { id: true, logoUrl: true },
  });
  for (const b of brands) {
    if (!b.logoUrl) continue;
    totalProcessed++;
    if (isAlreadyR2(b.logoUrl)) {
      totalSkipped++;
      continue;
    }
    if (!isUploadthingUrl(b.logoUrl)) {
      totalSkipped++;
      continue;
    }
    try {
      const { url } = await migrateUrl(b.logoUrl, "brands");
      await prisma.carBrand.update({
        where: { id: b.id },
        data: { logoUrl: url },
      });
      totalUpdated++;
      console.log("[OK] CarBrand.logoUrl", b.id, "->", url);
    } catch (err) {
      totalFailed++;
      console.error("[FAIL] CarBrand.logoUrl", b.id, b.logoUrl, err);
    }
  }

  // --- CarModel.imageUrl ---
  const models = await prisma.carModel.findMany({
    where: { imageUrl: { not: null } },
    select: { id: true, imageUrl: true },
  });
  for (const m of models) {
    if (!m.imageUrl) continue;
    totalProcessed++;
    if (isAlreadyR2(m.imageUrl)) {
      totalSkipped++;
      continue;
    }
    if (!isUploadthingUrl(m.imageUrl)) {
      totalSkipped++;
      continue;
    }
    try {
      const { url } = await migrateUrl(m.imageUrl, "models");
      await prisma.carModel.update({
        where: { id: m.id },
        data: { imageUrl: url },
      });
      totalUpdated++;
      console.log("[OK] CarModel.imageUrl", m.id, "->", url);
    } catch (err) {
      totalFailed++;
      console.error("[FAIL] CarModel.imageUrl", m.id, m.imageUrl, err);
    }
  }

  // --- CarVariant.imageUrl ---
  const variants = await prisma.carVariant.findMany({
    where: { imageUrl: { not: null } },
    select: { id: true, imageUrl: true },
  });
  for (const v of variants) {
    if (!v.imageUrl) continue;
    totalProcessed++;
    if (isAlreadyR2(v.imageUrl)) {
      totalSkipped++;
      continue;
    }
    if (!isUploadthingUrl(v.imageUrl)) {
      totalSkipped++;
      continue;
    }
    try {
      const { url } = await migrateUrl(v.imageUrl, "variants");
      await prisma.carVariant.update({
        where: { id: v.id },
        data: { imageUrl: url },
      });
      totalUpdated++;
      console.log("[OK] CarVariant.imageUrl", v.id, "->", url);
    } catch (err) {
      totalFailed++;
      console.error("[FAIL] CarVariant.imageUrl", v.id, v.imageUrl, err);
    }
  }

  // --- DealerInventoryItem.imageUrls (JSON array) ---
  const items = await prisma.dealerInventoryItem.findMany({
    where: { imageUrls: { not: null } },
    select: { id: true, imageUrls: true },
  });
  for (const item of items) {
    if (!item.imageUrls) continue;
    let list: string[];
    try {
      const arr = JSON.parse(item.imageUrls) as unknown;
      list = Array.isArray(arr)
        ? (arr.filter((u): u is string => typeof u === "string") as string[])
        : [];
    } catch {
      continue;
    }
    const toMigrate = list.filter(
      (u) => u && isUploadthingUrl(u) && !isAlreadyR2(u)
    );
    if (toMigrate.length === 0) continue;
    totalProcessed++;
    try {
      const newUrlByOld = new Map<string, string>();
      for (const oldUrl of toMigrate) {
        const { url } = await migrateUrl(oldUrl, "inventory");
        newUrlByOld.set(oldUrl, url);
      }
      const merged = list.map((u) => (newUrlByOld.has(u) ? newUrlByOld.get(u)! : u));
      await prisma.dealerInventoryItem.update({
        where: { id: item.id },
        data: { imageUrls: JSON.stringify(merged) },
      });
      totalUpdated++;
      console.log("[OK] DealerInventoryItem.imageUrls", item.id);
    } catch (err) {
      totalFailed++;
      console.error("[FAIL] DealerInventoryItem", item.id, err);
    }
  }

  // --- UpcomingCar.imageUrl ---
  const upcoming = await prisma.upcomingCar.findMany({
    where: { imageUrl: { not: null } },
    select: { id: true, imageUrl: true },
  });
  for (const u of upcoming) {
    if (!u.imageUrl) continue;
    totalProcessed++;
    if (isAlreadyR2(u.imageUrl)) {
      totalSkipped++;
      continue;
    }
    if (!isUploadthingUrl(u.imageUrl)) {
      totalSkipped++;
      continue;
    }
    try {
      const { url } = await migrateUrl(u.imageUrl, "upcoming");
      await prisma.upcomingCar.update({
        where: { id: u.id },
        data: { imageUrl: url },
      });
      totalUpdated++;
      console.log("[OK] UpcomingCar.imageUrl", u.id, "->", url);
    } catch (err) {
      totalFailed++;
      console.error("[FAIL] UpcomingCar.imageUrl", u.id, u.imageUrl, err);
    }
  }

  // --- ContentArticle.heroMediaUrl ---
  const articles = await prisma.contentArticle.findMany({
    where: { heroMediaUrl: { not: null } },
    select: { id: true, heroMediaUrl: true },
  });
  for (const a of articles) {
    if (!a.heroMediaUrl) continue;
    totalProcessed++;
    if (isAlreadyR2(a.heroMediaUrl)) {
      totalSkipped++;
      continue;
    }
    if (!isUploadthingUrl(a.heroMediaUrl)) {
      totalSkipped++;
      continue;
    }
    try {
      const { url } = await migrateUrl(a.heroMediaUrl, "articles");
      await prisma.contentArticle.update({
        where: { id: a.id },
        data: { heroMediaUrl: url },
      });
      totalUpdated++;
      console.log("[OK] ContentArticle.heroMediaUrl", a.id, "->", url);
    } catch (err) {
      totalFailed++;
      console.error("[FAIL] ContentArticle.heroMediaUrl", a.id, a.heroMediaUrl, err);
    }
  }

  // --- HeroSlide.imageUrl ---
  const slides = await prisma.heroSlide.findMany({
    where: { imageUrl: { not: null } },
    select: { id: true, imageUrl: true },
  });
  for (const s of slides) {
    if (!s.imageUrl) continue;
    totalProcessed++;
    if (isAlreadyR2(s.imageUrl)) {
      totalSkipped++;
      continue;
    }
    if (!isUploadthingUrl(s.imageUrl)) {
      totalSkipped++;
      continue;
    }
    try {
      const { url } = await migrateUrl(s.imageUrl, "hero");
      await prisma.heroSlide.update({
        where: { id: s.id },
        data: { imageUrl: url },
      });
      totalUpdated++;
      console.log("[OK] HeroSlide.imageUrl", s.id, "->", url);
    } catch (err) {
      totalFailed++;
      console.error("[FAIL] HeroSlide.imageUrl", s.id, s.imageUrl, err);
    }
  }

  console.log("\n--- Summary ---");
  console.log("Processed:", totalProcessed);
  console.log("Updated:", totalUpdated);
  console.log("Skipped (already R2 or not Uploadthing):", totalSkipped);
  console.log("Failed:", totalFailed);
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });

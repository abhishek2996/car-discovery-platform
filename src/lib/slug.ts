/**
 * Converts a string to a URL-safe slug: lowercase, hyphens for spaces/special chars.
 * Example: "Mercedes-Benz" -> "mercedes-benz", "A4" -> "a4"
 */
export function slugify(text: string): string {
  return text
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 100) || "slug";
}

/**
 * Returns a slug that is unique among existing brand slugs.
 * If the base slug is taken, appends -2, -3, etc.
 */
export async function ensureUniqueBrandSlug(
  baseSlug: string,
  excludeBrandId?: string
): Promise<string> {
  const { prisma } = await import("@/lib/db");
  let slug = baseSlug;
  let n = 1;
  for (;;) {
    const existing = await prisma.carBrand.findFirst({
      where: {
        slug,
        ...(excludeBrandId ? { id: { not: excludeBrandId } } : {}),
      },
    });
    if (!existing) return slug;
    n += 1;
    slug = `${baseSlug}-${n}`;
  }
}

/**
 * Returns a slug that is unique for the given brand (among its models).
 * If the base slug is taken, appends -2, -3, etc.
 */
export async function ensureUniqueModelSlug(
  brandId: string,
  baseSlug: string,
  excludeModelId?: string
): Promise<string> {
  const { prisma } = await import("@/lib/db");
  let slug = baseSlug;
  let n = 1;
  for (;;) {
    const existing = await prisma.carModel.findFirst({
      where: {
        brandId,
        slug,
        ...(excludeModelId ? { id: { not: excludeModelId } } : {}),
      },
    });
    if (!existing) return slug;
    n += 1;
    slug = `${baseSlug}-${n}`;
  }
}

/**
 * Returns a slug that is unique for the given model (among its variants).
 * If the base slug is taken, appends -2, -3, etc.
 */
export async function ensureUniqueVariantSlug(
  modelId: string,
  baseSlug: string,
  excludeVariantId?: string
): Promise<string> {
  const { prisma } = await import("@/lib/db");
  let slug = baseSlug;
  let n = 1;
  for (;;) {
    const existing = await prisma.carVariant.findFirst({
      where: {
        modelId,
        slug,
        ...(excludeVariantId ? { id: { not: excludeVariantId } } : {}),
      },
    });
    if (!existing) return slug;
    n += 1;
    slug = `${baseSlug}-${n}`;
  }
}

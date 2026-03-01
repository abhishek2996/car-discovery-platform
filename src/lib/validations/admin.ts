import { z } from "zod";

const optionalSelect = z
  .string()
  .optional()
  .transform((v) => (v === "__none__" ? "" : v))
  .pipe(z.string().optional().or(z.literal("")));

/** Optional number from form: empty string -> undefined so we don't coerce "" to 0 (which fails seating.positive()) */
function optionalNumber<T extends z.ZodNumber>(schema: T) {
  return z
    .union([z.string(), z.literal("")])
    .optional()
    .transform((v) => (v === "" || v === undefined ? undefined : Number(v)))
    .pipe(schema.optional());
}

export const carBrandSchema = z.object({
  name: z.string().min(1, "Brand name is required").max(100),
  slug: z.string().min(1, "Slug is required").max(100).regex(/^[a-z0-9-]+$/, "Slug must be lowercase with hyphens only"),
  country: z.string().max(100).optional().or(z.literal("")),
  logoUrl: z.string().url("Must be a valid URL").optional().or(z.literal("")),
});
export type CarBrandFormValues = z.infer<typeof carBrandSchema>;

export const carModelSchema = z.object({
  brandId: z.string().min(1, "Brand is required"),
  name: z.string().min(1, "Model name is required").max(100),
  slug: z.string().min(1, "Slug is required").max(100).regex(/^[a-z0-9-]+$/, "Slug must be lowercase with hyphens only"),
  bodyType: optionalSelect,
  segment: z.string().max(50).optional().or(z.literal("")),
  minPrice: z.coerce.number().nonnegative().optional(),
  maxPrice: z.coerce.number().nonnegative().optional(),
  imageUrl: z.string().url().optional().or(z.literal("")),
  imageUrls: z.string().optional().or(z.literal("")), // JSON array of URLs
});
export type CarModelFormValues = z.infer<typeof carModelSchema>;

export const carVariantSchema = z.object({
  modelId: z.string().min(1, "Model is required"),
  name: z.string().min(1, "Variant name is required").max(100),
  slug: z.string().min(1, "Slug is required").max(100).regex(/^[a-z0-9-]+$/, "Slug must be lowercase with hyphens only"),
  fuelType: optionalSelect,
  transmission: optionalSelect,
  engine: z.string().max(200).optional().or(z.literal("")),
  power: z.string().max(50).optional().or(z.literal("")),
  torque: z.string().max(50).optional().or(z.literal("")),
  mileage: z.string().max(50).optional().or(z.literal("")),
  seating: optionalNumber(z.number().int().positive()),
  length: optionalNumber(z.number().int().nonnegative()),
  width: optionalNumber(z.number().int().nonnegative()),
  height: optionalNumber(z.number().int().nonnegative()),
  wheelbase: optionalNumber(z.number().int().nonnegative()),
  bootCapacity: optionalNumber(z.number().int().nonnegative()),
  fuelTank: optionalNumber(z.number().int().nonnegative()),
  exShowroomPrice: optionalNumber(z.number().nonnegative()),
  applyDimensionsToAllVariants: z
    .string()
    .optional()
    .transform((v) => v === "on"),
});
export type CarVariantFormValues = z.infer<typeof carVariantSchema>;

export const dealerApprovalSchema = z.object({
  dealerId: z.string().min(1),
  action: z.enum(["APPROVE", "REJECT", "SUSPEND", "RESTORE"]),
});
export type DealerApprovalValues = z.infer<typeof dealerApprovalSchema>;

export const userRoleSchema = z.object({
  userId: z.string().min(1),
  role: z.enum(["BUYER", "DEALER", "ADMIN"]),
});
export type UserRoleValues = z.infer<typeof userRoleSchema>;

export const leadReassignSchema = z.object({
  leadId: z.string().min(1),
  dealerId: z.string().min(1, "Dealer is required"),
});
export type LeadReassignValues = z.infer<typeof leadReassignSchema>;

export const contentArticleSchema = z.object({
  type: z.enum(["NEWS", "EXPERT_REVIEW", "FEATURE", "COMPARISON"]),
  title: z.string().min(3, "Title is required").max(200),
  slug: z.string().min(1, "Slug is required").max(200).regex(/^[a-z0-9-]+$/, "Slug must be lowercase with hyphens only"),
  body: z.string().min(10, "Body must be at least 10 characters"),
  heroMediaUrl: z.string().url().optional().or(z.literal("")),
  tags: z.string().max(500).optional().or(z.literal("")),
  publishNow: z.coerce.boolean().default(false),
});
export type ContentArticleFormValues = z.infer<typeof contentArticleSchema>;

export const upcomingCarSchema = z.object({
  brandId: z.string().min(1, "Brand is required"),
  name: z.string().min(1, "Name is required").max(100),
  expectedLaunch: z.string().max(50).optional().or(z.literal("")),
  estimatedPrice: z.string().max(100).optional().or(z.literal("")),
  keyHighlights: z.string().max(2000).optional().or(z.literal("")),
  imageUrl: z.string().url().optional().or(z.literal("")),
});
export type UpcomingCarFormValues = z.infer<typeof upcomingCarSchema>;

const heroLocationSchema = z.object({ name: z.string(), phone: z.string() });
export const heroSlideSchema = z.object({
  title: z.string().min(1, "Title is required").max(200),
  subtitle: z.string().max(500).optional().or(z.literal("")),
  benefitText: z.string().max(200).optional().or(z.literal("")),
  dealerName: z.string().max(200).optional().or(z.literal("")),
  locationsJson: z.string().max(2000).optional().or(z.literal("")),
  imageUrl: z.string().url().optional().or(z.literal("")),
  sortOrder: z.coerce.number().int().min(0),
  active: z.coerce.boolean(),
});
export type HeroSlideFormValues = z.infer<typeof heroSlideSchema>;

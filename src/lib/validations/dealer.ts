import { z } from "zod";

export const inventoryItemSchema = z.object({
  variantId: z.string().min(1, "Car variant is required"),
  onRoadPrice: z.coerce.number().positive("Price must be positive").optional(),
  stockStatus: z.enum(["IN_STOCK", "OUT_OF_STOCK", "EXPECTED"]).default("IN_STOCK"),
  visibility: z.enum(["DRAFT", "VISIBLE", "HIDDEN"]).default("VISIBLE"),
  colorOptions: z
    .string()
    .optional()
    .transform((v) => (v ? v : undefined)),
  offers: z
    .string()
    .max(1000, "Offers description too long")
    .optional()
    .transform((v) => (v ? v : undefined)),
  imageUrls: z
    .string()
    .optional()
    .transform((v) => (v ? v : undefined)),
});

export type InventoryItemFormValues = z.infer<typeof inventoryItemSchema>;

export const leadStatusSchema = z.object({
  leadId: z.string().min(1),
  status: z.enum(["NEW", "CONTACTED", "IN_PROGRESS", "COMPLETED", "DROPPED"]),
});

export type LeadStatusFormValues = z.infer<typeof leadStatusSchema>;

export const leadNoteSchema = z.object({
  leadId: z.string().min(1),
  note: z.string().min(1, "Note cannot be empty").max(1000),
});

export type LeadNoteFormValues = z.infer<typeof leadNoteSchema>;

export const testDriveStatusSchema = z.object({
  slotId: z.string().min(1),
  status: z.enum(["REQUESTED", "CONFIRMED", "COMPLETED", "CANCELLED", "NO_SHOW"]),
  notes: z.string().max(500).optional(),
});

export type TestDriveStatusFormValues = z.infer<typeof testDriveStatusSchema>;

export const offerSchema = z.object({
  inventoryItemId: z.string().min(1, "Inventory item is required"),
  title: z.string().min(3, "Title is required").max(100),
  description: z.string().max(500).optional(),
  discountType: z.enum(["PERCENTAGE", "FLAT"]).default("FLAT"),
  discountAmount: z.coerce.number().positive("Amount must be positive"),
  validFrom: z.string().min(1, "Start date is required"),
  validTo: z.string().min(1, "End date is required"),
  isHighlighted: z.coerce.boolean().default(false),
});

export type OfferFormValues = z.infer<typeof offerSchema>;

export const dealerSignupSchema = z.object({
  name: z.string().min(2, "Dealership name must be at least 2 characters").max(100),
  city: z.string().min(2, "City is required"),
  address: z.string().min(5, "Full address is required").max(300),
  phone: z.string().min(10, "Valid phone number is required"),
  email: z.string().email("Valid email is required"),
  description: z.string().max(1000).optional(),
  contactName: z.string().min(2, "Contact person name is required"),
  contactEmail: z.string().email("Valid email is required"),
  brandIds: z.array(z.string()).min(1, "Select at least one brand"),
});

export type DealerSignupFormValues = z.infer<typeof dealerSignupSchema>;

export const dealerSettingsSchema = z.object({
  name: z.string().min(2, "Dealership name is required").max(100),
  city: z.string().min(2, "City is required"),
  address: z.string().min(5, "Address is required").max(300),
  phone: z.string().min(10, "Valid phone number is required").optional().or(z.literal("")),
  email: z.string().email("Valid email").optional().or(z.literal("")),
  description: z.string().max(1000).optional().or(z.literal("")),
});

export type DealerSettingsFormValues = z.infer<typeof dealerSettingsSchema>;

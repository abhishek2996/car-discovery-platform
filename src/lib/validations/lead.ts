import { z } from "zod";

export const enquiryFormSchema = z.object({
  dealerId: z.string().min(1, "Dealer is required"),
  carModelId: z.string().optional(),
  carVariantId: z.string().optional(),
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(10, "Phone must be at least 10 digits").optional().or(z.literal("")),
  message: z.string().min(10, "Message must be at least 10 characters").max(1000),
  source: z.string().optional(),
});

export type EnquiryFormValues = z.infer<typeof enquiryFormSchema>;

export const testDriveFormSchema = z.object({
  dealerId: z.string().min(1, "Dealer is required"),
  variantId: z.string().min(1, "Car variant is required"),
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(10, "Phone must be at least 10 digits"),
  preferredDate: z.string().min(1, "Preferred date is required"),
  preferredTime: z.string().min(1, "Preferred time is required"),
  message: z.string().max(500).optional().or(z.literal("")),
  source: z.string().optional(),
});

export type TestDriveFormValues = z.infer<typeof testDriveFormSchema>;

export const reviewFormSchema = z.object({
  carVariantId: z.string().min(1, "Car variant is required"),
  rating: z.number().min(1, "Rating is required").max(5),
  title: z.string().min(3, "Title must be at least 3 characters").max(100),
  content: z.string().min(20, "Review must be at least 20 characters").max(2000),
});

export type ReviewFormValues = z.infer<typeof reviewFormSchema>;

export const alertMeSchema = z.object({
  upcomingCarId: z.string().min(1),
  email: z.string().email("Invalid email address"),
  name: z.string().min(2, "Name must be at least 2 characters").optional().or(z.literal("")),
});

export type AlertMeFormValues = z.infer<typeof alertMeSchema>;

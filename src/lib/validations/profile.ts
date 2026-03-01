import { z } from "zod";

export const profileSchema = z.object({
  name: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(100)
    .optional()
    .or(z.literal("")),
  phone: z
    .string()
    .min(10, "Phone must be at least 10 digits")
    .max(20)
    .optional()
    .or(z.literal("")),
});

export type ProfileFormValues = z.infer<typeof profileSchema>;

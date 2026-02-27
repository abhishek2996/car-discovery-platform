import { z } from "zod";

export const carSearchSchema = z.object({
  brand: z.string().optional(),
  minPrice: z.number().min(0).optional(),
  maxPrice: z.number().min(0).optional(),
  bodyType: z.string().optional(),
  fuel: z.string().optional(),
  transmission: z.string().optional(),
  seating: z.number().int().min(1).optional(),
  sort: z
    .enum(["popularity", "price_asc", "price_desc", "newest"])
    .optional()
    .default("popularity"),
  page: z.number().int().min(1).optional().default(1),
  q: z.string().optional(),
});

export type CarSearchParams = z.infer<typeof carSearchSchema>;

export function parseSearchParams(
  params: Record<string, string | string[] | undefined>,
): CarSearchParams {
  const str = (key: string) => {
    const v = params[key];
    return typeof v === "string" && v.length > 0 ? v : undefined;
  };
  const num = (key: string) => {
    const v = str(key);
    if (v === undefined) return undefined;
    const n = Number(v);
    return isNaN(n) ? undefined : n;
  };

  const raw = {
    brand: str("brand"),
    minPrice: num("minPrice"),
    maxPrice: num("maxPrice"),
    bodyType: str("bodyType"),
    fuel: str("fuel"),
    transmission: str("transmission"),
    seating: num("seating"),
    sort: str("sort"),
    page: num("page"),
    q: str("q"),
  };

  const result = carSearchSchema.safeParse(raw);
  if (result.success) return result.data;

  return { sort: "popularity", page: 1 };
}

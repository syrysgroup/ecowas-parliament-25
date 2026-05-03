import { z } from "zod";

export const interestSchema = z.object({
  buyer_name: z.string().trim().min(1, "Required").max(120),
  buyer_email: z.string().trim().email().max(255),
  buyer_phone: z.string().trim().max(40).optional().or(z.literal("")),
  buyer_country: z.string().trim().max(80).optional().or(z.literal("")),
  buyer_company: z.string().trim().max(160).optional().or(z.literal("")),
  quantity: z.coerce.number().positive().optional().or(z.nan()),
  unit: z.string().trim().max(40).optional().or(z.literal("")),
  size_spec: z.string().trim().max(300).optional().or(z.literal("")),
  target_price: z.coerce.number().nonnegative().optional().or(z.nan()),
  delivery_timeline: z.string().trim().max(120).optional().or(z.literal("")),
  message: z.string().trim().max(2000).optional().or(z.literal("")),
});

export type InterestInput = z.infer<typeof interestSchema>;

export const sellerSchema = z.object({
  title: z.string().trim().min(3).max(160),
  description: z.string().trim().min(10).max(4000),
  category_id: z.string().uuid().optional().or(z.literal("")),
  country: z.string().trim().min(2).max(80),
  seller_name: z.string().trim().min(2).max(160),
  seller_email: z.string().trim().email().max(255),
  seller_phone: z.string().trim().max(40).optional().or(z.literal("")),
  seller_company: z.string().trim().max(200).optional().or(z.literal("")),
  unit: z.string().trim().min(1).max(40),
  moq: z.coerce.number().nonnegative().optional().or(z.nan()),
  available_quantity: z.coerce.number().nonnegative().optional().or(z.nan()),
  price_min: z.coerce.number().nonnegative().optional().or(z.nan()),
  price_max: z.coerce.number().nonnegative().optional().or(z.nan()),
  currency: z.string().trim().min(3).max(6).default("USD"),
  image_url: z.string().url().optional().or(z.literal("")),
});

export type SellerInput = z.infer<typeof sellerSchema>;

export const inquirySchema = z.object({
  buyer_name: z.string().trim().min(1).max(120),
  buyer_email: z.string().trim().email().max(255),
  buyer_phone: z.string().trim().max(40).optional().or(z.literal("")),
  buyer_country: z.string().trim().max(80).optional().or(z.literal("")),
  buyer_company: z.string().trim().max(200).optional().or(z.literal("")),
  subject: z.string().trim().min(2).max(160),
  message: z.string().trim().min(5).max(4000),
});
export type InquiryInput = z.infer<typeof inquirySchema>;

export const sellerRequestSchema = z.object({
  seller_name: z.string().trim().min(2).max(160),
  seller_email: z.string().trim().email().max(255),
  seller_phone: z.string().trim().max(40).optional().or(z.literal("")),
  seller_company: z.string().trim().max(200).optional().or(z.literal("")),
  country: z.string().trim().min(2).max(80),
  product_title: z.string().trim().min(3).max(160),
  product_description: z.string().trim().min(10).max(4000),
  unit: z.string().trim().max(40).optional().or(z.literal("")),
  available_quantity: z.coerce.number().nonnegative().optional().or(z.nan()),
  price_min: z.coerce.number().nonnegative().optional().or(z.nan()),
  price_max: z.coerce.number().nonnegative().optional().or(z.nan()),
  currency: z.string().trim().min(3).max(6).default("USD"),
  image_url: z.string().url().optional().or(z.literal("")),
  notes: z.string().trim().max(2000).optional().or(z.literal("")),
});
export type SellerRequestInput = z.infer<typeof sellerRequestSchema>;

export const ECOWAS_COUNTRIES = [
  "Benin", "Burkina Faso", "Cabo Verde", "Côte d'Ivoire", "Gambia", "Ghana",
  "Guinea", "Guinea-Bissau", "Liberia", "Mali", "Niger", "Nigeria",
  "Senegal", "Sierra Leone", "Togo",
];

export function slugify(s: string) {
  return s.toLowerCase().trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 80) + "-" + Math.random().toString(36).slice(2, 7);
}
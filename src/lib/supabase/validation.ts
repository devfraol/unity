import { z } from "zod";

const slugSchema = z
  .string()
  .trim()
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Use lowercase hyphenated words.");

export const blogPostSchema = z.object({
  title: z.string().trim().min(1).max(200),
  slug: slugSchema,
  excerpt: z.string().trim().max(500).nullable().optional(),
  content: z.string().trim().min(1),
  cover_image: z.string().url().nullable().optional(),
  category_id: z.string().uuid().nullable().optional(),
  status: z.enum(["draft", "published", "archived"]).optional(),
  featured: z.boolean().optional(),
  published_at: z.string().datetime().nullable().optional(),
  seo_title: z.string().trim().max(200).nullable().optional(),
  seo_description: z.string().trim().max(320).nullable().optional(),
});

export const blogPostUpdateSchema = blogPostSchema.partial();

export const categorySchema = z.object({
  name: z.string().trim().min(1).max(100),
  slug: slugSchema,
  description: z.string().trim().max(500).nullable().optional(),
});

export const commentSchema = z.object({
  post_id: z.string().uuid(),
  name: z.string().trim().min(2).max(80),
  email: z.string().trim().email().max(254),
  content: z.string().trim().min(4).max(1000),
});

export type BlogPostInput = z.infer<typeof blogPostSchema>;
export type CategoryInput = z.infer<typeof categorySchema>;
export type CommentInput = z.infer<typeof commentSchema>;

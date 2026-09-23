import { getCurrentUser } from "@/lib/supabase/auth";
import { ServiceError, toServiceError } from "@/lib/supabase/errors";
import { supabase } from "@/lib/supabase/client";
import {
  blogPostSchema,
  blogPostUpdateSchema,
  type BlogPostInput,
} from "@/lib/supabase/validation";
import type { BlogPost } from "@/types/database";

function validatePost(input: BlogPostInput): BlogPostInput {
  const parsed = blogPostSchema.safeParse(input);
  if (!parsed.success)
    throw new ServiceError("validation", "Please correct the post details and try again.");
  return parsed.data;
}

async function requireCurrentUserId(): Promise<string> {
  const user = await getCurrentUser();
  if (!user) throw new ServiceError("authentication", "Please sign in to continue.");
  return user.id;
}

export async function getPublishedPosts(): Promise<BlogPost[]> {
  const { data, error } = await supabase
    .from("blog_posts")
    .select("*")
    .eq("status", "published")
    .order("published_at", { ascending: false });
  if (error) throw toServiceError(error);
  return data;
}

export async function getFeaturedPosts(): Promise<BlogPost[]> {
  const { data, error } = await supabase
    .from("blog_posts")
    .select("*")
    .eq("status", "published")
    .eq("featured", true)
    .order("published_at", { ascending: false });
  if (error) throw toServiceError(error);
  return data;
}

export async function getPostBySlug(slug: string): Promise<BlogPost | null> {
  const { data, error } = await supabase
    .from("blog_posts")
    .select("*")
    .eq("slug", slug)
    .maybeSingle();
  if (error) throw toServiceError(error);
  return data;
}

export async function getPostsByCategory(categorySlug: string): Promise<BlogPost[]> {
  const { data: category, error: categoryError } = await supabase
    .from("categories")
    .select("id")
    .eq("slug", categorySlug)
    .maybeSingle();
  if (categoryError) throw toServiceError(categoryError);
  if (!category) return [];

  const { data, error } = await supabase
    .from("blog_posts")
    .select("*")
    .eq("category_id", category.id)
    .order("published_at", { ascending: false });
  if (error) throw toServiceError(error);
  return data;
}

export async function createPost(input: BlogPostInput): Promise<BlogPost> {
  const author_id = await requireCurrentUserId();
  const data = validatePost(input);
  const { data: post, error } = await supabase
    .from("blog_posts")
    .insert({ ...data, author_id })
    .select()
    .single();
  if (error) throw toServiceError(error);
  return post;
}

export async function updatePost(id: string, input: Partial<BlogPostInput>): Promise<BlogPost> {
  const parsed = blogPostUpdateSchema.safeParse(input);
  if (!parsed.success)
    throw new ServiceError("validation", "Please correct the post details and try again.");
  const data = parsed.data;
  const { data: post, error } = await supabase
    .from("blog_posts")
    .update(data)
    .eq("id", id)
    .select()
    .single();
  if (error) throw toServiceError(error);
  return post;
}

export async function archivePost(id: string): Promise<BlogPost> {
  const { data, error } = await supabase
    .from("blog_posts")
    .update({ status: "archived" })
    .eq("id", id)
    .select()
    .single();
  if (error) throw toServiceError(error);
  return data;
}

export async function publishPost(id: string): Promise<BlogPost> {
  const { data, error } = await supabase
    .from("blog_posts")
    .update({ status: "published", published_at: new Date().toISOString() })
    .eq("id", id)
    .select()
    .single();
  if (error) throw toServiceError(error);
  return data;
}

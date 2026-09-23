import { getCurrentUser } from "@/lib/supabase/auth";
import { ServiceError, toServiceError } from "@/lib/supabase/errors";
import { supabase } from "@/lib/supabase/client";
import {
  blogPostSchema,
  blogPostUpdateSchema,
  type BlogPostInput,
} from "@/lib/supabase/validation";
import type { BlogPost, Category, Database, Profile } from "@/types/database";

export type PublicBlogPost = BlogPost & {
  category: Pick<Category, "name" | "slug"> | null;
  author: Pick<Profile, "full_name"> | null;
};

async function enrichPublicPosts(posts: BlogPost[]): Promise<PublicBlogPost[]> {
  if (!posts.length) return [];
  const categoryIds = [
    ...new Set(posts.flatMap((post) => (post.category_id ? [post.category_id] : []))),
  ];
  const authorIds = [...new Set(posts.map((post) => post.author_id))];
  const [{ data: categories, error: categoryError }, { data: authors, error: authorError }] =
    await Promise.all([
      categoryIds.length
        ? supabase.from("categories").select("id, name, slug").in("id", categoryIds)
        : Promise.resolve({ data: [], error: null }),
      authorIds.length
        ? supabase.from("profiles").select("id, full_name").in("id", authorIds)
        : Promise.resolve({ data: [], error: null }),
    ]);
  if (categoryError) throw toServiceError(categoryError);
  if (authorError) throw toServiceError(authorError);
  const categoryById = new Map((categories ?? []).map((category) => [category.id, category]));
  const authorById = new Map((authors ?? []).map((author) => [author.id, author]));
  return posts.map((post) => ({
    ...post,
    category: post.category_id ? (categoryById.get(post.category_id) ?? null) : null,
    author: authorById.get(post.author_id) ?? null,
  }));
}

async function enrichPublicPost(post: BlogPost | null): Promise<PublicBlogPost | null> {
  const [enriched] = await enrichPublicPosts(post ? [post] : []);
  return enriched ?? null;
}

function withoutUndefined<T extends Record<string, unknown>>(input: T): T {
  return Object.fromEntries(Object.entries(input).filter(([, value]) => value !== undefined)) as T;
}

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

export async function getPublishedPosts(): Promise<PublicBlogPost[]> {
  const { data, error } = await supabase
    .from("blog_posts")
    .select("*")
    .eq("status", "published")
    .order("published_at", { ascending: false });
  if (error) throw toServiceError(error);
  return enrichPublicPosts(data);
}

export async function getFeaturedPosts(): Promise<PublicBlogPost[]> {
  const { data, error } = await supabase
    .from("blog_posts")
    .select("*")
    .eq("status", "published")
    .eq("featured", true)
    .order("published_at", { ascending: false });
  if (error) throw toServiceError(error);
  return enrichPublicPosts(data);
}

export async function getPostBySlug(slug: string): Promise<PublicBlogPost | null> {
  const { data, error } = await supabase
    .from("blog_posts")
    .select("*")
    .eq("slug", slug)
    .eq("status", "published")
    .maybeSingle();
  if (error) throw toServiceError(error);
  return enrichPublicPost(data);
}

export async function getPostsByCategory(categorySlug: string): Promise<PublicBlogPost[]> {
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
    .eq("status", "published")
    .order("published_at", { ascending: false });
  if (error) throw toServiceError(error);
  return enrichPublicPosts(data);
}

export async function getPostsForAdmin(): Promise<BlogPost[]> {
  const { data, error } = await supabase
    .from("blog_posts")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw toServiceError(error);
  return data;
}

export async function getPostByIdForAdmin(id: string): Promise<BlogPost | null> {
  const { data, error } = await supabase.from("blog_posts").select("*").eq("id", id).maybeSingle();
  if (error) throw toServiceError(error);
  return data;
}

export async function createPost(input: BlogPostInput): Promise<BlogPost> {
  const author_id = await requireCurrentUserId();
  const data = validatePost(input);
  const { data: post, error } = await supabase
    .from("blog_posts")
    .insert(
      withoutUndefined({
        ...data,
        author_id,
      }) as Database["public"]["Tables"]["blog_posts"]["Insert"],
    )
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
    .update(withoutUndefined(data) as Database["public"]["Tables"]["blog_posts"]["Update"])
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

export async function deletePost(id: string): Promise<void> {
  const { error } = await supabase.from("blog_posts").delete().eq("id", id);
  if (error) throw toServiceError(error);
}

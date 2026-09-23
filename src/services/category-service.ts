import { ServiceError, toServiceError } from "@/lib/supabase/errors";
import { supabase } from "@/lib/supabase/client";
import { categorySchema, type CategoryInput } from "@/lib/supabase/validation";
import type { Category, Database } from "@/types/database";

function withoutUndefined<T extends Record<string, unknown>>(input: T): T {
  return Object.fromEntries(Object.entries(input).filter(([, value]) => value !== undefined)) as T;
}

function validateCategory(input: CategoryInput): CategoryInput {
  const parsed = categorySchema.safeParse(input);
  if (!parsed.success)
    throw new ServiceError("validation", "Please correct the category details and try again.");
  return parsed.data;
}

export async function getCategories(): Promise<Category[]> {
  const { data, error } = await supabase.from("categories").select("*").order("name");
  if (error) throw toServiceError(error);
  return data;
}

export async function getCategoryBySlug(slug: string): Promise<Category | null> {
  const { data, error } = await supabase
    .from("categories")
    .select("*")
    .eq("slug", slug)
    .maybeSingle();
  if (error) throw toServiceError(error);
  return data;
}

export async function createCategory(input: CategoryInput): Promise<Category> {
  const { data, error } = await supabase
    .from("categories")
    .insert(
      withoutUndefined(
        validateCategory(input),
      ) as Database["public"]["Tables"]["categories"]["Insert"],
    )
    .select()
    .single();
  if (error) throw toServiceError(error);
  return data;
}

export async function updateCategory(id: string, input: CategoryInput): Promise<Category> {
  const { data, error } = await supabase
    .from("categories")
    .update(
      withoutUndefined(
        validateCategory(input),
      ) as Database["public"]["Tables"]["categories"]["Update"],
    )
    .eq("id", id)
    .select()
    .single();
  if (error) throw toServiceError(error);
  return data;
}

export async function deleteCategory(id: string): Promise<void> {
  const { error } = await supabase.from("categories").delete().eq("id", id);
  if (error) throw toServiceError(error);
}

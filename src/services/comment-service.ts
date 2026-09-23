import { getCurrentUser } from "@/lib/supabase/auth";
import { ServiceError, toServiceError } from "@/lib/supabase/errors";
import { supabase } from "@/lib/supabase/client";
import { commentSchema, type CommentInput } from "@/lib/supabase/validation";
import type { Comment } from "@/types/database";

function validateComment(input: CommentInput): CommentInput {
  const parsed = commentSchema.safeParse(input);
  if (!parsed.success)
    throw new ServiceError("validation", "Please correct your comment and try again.");
  return parsed.data;
}

async function requireModeratorId(): Promise<string> {
  const user = await getCurrentUser();
  if (!user) throw new ServiceError("authentication", "Please sign in to continue.");
  return user.id;
}

export async function getApprovedComments(postId: string): Promise<Comment[]> {
  const { data, error } = await supabase
    .from("comments")
    .select("*")
    .eq("post_id", postId)
    .eq("status", "approved")
    .order("created_at");
  if (error) throw toServiceError(error);
  return data;
}

export async function createComment(input: CommentInput): Promise<Comment> {
  const { data, error } = await supabase
    .from("comments")
    .insert({ ...validateComment(input), status: "pending", approved_at: null, approved_by: null })
    .select()
    .single();
  if (error) throw toServiceError(error);
  return data;
}

export async function getCommentsForModeration(): Promise<Comment[]> {
  const { data, error } = await supabase
    .from("comments")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw toServiceError(error);
  return data;
}

async function setCommentStatus(
  id: string,
  status: "approved" | "rejected" | "spam",
): Promise<Comment> {
  const moderatorId = await requireModeratorId();
  const moderation =
    status === "approved"
      ? { status, approved_at: new Date().toISOString(), approved_by: moderatorId }
      : { status, approved_at: null, approved_by: null };
  const { data, error } = await supabase
    .from("comments")
    .update(moderation)
    .eq("id", id)
    .select()
    .single();
  if (error) throw toServiceError(error);
  return data;
}

export function approveComment(id: string): Promise<Comment> {
  return setCommentStatus(id, "approved");
}

export function rejectComment(id: string): Promise<Comment> {
  return setCommentStatus(id, "rejected");
}

export function markCommentAsSpam(id: string): Promise<Comment> {
  return setCommentStatus(id, "spam");
}

export async function deleteComment(id: string): Promise<void> {
  const { error } = await supabase.from("comments").delete().eq("id", id);
  if (error) throw toServiceError(error);
}

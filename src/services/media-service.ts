import { ServiceError, toServiceError } from "@/lib/supabase/errors";
import { supabase } from "@/lib/supabase/client";

const BUCKET = "blog-images";
const MAX_FILE_SIZE = 5 * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);

function validateImage(file: File): void {
  if (!ALLOWED_IMAGE_TYPES.has(file.type)) {
    throw new ServiceError("validation", "Choose a JPG, PNG, WebP, or GIF image.");
  }
  if (file.size > MAX_FILE_SIZE) {
    throw new ServiceError("validation", "Images must be 5 MB or smaller.");
  }
}

function makeSafeFileName(file: File): string {
  const extension = file.name.split(".").pop()?.toLowerCase() || "image";
  const baseName = file.name
    .replace(/\.[^.]+$/, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 60);
  return `uploads/${crypto.randomUUID()}-${baseName || "image"}.${extension}`;
}

export async function uploadBlogImage(file: File): Promise<{ path: string; publicUrl: string }> {
  validateImage(file);
  const path = makeSafeFileName(file);
  const { error } = await supabase.storage.from(BUCKET).upload(path, file, {
    cacheControl: "3600",
    contentType: file.type,
    upsert: false,
  });
  if (error) throw toServiceError(error);

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
  return { path, publicUrl: data.publicUrl };
}

export async function deleteBlogImage(path: string): Promise<void> {
  if (!path.startsWith("uploads/") || path.includes("..")) {
    throw new ServiceError("validation", "The image path is invalid.");
  }
  const { error } = await supabase.storage.from(BUCKET).remove([path]);
  if (error) throw toServiceError(error);
}

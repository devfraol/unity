import { getCurrentUser } from "@/lib/supabase/auth";
import { ServiceError, toServiceError } from "@/lib/supabase/errors";
import { supabase } from "@/lib/supabase/client";
import type { Profile } from "@/types/database";

export async function getCurrentProfile(): Promise<Profile | null> {
  const user = await getCurrentUser();
  if (!user) return null;
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle();
  if (error) throw toServiceError(error);
  return data;
}

export async function requireStaffProfile(): Promise<Profile> {
  const profile = await getCurrentProfile();
  if (!profile || !["admin", "editor"].includes(profile.role)) {
    throw new ServiceError("authorization", "You do not have access to the CMS.");
  }
  return profile;
}

import type { AuthChangeEvent, Session, Subscription, User } from "@supabase/supabase-js";
import { ServiceError, toServiceError } from "@/lib/supabase/errors";
import { supabase } from "@/lib/supabase/client";

export async function getSession(): Promise<Session | null> {
  const { data, error } = await supabase.auth.getSession();
  if (error) throw toServiceError(error);
  return data.session;
}

export async function getCurrentUser(): Promise<User | null> {
  const { data, error } = await supabase.auth.getUser();
  if (error) throw toServiceError(error);
  return data.user;
}

export async function signInWithPassword(email: string, password: string): Promise<Session> {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw toServiceError(error);
  if (!data.session) throw new ServiceError("authentication", "We could not start a session.");
  return data.session;
}

export async function signOut(): Promise<void> {
  const { error } = await supabase.auth.signOut();
  if (error) throw toServiceError(error);
}

export function onAuthStateChange(
  callback: (event: AuthChangeEvent, session: Session | null) => void,
): Subscription {
  return supabase.auth.onAuthStateChange(callback).data.subscription;
}

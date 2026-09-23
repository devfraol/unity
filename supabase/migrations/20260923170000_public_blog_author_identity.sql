-- Phase 3: published articles may display their staff author's name publicly.
-- This keeps private post/comment data protected by their existing RLS policies.
create policy "Anyone can read public author identities" on public.profiles
for select using (true);

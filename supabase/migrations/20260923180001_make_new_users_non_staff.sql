-- Phase 4: public sign-ups must never receive CMS permissions.
-- Existing staff retain their admin/editor roles; new auth users are non-staff members.
alter table public.profiles alter column role set default 'member';

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, avatar_url, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', ''),
    new.raw_user_meta_data ->> 'avatar_url',
    'member'
  );
  return new;
end;
$$;

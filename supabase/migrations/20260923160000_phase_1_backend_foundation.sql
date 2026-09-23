-- Phase 1: secure Supabase foundation for Unity Welcome Settlement Agency.
create extension if not exists pgcrypto;

create type public.profile_role as enum ('admin', 'editor');
create type public.blog_post_status as enum ('draft', 'published', 'archived');
create type public.comment_status as enum ('pending', 'approved', 'rejected', 'spam');

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null default '',
  avatar_url text,
  role public.profile_role not null default 'editor',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(trim(name)) between 1 and 100),
  slug text not null unique check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  description text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.blog_posts (
  id uuid primary key default gen_random_uuid(),
  title text not null check (char_length(trim(title)) between 1 and 200),
  slug text not null unique check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  excerpt text,
  content text not null check (char_length(trim(content)) > 0),
  cover_image text,
  category_id uuid references public.categories(id) on delete set null,
  author_id uuid not null references public.profiles(id) on delete restrict,
  status public.blog_post_status not null default 'draft',
  featured boolean not null default false,
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  seo_title text,
  seo_description text,
  constraint published_posts_have_published_at check (
    status <> 'published' or published_at is not null
  )
);

create table public.comments (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.blog_posts(id) on delete cascade,
  name text not null check (char_length(trim(name)) between 2 and 80),
  email text not null check (char_length(email) <= 254),
  content text not null check (char_length(trim(content)) between 4 and 1000),
  status public.comment_status not null default 'pending',
  created_at timestamptz not null default now(),
  approved_at timestamptz,
  approved_by uuid references public.profiles(id) on delete set null,
  constraint approved_comments_are_moderated check (
    (status = 'approved' and approved_at is not null and approved_by is not null)
    or (status <> 'approved' and approved_at is null and approved_by is null)
  )
);

create index blog_posts_status_idx on public.blog_posts (status);
create index blog_posts_published_at_idx on public.blog_posts (published_at desc);
create index blog_posts_category_id_idx on public.blog_posts (category_id);
create index blog_posts_author_id_idx on public.blog_posts (author_id);
create index comments_post_id_idx on public.comments (post_id);
create index comments_status_idx on public.comments (status);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_set_updated_at before update on public.profiles
for each row execute function public.set_updated_at();
create trigger categories_set_updated_at before update on public.categories
for each row execute function public.set_updated_at();
create trigger blog_posts_set_updated_at before update on public.blog_posts
for each row execute function public.set_updated_at();

-- Auth users are provisioned by staff. The trigger never accepts a client-supplied role.
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
    'editor'
  );
  return new;
end;
$$;

create trigger on_auth_user_created
after insert on auth.users
for each row execute procedure public.handle_new_user();

create or replace function public.is_staff()
returns boolean
language sql
stable
security definer set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role in ('admin', 'editor')
  );
$$;

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$;

-- The only supported role-changing mechanism. It is internally authorization checked.
create or replace function public.set_profile_role(target_user_id uuid, new_role public.profile_role)
returns public.profiles
language plpgsql
security definer set search_path = public
as $$
declare updated_profile public.profiles;
begin
  if not public.is_admin() then
    raise exception 'Only administrators may change roles' using errcode = '42501';
  end if;

  update public.profiles
  set role = new_role
  where id = target_user_id
  returning * into updated_profile;

  if updated_profile is null then
    raise exception 'Profile not found' using errcode = 'P0002';
  end if;
  return updated_profile;
end;
$$;

alter table public.profiles enable row level security;
alter table public.categories enable row level security;
alter table public.blog_posts enable row level security;
alter table public.comments enable row level security;

create policy "Users can read their own profile" on public.profiles
for select to authenticated using (id = auth.uid());
create policy "Admins can read profiles" on public.profiles
for select to authenticated using (public.is_admin());

create policy "Anyone can read categories" on public.categories
for select using (true);
create policy "Staff can insert categories" on public.categories
for insert to authenticated with check (public.is_staff());
create policy "Staff can update categories" on public.categories
for update to authenticated using (public.is_staff()) with check (public.is_staff());
create policy "Staff can delete categories" on public.categories
for delete to authenticated using (public.is_staff());

create policy "Anyone can read published posts" on public.blog_posts
for select using (status = 'published');
create policy "Staff can read all posts" on public.blog_posts
for select to authenticated using (public.is_staff());
create policy "Staff can create posts" on public.blog_posts
for insert to authenticated with check (public.is_staff() and author_id = auth.uid());
create policy "Staff can update posts" on public.blog_posts
for update to authenticated using (public.is_staff()) with check (public.is_staff());
create policy "Staff can delete posts" on public.blog_posts
for delete to authenticated using (public.is_staff());

create policy "Anyone can read approved comments" on public.comments
for select using (status = 'approved');
create policy "Anyone can submit pending comments" on public.comments
for insert with check (
  status = 'pending'
  and approved_at is null
  and approved_by is null
  and exists (
    select 1 from public.blog_posts
    where id = post_id and status = 'published'
  )
);
create policy "Staff can read all comments" on public.comments
for select to authenticated using (public.is_staff());
create policy "Staff can moderate comments" on public.comments
for update to authenticated using (public.is_staff()) with check (public.is_staff());
create policy "Staff can delete comments" on public.comments
for delete to authenticated using (public.is_staff());

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'blog-images', 'blog-images', true, 5242880,
  array['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

create policy "Anyone can read public blog images" on storage.objects
for select using (bucket_id = 'blog-images');
create policy "Staff can upload blog images" on storage.objects
for insert to authenticated with check (
  bucket_id = 'blog-images'
  and public.is_staff()
  and lower(storage.extension(name)) in ('jpg', 'jpeg', 'png', 'webp', 'gif')
  and coalesce((metadata ->> 'size')::bigint, 0) <= 5242880
  and coalesce(metadata ->> 'mimetype', '') like 'image/%'
);
create policy "Staff can update blog images" on storage.objects
for update to authenticated using (bucket_id = 'blog-images' and public.is_staff())
with check (bucket_id = 'blog-images' and public.is_staff());
create policy "Staff can delete blog images" on storage.objects
for delete to authenticated using (bucket_id = 'blog-images' and public.is_staff());

grant execute on function public.set_profile_role(uuid, public.profile_role) to authenticated;

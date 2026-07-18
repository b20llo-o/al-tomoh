-- ============================================================================
-- Al-Tomoh Bookstore — Supabase schema
-- Physical-books-only e-commerce with a hidden host admin console.
--
-- Run this in the Supabase SQL editor (or via the CLI) on a fresh project.
-- It is idempotent enough to re-run during setup, but review before running
-- against a database that already holds data.
-- ============================================================================

-- Extensions -----------------------------------------------------------------
create extension if not exists "pgcrypto";

-- ============================================================================
-- Profiles (one row per auth user)
-- ============================================================================
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text,
  phone text,
  role text not null default 'customer' check (role in ('customer', 'admin')),
  is_suspended boolean not null default false,
  created_at timestamptz not null default now()
);

-- Auto-create a profile whenever a new auth user signs up.
-- Wrapped in an exception guard so a profile hiccup can NEVER abort the signup
-- transaction (which would surface to the user as a 500 "Database error").
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, coalesce(new.raw_user_meta_data ->> 'full_name', ''))
  on conflict (id) do nothing;
  return new;
exception
  when others then
    -- Never block auth user creation because of the profile row.
    return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Helper: is the current request coming from an active admin?
create or replace function public.is_admin()
returns boolean
language sql
security definer set search_path = public
stable
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin' and is_suspended = false
  );
$$;

-- ============================================================================
-- Categories
-- ============================================================================
create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  name_en text,
  slug text not null unique,
  description text,
  description_en text,
  sort_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

-- ============================================================================
-- Books (physical books only)
-- ============================================================================
create table if not exists public.books (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  title_en text,
  slug text not null unique,
  author text not null,
  author_en text,
  publisher text,
  publisher_en text,
  isbn text,
  description text,
  description_en text,
  category_id uuid references public.categories (id) on delete set null,
  category_ids uuid[] not null default '{}',
  price_try numeric(12, 2) not null default 0,
  price_usd numeric(12, 2),
  discount_percent integer not null default 0 check (discount_percent >= 0 and discount_percent <= 95),
  pages integer,
  language text,
  publication_year integer,
  stock integer not null default 0,
  is_featured boolean not null default false,
  is_bestseller boolean not null default false,
  is_new_arrival boolean not null default false,
  is_visible boolean not null default true,
  is_deleted boolean not null default false,
  cover_url text,
  gallery text[] not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists books_category_idx on public.books (category_id);
create index if not exists books_category_ids_idx on public.books using gin (category_ids);
create index if not exists books_visible_idx on public.books (is_visible, is_deleted);
create index if not exists books_flags_idx on public.books (is_featured, is_bestseller, is_new_arrival);

-- ============================================================================
-- Addresses
-- ============================================================================
create table if not exists public.addresses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  label text not null default 'Home',
  full_name text not null,
  phone text not null,
  country text not null,
  city text not null,
  district text,
  postal_code text,
  address_line text not null,
  is_default boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists addresses_user_idx on public.addresses (user_id);

-- ============================================================================
-- Orders & order items
-- ============================================================================
create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  order_number text not null unique,
  user_id uuid not null references auth.users (id) on delete cascade,
  status text not null default 'pending'
    check (status in ('pending', 'processing', 'shipped', 'delivered', 'cancelled')),
  payment_status text not null default 'pending'
    check (payment_status in ('pending', 'paid', 'failed', 'refunded')),
  payment_provider text,
  payment_reference text,
  currency text not null default 'TRY' check (currency in ('TRY', 'USD')),
  exchange_rate numeric(12, 4) not null default 1,
  subtotal numeric(12, 2) not null default 0,
  shipping_cost numeric(12, 2) not null default 0,
  tax_amount numeric(12, 2) not null default 0,
  total numeric(12, 2) not null default 0,
  shipping_full_name text not null,
  shipping_phone text not null,
  shipping_country text not null,
  shipping_city text not null,
  shipping_district text,
  shipping_postal_code text,
  shipping_address_line text not null,
  tracking_number text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists orders_user_idx on public.orders (user_id);
create index if not exists orders_status_idx on public.orders (status);

create table if not exists public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders (id) on delete cascade,
  book_id uuid references public.books (id) on delete set null,
  title text not null,
  author text,
  unit_price numeric(12, 2) not null,
  quantity integer not null check (quantity > 0)
);

create index if not exists order_items_order_idx on public.order_items (order_id);

-- ============================================================================
-- Wishlists
-- ============================================================================
create table if not exists public.wishlists (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  book_id uuid not null references public.books (id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (user_id, book_id)
);

create index if not exists wishlists_user_idx on public.wishlists (user_id);

-- ============================================================================
-- Testimonials
-- ============================================================================
create table if not exists public.testimonials (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  role text,
  message text not null,
  is_visible boolean not null default true,
  sort_order integer not null default 0
);

-- ============================================================================
-- Contact messages
-- ============================================================================
create table if not exists public.contact_messages (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  subject text,
  message text not null,
  is_read boolean not null default false,
  created_at timestamptz not null default now()
);

-- ============================================================================
-- Newsletter subscribers
-- ============================================================================
create table if not exists public.newsletter_subscribers (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  created_at timestamptz not null default now()
);

-- ============================================================================
-- Editable site content & store settings (JSON blobs, keyed)
-- ============================================================================
create table if not exists public.site_content (
  key text primary key,
  value jsonb not null,
  updated_at timestamptz not null default now()
);

create table if not exists public.store_settings (
  key text primary key,
  value jsonb not null,
  updated_at timestamptz not null default now()
);

-- ============================================================================
-- Activity logs
-- ============================================================================
create table if not exists public.activity_logs (
  id uuid primary key default gen_random_uuid(),
  admin_id uuid references public.profiles (id) on delete set null,
  action text not null,
  entity text not null,
  entity_id text,
  details jsonb,
  created_at timestamptz not null default now()
);

create index if not exists activity_logs_created_idx on public.activity_logs (created_at desc);

-- ============================================================================
-- Row Level Security
-- ============================================================================
alter table public.profiles enable row level security;
alter table public.categories enable row level security;
alter table public.books enable row level security;
alter table public.addresses enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.wishlists enable row level security;
alter table public.testimonials enable row level security;
alter table public.contact_messages enable row level security;
alter table public.newsletter_subscribers enable row level security;
alter table public.site_content enable row level security;
alter table public.store_settings enable row level security;
alter table public.activity_logs enable row level security;

-- ---- Profiles --------------------------------------------------------------
drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own" on public.profiles
  for select using (auth.uid() = id or public.is_admin());

drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own" on public.profiles
  for update using (auth.uid() = id or public.is_admin())
  with check (auth.uid() = id or public.is_admin());

-- ---- Categories ------------------------------------------------------------
drop policy if exists "categories_public_read" on public.categories;
create policy "categories_public_read" on public.categories
  for select using (is_active or public.is_admin());

drop policy if exists "categories_admin_write" on public.categories;
create policy "categories_admin_write" on public.categories
  for all using (public.is_admin()) with check (public.is_admin());

-- ---- Books -----------------------------------------------------------------
drop policy if exists "books_public_read" on public.books;
create policy "books_public_read" on public.books
  for select using ((is_visible and not is_deleted) or public.is_admin());

drop policy if exists "books_admin_write" on public.books;
create policy "books_admin_write" on public.books
  for all using (public.is_admin()) with check (public.is_admin());

-- ---- Addresses -------------------------------------------------------------
drop policy if exists "addresses_own" on public.addresses;
create policy "addresses_own" on public.addresses
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ---- Orders ----------------------------------------------------------------
drop policy if exists "orders_select_own" on public.orders;
create policy "orders_select_own" on public.orders
  for select using (auth.uid() = user_id or public.is_admin());

drop policy if exists "orders_insert_own" on public.orders;
create policy "orders_insert_own" on public.orders
  for insert with check (auth.uid() = user_id);

drop policy if exists "orders_admin_update" on public.orders;
create policy "orders_admin_update" on public.orders
  for update using (public.is_admin()) with check (public.is_admin());

drop policy if exists "orders_owner_or_admin_delete" on public.orders;
create policy "orders_owner_or_admin_delete" on public.orders
  for delete using (auth.uid() = user_id or public.is_admin());

-- ---- Order items -----------------------------------------------------------
drop policy if exists "order_items_select" on public.order_items;
create policy "order_items_select" on public.order_items
  for select using (
    public.is_admin() or exists (
      select 1 from public.orders o
      where o.id = order_items.order_id and o.user_id = auth.uid()
    )
  );

drop policy if exists "order_items_insert" on public.order_items;
create policy "order_items_insert" on public.order_items
  for insert with check (
    exists (
      select 1 from public.orders o
      where o.id = order_items.order_id and o.user_id = auth.uid()
    )
  );

drop policy if exists "order_items_admin_all" on public.order_items;
create policy "order_items_admin_all" on public.order_items
  for all using (public.is_admin()) with check (public.is_admin());

-- ---- Wishlists -------------------------------------------------------------
drop policy if exists "wishlists_own" on public.wishlists;
create policy "wishlists_own" on public.wishlists
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ---- Testimonials ----------------------------------------------------------
drop policy if exists "testimonials_public_read" on public.testimonials;
create policy "testimonials_public_read" on public.testimonials
  for select using (is_visible or public.is_admin());

drop policy if exists "testimonials_admin_write" on public.testimonials;
create policy "testimonials_admin_write" on public.testimonials
  for all using (public.is_admin()) with check (public.is_admin());

-- ---- Contact messages ------------------------------------------------------
drop policy if exists "contact_insert_anyone" on public.contact_messages;
create policy "contact_insert_anyone" on public.contact_messages
  for insert with check (true);

drop policy if exists "contact_admin_read" on public.contact_messages;
create policy "contact_admin_read" on public.contact_messages
  for select using (public.is_admin());

drop policy if exists "contact_admin_write" on public.contact_messages;
create policy "contact_admin_write" on public.contact_messages
  for all using (public.is_admin()) with check (public.is_admin());

-- ---- Newsletter ------------------------------------------------------------
drop policy if exists "newsletter_insert_anyone" on public.newsletter_subscribers;
create policy "newsletter_insert_anyone" on public.newsletter_subscribers
  for insert with check (true);

drop policy if exists "newsletter_admin_read" on public.newsletter_subscribers;
create policy "newsletter_admin_read" on public.newsletter_subscribers
  for select using (public.is_admin());

-- ---- Site content & store settings -----------------------------------------
drop policy if exists "site_content_public_read" on public.site_content;
create policy "site_content_public_read" on public.site_content
  for select using (true);

drop policy if exists "site_content_admin_write" on public.site_content;
create policy "site_content_admin_write" on public.site_content
  for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists "store_settings_public_read" on public.store_settings;
create policy "store_settings_public_read" on public.store_settings
  for select using (true);

drop policy if exists "store_settings_admin_write" on public.store_settings;
create policy "store_settings_admin_write" on public.store_settings
  for all using (public.is_admin()) with check (public.is_admin());

-- ---- Activity logs ---------------------------------------------------------
drop policy if exists "activity_logs_admin_read" on public.activity_logs;
create policy "activity_logs_admin_read" on public.activity_logs
  for select using (public.is_admin());

drop policy if exists "activity_logs_admin_insert" on public.activity_logs;
create policy "activity_logs_admin_insert" on public.activity_logs
  for insert with check (public.is_admin());

-- ============================================================================
-- Storage bucket for book covers (public read, admin write)
-- ============================================================================
insert into storage.buckets (id, name, public)
values ('book-covers', 'book-covers', true)
on conflict (id) do nothing;

drop policy if exists "covers_public_read" on storage.objects;
create policy "covers_public_read" on storage.objects
  for select using (bucket_id = 'book-covers');

drop policy if exists "covers_admin_write" on storage.objects;
create policy "covers_admin_write" on storage.objects
  for insert with check (bucket_id = 'book-covers' and public.is_admin());

drop policy if exists "covers_admin_update" on storage.objects;
create policy "covers_admin_update" on storage.objects
  for update using (bucket_id = 'book-covers' and public.is_admin());

drop policy if exists "covers_admin_delete" on storage.objects;
create policy "covers_admin_delete" on storage.objects
  for delete using (bucket_id = 'book-covers' and public.is_admin());

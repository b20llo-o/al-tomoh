-- ============================================================================
-- Al-Tomoh — migration v2
-- Run this ONCE on an existing database (that already has schema.sql applied).
-- Everything here is additive and safe: no existing data is touched.
--
-- Adds: English variants for books & categories, and multi-category support.
-- ============================================================================

-- English variants (nullable; the UI falls back to the primary Arabic value) --
alter table public.categories add column if not exists name_en text;
alter table public.categories add column if not exists description_en text;

alter table public.books add column if not exists title_en text;
alter table public.books add column if not exists author_en text;
alter table public.books add column if not exists publisher_en text;
alter table public.books add column if not exists description_en text;

-- Multi-category: a book keeps a primary category_id plus extra ids -----------
alter table public.books
  add column if not exists category_ids uuid[] not null default '{}';

-- Index to speed up "book has category X" filters
create index if not exists books_category_ids_idx on public.books using gin (category_ids);

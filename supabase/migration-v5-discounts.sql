-- ============================================================================
-- Al-Tomoh — migration v5: book discounts
-- Run once in Supabase → SQL Editor → Run. Additive and safe.
--
-- Adds a per-book discount percentage. 0 = no discount. The storefront shows a
-- red star with the percentage on the cover and a struck-through original price.
-- ============================================================================

alter table public.books
  add column if not exists discount_percent integer not null default 0
  check (discount_percent >= 0 and discount_percent <= 95);

-- Speed up the "on sale" listing.
create index if not exists books_discount_idx
  on public.books (discount_percent)
  where discount_percent > 0;

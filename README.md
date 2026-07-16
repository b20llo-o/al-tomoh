# Al-Tomoh Bookstore

A premium online bookstore for **physical printed books only**, built with Next.js,
TypeScript, Tailwind CSS, and Supabase. It pairs a calm, literary storefront with a
hidden host administrator console for running the whole shop.

The storefront is **Arabic-first (RTL)** with English available from the language
switcher in the navbar. The visitor's language and currency choices are remembered.

The visual identity — warm orange and deep navy, an elegant serif display face, and
outline-only iconography — is drawn directly from the Al-Tomoh logo.

## Features

**Storefront**
- Home, Categories, Our Services, About Us, Contact Us, and Login pages
- Book detail pages with cover gallery, full metadata, and related books
- Powerful search and filtering (title, author, category, publisher, ISBN, price
  range, language, availability) with sorting
- Two currencies — Turkish Lira (TRY) and US Dollar (USD) — with a navbar switcher,
  automatic conversion, and a remembered preference
- Shopping cart, wishlist, secure checkout, order confirmation, order history, and
  live order tracking
- Printable invoices (browser print / save-as-PDF)
- Premium dark mode with a fluid, animated theme transition
- Subtle, elegant animations throughout

**Payments — iyzico**
- All card payments (domestic and international) go through **iyzico's hosted
  checkout form**: the customer is redirected to iyzico's secure page, and the
  order is marked paid only after the callback token is verified server-side
  against iyzico's API. Sandbox keys (prefix `sandbox-`) automatically target
  the sandbox environment.
- Bank transfer is also available; those orders stay *pending* until the admin
  confirms the payment from the console.
- Without provider keys, card orders are safely recorded as *pending* rather
  than assumed paid.

**Performance**
- Public middleware work is eliminated: the auth round-trip runs only on
  `/account`, `/checkout`, and the hidden console.
- All public catalogue reads are served from the server cache
  (`unstable_cache` + tags) with 1–5 minute windows; admin edits publish
  instantly via `revalidateTag`.
- The navbar resolves the session client-side, and route-level loading
  skeletons give instant feedback on navigation.

**Hidden Host Console** (`/host-console`)
- Never appears in public navigation and returns a plain 404 to anyone who is not a
  verified, non-suspended admin — enforced in middleware *and* the layout
- Book management: add, edit, hide, delete, restore, cover upload, categories
- Order management: view, change status, add tracking, print invoices
- Customer management: view accounts, suspend / reinstate
- Content management: contact, about, homepage, services copy, and testimonials
- Store settings: currency rate, shipping, tax, payment methods
- Analytics: revenue, orders, average order value, best sellers
- Activity logs of every administrative action

Every book shown on the site comes **directly from Supabase**. There are no hardcoded,
demo, or local books — if a book is not in Supabase (and visible), it never appears.

## Tech stack

Next.js 15 (App Router) · React 19 · TypeScript · Tailwind CSS · Supabase
(Postgres, Auth, Storage) · `lucide-react` icons · `next-themes`.

## Getting started

### 1. Install dependencies

```bash
npm install
```

### 2. Create a Supabase project and apply the schema

In the Supabase SQL editor, run the contents of:

1. `supabase/schema.sql` — tables, row-level-security policies, triggers, and the
   `book-covers` storage bucket.
2. `supabase/seed.sql` — optional. Seeds categories, store settings, and testimonials.
   **It seeds no books** — add those through the console.

**Already have a database from an earlier version?** Run `supabase/migration-v2.sql`
once instead — it additively adds the English fields (`title_en`, `author_en`,
`name_en`, …) and multi-category support without touching your existing data.

### Branding: your logo

Drop your logo file at **`public/logo.png`** (a square PNG) and it is used
everywhere automatically — navbar, footer, hero, invoices, the app icon, and the
confirmation emails. A vector fallback lives at `public/logo.svg`.

### Confirmation & recovery emails

Branded, bilingual (Arabic + English) email templates live in
`supabase/email-templates/`. In the Supabase dashboard go to **Authentication →
Email Templates** and paste:

- `confirm-signup.html` into **Confirm signup**
- `reset-password.html` into **Reset password**

They load your logo from `{{ .SiteURL }}/logo.png`, so set your **Site URL** under
**Authentication → URL Configuration** to your deployed domain.

### Languages & bilingual content

The store is **Arabic by default** with an English switcher in the navbar. Books
and categories each have an optional English variant (title, author, publisher,
description / name). Fill them in from the host console; when a visitor switches to
English, any book that has English text shows it, otherwise it falls back to the
Arabic value. Books can also belong to **multiple categories**.

### 3. Configure environment variables

Copy `.env.example` to `.env.local` and fill in your Supabase keys:

```bash
cp .env.example .env.local
```

| Variable | Purpose |
| --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon key |
| `SUPABASE_SERVICE_ROLE_KEY` | Service-role key (server-only) |
| `IYZICO_API_KEY` / `IYZICO_SECRET_KEY` | iyzico card payments (sandbox keys hit the sandbox API) |
| `NEXT_PUBLIC_SITE_URL` | Public URL of the deployment — used for the iyzico callback |

### 4. Run the app

```bash
npm run dev
```

Visit `http://localhost:3000`.

### 5. Make yourself an admin

1. Register a normal account through **Login → Create account**.
2. In the Supabase SQL editor, promote it (replace the email):

   ```sql
   update public.profiles p
   set role = 'admin'
   from auth.users u
   where u.id = p.id and u.email = 'you@example.com';
   ```

3. Sign out and back in. The hidden console is now reachable at **`/host-console`**.
   It is intentionally unlinked from the public site.

## Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start the dev server |
| `npm run build` | Production build |
| `npm run start` | Start the production server |
| `npm run typecheck` | Type-check without emitting |

## Project structure

```
src/
  app/
    (site)/            Public storefront + customer account (shared chrome)
    host-console/      Hidden admin console (guarded layout)
    auth/callback/     Supabase auth code exchange
    actions/           Server actions (checkout, account, admin, uploads)
  components/
    layout/  store/  home/  cart/  checkout/  account/  admin/  auth/  brand/
  lib/
    supabase/          Browser + server Supabase clients
    data.ts            Public data access (server-only)
    admin-data.ts      Admin data access (server-only)
    currency.ts        Currency conversion & formatting
    types.ts           Shared domain types
supabase/
  schema.sql           Database schema + RLS + storage
  seed.sql             Optional store configuration & copy
```

## Security notes

- The admin route is protected in two layers: middleware rewrites unauthorized
  requests to a 404, and the console layout re-verifies the admin role server-side.
- All Supabase tables use row-level security. Customers can only read their own
  orders, addresses, and wishlist; only admins can write catalogue and settings data.
- Prices, stock, shipping, and tax are always recomputed server-side at checkout —
  nothing about money is trusted from the browser.

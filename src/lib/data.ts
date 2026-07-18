import "server-only";
import { unstable_cache } from "next/cache";
import { createStaticClient } from "./supabase/static";
import type {
  Book,
  Category,
  SiteContentKey,
  SiteContentMap,
  StoreSettingsKey,
  StoreSettingsMap,
  Testimonial,
} from "./types";
import { DEFAULT_SITE_CONTENT, DEFAULT_STORE_SETTINGS } from "./defaults";
import { BOOK_SELECT } from "./queries";
import { DEFAULT_LOCALE, type Locale } from "./i18n";

export { BOOK_SELECT };

/*
 * All public reads are wrapped in `unstable_cache` with short revalidation
 * windows and tags. Admin mutations call `revalidateTag`, so edits publish
 * immediately while ordinary navigation is served from the cache — this is
 * what keeps page-to-page transitions fast.
 */

export const CACHE_TAGS = {
  books: "books",
  categories: "categories",
  content: "content",
  settings: "settings",
} as const;

interface BookQueryOptions {
  featured?: boolean;
  bestseller?: boolean;
  newArrival?: boolean;
  discounted?: boolean;
  categoryId?: string;
  limit?: number;
}

const cachedVisibleBooks = unstable_cache(
  async (optionsJson: string): Promise<Book[]> => {
    const options = JSON.parse(optionsJson) as BookQueryOptions;
    try {
      const supabase = createStaticClient();
      let query = supabase
        .from("books")
        .select(BOOK_SELECT)
        .eq("is_visible", true)
        .eq("is_deleted", false)
        .order("created_at", { ascending: false });

      if (options.featured) query = query.eq("is_featured", true);
      if (options.bestseller) query = query.eq("is_bestseller", true);
      if (options.newArrival) query = query.eq("is_new_arrival", true);
      if (options.discounted) query = query.gt("discount_percent", 0);
      if (options.categoryId) {
        // A book belongs to a category if it is the primary OR in the extras array.
        query = query.or(
          `category_id.eq.${options.categoryId},category_ids.cs.{${options.categoryId}}`
        );
      }
      if (options.limit) query = query.limit(options.limit);

      const { data, error } = await query;
      if (error) return [];
      return (data ?? []) as Book[];
    } catch {
      return [];
    }
  },
  ["visible-books"],
  { revalidate: 60, tags: [CACHE_TAGS.books] }
);

export async function getVisibleBooks(options: BookQueryOptions = {}): Promise<Book[]> {
  return cachedVisibleBooks(JSON.stringify(options));
}

const cachedBookBySlug = unstable_cache(
  async (slug: string): Promise<Book | null> => {
    try {
      const supabase = createStaticClient();
      const { data, error } = await supabase
        .from("books")
        .select(BOOK_SELECT)
        .eq("slug", slug)
        .eq("is_visible", true)
        .eq("is_deleted", false)
        .maybeSingle();
      if (error) return null;
      return (data as Book) ?? null;
    } catch {
      return null;
    }
  },
  ["book-by-slug"],
  { revalidate: 60, tags: [CACHE_TAGS.books] }
);

export async function getBookBySlug(slug: string): Promise<Book | null> {
  const book = await cachedBookBySlug(slug);
  if (!book) return null;
  // Attach the extra categories (multi-category) from the id array.
  if (book.category_ids && book.category_ids.length > 0) {
    const categories = await getActiveCategories();
    book.categories = categories.filter(
      (c) => book.category_ids.includes(c.id) && c.id !== book.category_id
    );
  }
  return book;
}

const cachedActiveCategories = unstable_cache(
  async (): Promise<Category[]> => {
    try {
      const supabase = createStaticClient();
      const { data, error } = await supabase
        .from("categories")
        .select("*")
        .eq("is_active", true)
        .order("sort_order", { ascending: true });
      if (error) return [];
      return (data ?? []) as Category[];
    } catch {
      return [];
    }
  },
  ["active-categories"],
  { revalidate: 300, tags: [CACHE_TAGS.categories] }
);

export async function getActiveCategories(): Promise<Category[]> {
  return cachedActiveCategories();
}

const cachedCategoryBySlug = unstable_cache(
  async (slug: string): Promise<Category | null> => {
    try {
      const supabase = createStaticClient();
      const { data, error } = await supabase
        .from("categories")
        .select("*")
        .eq("slug", slug)
        .eq("is_active", true)
        .maybeSingle();
      if (error) return null;
      return (data as Category) ?? null;
    } catch {
      return null;
    }
  },
  ["category-by-slug"],
  { revalidate: 300, tags: [CACHE_TAGS.categories] }
);

export async function getCategoryBySlug(slug: string): Promise<Category | null> {
  return cachedCategoryBySlug(slug);
}

const cachedTestimonials = unstable_cache(
  async (): Promise<Testimonial[]> => {
    try {
      const supabase = createStaticClient();
      const { data, error } = await supabase
        .from("testimonials")
        .select("*")
        .eq("is_visible", true)
        .order("sort_order", { ascending: true });
      if (error) return [];
      return (data ?? []) as Testimonial[];
    } catch {
      return [];
    }
  },
  ["testimonials"],
  { revalidate: 300, tags: [CACHE_TAGS.content] }
);

export async function getVisibleTestimonials(): Promise<Testimonial[]> {
  return cachedTestimonials();
}

/** Distinct languages across the visible catalogue, for search filters. */
const cachedLanguages = unstable_cache(
  async (): Promise<string[]> => {
    try {
      const supabase = createStaticClient();
      const { data } = await supabase
        .from("books")
        .select("language")
        .eq("is_visible", true)
        .eq("is_deleted", false)
        .not("language", "is", null);
      const set = new Set((data ?? []).map((row) => row.language as string));
      return Array.from(set).sort();
    } catch {
      return [];
    }
  },
  ["book-languages"],
  { revalidate: 300, tags: [CACHE_TAGS.books] }
);

export async function getBookLanguages(): Promise<string[]> {
  return cachedLanguages();
}

const cachedSiteContentRow = unstable_cache(
  async (key: string): Promise<object | null> => {
    try {
      const supabase = createStaticClient();
      const { data, error } = await supabase
        .from("site_content")
        .select("value")
        .eq("key", key)
        .maybeSingle();
      if (error || !data?.value) return null;
      return data.value as object;
    } catch {
      return null;
    }
  },
  ["site-content"],
  { revalidate: 120, tags: [CACHE_TAGS.content] }
);

/** English content is stored under a `<key>__en` row; Arabic under `<key>`. */
export function contentRowKey(key: SiteContentKey, locale: Locale): string {
  return locale === "en" ? `${key}__en` : key;
}

export async function getSiteContent<K extends SiteContentKey>(
  key: K,
  locale: Locale = DEFAULT_LOCALE
): Promise<SiteContentMap[K]> {
  const stored = await cachedSiteContentRow(contentRowKey(key, locale));
  const fallback = DEFAULT_SITE_CONTENT[locale][key];
  if (!stored) return fallback;
  return { ...fallback, ...stored } as SiteContentMap[K];
}

const cachedStoreSettingRow = unstable_cache(
  async (key: string): Promise<object | null> => {
    try {
      const supabase = createStaticClient();
      const { data, error } = await supabase
        .from("store_settings")
        .select("value")
        .eq("key", key)
        .maybeSingle();
      if (error || !data?.value) return null;
      return data.value as object;
    } catch {
      return null;
    }
  },
  ["store-settings"],
  { revalidate: 120, tags: [CACHE_TAGS.settings] }
);

export async function getStoreSetting<K extends StoreSettingsKey>(
  key: K
): Promise<StoreSettingsMap[K]> {
  const stored = await cachedStoreSettingRow(key);
  if (!stored) return DEFAULT_STORE_SETTINGS[key];
  return { ...DEFAULT_STORE_SETTINGS[key], ...stored } as StoreSettingsMap[K];
}

export async function getTryPerUsd(): Promise<number> {
  const currency = await getStoreSetting("currency");
  return currency.try_per_usd;
}

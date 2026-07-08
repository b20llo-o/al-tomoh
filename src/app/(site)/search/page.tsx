import { BookGrid } from "@/components/store/book-grid";
import { SearchFilters } from "@/components/store/search-filters";
import { createStaticClient } from "@/lib/supabase/static";
import { BOOK_SELECT, getActiveCategories, getBookLanguages } from "@/lib/data";
import { getLocaleT } from "@/lib/locale-server";
import type { Book } from "@/lib/types";

export const dynamic = "force-dynamic";

interface SearchParams {
  q?: string;
  category?: string;
  min?: string;
  max?: string;
  language?: string;
  availability?: string;
  sort?: string;
}

async function searchBooks(params: SearchParams): Promise<Book[]> {
  try {
    const supabase = createStaticClient();
    let query = supabase
      .from("books")
      .select(BOOK_SELECT)
      .eq("is_visible", true)
      .eq("is_deleted", false);

    const q = params.q?.trim();
    if (q) {
      const escaped = q.replace(/[%_,()]/g, " ").trim();
      if (escaped) {
        query = query.or(
          `title.ilike.%${escaped}%,author.ilike.%${escaped}%,publisher.ilike.%${escaped}%,isbn.ilike.%${escaped}%`
        );
      }
    }
    if (params.category) {
      query = query.or(
        `category_id.eq.${params.category},category_ids.cs.{${params.category}}`
      );
    }
    if (params.language) query = query.ilike("language", params.language);
    if (params.availability === "in-stock") query = query.gt("stock", 0);

    const min = Number(params.min);
    const max = Number(params.max);
    if (Number.isFinite(min) && min > 0) query = query.gte("price_try", min);
    if (Number.isFinite(max) && max > 0) query = query.lte("price_try", max);

    switch (params.sort) {
      case "price-asc":
        query = query.order("price_try", { ascending: true });
        break;
      case "price-desc":
        query = query.order("price_try", { ascending: false });
        break;
      case "title":
        query = query.order("title", { ascending: true });
        break;
      case "bestselling":
        query = query
          .order("is_bestseller", { ascending: false })
          .order("created_at", { ascending: false });
        break;
      default:
        query = query.order("created_at", { ascending: false });
    }

    const { data, error } = await query.limit(60);
    if (error) return [];
    return (data ?? []) as Book[];
  } catch {
    return [];
  }
}

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const { t } = await getLocaleT();
  const [books, categories, languages] = await Promise.all([
    searchBooks(params),
    getActiveCategories(),
    getBookLanguages(),
  ]);

  return (
    <div className="container-page py-14 sm:py-16">
      <div className="mb-8 max-w-2xl animate-fade-up">
        <span className="section-eyebrow">{t("search.eyebrow")}</span>
        <h1 className="heading-display text-3xl sm:text-4xl">
          {params.q ? `${t("search.resultsFor")} “${params.q}”` : t("search.titleAll")}
        </h1>
        <p className="mt-3 text-sm text-muted">
          {books.length === 1
            ? t("search.foundOne")
            : `${books.length} ${t("search.found")}`}
        </p>
      </div>

      <div className="grid items-start gap-8 lg:grid-cols-[260px_1fr]">
        <SearchFilters categories={categories} languages={languages} />
        <BookGrid books={books} emptyMessage={t("search.empty")} />
      </div>
    </div>
  );
}

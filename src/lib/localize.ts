import type { Locale } from "./i18n";
import type { Book, Category } from "./types";

/*
 * Books and categories can carry an English variant alongside the primary
 * (Arabic) value. When the store is viewed in English we show the *_en field
 * if it was filled in, otherwise we fall back to the primary value — so a book
 * that only has Arabic text still renders everywhere.
 */

export function categoryName(category: Pick<Category, "name" | "name_en">, locale: Locale): string {
  if (locale === "en" && category.name_en?.trim()) return category.name_en;
  return category.name;
}

export function categoryDescription(
  category: Pick<Category, "description" | "description_en">,
  locale: Locale
): string | null {
  if (locale === "en" && category.description_en?.trim()) return category.description_en;
  return category.description;
}

export function bookTitle(book: Pick<Book, "title" | "title_en">, locale: Locale): string {
  if (locale === "en" && book.title_en?.trim()) return book.title_en;
  return book.title;
}

export function bookAuthor(book: Pick<Book, "author" | "author_en">, locale: Locale): string {
  if (locale === "en" && book.author_en?.trim()) return book.author_en;
  return book.author;
}

export function bookPublisher(
  book: Pick<Book, "publisher" | "publisher_en">,
  locale: Locale
): string | null {
  if (locale === "en" && book.publisher_en?.trim()) return book.publisher_en;
  return book.publisher;
}

export function bookDescription(
  book: Pick<Book, "description" | "description_en">,
  locale: Locale
): string | null {
  if (locale === "en" && book.description_en?.trim()) return book.description_en;
  return book.description;
}

/** All categories attached to a book (primary + extras), de-duplicated. */
export function bookCategories(
  book: Pick<Book, "category" | "categories" | "category_id" | "category_ids">
): Category[] {
  const out: Category[] = [];
  const seen = new Set<string>();
  if (book.category) {
    out.push(book.category);
    seen.add(book.category.id);
  }
  for (const c of book.categories ?? []) {
    if (!seen.has(c.id)) {
      out.push(c);
      seen.add(c.id);
    }
  }
  return out;
}

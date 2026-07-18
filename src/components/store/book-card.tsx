"use client";

import Link from "next/link";
import { ShoppingBag } from "lucide-react";
import { BookCover } from "./book-cover";
import { DiscountBadge } from "./discount-badge";
import { Price } from "./price";
import { useCart } from "@/components/providers/cart-provider";
import { useLocale } from "@/components/providers/locale-provider";
import { bookAuthor, bookTitle, categoryName } from "@/lib/localize";
import type { Book } from "@/lib/types";

export function BookCard({ book }: { book: Book }) {
  const { addItem } = useCart();
  const { t, locale } = useLocale();
  const inStock = book.stock > 0;
  const title = bookTitle(book, locale);

  return (
    <article className="group card-surface-hover relative flex flex-col p-3">
      <div className="relative">
        <Link href={`/books/${book.slug}`} className="block">
          <BookCover title={title} coverUrl={book.cover_url} />
        </Link>
        {book.discount_percent > 0 && (
          <DiscountBadge
            percent={book.discount_percent}
            className="start-0 top-0 h-12 w-12 -translate-x-1/2 -translate-y-1/2 rtl:translate-x-1/2"
          />
        )}
      </div>
      <div className="flex flex-1 flex-col px-1.5 pb-1.5 pt-4">
        <div className="mb-1.5 flex items-center gap-2">
          {book.category && (
            <span className="badge bg-navy-900/5 text-navy-900/70 dark:bg-parchment-100/10 dark:text-parchment-100/70">
              {categoryName(book.category, locale)}
            </span>
          )}
          {!inStock && (
            <span className="badge bg-navy-900/5 text-navy-900/50 dark:bg-parchment-100/10 dark:text-parchment-100/50">
              {t("common.outOfStock")}
            </span>
          )}
        </div>
        <Link href={`/books/${book.slug}`}>
          <h3 className="font-display text-base font-semibold leading-snug text-navy-950 transition-colors group-hover:text-brand-600 dark:text-parchment-50 dark:group-hover:text-brand-400 line-clamp-2">
            {title}
          </h3>
        </Link>
        <p className="mt-1 text-sm text-muted">{bookAuthor(book, locale)}</p>
        <div className="mt-auto flex items-center justify-between pt-4">
          <Price book={book} className="text-base" />
          <button
            type="button"
            onClick={() => addItem(book.id)}
            disabled={!inStock}
            aria-label={t("common.addToCart")}
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-navy-900/15 text-navy-900/70 transition-all duration-300 hover:border-brand-500 hover:bg-brand-500 hover:text-white disabled:opacity-40 dark:border-parchment-100/20 dark:text-parchment-100/70"
          >
            <ShoppingBag className="h-4 w-4" strokeWidth={1.75} />
          </button>
        </div>
      </div>
    </article>
  );
}

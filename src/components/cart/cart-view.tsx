"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Minus, MessageCircle, Plus, Trash2 } from "lucide-react";
import { useCart } from "@/components/providers/cart-provider";
import { useCurrency } from "@/components/providers/currency-provider";
import { useLocale } from "@/components/providers/locale-provider";
import { BookCover } from "@/components/store/book-cover";
import { EmptyState } from "@/components/store/empty-state";
import { fetchCartBooks } from "@/lib/cart-books";
import { formatPrice } from "@/lib/currency";
import { bookAuthor, bookTitle } from "@/lib/localize";
import { orderCartMessage, waLink } from "@/lib/whatsapp";
import type { Book } from "@/lib/types";

export function CartView({ whatsapp }: { whatsapp: string }) {
  const { lines, setQuantity, removeItem, isReady } = useCart();
  const { priceOf, amountOf, currency } = useCurrency();
  const { t, locale } = useLocale();
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);

  const bookIds = useMemo(() => lines.map((l) => l.bookId), [lines]);

  useEffect(() => {
    if (!isReady) return;
    let cancelled = false;
    setLoading(true);
    fetchCartBooks(bookIds).then((data) => {
      if (!cancelled) {
        setBooks(data);
        setLoading(false);
      }
    });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isReady, bookIds.join(",")]);

  const enriched = useMemo(
    () =>
      lines
        .map((line) => {
          const book = books.find((b) => b.id === line.bookId);
          return book ? { line, book } : null;
        })
        .filter((v): v is { line: (typeof lines)[number]; book: Book } => v !== null),
    [lines, books]
  );

  const subtotal = enriched.reduce(
    (sum, { line, book }) => sum + amountOf(book) * line.quantity,
    0
  );

  const waHref = useMemo(() => {
    const message = orderCartMessage(
      enriched.map(({ line, book }) => ({
        title: bookTitle(book, locale),
        author: bookAuthor(book, locale),
        quantity: line.quantity,
        price: priceOf(book),
      })),
      formatPrice(subtotal, currency),
      locale
    );
    return waLink(whatsapp, message);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enriched, subtotal, currency, locale, whatsapp]);

  if (!isReady || loading) {
    return <p className="text-sm text-muted">{t("cart.loading")}</p>;
  }

  if (enriched.length === 0) {
    return (
      <EmptyState
        message={t("cart.empty")}
        action={
          <Link href="/categories" className="btn-primary mt-2">
            {t("common.browseCollection")}
          </Link>
        }
      />
    );
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
      <ul className="space-y-4">
        {enriched.map(({ line, book }) => (
          <li key={book.id} className="card-surface flex gap-4 p-4">
            <Link href={`/books/${book.slug}`} className="w-20 shrink-0 sm:w-24">
              <BookCover title={bookTitle(book, locale)} coverUrl={book.cover_url} sizes="96px" />
            </Link>
            <div className="flex flex-1 flex-col">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <Link
                    href={`/books/${book.slug}`}
                    className="font-display text-base font-semibold leading-snug text-navy-950 hover:text-brand-600 dark:text-parchment-50 dark:hover:text-brand-400"
                  >
                    {bookTitle(book, locale)}
                  </Link>
                  <p className="mt-0.5 text-sm text-muted">{bookAuthor(book, locale)}</p>
                </div>
                <button
                  type="button"
                  onClick={() => removeItem(book.id)}
                  aria-label={t("common.remove")}
                  className="text-navy-900/40 transition-colors hover:text-red-600 dark:text-parchment-100/40"
                >
                  <Trash2 className="h-4 w-4" strokeWidth={1.75} />
                </button>
              </div>

              {book.stock < line.quantity && (
                <p className="mt-1 text-xs text-red-600 dark:text-red-400">
                  {t("cart.onlyLeft", { n: book.stock })}
                </p>
              )}

              <div className="mt-auto flex items-center justify-between pt-3">
                <div className="flex items-center rounded-lg border border-navy-900/15 dark:border-parchment-100/20">
                  <button
                    type="button"
                    onClick={() => setQuantity(book.id, line.quantity - 1)}
                    aria-label={t("book.decreaseQty")}
                    className="flex h-9 w-9 items-center justify-center text-navy-900/70 hover:text-brand-600 dark:text-parchment-100/70"
                  >
                    <Minus className="h-3.5 w-3.5" strokeWidth={1.75} />
                  </button>
                  <span className="w-8 text-center text-sm font-semibold">{line.quantity}</span>
                  <button
                    type="button"
                    onClick={() => setQuantity(book.id, line.quantity + 1)}
                    aria-label={t("book.increaseQty")}
                    className="flex h-9 w-9 items-center justify-center text-navy-900/70 hover:text-brand-600 dark:text-parchment-100/70"
                  >
                    <Plus className="h-3.5 w-3.5" strokeWidth={1.75} />
                  </button>
                </div>
                <span className="font-semibold text-brand-600 dark:text-brand-400">
                  {priceOf(book)}
                </span>
              </div>
            </div>
          </li>
        ))}
      </ul>

      <aside className="lg:sticky lg:top-24 lg:self-start">
        <div className="card-surface p-6">
          <h2 className="mb-5 font-display text-lg font-semibold text-navy-950 dark:text-parchment-50">
            {t("cart.summary")}
          </h2>
          <dl className="space-y-3 text-sm">
            <div className="flex items-center justify-between">
              <dt className="text-muted">{t("common.subtotal")}</dt>
              <dd className="font-medium">{formatPrice(subtotal, currency)}</dd>
            </div>
            <div className="flex items-center justify-between">
              <dt className="text-muted">{t("common.shipping")}</dt>
              <dd className="text-muted">{t("cart.shippingAtCheckout")}</dd>
            </div>
          </dl>
          <div className="my-5 h-px bg-navy-900/10 dark:bg-parchment-100/10" />
          <a
            href={waHref}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#25D366] py-3 font-semibold text-white shadow-sm transition-all duration-300 hover:bg-[#1eb856] hover:shadow-md active:scale-[0.98]"
          >
            <MessageCircle className="h-4 w-4" strokeWidth={2} />
            {t("wa.orderCart")}
          </a>
          <p className="mt-3 text-center text-xs text-muted">{t("wa.cartNote")}</p>
          <Link
            href="/categories"
            className="mt-3 block text-center text-sm font-medium text-muted hover:text-brand-600 dark:hover:text-brand-400"
          >
            {t("common.continueShopping")}
          </Link>
        </div>
      </aside>
    </div>
  );
}

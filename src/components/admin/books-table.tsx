"use client";

import Link from "next/link";
import { useState } from "react";
import {
  Eye,
  EyeOff,
  Pencil,
  RotateCcw,
  Search,
  Trash2,
} from "lucide-react";
import { setBookVisibility, softDeleteBook } from "@/app/actions/admin";
import { useLocale } from "@/components/providers/locale-provider";
import { bookAuthor, bookTitle, categoryName } from "@/lib/localize";
import { formatPrice } from "@/lib/currency";
import { ADMIN_PATH } from "@/lib/defaults";
import type { Book } from "@/lib/types";
import { cn } from "@/lib/utils";

export function BooksTable({ books }: { books: Book[] }) {
  const { t, locale } = useLocale();
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<"active" | "hidden" | "deleted">("active");

  const filtered = books.filter((book) => {
    if (filter === "deleted" && !book.is_deleted) return false;
    if (filter === "active" && (book.is_deleted || !book.is_visible)) return false;
    if (filter === "hidden" && (book.is_deleted || book.is_visible)) return false;
    if (query) {
      const q = query.toLowerCase();
      return (
        book.title.toLowerCase().includes(q) ||
        book.author.toLowerCase().includes(q) ||
        (book.isbn ?? "").toLowerCase().includes(q)
      );
    }
    return true;
  });

  const tabs = [
    { key: "active" as const, label: t("adm.active") },
    { key: "hidden" as const, label: t("adm.hidden") },
    { key: "deleted" as const, label: t("adm.deleted") },
  ];

  return (
    <div>
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div className="flex rounded-xl border border-navy-900/10 p-1 dark:border-parchment-100/15">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => setFilter(tab.key)}
              className={cn(
                "rounded-lg px-4 py-1.5 text-sm font-medium transition-colors",
                filter === tab.key
                  ? "bg-brand-500 text-white"
                  : "text-navy-900/60 hover:text-navy-950 dark:text-parchment-100/60 dark:hover:text-parchment-50"
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>
        <div className="relative">
          <Search className="pointer-events-none absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-navy-900/40 dark:text-parchment-100/40" strokeWidth={1.75} />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t("adm.searchBooks")}
            className="input-field w-64 ps-9"
          />
        </div>
      </div>

      <div className="card-surface overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-sm">
            <thead>
              <tr className="border-b border-navy-900/10 text-start text-xs uppercase tracking-wider text-muted dark:border-parchment-100/10">
                <th className="px-5 py-3 text-start font-semibold">{t("adm.colTitle")}</th>
                <th className="px-3 py-3 text-start font-semibold">{t("adm.colCategory")}</th>
                <th className="px-3 py-3 text-start font-semibold">{t("adm.colPrice")}</th>
                <th className="px-3 py-3 text-start font-semibold">{t("adm.colStock")}</th>
                <th className="px-3 py-3 text-start font-semibold">{t("adm.colStatus")}</th>
                <th className="px-5 py-3 text-end font-semibold">{t("adm.colActions")}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-navy-900/5 dark:divide-parchment-100/5">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-12 text-center text-muted">
                    {t("adm.noBooksView")}
                  </td>
                </tr>
              ) : (
                filtered.map((book) => (
                  <tr key={book.id} className="hover:bg-navy-900/[0.02] dark:hover:bg-parchment-100/[0.02]">
                    <td className="px-5 py-3">
                      <p className="font-medium text-navy-950 dark:text-parchment-100">
                        {bookTitle(book, locale)}
                      </p>
                      <p className="text-xs text-muted">{bookAuthor(book, locale)}</p>
                    </td>
                    <td className="px-3 py-3 text-muted">
                      {book.category ? categoryName(book.category, locale) : "—"}
                    </td>
                    <td className="px-3 py-3 font-medium">
                      {formatPrice(book.price_try, "TRY")}
                    </td>
                    <td className="px-3 py-3">
                      <span
                        className={cn(
                          book.stock <= 3
                            ? "text-red-600 dark:text-red-400"
                            : "text-navy-950 dark:text-parchment-100"
                        )}
                      >
                        {book.stock}
                      </span>
                    </td>
                    <td className="px-3 py-3">
                      {book.is_deleted ? (
                        <span className="badge bg-red-500/10 text-red-700 dark:text-red-400">
                          {t("adm.deleted")}
                        </span>
                      ) : book.is_visible ? (
                        <span className="badge bg-emerald-500/10 text-emerald-700 dark:text-emerald-400">
                          {t("adm.visible")}
                        </span>
                      ) : (
                        <span className="badge bg-amber-500/10 text-amber-700 dark:text-amber-400">
                          {t("adm.hidden")}
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex items-center justify-end gap-1">
                        {!book.is_deleted && (
                          <>
                            <Link
                              href={`${ADMIN_PATH}/books/${book.id}`}
                              className="flex h-8 w-8 items-center justify-center rounded-lg text-navy-900/60 hover:bg-navy-900/5 hover:text-brand-600 dark:text-parchment-100/60 dark:hover:bg-parchment-100/10"
                              aria-label={t("adm.edit")}
                            >
                              <Pencil className="h-4 w-4" strokeWidth={1.75} />
                            </Link>
                            <form action={setBookVisibility}>
                              <input type="hidden" name="id" value={book.id} />
                              <input
                                type="hidden"
                                name="visible"
                                value={(!book.is_visible).toString()}
                              />
                              <button
                                type="submit"
                                className="flex h-8 w-8 items-center justify-center rounded-lg text-navy-900/60 hover:bg-navy-900/5 hover:text-brand-600 dark:text-parchment-100/60 dark:hover:bg-parchment-100/10"
                                aria-label={book.is_visible ? t("adm.hide") : t("adm.show")}
                              >
                                {book.is_visible ? (
                                  <EyeOff className="h-4 w-4" strokeWidth={1.75} />
                                ) : (
                                  <Eye className="h-4 w-4" strokeWidth={1.75} />
                                )}
                              </button>
                            </form>
                          </>
                        )}
                        <form action={softDeleteBook}>
                          <input type="hidden" name="id" value={book.id} />
                          <input
                            type="hidden"
                            name="restore"
                            value={book.is_deleted ? "true" : "false"}
                          />
                          <button
                            type="submit"
                            className={cn(
                              "flex h-8 w-8 items-center justify-center rounded-lg hover:bg-navy-900/5 dark:hover:bg-parchment-100/10",
                              book.is_deleted
                                ? "text-navy-900/60 hover:text-emerald-600 dark:text-parchment-100/60"
                                : "text-navy-900/60 hover:text-red-600 dark:text-parchment-100/60"
                            )}
                            aria-label={book.is_deleted ? t("adm.restore") : t("adm.delete")}
                          >
                            {book.is_deleted ? (
                              <RotateCcw className="h-4 w-4" strokeWidth={1.75} />
                            ) : (
                              <Trash2 className="h-4 w-4" strokeWidth={1.75} />
                            )}
                          </button>
                        </form>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

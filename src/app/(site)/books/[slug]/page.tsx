import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { BookGallery } from "@/components/store/book-gallery";
import { BookActions } from "@/components/store/book-actions";
import { BookGrid } from "@/components/store/book-grid";
import { Price } from "@/components/store/price";
import { SectionHeading } from "@/components/store/section-heading";
import { WhatsAppOrderButton } from "@/components/store/whatsapp-order-button";
import { getBookBySlug, getSiteContent, getVisibleBooks } from "@/lib/data";
import { getLocaleT } from "@/lib/locale-server";
import {
  bookAuthor,
  bookCategories,
  bookDescription,
  bookPublisher,
  bookTitle,
  categoryName,
} from "@/lib/localize";

export default async function BookPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const { locale, t } = await getLocaleT();
  const book = await getBookBySlug(decodeURIComponent(slug));
  if (!book) notFound();

  const contact = await getSiteContent("contact_info", locale);

  const title = bookTitle(book, locale);
  const author = bookAuthor(book, locale);
  const description = bookDescription(book, locale);
  const cats = bookCategories(book);

  const relatedRaw = book.category_id
    ? await getVisibleBooks({ categoryId: book.category_id, limit: 6 })
    : [];
  const related = relatedRaw.filter((b) => b.id !== book.id).slice(0, 5);

  const inStock = book.stock > 0;

  const facts: { label: string; value: string | null; ltr?: boolean }[] = [
    { label: t("book.author"), value: author },
    { label: t("book.publisher"), value: bookPublisher(book, locale) },
    { label: t("book.isbn"), value: book.isbn, ltr: true },
    {
      label: t("book.category"),
      value: cats.length ? cats.map((c) => categoryName(c, locale)).join("، ") : null,
    },
    { label: t("book.language"), value: book.language },
    { label: t("book.pages"), value: book.pages ? String(book.pages) : null },
    {
      label: t("book.pubYear"),
      value: book.publication_year ? String(book.publication_year) : null,
    },
  ];
  const shownFacts = facts.filter((f) => f.value);
  const mid = Math.ceil(shownFacts.length / 2);

  return (
    <div className="container-page py-10 sm:py-14">
      {book.category ? (
        <Link
          href={`/categories/${book.category.slug}`}
          className="mb-6 inline-flex items-center gap-1.5 text-sm font-medium text-muted transition-colors hover:text-brand-600 dark:hover:text-brand-400"
        >
          <ChevronLeft className="h-4 w-4 rtl:rotate-180" strokeWidth={1.75} />
          {categoryName(book.category, locale)}
        </Link>
      ) : (
        <Link
          href="/search"
          className="mb-6 inline-flex items-center gap-1.5 text-sm font-medium text-muted transition-colors hover:text-brand-600 dark:hover:text-brand-400"
        >
          <ChevronLeft className="h-4 w-4 rtl:rotate-180" strokeWidth={1.75} />
          {t("book.allBooks")}
        </Link>
      )}

      <div className="grid gap-10 lg:grid-cols-2 lg:gap-14">
        <BookGallery title={title} coverUrl={book.cover_url} gallery={book.gallery ?? []} />

        <div className="animate-fade-up">
          <div className="mb-3 flex flex-wrap items-center gap-2">
            {book.is_bestseller && (
              <span className="badge bg-brand-500/10 text-brand-600 dark:text-brand-400">
                {t("book.bestSeller")}
              </span>
            )}
            {book.is_new_arrival && (
              <span className="badge bg-navy-900/5 text-navy-900/70 dark:bg-parchment-100/10 dark:text-parchment-100/70">
                {t("book.newArrival")}
              </span>
            )}
            <span
              className={`badge ${
                inStock
                  ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400"
                  : "bg-navy-900/5 text-navy-900/50 dark:bg-parchment-100/10 dark:text-parchment-100/50"
              }`}
            >
              {inStock ? t("book.inStock") : t("book.outOfStock")}
            </span>
          </div>

          <h1 className="heading-display text-3xl leading-tight sm:text-4xl">{title}</h1>
          <p className="mt-2 text-lg text-muted">
            {t("book.by")} {author}
          </p>

          {cats.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-2">
              {cats.map((c) => (
                <Link
                  key={c.id}
                  href={`/categories/${c.slug}`}
                  className="badge border border-navy-900/15 text-navy-900/70 transition-colors hover:border-brand-500 hover:text-brand-600 dark:border-parchment-100/20 dark:text-parchment-100/70 dark:hover:text-brand-400"
                >
                  {categoryName(c, locale)}
                </Link>
              ))}
            </div>
          )}

          <div className="mt-6">
            <Price book={book} className="text-3xl" />
            <p className="mt-1 text-xs text-muted">{t("book.currencyNote")}</p>
          </div>

          <div className="mt-7 space-y-3">
            <BookActions book={book} />
            {book.stock > 0 && contact.whatsapp && (
              <div>
                <WhatsAppOrderButton book={book} number={contact.whatsapp} className="w-full sm:w-auto" />
                <p className="mt-2 text-xs text-muted">{t("wa.note")}</p>
              </div>
            )}
          </div>

          {/* Description — back in its place, under the Add to cart button */}
          {description && (
            <div className="mt-9">
              <h2 className="mb-3 font-display text-lg font-semibold text-navy-950 dark:text-parchment-50">
                {t("book.aboutTitle")}
              </h2>
              <p className="whitespace-pre-line text-sm leading-relaxed text-navy-900/80 dark:text-parchment-100/80">
                {description}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Details only — centered and comfortably wide below the fold */}
      {shownFacts.length > 0 && (
        <div className="mx-auto mt-14 max-w-4xl">
          <h2 className="mb-5 text-center font-display text-2xl font-semibold text-navy-950 dark:text-parchment-50">
            {t("book.details")}
          </h2>
          <div className="card-surface grid gap-x-10 p-2 sm:grid-cols-2 sm:p-4">
            {[shownFacts.slice(0, mid), shownFacts.slice(mid)].map((col, i) => (
              <dl key={i} className="divide-y divide-navy-900/5 dark:divide-parchment-100/5">
                {col.map((fact) => (
                  <div
                    key={fact.label}
                    className="flex items-center justify-between px-4 py-3.5"
                  >
                    <dt className="text-sm text-muted">{fact.label}</dt>
                    <dd
                      className={`text-sm font-medium text-navy-950 dark:text-parchment-100 ${fact.ltr ? "force-ltr" : ""}`}
                    >
                      {fact.value}
                    </dd>
                  </div>
                ))}
              </dl>
            ))}
          </div>
        </div>
      )}

      {related.length > 0 && (
        <section className="mt-20">
          <SectionHeading
            eyebrow={t("book.relatedEyebrow")}
            title={t("book.relatedTitle")}
            href={book.category ? `/categories/${book.category.slug}` : "/search"}
            linkLabel={t("common.viewAll")}
          />
          <BookGrid books={related} emptyMessage={t("book.gridEmpty")} />
        </section>
      )}
    </div>
  );
}

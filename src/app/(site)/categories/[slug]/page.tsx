import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { BookGrid } from "@/components/store/book-grid";
import { getCategoryBySlug, getVisibleBooks } from "@/lib/data";
import { getLocaleT } from "@/lib/locale-server";
import { categoryName, categoryDescription } from "@/lib/localize";

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const { locale, t } = await getLocaleT();
  const category = await getCategoryBySlug(decodeURIComponent(slug));
  if (!category) notFound();

  const books = await getVisibleBooks({ categoryId: category.id });

  return (
    <div className="container-page py-14 sm:py-16">
      <Link
        href="/categories"
        className="mb-6 inline-flex items-center gap-1.5 text-sm font-medium text-muted transition-colors hover:text-brand-600 dark:hover:text-brand-400"
      >
        <ChevronLeft className="h-4 w-4 rtl:rotate-180" strokeWidth={1.75} />
        {t("cats.all")}
      </Link>
      <div className="mb-10 max-w-2xl animate-fade-up">
        <span className="section-eyebrow">{t("cats.categoryEyebrow")}</span>
        <h1 className="heading-display text-3xl sm:text-4xl">{categoryName(category, locale)}</h1>
        {categoryDescription(category, locale) && (
          <p className="mt-3 text-sm leading-relaxed text-muted sm:text-base">
            {categoryDescription(category, locale)}
          </p>
        )}
      </div>
      <BookGrid books={books} emptyMessage={t("cats.shelfEmpty")} />
    </div>
  );
}

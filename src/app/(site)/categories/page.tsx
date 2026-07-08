import Link from "next/link";
import { ArrowRight, BookOpen } from "lucide-react";
import { EmptyState } from "@/components/store/empty-state";
import { getActiveCategories } from "@/lib/data";
import { getLocaleT } from "@/lib/locale-server";
import { categoryName, categoryDescription } from "@/lib/localize";

export default async function CategoriesPage() {
  const { locale, t } = await getLocaleT();
  const categories = await getActiveCategories();

  return (
    <div className="container-page py-14 sm:py-16">
      <div className="mb-10 max-w-2xl animate-fade-up">
        <span className="section-eyebrow">{t("cats.eyebrow")}</span>
        <h1 className="heading-display text-3xl sm:text-4xl">{t("cats.title")}</h1>
        <p className="mt-3 text-sm leading-relaxed text-muted sm:text-base">{t("cats.desc")}</p>
      </div>

      {categories.length === 0 ? (
        <EmptyState message={t("cats.empty")} />
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((category, index) => (
            <Link
              key={category.id}
              href={`/categories/${category.slug}`}
              className="group card-surface-hover flex flex-col p-7 animate-fade-up"
              style={{ animationDelay: `${Math.min(index * 60, 360)}ms` }}
            >
              <span className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-500/10 text-brand-600 transition-transform duration-300 group-hover:scale-110 dark:text-brand-400">
                <BookOpen className="h-5 w-5" strokeWidth={1.5} />
              </span>
              <h2 className="font-display text-xl font-semibold text-navy-950 transition-colors group-hover:text-brand-600 dark:text-parchment-50 dark:group-hover:text-brand-400">
                {categoryName(category, locale)}
              </h2>
              {categoryDescription(category, locale) && (
                <p className="mt-2 text-sm leading-relaxed text-muted line-clamp-3">
                  {categoryDescription(category, locale)}
                </p>
              )}
              <span className="mt-5 inline-flex items-center gap-1.5 text-sm font-medium text-brand-600 dark:text-brand-400">
                {t("cats.browseShelf")}
                <ArrowRight
                  className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5 rtl:rotate-180 rtl:group-hover:-translate-x-0.5"
                  strokeWidth={1.75}
                />
              </span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

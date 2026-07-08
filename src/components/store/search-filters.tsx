"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { RotateCcw, SlidersHorizontal } from "lucide-react";
import { useLocale } from "@/components/providers/locale-provider";
import type { Category } from "@/lib/types";

export function SearchFilters({
  categories,
  languages,
}: {
  categories: Category[];
  languages: string[];
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { t } = useLocale();
  const [open, setOpen] = useState(false);

  function apply(formData: FormData) {
    const params = new URLSearchParams();
    for (const key of ["q", "category", "min", "max", "language", "availability", "sort"]) {
      const value = String(formData.get(key) ?? "").trim();
      if (value) params.set(key, value);
    }
    router.push(`/search?${params.toString()}`);
  }

  return (
    <aside>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="btn-outline mb-4 w-full lg:hidden"
        aria-expanded={open}
      >
        <SlidersHorizontal className="h-4 w-4" strokeWidth={1.75} />
        {t("search.filters")}
      </button>

      <form
        action={apply}
        className={`card-surface space-y-5 p-5 ${open ? "block" : "hidden lg:block"}`}
      >
        <div>
          <label htmlFor="filter-q" className="label-field">
            {t("search.keywords")}
          </label>
          <input
            id="filter-q"
            name="q"
            defaultValue={searchParams.get("q") ?? ""}
            placeholder={t("search.keywordsPh")}
            className="input-field"
          />
        </div>

        <div>
          <label htmlFor="filter-category" className="label-field">
            {t("search.category")}
          </label>
          <select
            id="filter-category"
            name="category"
            defaultValue={searchParams.get("category") ?? ""}
            className="input-field"
          >
            <option value="">{t("search.allCategories")}</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <span className="label-field">{t("search.priceRange")}</span>
          <div className="flex items-center gap-2">
            <input
              name="min"
              type="number"
              min="0"
              defaultValue={searchParams.get("min") ?? ""}
              placeholder={t("search.min")}
              aria-label={t("search.min")}
              className="input-field"
            />
            <span className="text-muted">–</span>
            <input
              name="max"
              type="number"
              min="0"
              defaultValue={searchParams.get("max") ?? ""}
              placeholder={t("search.max")}
              aria-label={t("search.max")}
              className="input-field"
            />
          </div>
        </div>

        {languages.length > 0 && (
          <div>
            <label htmlFor="filter-language" className="label-field">
              {t("search.language")}
            </label>
            <select
              id="filter-language"
              name="language"
              defaultValue={searchParams.get("language") ?? ""}
              className="input-field"
            >
              <option value="">{t("search.allLanguages")}</option>
              {languages.map((language) => (
                <option key={language} value={language}>
                  {language}
                </option>
              ))}
            </select>
          </div>
        )}

        <div>
          <label htmlFor="filter-availability" className="label-field">
            {t("search.availability")}
          </label>
          <select
            id="filter-availability"
            name="availability"
            defaultValue={searchParams.get("availability") ?? ""}
            className="input-field"
          >
            <option value="">{t("search.allBooks")}</option>
            <option value="in-stock">{t("search.inStockOnly")}</option>
          </select>
        </div>

        <div>
          <label htmlFor="filter-sort" className="label-field">
            {t("search.sortBy")}
          </label>
          <select
            id="filter-sort"
            name="sort"
            defaultValue={searchParams.get("sort") ?? "newest"}
            className="input-field"
          >
            <option value="newest">{t("search.newest")}</option>
            <option value="bestselling">{t("search.bestselling")}</option>
            <option value="price-asc">{t("search.priceAsc")}</option>
            <option value="price-desc">{t("search.priceDesc")}</option>
            <option value="title">{t("search.titleAz")}</option>
          </select>
        </div>

        <div className="flex gap-2 pt-1">
          <button type="submit" className="btn-primary flex-1">
            {t("search.apply")}
          </button>
          <button
            type="button"
            onClick={() => router.push("/search")}
            className="btn-ghost"
            aria-label={t("search.reset")}
          >
            <RotateCcw className="h-4 w-4" strokeWidth={1.75} />
          </button>
        </div>
      </form>
    </aside>
  );
}

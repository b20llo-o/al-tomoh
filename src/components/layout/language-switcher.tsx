"use client";

import { useLocale } from "@/components/providers/locale-provider";
import { LOCALES, type Locale } from "@/lib/i18n";
import { cn } from "@/lib/utils";

const LABELS: Record<Locale, string> = { ar: "عربي", en: "EN" };

export function LanguageSwitcher() {
  const { locale, setLocale } = useLocale();

  return (
    <div
      className="flex items-center rounded-xl border border-navy-900/10 p-0.5 dark:border-parchment-100/15"
      role="group"
      aria-label="Language"
    >
      {LOCALES.map((option) => (
        <button
          key={option}
          type="button"
          onClick={() => option !== locale && setLocale(option)}
          aria-pressed={locale === option}
          className={cn(
            "rounded-[10px] px-2.5 py-1 text-xs font-semibold transition-all duration-300",
            locale === option
              ? "bg-navy-900 text-parchment-50 shadow-sm dark:bg-parchment-100 dark:text-navy-950"
              : "text-navy-900/60 hover:text-navy-950 dark:text-parchment-100/60 dark:hover:text-parchment-50"
          )}
        >
          {LABELS[option]}
        </button>
      ))}
    </div>
  );
}

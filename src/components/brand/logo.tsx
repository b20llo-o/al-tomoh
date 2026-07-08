"use client";

import { useState } from "react";
import { useLocale } from "@/components/providers/locale-provider";
import { cn } from "@/lib/utils";

/**
 * The Al-Tomoh badge.
 *
 * It loads the real brand artwork from `public/logo.png`. Drop your exact logo
 * file there (or `public/logo.svg`) and it is used everywhere automatically.
 * Until a PNG is present it falls back to `public/logo.svg` (a vector rendition
 * of the mark), so the logo is never broken.
 */
export function LogoMark({ className }: { className?: string }) {
  const [src, setSrc] = useState("/logo.png");
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt="الطموح — Al-Tomoh"
      onError={() => {
        if (src !== "/logo.svg") setSrc("/logo.svg");
      }}
      className={cn("h-10 w-10 select-none rounded-[22%] object-contain", className)}
      draggable={false}
    />
  );
}

export function BrandWordmark({ compact = false }: { compact?: boolean }) {
  const { locale } = useLocale();
  const isAr = locale === "ar";

  return (
    <span className="flex items-center gap-3">
      <LogoMark className={compact ? "h-9 w-9" : "h-11 w-11"} />
      <span className="flex flex-col leading-none">
        <span
          className={cn(
            "font-display font-semibold tracking-tight text-navy-950 dark:text-parchment-50",
            compact ? "text-lg" : "text-xl"
          )}
        >
          {isAr ? "مكتبة الطموح" : "Al-Tomoh"}
        </span>
        {!compact && (
          <span className="mt-1 text-[10px] font-semibold uppercase tracking-[0.22em] text-brand-600 dark:text-brand-400">
            {isAr ? "" : "Bookstore"}
          </span>
        )}
      </span>
    </span>
  );
}

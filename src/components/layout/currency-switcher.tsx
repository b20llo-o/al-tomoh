"use client";

import { useCurrency } from "@/components/providers/currency-provider";
import { CURRENCIES } from "@/lib/currency";
import { cn } from "@/lib/utils";

export function CurrencySwitcher() {
  const { currency, setCurrency } = useCurrency();

  return (
    <div
      className="flex items-center rounded-xl border border-navy-900/10 p-0.5 dark:border-parchment-100/15"
      role="group"
      aria-label="Currency"
    >
      {CURRENCIES.map((option) => (
        <button
          key={option}
          type="button"
          onClick={() => setCurrency(option)}
          aria-pressed={currency === option}
          className={cn(
            "rounded-[10px] px-2.5 py-1 text-xs font-semibold tracking-wide transition-all duration-300",
            currency === option
              ? "bg-brand-500 text-white shadow-sm"
              : "text-navy-900/60 hover:text-navy-950 dark:text-parchment-100/60 dark:hover:text-parchment-50"
          )}
        >
          {option}
        </button>
      ))}
    </div>
  );
}

"use client";

import { useCurrency } from "@/components/providers/currency-provider";
import type { Book } from "@/lib/types";
import { cn } from "@/lib/utils";

export function Price({
  book,
  className,
}: {
  book: Pick<Book, "price_try" | "price_usd" | "discount_percent">;
  className?: string;
}) {
  const { priceOf, originalPriceOf } = useCurrency();
  const original = originalPriceOf(book);
  return (
    <span className="inline-flex flex-wrap items-baseline gap-x-2">
      <span className={cn("font-semibold text-brand-600 dark:text-brand-400", className)}>
        {priceOf(book)}
      </span>
      {original && (
        <span className="text-sm font-medium text-navy-900/40 line-through dark:text-parchment-100/40">
          {original}
        </span>
      )}
    </span>
  );
}

export function TryAmount({
  amountTry,
  className,
}: {
  amountTry: number;
  className?: string;
}) {
  const { formatTry } = useCurrency();
  return <span className={className}>{formatTry(amountTry)}</span>;
}

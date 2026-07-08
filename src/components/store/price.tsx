"use client";

import { useCurrency } from "@/components/providers/currency-provider";
import type { Book } from "@/lib/types";
import { cn } from "@/lib/utils";

export function Price({
  book,
  className,
}: {
  book: Pick<Book, "price_try" | "price_usd">;
  className?: string;
}) {
  const { priceOf } = useCurrency();
  return (
    <span className={cn("font-semibold text-brand-600 dark:text-brand-400", className)}>
      {priceOf(book)}
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

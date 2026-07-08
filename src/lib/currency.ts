import type { Book, Currency } from "./types";

export const CURRENCIES: Currency[] = ["TRY", "USD"];
export const DEFAULT_CURRENCY: Currency = "TRY";
export const CURRENCY_COOKIE = "altomoh-currency";
/** Fallback used only when store settings cannot be loaded */
export const FALLBACK_TRY_PER_USD = 34;

export function isCurrency(value: string | undefined | null): value is Currency {
  return value === "TRY" || value === "USD";
}

/**
 * Resolve a book's price in the requested currency.
 * Books always carry a TRY price; the USD price is either set explicitly
 * by the store admin or derived from the configured exchange rate.
 */
export function bookPrice(
  book: Pick<Book, "price_try" | "price_usd">,
  currency: Currency,
  tryPerUsd: number
): number {
  if (currency === "TRY") return book.price_try;
  if (book.price_usd != null && book.price_usd > 0) return book.price_usd;
  const rate = tryPerUsd > 0 ? tryPerUsd : FALLBACK_TRY_PER_USD;
  return round2(book.price_try / rate);
}

export function convertAmount(
  amountTry: number,
  currency: Currency,
  tryPerUsd: number
): number {
  if (currency === "TRY") return round2(amountTry);
  const rate = tryPerUsd > 0 ? tryPerUsd : FALLBACK_TRY_PER_USD;
  return round2(amountTry / rate);
}

export function formatPrice(amount: number, currency: Currency): string {
  return new Intl.NumberFormat(currency === "TRY" ? "tr-TR" : "en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function round2(value: number): number {
  return Math.round(value * 100) / 100;
}

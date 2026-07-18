import type { Book, Currency } from "./types";

export const CURRENCIES: Currency[] = ["SYP", "USD"];
export const DEFAULT_CURRENCY: Currency = "SYP";
export const CURRENCY_COOKIE = "altomoh-currency";
/** Fallback used only when store settings cannot be loaded (SYP per 1 USD) */
export const FALLBACK_SYP_PER_USD = 13000;

export function isCurrency(value: string | undefined | null): value is Currency {
  return value === "SYP" || value === "USD";
}

/**
 * Resolve a book's price in the requested currency.
 * Books always carry a base (Syrian Pound) price in `price_try`; the USD price
 * is either set explicitly by the store admin or derived from the configured
 * exchange rate. (The column is still named `price_try` for backwards data
 * compatibility, but it now holds the SYP amount.)
 */
/** The book's list price in the requested currency, BEFORE any discount. */
export function bookBasePrice(
  book: Pick<Book, "price_try" | "price_usd">,
  currency: Currency,
  sypPerUsd: number
): number {
  if (currency === "SYP") return book.price_try;
  if (book.price_usd != null && book.price_usd > 0) return book.price_usd;
  const rate = sypPerUsd > 0 ? sypPerUsd : FALLBACK_SYP_PER_USD;
  return round2(book.price_try / rate);
}

/** True when the book carries an active discount. */
export function hasDiscount(book: Pick<Book, "discount_percent">): boolean {
  return (book.discount_percent ?? 0) > 0;
}

/**
 * The price the customer actually pays in the requested currency, i.e. the list
 * price with any discount applied. This is what the cart, the WhatsApp order and
 * the headline price all use.
 */
export function bookPrice(
  book: Pick<Book, "price_try" | "price_usd" | "discount_percent">,
  currency: Currency,
  sypPerUsd: number
): number {
  const base = bookBasePrice(book, currency, sypPerUsd);
  const pct = book.discount_percent ?? 0;
  if (pct <= 0) return base;
  return round2(base * (1 - pct / 100));
}

export function convertAmount(
  amountSyp: number,
  currency: Currency,
  sypPerUsd: number
): number {
  if (currency === "SYP") return round2(amountSyp);
  const rate = sypPerUsd > 0 ? sypPerUsd : FALLBACK_SYP_PER_USD;
  return round2(amountSyp / rate);
}

export function formatPrice(amount: number, currency: Currency): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: currency === "SYP" ? 0 : 2,
    maximumFractionDigits: currency === "SYP" ? 0 : 2,
  }).format(amount);
}

export function round2(value: number): number {
  return Math.round(value * 100) / 100;
}

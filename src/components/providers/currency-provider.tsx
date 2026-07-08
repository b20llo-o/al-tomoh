"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  CURRENCY_COOKIE,
  DEFAULT_CURRENCY,
  bookPrice,
  convertAmount,
  formatPrice,
} from "@/lib/currency";
import type { Book, Currency } from "@/lib/types";

interface CurrencyContextValue {
  currency: Currency;
  setCurrency: (currency: Currency) => void;
  tryPerUsd: number;
  /** Format a book's price in the active currency */
  priceOf: (book: Pick<Book, "price_try" | "price_usd">) => string;
  /** Raw numeric price of a book in the active currency */
  amountOf: (book: Pick<Book, "price_try" | "price_usd">) => number;
  /** Convert and format an arbitrary TRY amount */
  formatTry: (amountTry: number) => string;
}

const CurrencyContext = createContext<CurrencyContextValue | null>(null);

export function CurrencyProvider({
  children,
  initialCurrency,
  tryPerUsd,
}: {
  children: ReactNode;
  initialCurrency: Currency;
  tryPerUsd: number;
}) {
  const [currency, setCurrencyState] = useState<Currency>(
    initialCurrency ?? DEFAULT_CURRENCY
  );

  const setCurrency = useCallback((next: Currency) => {
    setCurrencyState(next);
    // Remember the visitor's preference for a year.
    document.cookie = `${CURRENCY_COOKIE}=${next}; path=/; max-age=31536000; samesite=lax`;
  }, []);

  const value = useMemo<CurrencyContextValue>(
    () => ({
      currency,
      setCurrency,
      tryPerUsd,
      priceOf: (book) => formatPrice(bookPrice(book, currency, tryPerUsd), currency),
      amountOf: (book) => bookPrice(book, currency, tryPerUsd),
      formatTry: (amountTry) =>
        formatPrice(convertAmount(amountTry, currency, tryPerUsd), currency),
    }),
    [currency, setCurrency, tryPerUsd]
  );

  return <CurrencyContext.Provider value={value}>{children}</CurrencyContext.Provider>;
}

export function useCurrency(): CurrencyContextValue {
  const ctx = useContext(CurrencyContext);
  if (!ctx) throw new Error("useCurrency must be used within CurrencyProvider");
  return ctx;
}

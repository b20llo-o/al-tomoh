"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { CartLine } from "@/lib/types";

const CART_STORAGE_KEY = "altomoh-cart";
const MAX_QTY = 20;

interface CartContextValue {
  lines: CartLine[];
  count: number;
  addItem: (bookId: string, quantity?: number) => void;
  setQuantity: (bookId: string, quantity: number) => void;
  removeItem: (bookId: string) => void;
  clearCart: () => void;
  isReady: boolean;
}

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [lines, setLines] = useState<CartLine[]>([]);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(CART_STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as CartLine[];
        if (Array.isArray(parsed)) {
          setLines(
            parsed.filter(
              (l) => typeof l?.bookId === "string" && Number.isFinite(l?.quantity) && l.quantity > 0
            )
          );
        }
      }
    } catch {
      // Corrupt storage — start with an empty cart.
    }
    setIsReady(true);
  }, []);

  useEffect(() => {
    if (!isReady) return;
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(lines));
    } catch {
      // Storage unavailable (private mode) — cart lives in memory only.
    }
  }, [lines, isReady]);

  const addItem = useCallback((bookId: string, quantity = 1) => {
    setLines((prev) => {
      const existing = prev.find((l) => l.bookId === bookId);
      if (existing) {
        return prev.map((l) =>
          l.bookId === bookId
            ? { ...l, quantity: Math.min(MAX_QTY, l.quantity + quantity) }
            : l
        );
      }
      return [...prev, { bookId, quantity: Math.min(MAX_QTY, quantity) }];
    });
  }, []);

  const setQuantity = useCallback((bookId: string, quantity: number) => {
    setLines((prev) =>
      quantity <= 0
        ? prev.filter((l) => l.bookId !== bookId)
        : prev.map((l) =>
            l.bookId === bookId ? { ...l, quantity: Math.min(MAX_QTY, quantity) } : l
          )
    );
  }, []);

  const removeItem = useCallback((bookId: string) => {
    setLines((prev) => prev.filter((l) => l.bookId !== bookId));
  }, []);

  const clearCart = useCallback(() => setLines([]), []);

  const value = useMemo<CartContextValue>(
    () => ({
      lines,
      count: lines.reduce((sum, l) => sum + l.quantity, 0),
      addItem,
      setQuantity,
      removeItem,
      clearCart,
      isReady,
    }),
    [lines, addItem, setQuantity, removeItem, clearCart, isReady]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}

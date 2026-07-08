"use client";

import { useState } from "react";
import { Check, ShoppingBag } from "lucide-react";
import { useCart } from "@/components/providers/cart-provider";
import { useLocale } from "@/components/providers/locale-provider";

export function WishlistAddButton({
  bookId,
  inStock,
}: {
  bookId: string;
  inStock: boolean;
}) {
  const { addItem } = useCart();
  const { t } = useLocale();
  const [added, setAdded] = useState(false);

  return (
    <button
      type="button"
      disabled={!inStock}
      onClick={() => {
        addItem(bookId);
        setAdded(true);
        setTimeout(() => setAdded(false), 1500);
      }}
      className="btn-outline h-9 px-4 text-xs"
    >
      {added ? (
        <>
          <Check className="h-3.5 w-3.5" strokeWidth={2} />
          {t("common.added")}
        </>
      ) : (
        <>
          <ShoppingBag className="h-3.5 w-3.5" strokeWidth={1.75} />
          {inStock ? t("common.addToCart") : t("common.outOfStock")}
        </>
      )}
    </button>
  );
}

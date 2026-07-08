"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Check, Heart, Minus, Plus, ShoppingBag } from "lucide-react";
import { useCart } from "@/components/providers/cart-provider";
import { useLocale } from "@/components/providers/locale-provider";
import { createClient } from "@/lib/supabase/client";
import type { Book } from "@/lib/types";
import { cn } from "@/lib/utils";

export function BookActions({ book }: { book: Book }) {
  const router = useRouter();
  const { addItem } = useCart();
  const { t } = useLocale();
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);
  const [wishlisted, setWishlisted] = useState(false);
  const [wishlistBusy, setWishlistBusy] = useState(false);

  const inStock = book.stock > 0;

  // Resolve wishlist state client-side so the page itself renders instantly.
  useEffect(() => {
    let cancelled = false;
    const supabase = createClient();
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!session?.user || cancelled) return;
      const { data } = await supabase
        .from("wishlists")
        .select("id")
        .eq("user_id", session.user.id)
        .eq("book_id", book.id)
        .maybeSingle();
      if (!cancelled) setWishlisted(Boolean(data));
    });
    return () => {
      cancelled = true;
    };
  }, [book.id]);

  function handleAdd() {
    addItem(book.id, quantity);
    setAdded(true);
    window.setTimeout(() => setAdded(false), 1800);
  }

  async function toggleWishlist() {
    setWishlistBusy(true);
    try {
      const supabase = createClient();
      const {
        data: { session },
      } = await supabase.auth.getSession();
      const user = session?.user;
      if (!user) {
        router.push(`/login?next=/books/${book.slug}`);
        return;
      }
      if (wishlisted) {
        await supabase
          .from("wishlists")
          .delete()
          .eq("user_id", user.id)
          .eq("book_id", book.id);
        setWishlisted(false);
      } else {
        await supabase.from("wishlists").insert({ user_id: user.id, book_id: book.id });
        setWishlisted(true);
      }
    } finally {
      setWishlistBusy(false);
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-3">
      <div className="flex items-center rounded-xl border border-navy-900/15 dark:border-parchment-100/20">
        <button
          type="button"
          onClick={() => setQuantity((q) => Math.max(1, q - 1))}
          aria-label={t("book.decreaseQty")}
          className="flex h-11 w-10 items-center justify-center text-navy-900/70 transition-colors hover:text-brand-600 dark:text-parchment-100/70"
        >
          <Minus className="h-4 w-4" strokeWidth={1.75} />
        </button>
        <span className="w-8 text-center text-sm font-semibold" aria-live="polite">
          {quantity}
        </span>
        <button
          type="button"
          onClick={() => setQuantity((q) => Math.min(20, q + 1))}
          aria-label={t("book.increaseQty")}
          className="flex h-11 w-10 items-center justify-center text-navy-900/70 transition-colors hover:text-brand-600 dark:text-parchment-100/70"
        >
          <Plus className="h-4 w-4" strokeWidth={1.75} />
        </button>
      </div>

      <button
        type="button"
        onClick={handleAdd}
        disabled={!inStock}
        className="btn-primary h-11 min-w-44 flex-1 sm:flex-none"
      >
        {added ? (
          <>
            <Check className="h-4 w-4" strokeWidth={2} />
            {t("common.addedToCart")}
          </>
        ) : (
          <>
            <ShoppingBag className="h-4 w-4" strokeWidth={1.75} />
            {inStock ? t("common.addToCart") : t("common.outOfStock")}
          </>
        )}
      </button>

      <button
        type="button"
        onClick={toggleWishlist}
        disabled={wishlistBusy}
        aria-pressed={wishlisted}
        aria-label={wishlisted ? t("book.removeWishlist") : t("book.addWishlist")}
        className={cn(
          "flex h-11 w-11 items-center justify-center rounded-xl border transition-all duration-300",
          wishlisted
            ? "border-brand-500 bg-brand-500/10 text-brand-600 dark:text-brand-400"
            : "border-navy-900/15 text-navy-900/70 hover:border-brand-500 hover:text-brand-600 dark:border-parchment-100/20 dark:text-parchment-100/70 dark:hover:text-brand-400"
        )}
      >
        <Heart
          className="h-5 w-5"
          strokeWidth={1.75}
          fill={wishlisted ? "currentColor" : "none"}
        />
      </button>
    </div>
  );
}

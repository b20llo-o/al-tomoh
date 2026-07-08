import Link from "next/link";
import { Trash2 } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { BookCover } from "@/components/store/book-cover";
import { Price } from "@/components/store/price";
import { EmptyState } from "@/components/store/empty-state";
import { WishlistAddButton } from "@/components/account/wishlist-add-button";
import { removeFromWishlist } from "@/app/actions/account";
import { BOOK_SELECT } from "@/lib/queries";
import { getLocaleT } from "@/lib/locale-server";
import { bookAuthor, bookTitle } from "@/lib/localize";
import type { Book } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function WishlistPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const { locale, t } = await getLocaleT();

  const { data } = await supabase
    .from("wishlists")
    .select(`book:books(${BOOK_SELECT})`)
    .eq("user_id", user!.id)
    .order("created_at", { ascending: false });

  const books = ((data ?? [])
    .map((row) => row.book)
    .filter(Boolean) as unknown as Book[]).filter(
    (b) => b.is_visible && !b.is_deleted
  );

  if (books.length === 0) {
    return (
      <EmptyState
        message={t("acc.wishlistEmpty")}
        action={
          <Link href="/categories" className="btn-primary mt-2">
            {t("acc.discover")}
          </Link>
        }
      />
    );
  }

  return (
    <div className="space-y-4">
      {books.map((book) => (
        <div key={book.id} className="card-surface flex gap-4 p-4">
          <Link href={`/books/${book.slug}`} className="w-16 shrink-0 sm:w-20">
            <BookCover title={bookTitle(book, locale)} coverUrl={book.cover_url} sizes="80px" />
          </Link>
          <div className="flex flex-1 flex-col">
            <div className="flex items-start justify-between gap-3">
              <div>
                <Link
                  href={`/books/${book.slug}`}
                  className="font-display text-base font-semibold text-navy-950 hover:text-brand-600 dark:text-parchment-50 dark:hover:text-brand-400"
                >
                  {bookTitle(book, locale)}
                </Link>
                <p className="mt-0.5 text-sm text-muted">{bookAuthor(book, locale)}</p>
              </div>
              <form action={removeFromWishlist}>
                <input type="hidden" name="book_id" value={book.id} />
                <button
                  type="submit"
                  aria-label={t("common.remove")}
                  className="text-navy-900/40 transition-colors hover:text-red-600 dark:text-parchment-100/40"
                >
                  <Trash2 className="h-4 w-4" strokeWidth={1.75} />
                </button>
              </form>
            </div>
            <div className="mt-auto flex items-center justify-between pt-3">
              <Price book={book} />
              <WishlistAddButton bookId={book.id} inStock={book.stock > 0} />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

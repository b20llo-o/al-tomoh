"use client";

import { MessageCircle } from "lucide-react";
import { useCurrency } from "@/components/providers/currency-provider";
import { useLocale } from "@/components/providers/locale-provider";
import { bookAuthor, bookTitle } from "@/lib/localize";
import { orderBookMessage, siteUrl, waLink } from "@/lib/whatsapp";
import type { Book } from "@/lib/types";
import { cn } from "@/lib/utils";

/**
 * Opens a WhatsApp chat with the bookshop, pre-filled with this book. Ordering
 * and payment are arranged in the chat — the site takes no online payment.
 */
export function WhatsAppOrderButton({
  book,
  number,
  className,
}: {
  book: Book;
  number: string;
  className?: string;
}) {
  const { priceOf } = useCurrency();
  const { t, locale } = useLocale();

  const base = siteUrl();
  const message = orderBookMessage(
    {
      title: bookTitle(book, locale),
      author: bookAuthor(book, locale),
      price: priceOf(book),
      url: base ? `${base}/books/${book.slug}` : undefined,
    },
    locale
  );

  return (
    <a
      href={waLink(number, message)}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        "inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-[#25D366] px-6 font-semibold text-white shadow-sm transition-all duration-300 hover:bg-[#1eb856] hover:shadow-md active:scale-[0.98]",
        className
      )}
    >
      <MessageCircle className="h-[18px] w-[18px]" strokeWidth={2} />
      {t("wa.orderBook")}
    </a>
  );
}

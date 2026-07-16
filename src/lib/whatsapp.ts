import type { Locale } from "./i18n";

/**
 * Ordering happens over WhatsApp: the customer taps a button that opens a chat
 * with the store, pre-filled with the book(s) they want. No online payment is
 * taken on the site — the bookseller arranges payment and delivery in the chat.
 */

/** Build a wa.me link. `number` may contain spaces/+/dashes; only digits are kept. */
export function waLink(number: string, message: string): string {
  const digits = (number || "").replace(/[^0-9]/g, "");
  return `https://wa.me/${digits}?text=${encodeURIComponent(message)}`;
}

/** Absolute site URL (for links inside WhatsApp messages), or "" when unknown. */
export function siteUrl(): string {
  return (process.env.NEXT_PUBLIC_SITE_URL ?? "").replace(/\/$/, "");
}

interface OrderBookInput {
  title: string;
  author: string;
  price: string;
  url?: string;
}

/** Message for ordering a single book. */
export function orderBookMessage(book: OrderBookInput, locale: Locale): string {
  const lines =
    locale === "en"
      ? [
          "Hello Al-Tomoh Bookstore 👋",
          "I'd like to order this book:",
          "",
          `📚 ${book.title} — ${book.author}`,
          `💵 ${book.price}`,
        ]
      : [
          "مرحبًا مكتبة الطموح 👋",
          "أرغب في طلب هذا الكتاب:",
          "",
          `📚 ${book.title} — ${book.author}`,
          `💵 ${book.price}`,
        ];
  if (book.url) lines.push(book.url);
  return lines.join("\n");
}

interface OrderLine {
  title: string;
  author: string;
  quantity: number;
  price: string;
}

/** Message for ordering a whole cart. */
export function orderCartMessage(
  lines: OrderLine[],
  total: string,
  locale: Locale
): string {
  const header =
    locale === "en"
      ? ["Hello Al-Tomoh Bookstore 👋", "I'd like to order these books:", ""]
      : ["مرحبًا مكتبة الطموح 👋", "أرغب في طلب هذه الكتب:", ""];
  const items = lines.map(
    (l, i) => `${i + 1}. ${l.title} — ${l.author} ×${l.quantity} (${l.price})`
  );
  const footer =
    locale === "en" ? ["", `Total: ${total}`] : ["", `الإجمالي: ${total}`];
  return [...header, ...items, ...footer].join("\n");
}

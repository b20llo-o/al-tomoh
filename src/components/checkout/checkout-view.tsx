"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { CreditCard, Landmark, Loader2, Lock } from "lucide-react";
import { useCart } from "@/components/providers/cart-provider";
import { useCurrency } from "@/components/providers/currency-provider";
import { useLocale } from "@/components/providers/locale-provider";
import { BookCover } from "@/components/store/book-cover";
import { EmptyState } from "@/components/store/empty-state";
import { fetchCartBooks } from "@/lib/cart-books";
import { placeOrder } from "@/app/actions/checkout";
import { formatPrice, round2 } from "@/lib/currency";
import { bookTitle } from "@/lib/localize";
import type { Address, Book, StoreSettingsMap } from "@/lib/types";
import { cn } from "@/lib/utils";

export function CheckoutView({
  addresses,
  defaultName,
  defaultPhone,
  shippingSettings,
  paymentSettings,
}: {
  addresses: Address[];
  defaultName: string;
  defaultPhone: string;
  shippingSettings: StoreSettingsMap["shipping"];
  paymentSettings: StoreSettingsMap["payments"];
}) {
  const router = useRouter();
  const { lines, clearCart, isReady } = useCart();
  const { currency, amountOf, tryPerUsd } = useCurrency();
  const { t, locale } = useLocale();

  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [redirecting, setRedirecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const defaultAddress = addresses.find((a) => a.is_default) ?? addresses[0];

  const [form, setForm] = useState({
    full_name: defaultAddress?.full_name || defaultName,
    phone: defaultAddress?.phone || defaultPhone,
    country: defaultAddress?.country || (locale === "ar" ? "تركيا" : "Türkiye"),
    city: defaultAddress?.city || "",
    district: defaultAddress?.district || "",
    postal_code: defaultAddress?.postal_code || "",
    address_line: defaultAddress?.address_line || "",
    notes: "",
  });

  const [method, setMethod] = useState<"card" | "bank_transfer">(
    paymentSettings.enable_card_payments ? "card" : "bank_transfer"
  );

  const bookIds = useMemo(() => lines.map((l) => l.bookId), [lines]);

  useEffect(() => {
    if (!isReady) return;
    let cancelled = false;
    fetchCartBooks(bookIds).then((data) => {
      if (!cancelled) {
        setBooks(data);
        setLoading(false);
      }
    });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isReady, bookIds.join(",")]);

  const enriched = useMemo(
    () =>
      lines
        .map((line) => {
          const book = books.find((b) => b.id === line.bookId);
          return book ? { line, book } : null;
        })
        .filter((v): v is { line: (typeof lines)[number]; book: Book } => v !== null),
    [lines, books]
  );

  const subtotal = round2(
    enriched.reduce((sum, { line, book }) => sum + amountOf(book) * line.quantity, 0)
  );

  const isDomestic =
    form.country.trim().toLowerCase().startsWith("t") || form.country.includes("تركي");
  const threshold =
    currency === "TRY"
      ? shippingSettings.free_shipping_threshold_try
      : round2(shippingSettings.free_shipping_threshold_try / tryPerUsd);
  let shippingCost = 0;
  if (subtotal > 0 && subtotal < threshold) {
    if (isDomestic) {
      shippingCost =
        currency === "TRY"
          ? shippingSettings.domestic_flat_try
          : round2(shippingSettings.domestic_flat_try / tryPerUsd);
    } else {
      shippingCost =
        currency === "USD"
          ? shippingSettings.international_flat_usd
          : round2(shippingSettings.international_flat_usd * tryPerUsd);
    }
  }
  const total = round2(subtotal + shippingCost);

  function update<K extends keyof typeof form>(key: K, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const result = await placeOrder({
        lines,
        currency,
        shipping: {
          full_name: form.full_name,
          phone: form.phone,
          country: form.country,
          city: form.city,
          district: form.district,
          postal_code: form.postal_code,
          address_line: form.address_line,
        },
        payment_method: method,
        notes: form.notes,
      });

      if (result.success && result.paymentUrl) {
        // Card payment: hand over to iyzico's hosted secure page.
        clearCart();
        setRedirecting(true);
        window.location.assign(result.paymentUrl);
        return;
      }
      if (result.success && result.orderNumber) {
        clearCart();
        router.push(`/checkout/confirmation?order=${result.orderNumber}`);
        return;
      }
      setError(result.message ?? t("common.error"));
      setSubmitting(false);
    } catch {
      setError(t("common.error"));
      setSubmitting(false);
    }
  }

  if (!isReady || loading) {
    return <p className="text-sm text-muted">{t("co.preparing")}</p>;
  }

  if (redirecting) {
    return (
      <div className="card-surface flex flex-col items-center gap-4 p-16 text-center">
        <Loader2 className="h-8 w-8 animate-spin text-brand-500" strokeWidth={1.75} />
        <p className="text-sm text-muted">{t("co.redirecting")}</p>
      </div>
    );
  }

  if (enriched.length === 0) {
    return (
      <EmptyState
        message={t("co.empty")}
        action={
          <Link href="/categories" className="btn-primary mt-2">
            {t("common.browseCollection")}
          </Link>
        }
      />
    );
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-8 lg:grid-cols-[1fr_380px]">
      <div className="space-y-6">
        {/* Shipping information */}
        <section className="card-surface p-6 sm:p-8">
          <h2 className="mb-6 font-display text-xl font-semibold text-navy-950 dark:text-parchment-50">
            {t("co.shippingInfo")}
          </h2>
          <div className="grid gap-5 sm:grid-cols-2">
            <Field label={t("co.fullName")} required>
              <input
                required
                value={form.full_name}
                onChange={(e) => update("full_name", e.target.value)}
                className="input-field"
                autoComplete="name"
              />
            </Field>
            <Field label={t("co.phone")} required>
              <input
                required
                value={form.phone}
                onChange={(e) => update("phone", e.target.value)}
                className="input-field force-ltr"
                autoComplete="tel"
              />
            </Field>
            <Field label={t("co.country")} required>
              <input
                required
                value={form.country}
                onChange={(e) => update("country", e.target.value)}
                className="input-field"
                autoComplete="country-name"
              />
            </Field>
            <Field label={t("co.city")} required>
              <input
                required
                value={form.city}
                onChange={(e) => update("city", e.target.value)}
                className="input-field"
                autoComplete="address-level2"
              />
            </Field>
            <Field label={t("co.district")}>
              <input
                value={form.district}
                onChange={(e) => update("district", e.target.value)}
                className="input-field"
                autoComplete="address-level3"
              />
            </Field>
            <Field label={t("co.postalCode")}>
              <input
                value={form.postal_code}
                onChange={(e) => update("postal_code", e.target.value)}
                className="input-field"
                autoComplete="postal-code"
              />
            </Field>
            <div className="sm:col-span-2">
              <Field label={t("co.address")} required>
                <textarea
                  required
                  rows={2}
                  value={form.address_line}
                  onChange={(e) => update("address_line", e.target.value)}
                  className="input-field resize-y"
                  autoComplete="street-address"
                />
              </Field>
            </div>
            <div className="sm:col-span-2">
              <Field label={t("co.notes")}>
                <textarea
                  rows={2}
                  value={form.notes}
                  onChange={(e) => update("notes", e.target.value)}
                  className="input-field resize-y"
                  placeholder={t("co.notesPh")}
                />
              </Field>
            </div>
          </div>
        </section>

        {/* Payment */}
        <section className="card-surface p-6 sm:p-8">
          <h2 className="mb-6 font-display text-xl font-semibold text-navy-950 dark:text-parchment-50">
            {t("co.payment")}
          </h2>
          <div className="space-y-3">
            {paymentSettings.enable_card_payments && (
              <PaymentOption
                active={method === "card"}
                onSelect={() => setMethod("card")}
                icon={CreditCard}
                title={t("co.card")}
                description={t("co.cardDesc")}
              />
            )}
            {paymentSettings.enable_bank_transfer && (
              <PaymentOption
                active={method === "bank_transfer"}
                onSelect={() => setMethod("bank_transfer")}
                icon={Landmark}
                title={t("co.bank")}
                description={t("co.bankDesc")}
              />
            )}
          </div>
          {method === "bank_transfer" && (
            <p className="mt-4 rounded-xl bg-navy-900/5 px-4 py-3 text-xs leading-relaxed text-muted dark:bg-parchment-100/5">
              {paymentSettings.bank_transfer_instructions}
            </p>
          )}
          <p className="mt-5 flex items-center gap-2 text-xs text-muted">
            <Lock className="h-3.5 w-3.5" strokeWidth={1.75} />
            {t("co.secure")}
          </p>
        </section>
      </div>

      {/* Summary */}
      <aside className="lg:sticky lg:top-24 lg:self-start">
        <div className="card-surface p-6">
          <h2 className="mb-5 font-display text-lg font-semibold text-navy-950 dark:text-parchment-50">
            {t("co.yourOrder")}
          </h2>
          <ul className="mb-5 space-y-4">
            {enriched.map(({ line, book }) => (
              <li key={book.id} className="flex gap-3">
                <div className="w-12 shrink-0">
                  <BookCover title={bookTitle(book, locale)} coverUrl={book.cover_url} sizes="48px" />
                </div>
                <div className="flex flex-1 items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-navy-950 dark:text-parchment-100">
                      {bookTitle(book, locale)}
                    </p>
                    <p className="text-xs text-muted">
                      {t("common.qty")} {line.quantity}
                    </p>
                  </div>
                  <span className="text-sm font-medium">
                    {formatPrice(round2(amountOf(book) * line.quantity), currency)}
                  </span>
                </div>
              </li>
            ))}
          </ul>
          <dl className="space-y-2.5 border-t border-navy-900/10 pt-5 text-sm dark:border-parchment-100/10">
            <div className="flex justify-between">
              <dt className="text-muted">{t("common.subtotal")}</dt>
              <dd>{formatPrice(subtotal, currency)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted">{t("common.shipping")}</dt>
              <dd>{shippingCost === 0 ? t("common.free") : formatPrice(shippingCost, currency)}</dd>
            </div>
            <div className="flex justify-between border-t border-navy-900/10 pt-3 text-base font-semibold dark:border-parchment-100/10">
              <dt>{t("common.total")}</dt>
              <dd className="text-brand-600 dark:text-brand-400">
                {formatPrice(total, currency)}
              </dd>
            </div>
          </dl>

          {error && (
            <p role="alert" className="mt-4 rounded-xl bg-red-500/10 px-4 py-3 text-sm text-red-700 dark:text-red-400">
              {error}
            </p>
          )}

          <button type="submit" disabled={submitting} className="btn-primary mt-5 w-full py-3">
            {submitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" strokeWidth={1.75} />
                {t("co.placing")}
              </>
            ) : (
              <>
                <Lock className="h-4 w-4" strokeWidth={1.75} />
                {t("co.placeOrder")}
              </>
            )}
          </button>
        </div>
      </aside>
    </form>
  );
}

function Field({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="label-field">
        {label}
        {required && <span className="text-brand-500"> *</span>}
      </span>
      {children}
    </label>
  );
}

function PaymentOption({
  active,
  onSelect,
  icon: Icon,
  title,
  description,
}: {
  active: boolean;
  onSelect: () => void;
  icon: typeof CreditCard;
  title: string;
  description: string;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={active}
      className={cn(
        "flex w-full items-start gap-3 rounded-xl border p-4 text-start transition-all duration-300",
        active
          ? "border-brand-500 bg-brand-500/5"
          : "border-navy-900/15 hover:border-brand-500/50 dark:border-parchment-100/15"
      )}
    >
      <span
        className={cn(
          "mt-0.5 flex h-9 w-9 items-center justify-center rounded-lg",
          active
            ? "bg-brand-500 text-white"
            : "bg-navy-900/5 text-navy-900/60 dark:bg-parchment-100/10 dark:text-parchment-100/60"
        )}
      >
        <Icon className="h-4 w-4" strokeWidth={1.75} />
      </span>
      <span>
        <span className="block text-sm font-medium text-navy-950 dark:text-parchment-100">
          {title}
        </span>
        <span className="mt-0.5 block text-xs text-muted">{description}</span>
      </span>
    </button>
  );
}

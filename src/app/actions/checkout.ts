"use server";

import { headers } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { getStoreSetting } from "@/lib/data";
import { bookPrice, round2 } from "@/lib/currency";
import { generateOrderNumber } from "@/lib/utils";
import { getLocale, getLocaleT } from "@/lib/locale-server";
import {
  initializeCheckoutForm,
  iyzicoConfigured,
} from "@/lib/payments/iyzico";
import type { CartLine, Currency } from "@/lib/types";

export interface CheckoutInput {
  lines: CartLine[];
  currency: Currency;
  shipping: {
    full_name: string;
    phone: string;
    country: string;
    city: string;
    district: string;
    postal_code: string;
    address_line: string;
  };
  payment_method: "card" | "bank_transfer";
  notes: string;
}

export interface CheckoutResult {
  success: boolean;
  message?: string;
  orderNumber?: string;
  /** When set, the client must redirect here to complete the card payment. */
  paymentUrl?: string;
}

/**
 * Creates an order from a validated cart. Prices, stock, shipping, and tax are
 * all recomputed server-side from Supabase — nothing about money is trusted
 * from the browser. Card payments go through iyzico's hosted checkout form;
 * the order is only marked paid after the callback is verified server-side.
 */
export async function placeOrder(input: CheckoutInput): Promise<CheckoutResult> {
  const { t } = await getLocaleT();
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { success: false, message: t("co.errSignIn") };
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("is_suspended")
    .eq("id", user.id)
    .maybeSingle();
  if (profile?.is_suspended) {
    return { success: false, message: t("co.errSuspended") };
  }

  const s = input.shipping;
  if (
    !s.full_name.trim() ||
    !s.phone.trim() ||
    !s.country.trim() ||
    !s.city.trim() ||
    !s.address_line.trim()
  ) {
    return { success: false, message: t("co.errShipping") };
  }

  const validLines = input.lines.filter(
    (l) => typeof l.bookId === "string" && Number.isInteger(l.quantity) && l.quantity > 0
  );
  if (validLines.length === 0) {
    return { success: false, message: t("co.errEmpty") };
  }

  // Re-fetch every book from Supabase — the source of truth for price and stock.
  const { data: books, error: booksError } = await supabase
    .from("books")
    .select("id, title, author, price_try, price_usd, stock, is_visible, is_deleted, category:categories(name)")
    .in(
      "id",
      validLines.map((l) => l.bookId)
    );
  if (booksError || !books) {
    return { success: false, message: t("co.errVerify") };
  }

  const [currencySettings, shippingSettings, taxSettings, paymentSettings] =
    await Promise.all([
      getStoreSetting("currency"),
      getStoreSetting("shipping"),
      getStoreSetting("tax"),
      getStoreSetting("payments"),
    ]);
  const tryPerUsd = currencySettings.try_per_usd;

  const currency: Currency = input.currency === "USD" ? "USD" : "TRY";

  let subtotal = 0;
  const orderItems: {
    book_id: string;
    title: string;
    author: string;
    unit_price: number;
    quantity: number;
    category: string;
  }[] = [];

  for (const line of validLines) {
    const book = books.find((b) => b.id === line.bookId);
    if (!book || !book.is_visible || book.is_deleted) {
      return {
        success: false,
        message: t("co.errUnavailable"),
      };
    }
    if (book.stock < line.quantity) {
      return {
        success: false,
        message: t("co.errStock", { title: book.title, n: book.stock }),
      };
    }
    const unitPrice = bookPrice(book, currency, tryPerUsd);
    subtotal += unitPrice * line.quantity;
    orderItems.push({
      book_id: book.id,
      title: book.title,
      author: book.author,
      unit_price: unitPrice,
      quantity: line.quantity,
      category:
        (book.category as unknown as { name: string } | null)?.name ?? "Books",
    });
  }
  subtotal = round2(subtotal);

  // Shipping: flat domestic/international, waived above the free-shipping threshold.
  const isDomestic = isTurkiye(s.country);
  const thresholdInCurrency =
    currency === "TRY"
      ? shippingSettings.free_shipping_threshold_try
      : round2(shippingSettings.free_shipping_threshold_try / tryPerUsd);
  let shippingCost = 0;
  if (subtotal < thresholdInCurrency) {
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

  const taxAmount = taxSettings.prices_include_tax
    ? 0
    : round2((subtotal * taxSettings.vat_percent) / 100);

  const total = round2(subtotal + shippingCost + taxAmount);

  const method = input.payment_method === "bank_transfer" ? "bank_transfer" : "card";
  if (method === "card" && !paymentSettings.enable_card_payments) {
    return { success: false, message: t("co.errCardOff") };
  }
  if (method === "bank_transfer" && !paymentSettings.enable_bank_transfer) {
    return { success: false, message: t("co.errBankOff") };
  }

  const orderNumber = generateOrderNumber();

  // Create the order first (pending) so the payment always references a real order.
  const { data: order, error: orderError } = await supabase
    .from("orders")
    .insert({
      order_number: orderNumber,
      user_id: user.id,
      status: "pending",
      payment_status: "pending",
      payment_provider: method === "card" ? "iyzico" : "bank_transfer",
      payment_reference: null,
      currency,
      exchange_rate: tryPerUsd,
      subtotal,
      shipping_cost: shippingCost,
      tax_amount: taxAmount,
      total,
      shipping_full_name: s.full_name.trim(),
      shipping_phone: s.phone.trim(),
      shipping_country: s.country.trim(),
      shipping_city: s.city.trim(),
      shipping_district: s.district.trim() || null,
      shipping_postal_code: s.postal_code.trim() || null,
      shipping_address_line: s.address_line.trim(),
      notes: input.notes.trim() || null,
    })
    .select("id, order_number")
    .single();

  if (orderError || !order) {
    return { success: false, message: t("co.errCreate") };
  }

  const { error: itemsError } = await supabase.from("order_items").insert(
    orderItems.map(({ category: _c, ...item }) => ({ ...item, order_id: order.id }))
  );
  if (itemsError) {
    await supabase.from("orders").delete().eq("id", order.id);
    return { success: false, message: t("co.errCreate") };
  }

  // Reserve stock immediately.
  for (const item of orderItems) {
    const book = books.find((b) => b.id === item.book_id);
    if (book) {
      await supabase
        .from("books")
        .update({ stock: Math.max(0, book.stock - item.quantity) })
        .eq("id", item.book_id);
    }
  }

  // ── Bank transfer: done — ships once the admin confirms the payment. ──
  if (method === "bank_transfer") {
    return { success: true, orderNumber: order.order_number };
  }

  // ── Card payment through iyzico's hosted checkout form. ──
  if (!iyzicoConfigured()) {
    // No provider keys in this environment — keep the order pending rather
    // than pretending the card was charged.
    return {
      success: true,
      orderNumber: order.order_number,
      message: t("co.notConfigured"),
    };
  }

  const locale = await getLocale();
  const origin = await resolveOrigin();
  const nameParts = s.full_name.trim().split(/\s+/);
  const firstName = nameParts[0] ?? "Customer";
  const lastName = nameParts.slice(1).join(" ") || firstName;
  const requestHeaders = await headers();
  const clientIp =
    requestHeaders.get("x-forwarded-for")?.split(",")[0]?.trim() || "85.34.78.112";

  const init = await initializeCheckoutForm({
    conversationId: order.order_number,
    basketId: order.id,
    price: subtotal.toFixed(2),
    paidPrice: total.toFixed(2),
    currency,
    callbackUrl: `${origin}/api/payments/iyzico/callback`,
    locale: locale === "ar" ? "en" : "tr",
    buyer: {
      id: user.id,
      name: firstName,
      surname: lastName,
      email: user.email ?? "customer@altomoh.com",
      phone: s.phone.trim(),
      identityNumber: "74300864791",
      address: s.address_line.trim(),
      city: s.city.trim(),
      country: s.country.trim(),
      ip: clientIp,
    },
    address: {
      contactName: s.full_name.trim(),
      city: s.city.trim(),
      country: s.country.trim(),
      addressLine: s.address_line.trim(),
      zipCode: s.postal_code.trim() || undefined,
    },
    basketItems: orderItems.map((item) => ({
      id: item.book_id,
      name: item.title,
      category: item.category,
      price: round2(item.unit_price * item.quantity).toFixed(2),
    })),
  });

  if (init.status !== "success" || !init.token || !init.paymentPageUrl) {
    // Roll back the reservation so the customer can retry cleanly.
    for (const item of orderItems) {
      const book = books.find((b) => b.id === item.book_id);
      if (book) {
        await supabase.from("books").update({ stock: book.stock }).eq("id", item.book_id);
      }
    }
    await supabase.from("orders").delete().eq("id", order.id);
    return {
      success: false,
      message: init.errorMessage ?? t("co.errPayStart"),
    };
  }

  // Remember the iyzico token so the callback can find this order.
  await supabase
    .from("orders")
    .update({ payment_reference: init.token })
    .eq("id", order.id);

  return {
    success: true,
    orderNumber: order.order_number,
    paymentUrl: init.paymentPageUrl,
  };
}

function isTurkiye(country: string): boolean {
  const c = country.trim().toLowerCase();
  return (
    c.startsWith("t") || c.includes("تركيا") || c.includes("تركية") || c === "تر"
  );
}

async function resolveOrigin(): Promise<string> {
  const h = await headers();
  const explicit = process.env.NEXT_PUBLIC_SITE_URL;
  if (explicit) return explicit.replace(/\/$/, "");
  const proto = h.get("x-forwarded-proto") ?? "https";
  const host = h.get("x-forwarded-host") ?? h.get("host") ?? "localhost:3000";
  return `${proto === "http" && host.startsWith("localhost") ? "http" : proto}://${host}`;
}

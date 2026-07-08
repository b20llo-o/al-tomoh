"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowRight, Package, Search } from "lucide-react";
import {
  OrderStatusBadge,
  PaymentStatusBadge,
} from "@/components/store/order-status-badge";
import { useLocale } from "@/components/providers/locale-provider";
import type { MessageKey } from "@/lib/i18n";
import { formatPrice } from "@/lib/currency";
import { ADMIN_PATH } from "@/lib/defaults";
import type { Order, OrderItem, OrderStatus } from "@/lib/types";
import { cn } from "@/lib/utils";

const STATUS_FILTERS: (OrderStatus | "all")[] = [
  "all",
  "pending",
  "processing",
  "shipped",
  "delivered",
  "cancelled",
];

const STATUS_KEYS: Record<OrderStatus | "all", MessageKey> = {
  all: "adm.all",
  pending: "status.pending",
  processing: "status.processing",
  shipped: "status.shipped",
  delivered: "status.delivered",
  cancelled: "status.cancelled",
};

export function OrdersTable({
  orders,
}: {
  orders: (Order & { order_items: OrderItem[] })[];
}) {
  const { t, locale } = useLocale();
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<OrderStatus | "all">("all");

  const filtered = orders.filter((order) => {
    if (status !== "all" && order.status !== status) return false;
    if (query) {
      const q = query.toLowerCase();
      return (
        order.order_number.toLowerCase().includes(q) ||
        order.shipping_full_name.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const dateFmt = (iso: string) =>
    new Date(iso).toLocaleDateString(locale === "ar" ? "ar-EG" : "en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });

  return (
    <div>
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-1.5">
          {STATUS_FILTERS.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setStatus(s)}
              className={cn(
                "rounded-full px-3.5 py-1.5 text-xs font-medium transition-colors",
                status === s
                  ? "bg-brand-500 text-white shadow-sm"
                  : "bg-navy-900/5 text-navy-900/60 hover:text-navy-950 dark:bg-parchment-100/10 dark:text-parchment-100/60 dark:hover:text-parchment-50"
              )}
            >
              {t(STATUS_KEYS[s])}
            </button>
          ))}
        </div>
        <div className="relative">
          <Search className="pointer-events-none absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-navy-900/40 dark:text-parchment-100/40" strokeWidth={1.75} />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t("adm.searchOrders")}
            className="input-field w-64 ps-9"
          />
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="card-surface flex flex-col items-center gap-3 py-16 text-center">
          <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-500/10 text-brand-600 dark:text-brand-400">
            <Package className="h-5 w-5" strokeWidth={1.5} />
          </span>
          <p className="text-sm text-muted">{t("adm.noOrdersView")}</p>
        </div>
      ) : (
        <div className="grid gap-3">
          {filtered.map((order) => {
            const count = order.order_items.reduce((sum, i) => sum + i.quantity, 0);
            return (
              <Link
                key={order.id}
                href={`${ADMIN_PATH}/orders/${order.id}`}
                className="group card-surface-hover flex flex-wrap items-center gap-4 p-4 sm:p-5"
              >
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-500/10 text-brand-600 dark:text-brand-400">
                  <Package className="h-5 w-5" strokeWidth={1.6} />
                </span>

                <div className="min-w-[9rem] flex-1">
                  <p className="force-ltr font-display text-sm font-semibold text-navy-950 dark:text-parchment-50">
                    {order.order_number}
                  </p>
                  <p className="mt-0.5 text-xs text-muted">
                    {order.shipping_full_name} · {count} {count === 1 ? t("acc.book") : t("acc.books")}
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-1.5">
                  <OrderStatusBadge status={order.status} />
                  <PaymentStatusBadge status={order.payment_status} />
                </div>

                <div className="text-end">
                  <p className="font-semibold text-brand-600 dark:text-brand-400">
                    {formatPrice(order.total, order.currency)}
                  </p>
                  <p className="text-xs text-muted">{dateFmt(order.created_at)}</p>
                </div>

                <span className="hidden items-center gap-1 text-sm font-medium text-muted transition-colors group-hover:text-brand-600 dark:group-hover:text-brand-400 sm:inline-flex">
                  {t("adm.manage")}
                  <ArrowRight
                    className="h-4 w-4 transition-transform group-hover:translate-x-0.5 rtl:rotate-180 rtl:group-hover:-translate-x-0.5"
                    strokeWidth={1.75}
                  />
                </span>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}

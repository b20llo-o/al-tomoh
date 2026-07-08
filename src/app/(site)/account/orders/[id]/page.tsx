import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft, MapPin, Printer, Truck } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import {
  OrderStatusBadge,
  PaymentStatusBadge,
} from "@/components/store/order-status-badge";
import { OrderTimeline } from "@/components/account/order-timeline";
import { formatPrice } from "@/lib/currency";
import { formatDate } from "@/lib/utils";
import { getLocaleT } from "@/lib/locale-server";
import type { Order, OrderItem } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function OrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const { t } = await getLocaleT();

  const { data } = await supabase
    .from("orders")
    .select("*, order_items(*)")
    .eq("id", id)
    .eq("user_id", user!.id)
    .maybeSingle();

  if (!data) notFound();
  const order = data as Order & { order_items: OrderItem[] };

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <Link
          href="/account/orders"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-muted transition-colors hover:text-brand-600 dark:hover:text-brand-400"
        >
          <ChevronLeft className="h-4 w-4 rtl:rotate-180" strokeWidth={1.75} />
          {t("acc.allOrders")}
        </Link>
        <Link
          href={`/account/orders/${order.id}/invoice`}
          className="btn-outline h-9 px-4 text-xs"
        >
          <Printer className="h-4 w-4" strokeWidth={1.75} />
          {t("acc.viewInvoice")}
        </Link>
      </div>

      <div className="card-surface p-6 sm:p-8">
        <div className="flex flex-wrap items-start justify-between gap-4 border-b border-navy-900/10 pb-6 dark:border-parchment-100/10">
          <div>
            <h2 className="force-ltr font-display text-2xl font-semibold text-navy-950 dark:text-parchment-50">
              {order.order_number}
            </h2>
            <p className="mt-1 text-sm text-muted">
              {t("conf.placedOn")}: {formatDate(order.created_at)}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <OrderStatusBadge status={order.status} />
            <PaymentStatusBadge status={order.payment_status} />
          </div>
        </div>

        <div className="py-6">
          <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-muted">
            {t("acc.progress")}
          </h3>
          <OrderTimeline status={order.status} />
        </div>

        {order.tracking_number && (
          <div className="mb-6 flex items-center gap-3 rounded-xl bg-brand-500/5 px-4 py-3">
            <Truck className="h-5 w-5 text-brand-600 dark:text-brand-400" strokeWidth={1.75} />
            <div>
              <p className="text-xs uppercase tracking-wider text-muted">
                {t("acc.trackingNumber")}
              </p>
              <p className="force-ltr text-sm font-medium text-navy-950 dark:text-parchment-100">
                {order.tracking_number}
              </p>
            </div>
          </div>
        )}

        <ul className="divide-y divide-navy-900/5 border-t border-navy-900/10 dark:divide-parchment-100/5 dark:border-parchment-100/10">
          {order.order_items.map((item) => (
            <li key={item.id} className="flex items-center justify-between gap-4 py-4">
              <div>
                <p className="text-sm font-medium text-navy-950 dark:text-parchment-100">
                  {item.title}
                </p>
                <p className="text-xs text-muted">
                  {item.author} · {formatPrice(item.unit_price, order.currency)} × {item.quantity}
                </p>
              </div>
              <span className="text-sm font-medium">
                {formatPrice(item.unit_price * item.quantity, order.currency)}
              </span>
            </li>
          ))}
        </ul>

        <div className="grid gap-6 border-t border-navy-900/10 pt-6 dark:border-parchment-100/10 sm:grid-cols-2">
          <div>
            <h3 className="mb-2 flex items-center gap-2 text-sm font-semibold text-navy-950 dark:text-parchment-100">
              <MapPin className="h-4 w-4 text-brand-500" strokeWidth={1.75} />
              {t("acc.shippingAddress")}
            </h3>
            <address className="text-sm not-italic leading-relaxed text-muted">
              {order.shipping_full_name}
              <br />
              {order.shipping_address_line}
              <br />
              {[order.shipping_district, order.shipping_city, order.shipping_postal_code]
                .filter(Boolean)
                .join(", ")}
              <br />
              {order.shipping_country}
              <br />
              <span className="force-ltr">{order.shipping_phone}</span>
            </address>
          </div>
          <div>
            <dl className="space-y-2 text-sm">
              <div className="flex justify-between">
                <dt className="text-muted">{t("common.subtotal")}</dt>
                <dd>{formatPrice(order.subtotal, order.currency)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted">{t("common.shipping")}</dt>
                <dd>
                  {order.shipping_cost === 0
                    ? t("common.free")
                    : formatPrice(order.shipping_cost, order.currency)}
                </dd>
              </div>
              {order.tax_amount > 0 && (
                <div className="flex justify-between">
                  <dt className="text-muted">{t("common.tax")}</dt>
                  <dd>{formatPrice(order.tax_amount, order.currency)}</dd>
                </div>
              )}
              <div className="flex justify-between border-t border-navy-900/10 pt-2 text-base font-semibold dark:border-parchment-100/10">
                <dt>{t("common.total")}</dt>
                <dd className="text-brand-600 dark:text-brand-400">
                  {formatPrice(order.total, order.currency)}
                </dd>
              </div>
            </dl>
          </div>
        </div>
      </div>
    </div>
  );
}

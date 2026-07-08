import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft, Printer } from "lucide-react";
import { PageHeader } from "@/components/admin/page-header";
import { OrderManager } from "@/components/admin/order-manager";
import { createClient } from "@/lib/supabase/server";
import { formatPrice } from "@/lib/currency";
import { formatDateTime } from "@/lib/utils";
import { getLocaleT } from "@/lib/locale-server";
import { ADMIN_PATH } from "@/lib/defaults";
import type { Order, OrderItem } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function AdminOrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const { t } = await getLocaleT();

  // Note: we do NOT embed profiles here — orders.user_id references auth.users,
  // not public.profiles, so PostgREST cannot resolve that relationship. All the
  // customer details we need are already denormalized onto the order.
  const { data } = await supabase
    .from("orders")
    .select("*, order_items(*)")
    .eq("id", id)
    .maybeSingle();

  if (!data) notFound();
  const order = data as Order & { order_items: OrderItem[] };

  return (
    <div>
      <Link
        href={`${ADMIN_PATH}/orders`}
        className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-muted hover:text-brand-600 dark:hover:text-brand-400"
      >
        <ChevronLeft className="h-4 w-4 rtl:rotate-180" strokeWidth={1.75} />
        {t("acc.allOrders")}
      </Link>
      <PageHeader
        title={order.order_number}
        description={`${t("adm.placed")} ${formatDateTime(order.created_at)}`}
        action={
          <Link href={`${ADMIN_PATH}/orders/${order.id}/invoice`} className="btn-outline">
            <Printer className="h-4 w-4" strokeWidth={1.75} />
            {t("adm.invoice")}
          </Link>
        }
      />

      <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
        <div className="space-y-6">
          <div className="card-surface p-6">
            <h2 className="mb-4 font-display text-lg font-semibold text-navy-950 dark:text-parchment-50">
              {t("adm.items")}
            </h2>
            <ul className="divide-y divide-navy-900/5 dark:divide-parchment-100/5">
              {order.order_items.map((item) => (
                <li key={item.id} className="flex items-center justify-between gap-4 py-3">
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
            <dl className="mt-4 space-y-2 border-t border-navy-900/10 pt-4 text-sm dark:border-parchment-100/10">
              <Row label={t("common.subtotal")} value={formatPrice(order.subtotal, order.currency)} />
              <Row
                label={t("common.shipping")}
                value={order.shipping_cost === 0 ? t("common.free") : formatPrice(order.shipping_cost, order.currency)}
              />
              {order.tax_amount > 0 && (
                <Row label={t("common.tax")} value={formatPrice(order.tax_amount, order.currency)} />
              )}
              <div className="flex justify-between border-t border-navy-900/10 pt-2 text-base font-semibold dark:border-parchment-100/10">
                <dt>{t("common.total")}</dt>
                <dd className="text-brand-600 dark:text-brand-400">
                  {formatPrice(order.total, order.currency)}
                </dd>
              </div>
            </dl>
          </div>

          <div className="card-surface p-6">
            <h2 className="mb-4 font-display text-lg font-semibold text-navy-950 dark:text-parchment-50">
              {t("adm.shippingDetails")}
            </h2>
            <address className="text-sm not-italic leading-relaxed text-muted">
              <span className="font-medium text-navy-950 dark:text-parchment-100">
                {order.shipping_full_name}
              </span>
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
            {order.notes && (
              <p className="mt-4 rounded-xl bg-navy-900/5 px-4 py-3 text-xs text-muted dark:bg-parchment-100/5">
                <span className="font-medium">{t("adm.customerNote")}:</span> {order.notes}
              </p>
            )}
          </div>
        </div>

        <OrderManager order={order} />
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between">
      <dt className="text-muted">{label}</dt>
      <dd>{value}</dd>
    </div>
  );
}

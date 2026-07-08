import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { EmptyState } from "@/components/store/empty-state";
import {
  OrderStatusBadge,
  PaymentStatusBadge,
} from "@/components/store/order-status-badge";
import { formatPrice } from "@/lib/currency";
import { formatDate } from "@/lib/utils";
import { getLocaleT } from "@/lib/locale-server";
import type { Order, OrderItem } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function OrdersPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const { t } = await getLocaleT();

  const { data } = await supabase
    .from("orders")
    .select("*, order_items(id, quantity)")
    .eq("user_id", user!.id)
    .order("created_at", { ascending: false });

  const orders = (data as (Order & { order_items: OrderItem[] })[]) ?? [];

  if (orders.length === 0) {
    return (
      <EmptyState
        message={t("acc.ordersEmpty")}
        action={
          <Link href="/categories" className="btn-primary mt-2">
            {t("acc.startBrowsing")}
          </Link>
        }
      />
    );
  }

  return (
    <div className="space-y-4">
      {orders.map((order) => {
        const itemCount = order.order_items.reduce((sum, i) => sum + i.quantity, 0);
        return (
          <Link
            key={order.id}
            href={`/account/orders/${order.id}`}
            className="group card-surface-hover block p-5 sm:p-6"
          >
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="force-ltr font-display text-base font-semibold text-navy-950 dark:text-parchment-50">
                  {order.order_number}
                </p>
                <p className="mt-0.5 text-sm text-muted">
                  {formatDate(order.created_at)} · {itemCount}{" "}
                  {itemCount === 1 ? t("acc.book") : t("acc.books")}
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <OrderStatusBadge status={order.status} />
                  <PaymentStatusBadge status={order.payment_status} />
                </div>
              </div>
              <div className="text-end">
                <p className="font-semibold text-brand-600 dark:text-brand-400">
                  {formatPrice(order.total, order.currency)}
                </p>
                <span className="mt-2 inline-flex items-center gap-1 text-sm font-medium text-muted transition-colors group-hover:text-brand-600 dark:group-hover:text-brand-400">
                  {t("acc.viewDetails")}
                  <ArrowRight
                    className="h-4 w-4 transition-transform group-hover:translate-x-0.5 rtl:rotate-180 rtl:group-hover:-translate-x-0.5"
                    strokeWidth={1.75}
                  />
                </span>
              </div>
            </div>
          </Link>
        );
      })}
    </div>
  );
}

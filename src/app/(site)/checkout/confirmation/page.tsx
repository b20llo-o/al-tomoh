import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { AlertTriangle, CheckCircle2, Package, Receipt } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { formatPrice } from "@/lib/currency";
import { formatDate } from "@/lib/utils";
import { getLocaleT } from "@/lib/locale-server";
import type { Order, OrderItem } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function ConfirmationPage({
  searchParams,
}: {
  searchParams: Promise<{ order?: string; payment?: string }>;
}) {
  const { order: orderNumber } = await searchParams;
  if (!orderNumber) notFound();

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { t } = await getLocaleT();

  const { data: order } = await supabase
    .from("orders")
    .select("*, order_items(*)")
    .eq("order_number", orderNumber)
    .eq("user_id", user.id)
    .maybeSingle();

  if (!order) notFound();
  const typedOrder = order as Order & { order_items: OrderItem[] };
  const failed = typedOrder.payment_status === "failed";
  const pending = typedOrder.payment_status === "pending";

  return (
    <div className="container-page py-14 sm:py-20">
      <div className="mx-auto max-w-2xl">
        <div className="flex flex-col items-center text-center animate-fade-up">
          <span
            className={`mb-6 flex h-16 w-16 items-center justify-center rounded-2xl ${
              failed
                ? "bg-red-500/10 text-red-600 dark:text-red-400"
                : "bg-brand-500/10 text-brand-600 dark:text-brand-400"
            }`}
          >
            {failed ? (
              <AlertTriangle className="h-8 w-8" strokeWidth={1.5} />
            ) : (
              <CheckCircle2 className="h-8 w-8" strokeWidth={1.5} />
            )}
          </span>
          <span className="section-eyebrow">{failed ? "" : t("conf.thanks")}</span>
          <h1 className="heading-display text-3xl sm:text-4xl">
            {failed ? t("conf.failedTitle") : t("conf.title")}
          </h1>
          <p className="mt-3 max-w-md text-sm leading-relaxed text-muted">
            {failed ? t("conf.failedNote") : t("conf.desc")}
          </p>
        </div>

        <div className="card-surface mt-10 p-6 sm:p-8 animate-fade-up animation-delay-100">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-navy-900/10 pb-5 dark:border-parchment-100/10">
            <div>
              <p className="text-xs uppercase tracking-wider text-muted">
                {t("conf.orderNumber")}
              </p>
              <p className="force-ltr font-display text-lg font-semibold text-navy-950 dark:text-parchment-50">
                {typedOrder.order_number}
              </p>
            </div>
            <div className="text-end">
              <p className="text-xs uppercase tracking-wider text-muted">{t("conf.placedOn")}</p>
              <p className="text-sm font-medium">{formatDate(typedOrder.created_at)}</p>
            </div>
          </div>

          <ul className="divide-y divide-navy-900/5 py-4 dark:divide-parchment-100/5">
            {typedOrder.order_items.map((item) => (
              <li key={item.id} className="flex items-center justify-between gap-4 py-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-navy-950 dark:text-parchment-100">
                    {item.title}
                  </p>
                  <p className="text-xs text-muted">
                    {item.author} · {t("common.qty")} {item.quantity}
                  </p>
                </div>
                <span className="text-sm font-medium">
                  {formatPrice(item.unit_price * item.quantity, typedOrder.currency)}
                </span>
              </li>
            ))}
          </ul>

          <dl className="space-y-2 border-t border-navy-900/10 pt-4 text-sm dark:border-parchment-100/10">
            <Row
              label={t("common.subtotal")}
              value={formatPrice(typedOrder.subtotal, typedOrder.currency)}
            />
            <Row
              label={t("common.shipping")}
              value={
                typedOrder.shipping_cost === 0
                  ? t("common.free")
                  : formatPrice(typedOrder.shipping_cost, typedOrder.currency)
              }
            />
            {typedOrder.tax_amount > 0 && (
              <Row
                label={t("common.tax")}
                value={formatPrice(typedOrder.tax_amount, typedOrder.currency)}
              />
            )}
            <div className="flex justify-between border-t border-navy-900/10 pt-3 text-base font-semibold dark:border-parchment-100/10">
              <dt>{t("common.total")}</dt>
              <dd className="text-brand-600 dark:text-brand-400">
                {formatPrice(typedOrder.total, typedOrder.currency)}
              </dd>
            </div>
          </dl>

          {pending && !failed && (
            <p className="mt-5 rounded-xl bg-navy-900/5 px-4 py-3 text-xs leading-relaxed text-muted dark:bg-parchment-100/5">
              {t("conf.pendingNote")}
            </p>
          )}
        </div>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-3 animate-fade-up animation-delay-200">
          <Link href={`/account/orders/${typedOrder.id}`} className="btn-primary">
            <Package className="h-4 w-4" strokeWidth={1.75} />
            {t("conf.track")}
          </Link>
          <Link href="/account/orders" className="btn-outline">
            <Receipt className="h-4 w-4" strokeWidth={1.75} />
            {t("conf.history")}
          </Link>
        </div>
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

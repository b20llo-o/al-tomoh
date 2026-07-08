import { LogoMark } from "@/components/brand/logo";
import { formatPrice } from "@/lib/currency";
import { formatDate } from "@/lib/utils";
import { getLocaleT } from "@/lib/locale-server";
import type { Order, OrderItem } from "@/lib/types";
import { PrintButton } from "./print-button";

/**
 * Printable invoice, rendered on its own so both the customer and the host
 * console can reuse it. Uses print styles so the browser's print dialog
 * produces a clean PDF.
 */
export async function Invoice({
  order,
  contact,
}: {
  order: Order & { order_items: OrderItem[] };
  contact: { email: string; phone: string; address: string };
}) {
  const { t } = await getLocaleT();

  return (
    <div className="container-page py-10">
      <div className="no-print mb-6 flex items-center justify-between">
        <p className="text-sm text-muted">
          {t("inv.for")} <span className="force-ltr">{order.order_number}</span>
        </p>
        <PrintButton />
      </div>

      <div className="print-area card-surface mx-auto max-w-3xl p-8 sm:p-12">
        <div className="flex items-start justify-between border-b border-navy-900/10 pb-8 dark:border-parchment-100/10">
          <div>
            <LogoMark className="h-12 w-12" />
            <p className="mt-3 font-display text-lg font-semibold text-navy-950 dark:text-parchment-50">
              Al-Tomoh — الطموح
            </p>
            <p className="mt-1 max-w-xs text-xs leading-relaxed text-muted">{contact.address}</p>
            <p className="force-ltr text-xs text-muted">
              {contact.email} · {contact.phone}
            </p>
          </div>
          <div className="text-end">
            <p className="font-display text-2xl font-semibold text-navy-950 dark:text-parchment-50">
              {t("inv.invoice")}
            </p>
            <p className="force-ltr mt-1 text-sm text-muted">{order.order_number}</p>
            <p className="text-sm text-muted">{formatDate(order.created_at)}</p>
          </div>
        </div>

        <div className="grid gap-6 py-8 sm:grid-cols-2">
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted">
              {t("inv.billedTo")}
            </p>
            <p className="text-sm font-medium text-navy-950 dark:text-parchment-100">
              {order.shipping_full_name}
            </p>
            <p className="text-sm leading-relaxed text-muted">
              {order.shipping_address_line}
              <br />
              {[order.shipping_district, order.shipping_city, order.shipping_postal_code]
                .filter(Boolean)
                .join(", ")}
              <br />
              {order.shipping_country}
            </p>
          </div>
          <div className="sm:text-end">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted">
              {t("inv.payment")}
            </p>
            <p className="text-sm text-navy-950 dark:text-parchment-100">
              {t(`status.${order.payment_status === "paid" ? "paid" : order.payment_status === "failed" ? "paymentFailed" : order.payment_status === "refunded" ? "paymentRefunded" : "paymentPending"}`)}
              {order.payment_provider ? ` · ${order.payment_provider}` : ""}
            </p>
            <p className="text-sm text-muted">
              {t("inv.status")}: {t(`status.${order.status}`)}
            </p>
          </div>
        </div>

        <table className="w-full text-sm">
          <thead>
            <tr className="border-y border-navy-900/10 text-start text-xs uppercase tracking-wider text-muted dark:border-parchment-100/10">
              <th className="py-3 text-start font-semibold">{t("inv.book")}</th>
              <th className="py-3 text-center font-semibold">{t("inv.qty")}</th>
              <th className="py-3 text-end font-semibold">{t("inv.unit")}</th>
              <th className="py-3 text-end font-semibold">{t("inv.amount")}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-navy-900/5 dark:divide-parchment-100/5">
            {order.order_items.map((item) => (
              <tr key={item.id}>
                <td className="py-3">
                  <span className="font-medium text-navy-950 dark:text-parchment-100">
                    {item.title}
                  </span>
                  {item.author && <span className="block text-xs text-muted">{item.author}</span>}
                </td>
                <td className="py-3 text-center">{item.quantity}</td>
                <td className="py-3 text-end">
                  {formatPrice(item.unit_price, order.currency)}
                </td>
                <td className="py-3 text-end font-medium">
                  {formatPrice(item.unit_price * item.quantity, order.currency)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="mt-6 flex justify-end">
          <dl className="w-full max-w-xs space-y-2 text-sm">
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

        <p className="mt-10 border-t border-navy-900/10 pt-6 text-center text-xs text-muted dark:border-parchment-100/10">
          {t("inv.thanks")}
        </p>
      </div>
    </div>
  );
}

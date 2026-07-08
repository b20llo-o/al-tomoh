"use client";

import { useActionState } from "react";
import { Save } from "lucide-react";
import { updateOrder, type AdminResult } from "@/app/actions/admin";
import { useLocale } from "@/components/providers/locale-provider";
import type { MessageKey } from "@/lib/i18n";
import type { Order, OrderStatus, PaymentStatus } from "@/lib/types";

const ORDER_STATUS_KEYS: Record<OrderStatus, MessageKey> = {
  pending: "status.pending",
  processing: "status.processing",
  shipped: "status.shipped",
  delivered: "status.delivered",
  cancelled: "status.cancelled",
};

const PAYMENT_STATUS_KEYS: Record<PaymentStatus, MessageKey> = {
  pending: "status.pending",
  paid: "status.paid",
  failed: "status.paymentFailed",
  refunded: "status.paymentRefunded",
};

const ORDER_STATUSES: OrderStatus[] = [
  "pending",
  "processing",
  "shipped",
  "delivered",
  "cancelled",
];
const PAYMENT_STATUSES: PaymentStatus[] = ["pending", "paid", "failed", "refunded"];

export function OrderManager({ order }: { order: Order }) {
  const { t } = useLocale();
  const [state, formAction, pending] = useActionState<AdminResult | null, FormData>(
    updateOrder,
    null
  );

  return (
    <aside className="lg:sticky lg:top-24 lg:self-start">
      <form action={formAction} className="card-surface p-6">
        <h2 className="mb-5 font-display text-lg font-semibold text-navy-950 dark:text-parchment-50">
          {t("adm.manageOrder")}
        </h2>
        <input type="hidden" name="id" value={order.id} />

        <div className="space-y-4">
          <label className="block">
            <span className="label-field">{t("adm.orderStatus")}</span>
            <select name="status" defaultValue={order.status} className="input-field">
              {ORDER_STATUSES.map((s) => (
                <option key={s} value={s}>
                  {t(ORDER_STATUS_KEYS[s])}
                </option>
              ))}
            </select>
          </label>

          <label className="block">
            <span className="label-field">{t("adm.paymentStatusL")}</span>
            <select
              name="payment_status"
              defaultValue={order.payment_status}
              className="input-field"
            >
              {PAYMENT_STATUSES.map((s) => (
                <option key={s} value={s}>
                  {t(PAYMENT_STATUS_KEYS[s])}
                </option>
              ))}
            </select>
          </label>

          <label className="block">
            <span className="label-field">{t("adm.trackingNumber")}</span>
            <input
              name="tracking_number"
              defaultValue={order.tracking_number ?? ""}
              placeholder={t("adm.trackingPh")}
              className="input-field"
            />
          </label>
        </div>

        <button type="submit" disabled={pending} className="btn-primary mt-5 w-full">
          <Save className="h-4 w-4" strokeWidth={1.75} />
          {pending ? t("common.saving") : t("adm.saveChanges")}
        </button>
        {state && (
          <p
            role="status"
            className={`mt-3 text-sm ${
              state.success ? "text-brand-600 dark:text-brand-400" : "text-red-600 dark:text-red-400"
            }`}
          >
            {state.message}
          </p>
        )}
      </form>
    </aside>
  );
}

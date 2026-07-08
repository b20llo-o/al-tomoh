"use client";

import { useLocale } from "@/components/providers/locale-provider";
import type { MessageKey } from "@/lib/i18n";
import type { OrderStatus, PaymentStatus } from "@/lib/types";
import { cn } from "@/lib/utils";

const ORDER_STYLES: Record<OrderStatus, string> = {
  pending: "bg-amber-500/10 text-amber-700 dark:text-amber-400",
  processing: "bg-navy-500/10 text-navy-600 dark:text-navy-300",
  shipped: "bg-brand-500/10 text-brand-600 dark:text-brand-400",
  delivered: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",
  cancelled: "bg-red-500/10 text-red-700 dark:text-red-400",
};

const ORDER_KEYS: Record<OrderStatus, MessageKey> = {
  pending: "status.pending",
  processing: "status.processing",
  shipped: "status.shipped",
  delivered: "status.delivered",
  cancelled: "status.cancelled",
};

const PAYMENT_STYLES: Record<PaymentStatus, string> = {
  pending: "bg-amber-500/10 text-amber-700 dark:text-amber-400",
  paid: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",
  failed: "bg-red-500/10 text-red-700 dark:text-red-400",
  refunded: "bg-navy-500/10 text-navy-600 dark:text-navy-300",
};

const PAYMENT_KEYS: Record<PaymentStatus, MessageKey> = {
  pending: "status.paymentPending",
  paid: "status.paid",
  failed: "status.paymentFailed",
  refunded: "status.paymentRefunded",
};

export function OrderStatusBadge({ status }: { status: OrderStatus }) {
  const { t } = useLocale();
  return <span className={cn("badge", ORDER_STYLES[status])}>{t(ORDER_KEYS[status])}</span>;
}

export function PaymentStatusBadge({ status }: { status: PaymentStatus }) {
  const { t } = useLocale();
  return <span className={cn("badge", PAYMENT_STYLES[status])}>{t(PAYMENT_KEYS[status])}</span>;
}

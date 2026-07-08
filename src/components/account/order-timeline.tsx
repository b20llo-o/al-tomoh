"use client";

import { Check } from "lucide-react";
import { useLocale } from "@/components/providers/locale-provider";
import type { MessageKey } from "@/lib/i18n";
import type { OrderStatus } from "@/lib/types";
import { cn } from "@/lib/utils";

const STEPS: { status: OrderStatus; key: MessageKey }[] = [
  { status: "pending", key: "acc.stepPlaced" },
  { status: "processing", key: "acc.stepProcessing" },
  { status: "shipped", key: "acc.stepShipped" },
  { status: "delivered", key: "acc.stepDelivered" },
];

export function OrderTimeline({ status }: { status: OrderStatus }) {
  const { t } = useLocale();

  if (status === "cancelled") {
    return (
      <div className="rounded-xl bg-red-500/10 px-4 py-3 text-sm text-red-700 dark:text-red-400">
        {t("acc.cancelledNote")}
      </div>
    );
  }

  const currentIndex = STEPS.findIndex((s) => s.status === status);

  return (
    <ol className="flex items-center">
      {STEPS.map((step, index) => {
        const done = index <= currentIndex;
        const active = index === currentIndex;
        return (
          <li key={step.status} className="flex flex-1 items-center last:flex-none">
            <div className="flex flex-col items-center gap-2">
              <span
                className={cn(
                  "flex h-9 w-9 items-center justify-center rounded-full border-2 transition-colors duration-300",
                  done
                    ? "border-brand-500 bg-brand-500 text-white"
                    : "border-navy-900/15 text-navy-900/30 dark:border-parchment-100/15 dark:text-parchment-100/30",
                  active && "ring-4 ring-brand-500/20"
                )}
              >
                {done ? (
                  <Check className="h-4 w-4" strokeWidth={2.5} />
                ) : (
                  <span className="text-xs font-semibold">{index + 1}</span>
                )}
              </span>
              <span
                className={cn(
                  "text-xs font-medium",
                  done ? "text-navy-950 dark:text-parchment-100" : "text-muted"
                )}
              >
                {t(step.key)}
              </span>
            </div>
            {index < STEPS.length - 1 && (
              <span
                className={cn(
                  "mx-2 mb-6 h-0.5 flex-1 rounded-full transition-colors duration-300",
                  index < currentIndex
                    ? "bg-brand-500"
                    : "bg-navy-900/15 dark:bg-parchment-100/15"
                )}
              />
            )}
          </li>
        );
      })}
    </ol>
  );
}

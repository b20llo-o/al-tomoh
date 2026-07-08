"use client";

import { useActionState } from "react";
import { Send } from "lucide-react";
import { subscribeToNewsletter, type ActionResult } from "@/app/actions/public";
import { useLocale } from "@/components/providers/locale-provider";
import { cn } from "@/lib/utils";

export function NewsletterForm({ variant = "section" }: { variant?: "section" | "footer" }) {
  const { t } = useLocale();
  const [state, formAction, pending] = useActionState<ActionResult | null, FormData>(
    subscribeToNewsletter,
    null
  );

  return (
    <div>
      <form action={formAction} className="flex gap-2">
        <input
          type="email"
          name="email"
          required
          placeholder={t("news.placeholder")}
          aria-label={t("news.placeholder")}
          className={cn(
            "input-field",
            variant === "footer" &&
              "border-parchment-100/20 bg-parchment-100/5 text-parchment-50 placeholder:text-parchment-100/40 focus:border-brand-400"
          )}
        />
        <button
          type="submit"
          disabled={pending}
          className="btn-primary shrink-0 px-4"
          aria-label={t("news.subscribe")}
        >
          <Send className="h-4 w-4 rtl:-scale-x-100" strokeWidth={1.75} />
          <span className={variant === "footer" ? "sr-only" : "hidden sm:inline"}>
            {pending ? t("news.joining") : t("news.subscribe")}
          </span>
        </button>
      </form>
      {state && (
        <p
          className={cn(
            "mt-2 text-xs",
            state.success
              ? "text-brand-500"
              : variant === "footer"
                ? "text-parchment-100/70"
                : "text-red-600 dark:text-red-400"
          )}
          role="status"
        >
          {state.message}
        </p>
      )}
    </div>
  );
}

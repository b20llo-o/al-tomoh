"use client";

import { useActionState } from "react";
import { Send } from "lucide-react";
import { sendContactMessage, type ActionResult } from "@/app/actions/public";
import { useLocale } from "@/components/providers/locale-provider";
import { cn } from "@/lib/utils";

export function ContactForm() {
  const { t } = useLocale();
  const [state, formAction, pending] = useActionState<ActionResult | null, FormData>(
    sendContactMessage,
    null
  );

  return (
    <form action={formAction} className="space-y-5">
      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="contact-name" className="label-field">
            {t("contact.name")}
          </label>
          <input
            id="contact-name"
            name="name"
            required
            className="input-field"
            placeholder={t("contact.namePh")}
          />
        </div>
        <div>
          <label htmlFor="contact-email" className="label-field">
            {t("contact.email")}
          </label>
          <input
            id="contact-email"
            name="email"
            type="email"
            required
            className="input-field"
            placeholder="you@example.com"
          />
        </div>
      </div>
      <div>
        <label htmlFor="contact-subject" className="label-field">
          {t("contact.subject")}
        </label>
        <input
          id="contact-subject"
          name="subject"
          className="input-field"
          placeholder={t("contact.subjectPh")}
        />
      </div>
      <div>
        <label htmlFor="contact-message" className="label-field">
          {t("contact.message")}
        </label>
        <textarea
          id="contact-message"
          name="message"
          required
          rows={6}
          className="input-field resize-y"
          placeholder={t("contact.messagePh")}
        />
      </div>
      <div className="flex items-center gap-4">
        <button type="submit" disabled={pending} className="btn-primary">
          <Send className="h-4 w-4 rtl:-scale-x-100" strokeWidth={1.75} />
          {pending ? t("contact.sending") : t("contact.send")}
        </button>
        {state && (
          <p
            role="status"
            className={cn(
              "text-sm",
              state.success
                ? "text-brand-600 dark:text-brand-400"
                : "text-red-600 dark:text-red-400"
            )}
          >
            {state.message}
          </p>
        )}
      </div>
    </form>
  );
}

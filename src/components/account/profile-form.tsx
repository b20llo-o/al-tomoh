"use client";

import { useActionState } from "react";
import { updateProfile, type AccountResult } from "@/app/actions/account";
import { useLocale } from "@/components/providers/locale-provider";
import { cn } from "@/lib/utils";

export function ProfileForm({
  email,
  fullName,
  phone,
}: {
  email: string;
  fullName: string;
  phone: string;
}) {
  const { t } = useLocale();
  const [state, formAction, pending] = useActionState<AccountResult | null, FormData>(
    updateProfile,
    null
  );

  return (
    <form action={formAction} className="max-w-lg space-y-5">
      <div>
        <label className="label-field">{t("auth.email")}</label>
        <input value={email} disabled className="input-field force-ltr opacity-60" />
        <p className="mt-1.5 text-xs text-muted">{t("acc.emailNote")}</p>
      </div>
      <div>
        <label htmlFor="full_name" className="label-field">
          {t("acc.fullName")}
        </label>
        <input
          id="full_name"
          name="full_name"
          defaultValue={fullName}
          required
          className="input-field"
        />
      </div>
      <div>
        <label htmlFor="phone" className="label-field">
          {t("acc.phone")}
        </label>
        <input id="phone" name="phone" defaultValue={phone} className="input-field force-ltr" />
      </div>
      <div className="flex items-center gap-4">
        <button type="submit" disabled={pending} className="btn-primary">
          {pending ? t("common.saving") : t("common.save")}
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

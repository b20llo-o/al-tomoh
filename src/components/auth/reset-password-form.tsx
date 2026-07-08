"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { ShieldCheck } from "lucide-react";
import { useLocale } from "@/components/providers/locale-provider";
import { createClient } from "@/lib/supabase/client";

export function ResetPasswordForm() {
  const router = useRouter();
  const { t } = useLocale();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (password.length < 8) {
      setError(t("auth.passwordShort"));
      return;
    }
    if (password !== confirm) {
      setError(t("auth.passwordMismatch"));
      return;
    }
    setBusy(true);
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.updateUser({ password });
      if (error) {
        setError(error.message);
        return;
      }
      setDone(true);
      setTimeout(() => {
        router.push("/account");
        router.refresh();
      }, 1600);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="card-surface p-8">
      <h1 className="mb-1.5 font-display text-xl font-semibold text-navy-950 dark:text-parchment-50">
        {t("auth.resetTitle")}
      </h1>
      <p className="mb-6 text-sm text-muted">{t("auth.resetDesc")}</p>

      {done ? (
        <p className="flex items-center gap-2 rounded-xl bg-brand-500/10 px-4 py-3 text-sm text-brand-700 dark:text-brand-400">
          <ShieldCheck className="h-4 w-4" strokeWidth={1.75} />
          {t("auth.passwordUpdated")}
        </p>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label htmlFor="new-password" className="label-field">
              {t("auth.newPassword")}
            </label>
            <input
              id="new-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={8}
              autoComplete="new-password"
              className="input-field force-ltr"
            />
          </div>
          <div>
            <label htmlFor="confirm-password" className="label-field">
              {t("auth.confirmPassword")}
            </label>
            <input
              id="confirm-password"
              type="password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              required
              minLength={8}
              autoComplete="new-password"
              className="input-field force-ltr"
            />
          </div>
          {error && (
            <p role="alert" className="rounded-xl bg-red-500/10 px-4 py-3 text-sm text-red-700 dark:text-red-400">
              {error}
            </p>
          )}
          <button type="submit" disabled={busy} className="btn-primary w-full py-3">
            {busy ? t("auth.updating") : t("auth.updatePassword")}
          </button>
        </form>
      )}
    </div>
  );
}

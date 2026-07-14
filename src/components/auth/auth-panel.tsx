"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { KeyRound, LogIn, Mail, UserPlus } from "lucide-react";
import { useLocale } from "@/components/providers/locale-provider";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

type Mode = "login" | "register" | "recover";

export function AuthPanel() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { t } = useLocale();
  const nextPath = safeNext(searchParams.get("next"));

  const [mode, setMode] = useState<Mode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [rememberMe, setRememberMe] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const tabs: { mode: Mode; label: string }[] = [
    { mode: "login", label: t("auth.signIn") },
    { mode: "register", label: t("auth.createAccount") },
  ];

  function friendlyError(message: string): string {
    if (/invalid login credentials/i.test(message)) return t("auth.badCredentials");
    if (/already registered/i.test(message)) return t("auth.alreadyRegistered");
    // Supabase's built-in email sender is rate limited (a few messages per
    // hour). A 429 / "rate limit" here means confirmation emails are throttled,
    // not that anything the user did is wrong.
    if (/rate limit|too many requests|429/i.test(message)) return t("auth.rateLimited");
    // Supabase can surface a raw, unhelpful body (e.g. "{}") when the Auth
    // server itself fails before producing a real error — most commonly when
    // Custom SMTP is enabled but misconfigured, so the confirmation email
    // can't be sent and signUp/reset requests fail with an empty 500 body.
    // Never show that kind of technical noise to the user.
    const looksUnhelpful = !message || !/[a-zA-Z؀-ۿ]{3,}/.test(message);
    if (looksUnhelpful) return t("common.error");
    return message;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    setNotice(null);
    const supabase = createClient();

    try {
      if (mode === "login") {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) {
          setError(friendlyError(error.message));
          return;
        }
        if (!rememberMe) {
          // Session cookies persist by default; drop the session when the tab closes.
          window.addEventListener("beforeunload", () => {
            void supabase.auth.signOut();
          });
        }
        router.push(nextPath);
        router.refresh();
      } else if (mode === "register") {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { full_name: fullName },
            emailRedirectTo: `${window.location.origin}/auth/callback`,
          },
        });
        if (error) {
          setError(friendlyError(error.message));
          return;
        }
        // When email confirmation is turned OFF in Supabase, signUp returns a
        // live session — sign the customer straight in. When it is ON, there is
        // no session yet and we ask them to confirm via email.
        if (data.session) {
          router.push(nextPath);
          router.refresh();
          return;
        }
        setNotice(t("auth.registered"));
      } else {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/auth/callback?next=/reset-password`,
        });
        if (error) {
          setError(friendlyError(error.message));
          return;
        }
        setNotice(t("auth.recoverSent"));
      }
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="card-surface p-8">
      {mode !== "recover" ? (
        <div className="mb-7 flex rounded-xl border border-navy-900/10 p-1 dark:border-parchment-100/15">
          {tabs.map((tab) => (
            <button
              key={tab.mode}
              type="button"
              onClick={() => {
                setMode(tab.mode);
                setError(null);
                setNotice(null);
              }}
              className={cn(
                "flex-1 rounded-lg py-2 text-sm font-medium transition-all duration-300",
                mode === tab.mode
                  ? "bg-brand-500 text-white shadow-sm"
                  : "text-navy-900/60 hover:text-navy-950 dark:text-parchment-100/60 dark:hover:text-parchment-50"
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>
      ) : (
        <div className="mb-7">
          <h1 className="font-display text-xl font-semibold text-navy-950 dark:text-parchment-50">
            {t("auth.recoverTitle")}
          </h1>
          <p className="mt-1.5 text-sm text-muted">{t("auth.recoverDesc")}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        {mode === "register" && (
          <div>
            <label htmlFor="auth-name" className="label-field">
              {t("auth.fullName")}
            </label>
            <input
              id="auth-name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
              autoComplete="name"
              className="input-field"
              placeholder={t("auth.namePh")}
            />
          </div>
        )}

        <div>
          <label htmlFor="auth-email" className="label-field">
            {t("auth.email")}
          </label>
          <input
            id="auth-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
            className="input-field force-ltr"
            placeholder="you@example.com"
          />
        </div>

        {mode !== "recover" && (
          <div>
            <label htmlFor="auth-password" className="label-field">
              {t("auth.password")}
            </label>
            <input
              id="auth-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={8}
              autoComplete={mode === "login" ? "current-password" : "new-password"}
              className="input-field force-ltr"
              placeholder={t("auth.passwordPh")}
            />
          </div>
        )}

        {mode === "login" && (
          <div className="flex items-center justify-between">
            <label className="flex cursor-pointer items-center gap-2 text-sm text-navy-900/80 dark:text-parchment-100/80">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="h-4 w-4 rounded border-navy-900/30 accent-[#ee7124]"
              />
              {t("auth.rememberMe")}
            </label>
            <button
              type="button"
              onClick={() => {
                setMode("recover");
                setError(null);
                setNotice(null);
              }}
              className="text-sm font-medium text-brand-600 hover:text-brand-700 dark:text-brand-400"
            >
              {t("auth.forgot")}
            </button>
          </div>
        )}

        {error && (
          <p role="alert" className="rounded-xl bg-red-500/10 px-4 py-3 text-sm text-red-700 dark:text-red-400">
            {error}
          </p>
        )}
        {notice && (
          <p role="status" className="rounded-xl bg-brand-500/10 px-4 py-3 text-sm text-brand-700 dark:text-brand-400">
            {notice}
          </p>
        )}

        <button type="submit" disabled={busy} className="btn-primary w-full py-3">
          {mode === "login" && <LogIn className="h-4 w-4 rtl:-scale-x-100" strokeWidth={1.75} />}
          {mode === "register" && <UserPlus className="h-4 w-4" strokeWidth={1.75} />}
          {mode === "recover" && <Mail className="h-4 w-4" strokeWidth={1.75} />}
          {busy
            ? t("auth.pleaseWait")
            : mode === "login"
              ? t("auth.signIn")
              : mode === "register"
                ? t("auth.createAccount")
                : t("auth.sendRecovery")}
        </button>

        {mode === "recover" && (
          <button
            type="button"
            onClick={() => setMode("login")}
            className="flex w-full items-center justify-center gap-2 text-sm font-medium text-muted transition-colors hover:text-brand-600 dark:hover:text-brand-400"
          >
            <KeyRound className="h-4 w-4" strokeWidth={1.75} />
            {t("auth.backToSignIn")}
          </button>
        )}
      </form>
    </div>
  );
}

function safeNext(next: string | null): string {
  if (!next || !next.startsWith("/") || next.startsWith("//")) return "/account";
  return next;
}

"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { KeyRound, LogIn, Mail, ShieldCheck, UserPlus } from "lucide-react";
import { useLocale } from "@/components/providers/locale-provider";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

type Mode = "login" | "register" | "recover" | "confirm";

export function AuthPanel() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { t } = useLocale();
  const nextPath = safeNext(searchParams.get("next"));

  const [mode, setMode] = useState<Mode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [code, setCode] = useState("");
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
    if (/already registered|already exists|user_already_exists/i.test(message))
      return t("auth.alreadyRegistered");
    // A wrong / expired confirmation code.
    if (/otp|token has expired|invalid.*token|expired|code/i.test(message))
      return t("auth.badCode");
    if (/rate limit|too many requests|429/i.test(message)) return t("auth.rateLimited");
    // Supabase can surface a raw, unhelpful body (e.g. "{}") when the Auth
    // server itself fails before producing a real error. Never show that noise.
    const looksUnhelpful = !message || !/[a-zA-Z؀-ۿ]{3,}/.test(message);
    if (looksUnhelpful) return t("common.error");
    return message;
  }

  /** True for the empty/opaque 500 body Supabase returns on an email-send hiccup. */
  function isOpaque(message: string): boolean {
    return !message || !/[a-zA-Z؀-ۿ]{3,}/.test(message);
  }

  function resetMessages() {
    setError(null);
    setNotice(null);
  }

  function goLoggedIn() {
    router.push(nextPath);
    router.refresh();
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    resetMessages();
    const supabase = createClient();

    try {
      if (mode === "login") {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) {
          setError(friendlyError(error.message));
          return;
        }
        if (!rememberMe) {
          window.addEventListener("beforeunload", () => {
            void supabase.auth.signOut();
          });
        }
        goLoggedIn();
      } else if (mode === "register") {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: { data: { full_name: fullName } },
        });
        // Email confirmation OFF → we get a live session, sign in immediately.
        if (data?.session) {
          goLoggedIn();
          return;
        }
        if (error) {
          // "Already registered" / rate limit → surface as-is and stay.
          if (!isOpaque(error.message)) {
            setError(friendlyError(error.message));
            return;
          }
          // Opaque 500: the account + code email are usually still created, so
          // move on to code entry rather than dead-ending the user.
        }
        // Email confirmation ON → ask for the 6-digit code.
        setMode("confirm");
        setNotice(t("auth.checkSpam"));
      } else if (mode === "confirm") {
        const { data, error } = await supabase.auth.verifyOtp({
          email,
          token: code.trim(),
          type: "signup",
        });
        if (error || !data?.session) {
          setError(friendlyError(error?.message ?? "otp"));
          return;
        }
        goLoggedIn();
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

  async function resendCode() {
    setBusy(true);
    resetMessages();
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.resend({ type: "signup", email });
      if (error) {
        setError(friendlyError(error.message));
        return;
      }
      setNotice(t("auth.codeResent"));
    } finally {
      setBusy(false);
    }
  }

  // ── Confirmation-code screen ──────────────────────────────────────────
  if (mode === "confirm") {
    return (
      <div className="card-surface p-8">
        <div className="mb-6 flex flex-col items-center text-center">
          <span className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-500/10 text-brand-600 dark:text-brand-400">
            <ShieldCheck className="h-7 w-7" strokeWidth={1.75} />
          </span>
          <h1 className="font-display text-xl font-semibold text-navy-950 dark:text-parchment-50">
            {t("auth.confirmTitle")}
          </h1>
          <p className="mt-1.5 text-sm text-muted">{t("auth.confirmDesc")}</p>
          <p className="force-ltr mt-1 text-sm font-medium text-navy-900 dark:text-parchment-100">
            {email}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label htmlFor="auth-code" className="label-field">
              {t("auth.codeLabel")}
            </label>
            <input
              id="auth-code"
              inputMode="numeric"
              autoComplete="one-time-code"
              pattern="[0-9]*"
              maxLength={6}
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
              required
              className="input-field force-ltr text-center text-lg tracking-[0.5em]"
              placeholder="••••••"
            />
          </div>

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

          <button type="submit" disabled={busy || code.length < 6} className="btn-primary w-full py-3">
            <ShieldCheck className="h-4 w-4" strokeWidth={1.75} />
            {busy ? t("auth.verifying") : t("auth.verify")}
          </button>
        </form>

        <div className="mt-5 flex items-center justify-between text-sm">
          <button
            type="button"
            onClick={resendCode}
            disabled={busy}
            className="font-medium text-brand-600 hover:text-brand-700 disabled:opacity-50 dark:text-brand-400"
          >
            {t("auth.resendCode")}
          </button>
          <button
            type="button"
            onClick={() => {
              setMode("register");
              setCode("");
              resetMessages();
            }}
            className="font-medium text-muted transition-colors hover:text-brand-600 dark:hover:text-brand-400"
          >
            {t("auth.changeEmail")}
          </button>
        </div>
      </div>
    );
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
                resetMessages();
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
                resetMessages();
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
            onClick={() => {
              setMode("login");
              resetMessages();
            }}
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

"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  Heart,
  LogOut,
  Menu,
  Package,
  Search,
  ShoppingBag,
  User,
  X,
} from "lucide-react";
import { BrandWordmark } from "@/components/brand/logo";
import { CurrencySwitcher } from "./currency-switcher";
import { LanguageSwitcher } from "./language-switcher";
import { ThemeToggle } from "./theme-toggle";
import { useCart } from "@/components/providers/cart-provider";
import { useLocale } from "@/components/providers/locale-provider";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { count } = useCart();
  const { t } = useLocale();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [userEmail, setUserEmail] = useState<string | null>(null);

  const NAV_LINKS = [
    { href: "/", label: t("nav.home") },
    { href: "/categories", label: t("nav.categories") },
    { href: "/services", label: t("nav.services") },
    { href: "/about", label: t("nav.about") },
    { href: "/contact", label: t("nav.contact") },
  ];

  // Resolve the session locally (no server round-trip on navigation).
  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUserEmail(session?.user?.email ?? null);
    });
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUserEmail(session?.user?.email ?? null);
    });
    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    setMobileOpen(false);
    setAccountOpen(false);
  }, [pathname]);

  function submitSearch(e: React.FormEvent) {
    e.preventDefault();
    const q = query.trim();
    router.push(q ? `/search?q=${encodeURIComponent(q)}` : "/search");
  }

  async function signOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    setUserEmail(null);
    router.push("/");
    router.refresh();
  }

  return (
    <header className="sticky top-0 z-50 border-b border-navy-900/10 bg-parchment-50/90 backdrop-blur-md transition-colors duration-300 dark:border-parchment-100/10 dark:bg-ink-950/90">
      <div className="container-page">
        <div className="flex h-16 items-center justify-between gap-4 lg:h-[72px]">
          <Link href="/" aria-label="Al-Tomoh" className="shrink-0">
            <BrandWordmark />
          </Link>

          <div className="hidden items-center gap-3 lg:flex">
            <nav className="flex items-center gap-1" aria-label="Main">
              {NAV_LINKS.map((link) => {
                const active =
                  link.href === "/" ? pathname === "/" : pathname.startsWith(link.href);
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={cn(
                      "relative whitespace-nowrap rounded-lg px-3 py-2 text-sm font-medium transition-colors duration-300",
                      active
                        ? "text-brand-600 dark:text-brand-400"
                        : "text-navy-900/70 hover:text-navy-950 dark:text-parchment-100/70 dark:hover:text-parchment-50"
                    )}
                  >
                    {link.label}
                    {active && (
                      <span className="absolute inset-x-3 -bottom-0.5 h-0.5 rounded-full bg-brand-500" />
                    )}
                  </Link>
                );
              })}
            </nav>

            {/* Search sits right next to the nav so it hugs the links side. */}
            <form onSubmit={submitSearch} className="relative hidden xl:block">
              <Search
                className="pointer-events-none absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-navy-900/40 dark:text-parchment-100/40"
                strokeWidth={1.75}
              />
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={t("nav.search")}
                className="input-field w-52 ps-9"
                aria-label={t("nav.search")}
              />
            </form>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2">
            <div className="hidden md:block">
              <LanguageSwitcher />
            </div>
            <div className="hidden md:block">
              <CurrencySwitcher />
            </div>
            <ThemeToggle />

            <Link
              href="/cart"
              aria-label={t("nav.cart")}
              className="relative flex h-9 w-9 items-center justify-center rounded-xl text-navy-900/70 transition-colors duration-300 hover:bg-navy-900/5 hover:text-navy-950 dark:text-parchment-100/70 dark:hover:bg-parchment-100/10 dark:hover:text-parchment-50"
            >
              <ShoppingBag className="h-[18px] w-[18px]" strokeWidth={1.75} />
              {count > 0 && (
                <span className="absolute -end-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-brand-500 px-1 text-[10px] font-semibold text-white">
                  {count}
                </span>
              )}
            </Link>

            {userEmail ? (
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setAccountOpen((open) => !open)}
                  aria-label={t("nav.accountMenu")}
                  aria-expanded={accountOpen}
                  className="flex h-9 w-9 items-center justify-center rounded-xl text-navy-900/70 transition-colors duration-300 hover:bg-navy-900/5 hover:text-navy-950 dark:text-parchment-100/70 dark:hover:bg-parchment-100/10 dark:hover:text-parchment-50"
                >
                  <User className="h-[18px] w-[18px]" strokeWidth={1.75} />
                </button>
                {accountOpen && (
                  <div className="card-surface absolute end-0 top-11 w-56 overflow-hidden p-1.5 animate-scale-in">
                    <p className="force-ltr truncate px-3 py-2 text-xs text-muted">{userEmail}</p>
                    <MenuLink href="/account" icon={User} label={t("nav.myProfile")} />
                    <MenuLink href="/account/orders" icon={Package} label={t("nav.myOrders")} />
                    <MenuLink href="/account/wishlist" icon={Heart} label={t("nav.wishlist")} />
                    <button
                      type="button"
                      onClick={signOut}
                      className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-navy-900/80 transition-colors hover:bg-navy-900/5 dark:text-parchment-100/80 dark:hover:bg-parchment-100/10"
                    >
                      <LogOut className="h-4 w-4" strokeWidth={1.75} />
                      {t("nav.signOut")}
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link href="/login" className="btn-primary hidden h-9 px-4 text-xs sm:inline-flex">
                {t("nav.login")}
              </Link>
            )}

            <button
              type="button"
              onClick={() => setMobileOpen((open) => !open)}
              aria-label={t("nav.toggleMenu")}
              aria-expanded={mobileOpen}
              className="flex h-9 w-9 items-center justify-center rounded-xl text-navy-900/70 hover:bg-navy-900/5 dark:text-parchment-100/70 dark:hover:bg-parchment-100/10 lg:hidden"
            >
              {mobileOpen ? (
                <X className="h-5 w-5" strokeWidth={1.75} />
              ) : (
                <Menu className="h-5 w-5" strokeWidth={1.75} />
              )}
            </button>
          </div>
        </div>
      </div>

      {mobileOpen && (
        <div className="border-t border-navy-900/10 bg-parchment-50 px-4 pb-6 pt-4 dark:border-parchment-100/10 dark:bg-ink-950 lg:hidden animate-fade-in">
          <form onSubmit={submitSearch} className="relative mb-4">
            <Search
              className="pointer-events-none absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-navy-900/40 dark:text-parchment-100/40"
              strokeWidth={1.75}
            />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t("nav.search")}
              className="input-field ps-9"
              aria-label={t("nav.search")}
            />
          </form>
          <nav className="flex flex-col gap-1" aria-label="Mobile">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="rounded-lg px-3 py-2.5 text-sm font-medium text-navy-900/80 hover:bg-navy-900/5 dark:text-parchment-100/80 dark:hover:bg-parchment-100/10"
              >
                {link.label}
              </Link>
            ))}
            {!userEmail && (
              <Link href="/login" className="btn-primary mt-3">
                {t("nav.login")}
              </Link>
            )}
          </nav>
          <div className="mt-4 flex items-center justify-between">
            <span className="text-xs text-muted">{t("nav.language")}</span>
            <LanguageSwitcher />
          </div>
          <div className="mt-3 flex items-center justify-between">
            <span className="text-xs text-muted">{t("nav.currency")}</span>
            <CurrencySwitcher />
          </div>
        </div>
      )}
    </header>
  );
}

function MenuLink({
  href,
  icon: Icon,
  label,
}: {
  href: string;
  icon: typeof User;
  label: string;
}) {
  return (
    <Link
      href={href}
      className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-navy-900/80 transition-colors hover:bg-navy-900/5 dark:text-parchment-100/80 dark:hover:bg-parchment-100/10"
    >
      <Icon className="h-4 w-4" strokeWidth={1.75} />
      {label}
    </Link>
  );
}

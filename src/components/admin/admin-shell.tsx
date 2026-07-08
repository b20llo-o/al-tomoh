"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import {
  BarChart3,
  BookMarked,
  ExternalLink,
  FileText,
  FolderTree,
  LayoutDashboard,
  LogOut,
  Menu,
  ScrollText,
  Settings,
  ShoppingCart,
  Users,
  X,
} from "lucide-react";
import { LogoMark } from "@/components/brand/logo";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { LanguageSwitcher } from "@/components/layout/language-switcher";
import { useLocale } from "@/components/providers/locale-provider";
import type { MessageKey } from "@/lib/i18n";
import { ADMIN_PATH } from "@/lib/defaults";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

const NAV: { href: string; key: MessageKey; icon: typeof LayoutDashboard; exact?: boolean }[] = [
  { href: ADMIN_PATH, key: "adm.dashboard", icon: LayoutDashboard, exact: true },
  { href: `${ADMIN_PATH}/books`, key: "adm.books", icon: BookMarked },
  { href: `${ADMIN_PATH}/categories`, key: "adm.categories", icon: FolderTree },
  { href: `${ADMIN_PATH}/orders`, key: "adm.orders", icon: ShoppingCart },
  { href: `${ADMIN_PATH}/customers`, key: "adm.customers", icon: Users },
  { href: `${ADMIN_PATH}/content`, key: "adm.content", icon: FileText },
  { href: `${ADMIN_PATH}/settings`, key: "adm.settings", icon: Settings },
  { href: `${ADMIN_PATH}/analytics`, key: "adm.analytics", icon: BarChart3 },
  { href: `${ADMIN_PATH}/logs`, key: "adm.logs", icon: ScrollText },
];

export function AdminShell({
  adminName,
  children,
}: {
  adminName: string;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { t } = useLocale();
  const [open, setOpen] = useState(false);

  async function signOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  }

  return (
    <div className="flex min-h-screen bg-parchment-100/50 dark:bg-ink-950">
      {/* Sidebar */}
      <aside
        className={cn(
          // On desktop the sidebar is always visible (lg:!translate-x-0 wins over
          // the RTL mobile transform below). On mobile it slides in/out.
          "fixed inset-y-0 start-0 z-50 flex w-64 flex-col border-e border-navy-900/10 bg-white transition-transform duration-300 dark:border-parchment-100/10 dark:bg-ink-900 lg:static lg:!translate-x-0",
          open ? "translate-x-0" : "-translate-x-full rtl:translate-x-full"
        )}
      >
        <div className="flex h-16 items-center justify-between border-b border-navy-900/10 px-5 dark:border-parchment-100/10">
          <Link href={ADMIN_PATH} className="flex items-center gap-2.5">
            <LogoMark className="h-8 w-8" />
            <span className="font-display text-base font-semibold text-navy-950 dark:text-parchment-50">
              {t("adm.console")}
            </span>
          </Link>
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="text-navy-900/50 lg:hidden"
            aria-label="Close menu"
          >
            <X className="h-5 w-5" strokeWidth={1.75} />
          </button>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto p-3" aria-label="Console">
          {NAV.map((item) => {
            const active = item.exact
              ? pathname === item.href
              : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3.5 py-2.5 text-sm font-medium transition-colors duration-200",
                  active
                    ? "bg-brand-500/10 text-brand-600 dark:text-brand-400"
                    : "text-navy-900/70 hover:bg-navy-900/5 hover:text-navy-950 dark:text-parchment-100/70 dark:hover:bg-parchment-100/10 dark:hover:text-parchment-50"
                )}
              >
                <item.icon className="h-4 w-4" strokeWidth={1.75} />
                {t(item.key)}
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-navy-900/10 p-3 dark:border-parchment-100/10">
          <Link
            href="/"
            className="flex items-center gap-3 rounded-lg px-3.5 py-2.5 text-sm font-medium text-navy-900/70 hover:bg-navy-900/5 dark:text-parchment-100/70 dark:hover:bg-parchment-100/10"
          >
            <ExternalLink className="h-4 w-4" strokeWidth={1.75} />
            {t("adm.viewStore")}
          </Link>
          <button
            type="button"
            onClick={signOut}
            className="flex w-full items-center gap-3 rounded-lg px-3.5 py-2.5 text-sm font-medium text-navy-900/70 hover:bg-navy-900/5 dark:text-parchment-100/70 dark:hover:bg-parchment-100/10"
          >
            <LogOut className="h-4 w-4" strokeWidth={1.75} />
            {t("adm.signOut")}
          </button>
        </div>
      </aside>

      {open && (
        <button
          type="button"
          aria-label="Close menu overlay"
          onClick={() => setOpen(false)}
          className="fixed inset-0 z-40 bg-navy-950/40 lg:hidden"
        />
      )}

      {/* Main */}
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-navy-900/10 bg-white/90 px-4 backdrop-blur-md dark:border-parchment-100/10 dark:bg-ink-900/90 sm:px-6">
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="text-navy-900/60 lg:hidden"
            aria-label="Open menu"
          >
            <Menu className="h-5 w-5" strokeWidth={1.75} />
          </button>
          <div className="ms-auto flex items-center gap-3">
            <span className="hidden text-sm text-muted sm:block">{adminName}</span>
            <LanguageSwitcher />
            <ThemeToggle />
          </div>
        </header>

        <main className="flex-1 p-4 sm:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}

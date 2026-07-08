"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Heart, LogOut, MapPin, Package, User } from "lucide-react";
import { useLocale } from "@/components/providers/locale-provider";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

export function AccountNav() {
  const pathname = usePathname();
  const router = useRouter();
  const { t } = useLocale();

  const links = [
    { href: "/account", label: t("acc.profile"), icon: User, exact: true },
    { href: "/account/orders", label: t("nav.myOrders"), icon: Package, exact: false },
    { href: "/account/addresses", label: t("acc.addresses"), icon: MapPin, exact: false },
    { href: "/account/wishlist", label: t("nav.wishlist"), icon: Heart, exact: false },
  ];

  async function signOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  }

  return (
    <aside>
      <nav className="card-surface flex flex-col gap-1 p-2 lg:sticky lg:top-24" aria-label="Account">
        {links.map((link) => {
          const active = link.exact ? pathname === link.href : pathname.startsWith(link.href);
          return (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "flex items-center gap-2.5 rounded-lg px-3.5 py-2.5 text-sm font-medium transition-colors duration-300",
                active
                  ? "bg-brand-500/10 text-brand-600 dark:text-brand-400"
                  : "text-navy-900/70 hover:bg-navy-900/5 hover:text-navy-950 dark:text-parchment-100/70 dark:hover:bg-parchment-100/10 dark:hover:text-parchment-50"
              )}
            >
              <link.icon className="h-4 w-4" strokeWidth={1.75} />
              {link.label}
            </Link>
          );
        })}
        <div className="my-1 h-px bg-navy-900/10 dark:bg-parchment-100/10" />
        <button
          type="button"
          onClick={signOut}
          className="flex items-center gap-2.5 rounded-lg px-3.5 py-2.5 text-sm font-medium text-navy-900/70 transition-colors hover:bg-navy-900/5 hover:text-navy-950 dark:text-parchment-100/70 dark:hover:bg-parchment-100/10"
        >
          <LogOut className="h-4 w-4" strokeWidth={1.75} />
          {t("nav.signOut")}
        </button>
      </nav>
    </aside>
  );
}

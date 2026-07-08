"use client";

import { useState } from "react";
import { Search, ShieldBan, ShieldCheck } from "lucide-react";
import { setUserSuspended } from "@/app/actions/admin";
import { useLocale } from "@/components/providers/locale-provider";
import { formatDate } from "@/lib/utils";
import type { Profile } from "@/lib/types";
import { cn } from "@/lib/utils";

export function CustomersTable({
  customers,
  currentUserId,
}: {
  customers: (Profile & { order_count: number })[];
  currentUserId: string;
}) {
  const { t } = useLocale();
  const [query, setQuery] = useState("");

  const filtered = customers.filter((c) => {
    if (!query) return true;
    const q = query.toLowerCase();
    return (
      (c.full_name ?? "").toLowerCase().includes(q) ||
      (c.phone ?? "").toLowerCase().includes(q)
    );
  });

  return (
    <div>
      <div className="mb-5 flex justify-end">
        <div className="relative">
          <Search className="pointer-events-none absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-navy-900/40 dark:text-parchment-100/40" strokeWidth={1.75} />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t("adm.searchCustomers")}
            className="input-field w-64 ps-9"
          />
        </div>
      </div>

      <div className="card-surface overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-sm">
            <thead>
              <tr className="border-b border-navy-900/10 text-start text-xs uppercase tracking-wider text-muted dark:border-parchment-100/10">
                <th className="px-5 py-3 text-start font-semibold">{t("adm.colCustomer")}</th>
                <th className="px-3 py-3 text-start font-semibold">{t("adm.colRole")}</th>
                <th className="px-3 py-3 text-start font-semibold">{t("adm.colOrders")}</th>
                <th className="px-3 py-3 text-start font-semibold">{t("adm.colJoined")}</th>
                <th className="px-5 py-3 text-end font-semibold">{t("adm.colActions")}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-navy-900/5 dark:divide-parchment-100/5">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-5 py-12 text-center text-muted">
                    {t("adm.noCustomers")}
                  </td>
                </tr>
              ) : (
                filtered.map((customer) => (
                  <tr key={customer.id} className="hover:bg-navy-900/[0.02] dark:hover:bg-parchment-100/[0.02]">
                    <td className="px-5 py-3">
                      <p className="font-medium text-navy-950 dark:text-parchment-100">
                        {customer.full_name ?? t("adm.unnamed")}
                      </p>
                      {customer.phone && <p className="force-ltr text-xs text-muted">{customer.phone}</p>}
                    </td>
                    <td className="px-3 py-3">
                      <span
                        className={cn(
                          "badge",
                          customer.role === "admin"
                            ? "bg-brand-500/10 text-brand-600 dark:text-brand-400"
                            : "bg-navy-900/5 text-navy-900/70 dark:bg-parchment-100/10 dark:text-parchment-100/70"
                        )}
                      >
                        {customer.role === "admin" ? t("adm.roleAdmin") : t("adm.roleCustomer")}
                      </span>
                    </td>
                    <td className="px-3 py-3 text-muted">{customer.order_count}</td>
                    <td className="px-3 py-3 text-muted">{formatDate(customer.created_at)}</td>
                    <td className="px-5 py-3 text-end">
                      {customer.id === currentUserId ? (
                        <span className="text-xs text-muted">{t("adm.you")}</span>
                      ) : customer.is_suspended ? (
                        <form action={setUserSuspended} className="inline">
                          <input type="hidden" name="id" value={customer.id} />
                          <input type="hidden" name="suspend" value="false" />
                          <button type="submit" className="btn-ghost h-8 px-3 text-xs text-emerald-600 dark:text-emerald-400">
                            <ShieldCheck className="h-3.5 w-3.5" strokeWidth={1.75} />
                            {t("adm.reinstate")}
                          </button>
                        </form>
                      ) : (
                        <form action={setUserSuspended} className="inline">
                          <input type="hidden" name="id" value={customer.id} />
                          <input type="hidden" name="suspend" value="true" />
                          <button type="submit" className="btn-ghost h-8 px-3 text-xs text-red-600 dark:text-red-400">
                            <ShieldBan className="h-3.5 w-3.5" strokeWidth={1.75} />
                            {t("adm.suspend")}
                          </button>
                        </form>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

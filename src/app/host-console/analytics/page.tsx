import { BarChart3, DollarSign, ShoppingCart, TrendingUp } from "lucide-react";
import { PageHeader } from "@/components/admin/page-header";
import { getLocaleT } from "@/lib/locale-server";
import { StatCard } from "@/components/admin/stat-card";
import { createClient } from "@/lib/supabase/server";
import { formatPrice } from "@/lib/currency";
import type { Order, OrderItem } from "@/lib/types";

export const dynamic = "force-dynamic";

interface MonthBucket {
  label: string;
  revenue: number;
  orders: number;
}

export default async function AnalyticsPage() {
  const { t, locale } = await getLocaleT();
  const supabase = await createClient();

  const [{ data: orders }, { data: items }] = await Promise.all([
    supabase.from("orders").select("total, currency, exchange_rate, payment_status, created_at"),
    supabase.from("order_items").select("title, author, quantity, unit_price"),
  ]);

  const toTry = (o: Pick<Order, "total" | "currency" | "exchange_rate">) =>
    o.currency === "USD" ? o.total * (o.exchange_rate || 1) : o.total;

  const paid = (orders ?? []).filter((o) => o.payment_status === "paid");
  const totalRevenue = paid.reduce((sum, o) => sum + toTry(o), 0);
  const avgOrderValue = paid.length ? totalRevenue / paid.length : 0;

  // Group revenue by month over the last 6 months.
  const now = new Date();
  const buckets: MonthBucket[] = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    buckets.push({
      label: d.toLocaleDateString(locale === "ar" ? "ar-EG" : "en-GB", { month: "short" }),
      revenue: 0,
      orders: 0,
    });
  }
  for (const o of paid) {
    const d = new Date(o.created_at);
    const monthsAgo =
      (now.getFullYear() - d.getFullYear()) * 12 + (now.getMonth() - d.getMonth());
    if (monthsAgo >= 0 && monthsAgo < 6) {
      const bucket = buckets[5 - monthsAgo];
      bucket.revenue += toTry(o);
      bucket.orders += 1;
    }
  }
  const maxRevenue = Math.max(1, ...buckets.map((b) => b.revenue));

  // Best sellers by units and by revenue.
  const soldMap = new Map<
    string,
    { title: string; author: string | null; units: number; revenue: number }
  >();
  for (const item of (items as OrderItem[]) ?? []) {
    const key = item.title;
    const existing = soldMap.get(key);
    if (existing) {
      existing.units += item.quantity;
      existing.revenue += item.quantity * item.unit_price;
    } else {
      soldMap.set(key, {
        title: item.title,
        author: item.author,
        units: item.quantity,
        revenue: item.quantity * item.unit_price,
      });
    }
  }
  const topBooks = Array.from(soldMap.values())
    .sort((a, b) => b.units - a.units)
    .slice(0, 8);

  return (
    <div>
      <PageHeader title={t("adm.analytics")} description={t("adm.analyticsDesc")} />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label={t("adm.totalRevenue")} value={formatPrice(totalRevenue, "TRY")} icon={DollarSign} />
        <StatCard label={t("adm.paidOrders")} value={String(paid.length)} icon={ShoppingCart} />
        <StatCard label={t("adm.avgOrder")} value={formatPrice(avgOrderValue, "TRY")} icon={TrendingUp} />
        <StatCard label={t("adm.totalOrders")} value={String((orders ?? []).length)} icon={BarChart3} />
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <div className="card-surface p-6">
          <h2 className="mb-6 font-display text-lg font-semibold text-navy-950 dark:text-parchment-50">
            {t("adm.revenue6")}
          </h2>
          <div className="flex h-56 items-end justify-between gap-3">
            {buckets.map((bucket) => (
              <div key={bucket.label} className="flex flex-1 flex-col items-center gap-2">
                <div className="flex w-full flex-1 items-end">
                  <div
                    className="w-full rounded-t-lg bg-gradient-to-t from-brand-600 to-brand-400 transition-all duration-500"
                    style={{ height: `${(bucket.revenue / maxRevenue) * 100}%`, minHeight: bucket.revenue > 0 ? "4px" : "0" }}
                    title={formatPrice(bucket.revenue, "TRY")}
                  />
                </div>
                <span className="text-xs font-medium text-muted">{bucket.label}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="card-surface p-6">
          <h2 className="mb-5 font-display text-lg font-semibold text-navy-950 dark:text-parchment-50">
            {t("adm.topBooks")}
          </h2>
          {topBooks.length === 0 ? (
            <p className="py-10 text-center text-sm text-muted">{t("adm.noSalesYet")}</p>
          ) : (
            <ul className="space-y-3">
              {topBooks.map((book, index) => (
                <li key={book.title} className="flex items-center gap-3">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-brand-500/10 text-xs font-semibold text-brand-600 dark:text-brand-400">
                    {index + 1}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-navy-950 dark:text-parchment-100">
                      {book.title}
                    </p>
                    {book.author && <p className="truncate text-xs text-muted">{book.author}</p>}
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-navy-950 dark:text-parchment-100">
                      {book.units} {t("adm.soldUnits")}
                    </p>
                    <p className="text-xs text-muted">{formatPrice(book.revenue, "TRY")}</p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}

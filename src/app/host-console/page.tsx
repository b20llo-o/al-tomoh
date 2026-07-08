import Link from "next/link";
import {
  AlertTriangle,
  BookMarked,
  Clock,
  DollarSign,
  ShoppingCart,
  Users,
} from "lucide-react";
import { PageHeader } from "@/components/admin/page-header";
import { StatCard } from "@/components/admin/stat-card";
import {
  OrderStatusBadge,
  PaymentStatusBadge,
} from "@/components/store/order-status-badge";
import { getDashboardStats } from "@/lib/admin-data";
import { ADMIN_PATH } from "@/lib/defaults";
import { formatPrice } from "@/lib/currency";
import { formatDate } from "@/lib/utils";
import { getLocaleT } from "@/lib/locale-server";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const [stats, { t }] = await Promise.all([getDashboardStats(), getLocaleT()]);

  return (
    <div>
      <PageHeader title={t("adm.dashboard")} description={t("adm.dashboardDesc")} />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        <StatCard
          label={t("adm.revenue")}
          value={formatPrice(stats.revenue, "TRY")}
          icon={DollarSign}
          hint={t("adm.paidOrders")}
        />
        <StatCard label={t("adm.orders")} value={String(stats.orderCount)} icon={ShoppingCart} />
        <StatCard
          label={t("adm.pending")}
          value={String(stats.pendingOrders)}
          icon={Clock}
          hint={t("adm.awaiting")}
        />
        <StatCard label={t("adm.customers")} value={String(stats.customerCount)} icon={Users} />
        <StatCard label={t("adm.books")} value={String(stats.bookCount)} icon={BookMarked} />
        <StatCard
          label={t("adm.lowStock")}
          value={String(stats.lowStockCount)}
          icon={AlertTriangle}
          hint={t("adm.lowStockHint")}
        />
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-3">
        <div className="card-surface p-6 lg:col-span-2">
          <div className="mb-5 flex items-center justify-between">
            <h2 className="font-display text-lg font-semibold text-navy-950 dark:text-parchment-50">
              {t("adm.recentOrders")}
            </h2>
            <Link
              href={`${ADMIN_PATH}/orders`}
              className="text-sm font-medium text-brand-600 hover:text-brand-700 dark:text-brand-400"
            >
              {t("adm.viewAll")}
            </Link>
          </div>
          {stats.recentOrders.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted">{t("adm.noOrders")}</p>
          ) : (
            <div className="space-y-2">
              {stats.recentOrders.map((order) => (
                <Link
                  key={order.id}
                  href={`${ADMIN_PATH}/orders/${order.id}`}
                  className="flex items-center justify-between gap-3 rounded-xl px-3 py-3 transition-colors hover:bg-navy-900/5 dark:hover:bg-parchment-100/5"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-navy-950 dark:text-parchment-100">
                      {order.order_number}
                    </p>
                    <p className="text-xs text-muted">{formatDate(order.created_at)}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <OrderStatusBadge status={order.status} />
                    <PaymentStatusBadge status={order.payment_status} />
                  </div>
                  <span className="w-24 text-right text-sm font-semibold text-brand-600 dark:text-brand-400">
                    {formatPrice(order.total, order.currency)}
                  </span>
                </Link>
              ))}
            </div>
          )}
        </div>

        <div className="card-surface p-6">
          <h2 className="mb-5 font-display text-lg font-semibold text-navy-950 dark:text-parchment-50">
            {t("adm.bestSellers")}
          </h2>
          {stats.bestSellers.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted">{t("adm.noSales")}</p>
          ) : (
            <ol className="space-y-4">
              {stats.bestSellers.map((book, index) => (
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
                  <span className="text-sm font-semibold text-muted">{book.sold}</span>
                </li>
              ))}
            </ol>
          )}
        </div>
      </div>
    </div>
  );
}

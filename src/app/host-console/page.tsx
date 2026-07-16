import Link from "next/link";
import { AlertTriangle, BookMarked, FolderTree, Users } from "lucide-react";
import { PageHeader } from "@/components/admin/page-header";
import { StatCard } from "@/components/admin/stat-card";
import { getDashboardStats } from "@/lib/admin-data";
import { ADMIN_PATH } from "@/lib/defaults";
import { formatDate } from "@/lib/utils";
import { getLocaleT } from "@/lib/locale-server";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const [stats, { t }] = await Promise.all([getDashboardStats(), getLocaleT()]);

  return (
    <div>
      <PageHeader title={t("adm.dashboard")} description={t("adm.dashboardDesc")} />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label={t("adm.books")} value={String(stats.bookCount)} icon={BookMarked} />
        <StatCard label={t("adm.categories")} value={String(stats.categoryCount)} icon={FolderTree} />
        <StatCard label={t("adm.customers")} value={String(stats.customerCount)} icon={Users} />
        <StatCard
          label={t("adm.lowStock")}
          value={String(stats.lowStockCount)}
          icon={AlertTriangle}
          hint={t("adm.lowStockHint")}
        />
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        {/* Low stock — what needs restocking */}
        <div className="card-surface p-6">
          <div className="mb-5 flex items-center justify-between">
            <h2 className="font-display text-lg font-semibold text-navy-950 dark:text-parchment-50">
              {t("adm.lowStock")}
            </h2>
            <Link
              href={`${ADMIN_PATH}/books`}
              className="text-sm font-medium text-brand-600 hover:text-brand-700 dark:text-brand-400"
            >
              {t("adm.viewAll")}
            </Link>
          </div>
          {stats.lowStockBooks.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted">{t("adm.allStocked")}</p>
          ) : (
            <ul className="space-y-2">
              {stats.lowStockBooks.map((book) => (
                <Link
                  key={book.id}
                  href={`${ADMIN_PATH}/books/${book.id}`}
                  className="flex items-center justify-between gap-3 rounded-xl px-3 py-3 transition-colors hover:bg-navy-900/5 dark:hover:bg-parchment-100/5"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-navy-950 dark:text-parchment-100">
                      {book.title}
                    </p>
                    {book.author && <p className="truncate text-xs text-muted">{book.author}</p>}
                  </div>
                  <span
                    className={`badge shrink-0 ${
                      book.stock === 0
                        ? "bg-red-500/10 text-red-700 dark:text-red-400"
                        : "bg-amber-500/10 text-amber-700 dark:text-amber-400"
                    }`}
                  >
                    {t("adm.inStockN", { n: book.stock })}
                  </span>
                </Link>
              ))}
            </ul>
          )}
        </div>

        {/* Recently added books */}
        <div className="card-surface p-6">
          <h2 className="mb-5 font-display text-lg font-semibold text-navy-950 dark:text-parchment-50">
            {t("adm.recentBooks")}
          </h2>
          {stats.recentBooks.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted">{t("adm.noBooks")}</p>
          ) : (
            <ul className="space-y-2">
              {stats.recentBooks.map((book) => (
                <Link
                  key={book.id}
                  href={`${ADMIN_PATH}/books/${book.id}`}
                  className="flex items-center justify-between gap-3 rounded-xl px-3 py-3 transition-colors hover:bg-navy-900/5 dark:hover:bg-parchment-100/5"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-navy-950 dark:text-parchment-100">
                      {book.title}
                    </p>
                    {book.author && <p className="truncate text-xs text-muted">{book.author}</p>}
                  </div>
                  <span className="shrink-0 text-xs text-muted">{formatDate(book.created_at)}</span>
                </Link>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}

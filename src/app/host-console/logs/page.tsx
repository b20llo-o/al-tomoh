import { PageHeader } from "@/components/admin/page-header";
import { getLocaleT } from "@/lib/locale-server";
import { EmptyState } from "@/components/store/empty-state";
import { createClient } from "@/lib/supabase/server";
import { formatDateTime } from "@/lib/utils";
import type { ActivityLog, Profile } from "@/lib/types";

export const dynamic = "force-dynamic";

const ACTION_STYLES: Record<string, string> = {
  create: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",
  update: "bg-navy-500/10 text-navy-600 dark:text-navy-300",
  delete: "bg-red-500/10 text-red-700 dark:text-red-400",
  hide: "bg-amber-500/10 text-amber-700 dark:text-amber-400",
  show: "bg-brand-500/10 text-brand-600 dark:text-brand-400",
  restore: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",
  suspend: "bg-red-500/10 text-red-700 dark:text-red-400",
  reinstate: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",
};

export default async function LogsPage() {
  const { t } = await getLocaleT();
  const supabase = await createClient();
  const { data } = await supabase
    .from("activity_logs")
    .select("*, admin:profiles(full_name)")
    .order("created_at", { ascending: false })
    .limit(200);

  const logs = (data as (ActivityLog & { admin: Partial<Profile> | null })[]) ?? [];

  return (
    <div>
      <PageHeader
        title={t("adm.logs")}
        description={t("adm.logsDesc")}
      />
      {logs.length === 0 ? (
        <EmptyState message={t("adm.noLogs")} />
      ) : (
        <div className="card-surface overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-sm">
              <thead>
                <tr className="border-b border-navy-900/10 text-start text-xs uppercase tracking-wider text-muted dark:border-parchment-100/10">
                  <th className="px-5 py-3 text-start font-semibold">{t("adm.when")}</th>
                  <th className="px-3 py-3 text-start font-semibold">{t("adm.admin")}</th>
                  <th className="px-3 py-3 text-start font-semibold">{t("adm.action")}</th>
                  <th className="px-3 py-3 text-start font-semibold">{t("adm.entity")}</th>
                  <th className="px-5 py-3 text-start font-semibold">{t("adm.details")}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-navy-900/5 dark:divide-parchment-100/5">
                {logs.map((log) => (
                  <tr key={log.id}>
                    <td className="whitespace-nowrap px-5 py-3 text-muted">
                      {formatDateTime(log.created_at)}
                    </td>
                    <td className="px-3 py-3 text-navy-950 dark:text-parchment-100">
                      {log.admin?.full_name ?? t("adm.system")}
                    </td>
                    <td className="px-3 py-3">
                      <span
                        className={`badge capitalize ${
                          ACTION_STYLES[log.action] ??
                          "bg-navy-900/5 text-navy-900/70 dark:bg-parchment-100/10 dark:text-parchment-100/70"
                        }`}
                      >
                        {log.action}
                      </span>
                    </td>
                    <td className="px-3 py-3 capitalize text-muted">{log.entity}</td>
                    <td className="px-5 py-3 text-xs text-muted">
                      {log.details ? JSON.stringify(log.details) : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

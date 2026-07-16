import { PageHeader } from "@/components/admin/page-header";
import { getLocaleT } from "@/lib/locale-server";
import { SettingsEditor } from "@/components/admin/settings-editor";
import { getStoreSetting } from "@/lib/data";

export const dynamic = "force-dynamic";

export default async function AdminSettingsPage() {
  const { t } = await getLocaleT();
  const [currency, shipping, tax] = await Promise.all([
    getStoreSetting("currency"),
    getStoreSetting("shipping"),
    getStoreSetting("tax"),
  ]);

  return (
    <div>
      <PageHeader
        title={t("adm.settings")}
        description={t("adm.settingsDesc")}
      />
      <SettingsEditor currency={currency} shipping={shipping} tax={tax} />
    </div>
  );
}

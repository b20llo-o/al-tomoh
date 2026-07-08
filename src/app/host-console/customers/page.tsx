import { PageHeader } from "@/components/admin/page-header";
import { getLocaleT } from "@/lib/locale-server";
import { CustomersTable } from "@/components/admin/customers-table";
import { getAllCustomers } from "@/lib/admin-data";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function AdminCustomersPage() {
  const [customers, { t }] = await Promise.all([getAllCustomers(), getLocaleT()]);
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <div>
      <PageHeader
        title={t("adm.customers")}
        description={t("adm.customersDesc")}
      />
      <CustomersTable customers={customers} currentUserId={user?.id ?? ""} />
    </div>
  );
}

import { PageHeader } from "@/components/admin/page-header";
import { getLocaleT } from "@/lib/locale-server";
import { OrdersTable } from "@/components/admin/orders-table";
import { getAllOrders } from "@/lib/admin-data";

export const dynamic = "force-dynamic";

export default async function AdminOrdersPage() {
  const [orders, { t }] = await Promise.all([getAllOrders(), getLocaleT()]);

  return (
    <div>
      <PageHeader
        title={t("adm.orders")}
        description={t("adm.ordersDesc")}
      />
      <OrdersTable orders={orders} />
    </div>
  );
}

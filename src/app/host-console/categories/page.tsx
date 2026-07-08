import { PageHeader } from "@/components/admin/page-header";
import { getLocaleT } from "@/lib/locale-server";
import { CategoryManager } from "@/components/admin/category-manager";
import { getAllCategories } from "@/lib/admin-data";

export const dynamic = "force-dynamic";

export default async function AdminCategoriesPage() {
  const [categories, { t }] = await Promise.all([getAllCategories(), getLocaleT()]);

  return (
    <div>
      <PageHeader
        title={t("adm.categories")}
        description={t("adm.categoriesDesc")}
      />
      <CategoryManager categories={categories} />
    </div>
  );
}

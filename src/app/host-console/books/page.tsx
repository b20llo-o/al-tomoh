import Link from "next/link";
import { Plus } from "lucide-react";
import { PageHeader } from "@/components/admin/page-header";
import { BooksTable } from "@/components/admin/books-table";
import { getAllBooks } from "@/lib/admin-data";
import { ADMIN_PATH } from "@/lib/defaults";
import { getLocaleT } from "@/lib/locale-server";

export const dynamic = "force-dynamic";

export default async function AdminBooksPage() {
  const [books, { t }] = await Promise.all([getAllBooks(), getLocaleT()]);

  return (
    <div>
      <PageHeader
        title={t("adm.books")}
        description={t("adm.booksDesc")}
        action={
          <Link href={`${ADMIN_PATH}/books/new`} className="btn-primary">
            <Plus className="h-4 w-4" strokeWidth={1.75} />
            {t("adm.addBook")}
          </Link>
        }
      />
      <BooksTable books={books} />
    </div>
  );
}

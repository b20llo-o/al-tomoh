import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { PageHeader } from "@/components/admin/page-header";
import { BookForm } from "@/components/admin/book-form";
import { getAllCategories } from "@/lib/admin-data";
import { ADMIN_PATH } from "@/lib/defaults";

export const dynamic = "force-dynamic";

export default async function NewBookPage() {
  const categories = await getAllCategories();

  return (
    <div>
      <Link
        href={`${ADMIN_PATH}/books`}
        className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-muted hover:text-brand-600 dark:hover:text-brand-400"
      >
        <ChevronLeft className="h-4 w-4" strokeWidth={1.75} />
        All books
      </Link>
      <PageHeader title="Add book" description="Create a new book in the catalogue." />
      <BookForm categories={categories} />
    </div>
  );
}

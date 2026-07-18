import { BookGrid } from "@/components/store/book-grid";
import { getVisibleBooks } from "@/lib/data";
import { getLocaleT } from "@/lib/locale-server";

export default async function OffersPage() {
  const { t } = await getLocaleT();
  const books = await getVisibleBooks({ discounted: true });

  return (
    <div className="container-page py-14 sm:py-16">
      <div className="mb-10 max-w-2xl animate-fade-up">
        <span className="section-eyebrow">{t("offers.eyebrow")}</span>
        <h1 className="heading-display text-3xl sm:text-4xl">{t("offers.title")}</h1>
        <p className="mt-3 text-sm leading-relaxed text-muted sm:text-base">{t("offers.desc")}</p>
      </div>
      <BookGrid books={books} emptyMessage={t("offers.empty")} />
    </div>
  );
}

import { CartView } from "@/components/cart/cart-view";
import { getLocaleT } from "@/lib/locale-server";

export default async function CartPage() {
  const { t } = await getLocaleT();

  return (
    <div className="container-page py-14 sm:py-16">
      <div className="mb-8 animate-fade-up">
        <span className="section-eyebrow">{t("cart.eyebrow")}</span>
        <h1 className="heading-display text-3xl sm:text-4xl">{t("cart.title")}</h1>
      </div>
      <CartView />
    </div>
  );
}

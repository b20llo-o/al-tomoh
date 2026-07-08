import { redirect } from "next/navigation";
import { CheckoutView } from "@/components/checkout/checkout-view";
import { createClient } from "@/lib/supabase/server";
import { getStoreSetting } from "@/lib/data";
import { getLocaleT } from "@/lib/locale-server";
import type { Address } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function CheckoutPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/checkout");

  const { t } = await getLocaleT();

  const [{ data: addresses }, { data: profile }, shipping, payments] = await Promise.all([
    supabase
      .from("addresses")
      .select("*")
      .eq("user_id", user.id)
      .order("is_default", { ascending: false }),
    supabase.from("profiles").select("full_name, phone").eq("id", user.id).maybeSingle(),
    getStoreSetting("shipping"),
    getStoreSetting("payments"),
  ]);

  return (
    <div className="container-page py-14 sm:py-16">
      <div className="mb-8 animate-fade-up">
        <span className="section-eyebrow">{t("co.eyebrow")}</span>
        <h1 className="heading-display text-3xl sm:text-4xl">{t("co.title")}</h1>
      </div>
      <CheckoutView
        addresses={(addresses as Address[]) ?? []}
        defaultName={profile?.full_name ?? ""}
        defaultPhone={profile?.phone ?? ""}
        shippingSettings={shipping}
        paymentSettings={payments}
      />
    </div>
  );
}

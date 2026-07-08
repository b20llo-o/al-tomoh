import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AccountNav } from "@/components/account/account-nav";
import { getLocaleT } from "@/lib/locale-server";

export const dynamic = "force-dynamic";

export default async function AccountLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/account");

  const { t } = await getLocaleT();

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name")
    .eq("id", user.id)
    .maybeSingle();

  return (
    <div className="container-page py-14 sm:py-16">
      <div className="mb-8 animate-fade-up">
        <span className="section-eyebrow">{t("acc.yourAccount")}</span>
        <h1 className="heading-display text-3xl sm:text-4xl">
          {profile?.full_name
            ? `${t("acc.welcome")} ${profile.full_name.split(" ")[0]}`
            : t("acc.myAccount")}
        </h1>
      </div>
      <div className="grid gap-8 lg:grid-cols-[240px_1fr]">
        <AccountNav />
        <div>{children}</div>
      </div>
    </div>
  );
}

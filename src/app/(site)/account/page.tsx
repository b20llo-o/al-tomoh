import { createClient } from "@/lib/supabase/server";
import { ProfileForm } from "@/components/account/profile-form";
import { getLocaleT } from "@/lib/locale-server";

export const dynamic = "force-dynamic";

export default async function ProfilePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const { t } = await getLocaleT();

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, phone")
    .eq("id", user!.id)
    .maybeSingle();

  return (
    <div className="card-surface p-6 sm:p-8">
      <h2 className="mb-1.5 font-display text-xl font-semibold text-navy-950 dark:text-parchment-50">
        {t("acc.profileTitle")}
      </h2>
      <p className="mb-6 text-sm text-muted">{t("acc.profileDesc")}</p>
      <ProfileForm
        email={user?.email ?? ""}
        fullName={profile?.full_name ?? ""}
        phone={profile?.phone ?? ""}
      />
    </div>
  );
}

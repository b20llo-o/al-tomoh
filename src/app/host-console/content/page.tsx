import { PageHeader } from "@/components/admin/page-header";
import { getLocaleT } from "@/lib/locale-server";
import { ContentEditor } from "@/components/admin/content-editor";
import { getSiteContent } from "@/lib/data";
import { createClient } from "@/lib/supabase/server";
import type { Testimonial } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function AdminContentPage() {
  // Load every block in BOTH languages so the editor can show two fields each.
  const [
    contactAr,
    contactEn,
    aboutAr,
    aboutEn,
    homeAr,
    homeEn,
    servicesAr,
    servicesEn,
  ] = await Promise.all([
    getSiteContent("contact_info", "ar"),
    getSiteContent("contact_info", "en"),
    getSiteContent("about_page", "ar"),
    getSiteContent("about_page", "en"),
    getSiteContent("homepage", "ar"),
    getSiteContent("homepage", "en"),
    getSiteContent("services_page", "ar"),
    getSiteContent("services_page", "en"),
  ]);

  const { t } = await getLocaleT();
  const supabase = await createClient();
  const { data: testimonials } = await supabase
    .from("testimonials")
    .select("*")
    .order("sort_order", { ascending: true });

  return (
    <div>
      <PageHeader title={t("adm.content")} description={t("adm.contentDesc")} />
      <ContentEditor
        contact={{ ar: contactAr, en: contactEn }}
        about={{ ar: aboutAr, en: aboutEn }}
        homepage={{ ar: homeAr, en: homeEn }}
        services={{ ar: servicesAr, en: servicesEn }}
        testimonials={(testimonials as Testimonial[]) ?? []}
      />
    </div>
  );
}

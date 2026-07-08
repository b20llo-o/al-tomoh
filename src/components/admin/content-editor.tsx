"use client";

import { useState } from "react";
import { Plus, Save, Trash2 } from "lucide-react";
import { saveSiteContent, saveTestimonial, deleteTestimonial } from "@/app/actions/admin";
import { useLocale } from "@/components/providers/locale-provider";
import type { MessageKey } from "@/lib/i18n";
import type { SiteContentMap, Testimonial } from "@/lib/types";
import { cn } from "@/lib/utils";

type Tab = "contact" | "homepage" | "about" | "services" | "testimonials";
type Bi<T> = { ar: T; en: T };

const TAB_KEYS: { key: Tab; label: MessageKey }[] = [
  { key: "contact", label: "adm.tabContact" },
  { key: "homepage", label: "adm.tabHomepage" },
  { key: "about", label: "adm.tabAbout" },
  { key: "services", label: "adm.tabServices" },
  { key: "testimonials", label: "adm.tabTestimonials" },
];

export function ContentEditor({
  contact,
  about,
  homepage,
  services,
  testimonials,
}: {
  contact: Bi<SiteContentMap["contact_info"]>;
  about: Bi<SiteContentMap["about_page"]>;
  homepage: Bi<SiteContentMap["homepage"]>;
  services: Bi<SiteContentMap["services_page"]>;
  testimonials: Testimonial[];
}) {
  const { t } = useLocale();
  const [tab, setTab] = useState<Tab>("contact");

  return (
    <div>
      <div className="mb-6 flex flex-wrap gap-1.5">
        {TAB_KEYS.map((item) => (
          <button
            key={item.key}
            type="button"
            onClick={() => setTab(item.key)}
            className={cn(
              "rounded-lg px-4 py-2 text-sm font-medium transition-colors",
              tab === item.key
                ? "bg-brand-500 text-white"
                : "bg-navy-900/5 text-navy-900/60 hover:text-navy-950 dark:bg-parchment-100/10 dark:text-parchment-100/60"
            )}
          >
            {t(item.label)}
          </button>
        ))}
      </div>

      {tab === "contact" && <ContactEditor initial={contact} />}
      {tab === "homepage" && <HomepageEditor initial={homepage} />}
      {tab === "about" && <AboutEditor initial={about} />}
      {tab === "services" && <ServicesEditor initial={services} />}
      {tab === "testimonials" && <TestimonialsEditor testimonials={testimonials} />}
    </div>
  );
}

/* ── shared save hook: saves Arabic to <key>, English to <key>__en ── */
function useBiSaver(key: string) {
  const [status, setStatus] = useState<{ ok: boolean; msg: string } | null>(null);
  const [saving, setSaving] = useState(false);
  async function save(ar: unknown, en: unknown) {
    setSaving(true);
    setStatus(null);
    const [r1, r2] = await Promise.all([
      saveSiteContent(key, ar),
      saveSiteContent(`${key}__en`, en),
    ]);
    const ok = r1.success && r2.success;
    setStatus({ ok, msg: ok ? r1.message : r1.message || r2.message });
    setSaving(false);
  }
  return { status, saving, save };
}

function SaveBar({
  saving,
  status,
}: {
  saving: boolean;
  status: { ok: boolean; msg: string } | null;
}) {
  const { t } = useLocale();
  return (
    <div className="mt-6 flex items-center gap-4">
      <button type="submit" disabled={saving} className="btn-primary">
        <Save className="h-4 w-4" strokeWidth={1.75} />
        {saving ? t("common.saving") : t("common.save")}
      </button>
      {status && (
        <p className={cn("text-sm", status.ok ? "text-brand-600 dark:text-brand-400" : "text-red-600 dark:text-red-400")}>
          {status.msg}
        </p>
      )}
    </div>
  );
}

/* ── bilingual field: Arabic input + English input, side by side ── */
function BiField({
  label,
  ar,
  en,
  onAr,
  onEn,
  textarea,
  rows = 3,
}: {
  label: string;
  ar: string;
  en: string;
  onAr: (v: string) => void;
  onEn: (v: string) => void;
  textarea?: boolean;
  rows?: number;
}) {
  return (
    <div>
      <span className="label-field">{label}</span>
      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <span className="mb-1 block text-[10px] font-semibold uppercase tracking-wider text-brand-600 dark:text-brand-400">
            عربي
          </span>
          {textarea ? (
            <textarea value={ar} onChange={(e) => onAr(e.target.value)} rows={rows} dir="rtl" className="input-field resize-y" />
          ) : (
            <input value={ar} onChange={(e) => onAr(e.target.value)} dir="rtl" className="input-field" />
          )}
        </div>
        <div>
          <span className="mb-1 block text-[10px] font-semibold uppercase tracking-wider text-navy-900/60 dark:text-parchment-100/60">
            English
          </span>
          {textarea ? (
            <textarea value={en} onChange={(e) => onEn(e.target.value)} rows={rows} dir="ltr" className="input-field resize-y" />
          ) : (
            <input value={en} onChange={(e) => onEn(e.target.value)} dir="ltr" className="input-field" />
          )}
        </div>
      </div>
    </div>
  );
}

function ContactEditor({ initial }: { initial: Bi<SiteContentMap["contact_info"]> }) {
  const [ar, setAr] = useState(initial.ar);
  const [en, setEn] = useState(initial.en);
  const { status, saving, save } = useBiSaver("contact_info");

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        save(ar, en);
      }}
      className="card-surface max-w-3xl space-y-5 p-6"
    >
      <BiField label="البريد الإلكتروني — Email" ar={ar.email} en={en.email} onAr={(v) => setAr({ ...ar, email: v })} onEn={(v) => setEn({ ...en, email: v })} />
      <BiField label="الهاتف — Phone" ar={ar.phone} en={en.phone} onAr={(v) => setAr({ ...ar, phone: v })} onEn={(v) => setEn({ ...en, phone: v })} />
      <BiField label="العنوان — Address" ar={ar.address} en={en.address} onAr={(v) => setAr({ ...ar, address: v })} onEn={(v) => setEn({ ...en, address: v })} textarea rows={2} />
      <BiField label="ساعات العمل — Working hours" ar={ar.working_hours} en={en.working_hours} onAr={(v) => setAr({ ...ar, working_hours: v })} onEn={(v) => setEn({ ...en, working_hours: v })} />
      <BiField label="رابط الخريطة — Map embed URL" ar={ar.map_embed_url} en={en.map_embed_url} onAr={(v) => setAr({ ...ar, map_embed_url: v })} onEn={(v) => setEn({ ...en, map_embed_url: v })} textarea rows={2} />
      <SaveBar saving={saving} status={status} />
    </form>
  );
}

function HomepageEditor({ initial }: { initial: Bi<SiteContentMap["homepage"]> }) {
  const [ar, setAr] = useState(initial.ar);
  const [en, setEn] = useState(initial.en);
  const { status, saving, save } = useBiSaver("homepage");

  function updateItem(lang: "ar" | "en", i: number, key: "title" | "description", value: string) {
    if (lang === "ar") {
      const items = [...ar.why_choose_us];
      items[i] = { ...items[i], [key]: value };
      setAr({ ...ar, why_choose_us: items });
    } else {
      const items = [...en.why_choose_us];
      items[i] = { ...items[i], [key]: value };
      setEn({ ...en, why_choose_us: items });
    }
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        save(ar, en);
      }}
      className="card-surface max-w-3xl space-y-5 p-6"
    >
      <BiField label="عنوان الهيرو — Hero title" ar={ar.hero_title} en={en.hero_title} onAr={(v) => setAr({ ...ar, hero_title: v })} onEn={(v) => setEn({ ...en, hero_title: v })} />
      <BiField label="نص الهيرو — Hero subtitle" ar={ar.hero_subtitle} en={en.hero_subtitle} onAr={(v) => setAr({ ...ar, hero_subtitle: v })} onEn={(v) => setEn({ ...en, hero_subtitle: v })} textarea />
      <div className="border-t border-navy-900/10 pt-5 dark:border-parchment-100/10">
        <h3 className="mb-3 text-sm font-semibold text-navy-950 dark:text-parchment-100">لماذا تختارنا — Why choose us</h3>
        <div className="space-y-4">
          {ar.why_choose_us.map((item, i) => (
            <div key={i} className="space-y-3 rounded-xl border border-navy-900/10 p-4 dark:border-parchment-100/10">
              <BiField label={`العنوان ${i + 1} — Title`} ar={item.title} en={en.why_choose_us[i]?.title ?? ""} onAr={(v) => updateItem("ar", i, "title", v)} onEn={(v) => updateItem("en", i, "title", v)} />
              <BiField label="الوصف — Description" ar={item.description} en={en.why_choose_us[i]?.description ?? ""} onAr={(v) => updateItem("ar", i, "description", v)} onEn={(v) => updateItem("en", i, "description", v)} textarea rows={2} />
            </div>
          ))}
        </div>
      </div>
      <SaveBar saving={saving} status={status} />
    </form>
  );
}

function AboutEditor({ initial }: { initial: Bi<SiteContentMap["about_page"]> }) {
  const [ar, setAr] = useState(initial.ar);
  const [en, setEn] = useState(initial.en);
  const { status, saving, save } = useBiSaver("about_page");

  function updateValue(lang: "ar" | "en", i: number, key: "title" | "description", value: string) {
    if (lang === "ar") {
      const values = [...ar.values];
      values[i] = { ...values[i], [key]: value };
      setAr({ ...ar, values });
    } else {
      const values = [...en.values];
      values[i] = { ...values[i], [key]: value };
      setEn({ ...en, values });
    }
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        save(ar, en);
      }}
      className="card-surface max-w-3xl space-y-5 p-6"
    >
      <BiField label="القصة — Story" ar={ar.story} en={en.story} onAr={(v) => setAr({ ...ar, story: v })} onEn={(v) => setEn({ ...en, story: v })} textarea rows={5} />
      <BiField label="الرسالة — Mission" ar={ar.mission} en={en.mission} onAr={(v) => setAr({ ...ar, mission: v })} onEn={(v) => setEn({ ...en, mission: v })} textarea rows={3} />
      <div className="border-t border-navy-900/10 pt-5 dark:border-parchment-100/10">
        <h3 className="mb-3 text-sm font-semibold text-navy-950 dark:text-parchment-100">القيم — Values</h3>
        <div className="space-y-4">
          {ar.values.map((value, i) => (
            <div key={i} className="space-y-3 rounded-xl border border-navy-900/10 p-4 dark:border-parchment-100/10">
              <BiField label={`القيمة ${i + 1} — Value title`} ar={value.title} en={en.values[i]?.title ?? ""} onAr={(v) => updateValue("ar", i, "title", v)} onEn={(v) => updateValue("en", i, "title", v)} />
              <BiField label="الوصف — Description" ar={value.description} en={en.values[i]?.description ?? ""} onAr={(v) => updateValue("ar", i, "description", v)} onEn={(v) => updateValue("en", i, "description", v)} textarea rows={2} />
            </div>
          ))}
        </div>
      </div>
      <SaveBar saving={saving} status={status} />
    </form>
  );
}

function ServicesEditor({ initial }: { initial: Bi<SiteContentMap["services_page"]> }) {
  const [ar, setAr] = useState(initial.ar);
  const [en, setEn] = useState(initial.en);
  const { status, saving, save } = useBiSaver("services_page");

  function updateService(lang: "ar" | "en", i: number, key: "title" | "description", value: string) {
    if (lang === "ar") {
      const services = [...ar.services];
      services[i] = { ...services[i], [key]: value };
      setAr({ ...ar, services });
    } else {
      const services = [...en.services];
      services[i] = { ...services[i], [key]: value };
      setEn({ ...en, services });
    }
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        save(ar, en);
      }}
      className="card-surface max-w-3xl space-y-5 p-6"
    >
      <BiField label="المقدمة — Intro" ar={ar.intro} en={en.intro} onAr={(v) => setAr({ ...ar, intro: v })} onEn={(v) => setEn({ ...en, intro: v })} textarea rows={3} />
      <div className="border-t border-navy-900/10 pt-5 dark:border-parchment-100/10">
        <h3 className="mb-3 text-sm font-semibold text-navy-950 dark:text-parchment-100">الخدمات — Services</h3>
        <div className="space-y-4">
          {ar.services.map((service, i) => (
            <div key={i} className="space-y-3 rounded-xl border border-navy-900/10 p-4 dark:border-parchment-100/10">
              <BiField label={`الخدمة ${i + 1} — Service title`} ar={service.title} en={en.services[i]?.title ?? ""} onAr={(v) => updateService("ar", i, "title", v)} onEn={(v) => updateService("en", i, "title", v)} />
              <BiField label="الوصف — Description" ar={service.description} en={en.services[i]?.description ?? ""} onAr={(v) => updateService("ar", i, "description", v)} onEn={(v) => updateService("en", i, "description", v)} textarea rows={2} />
            </div>
          ))}
        </div>
      </div>
      <SaveBar saving={saving} status={status} />
    </form>
  );
}

function TestimonialsEditor({ testimonials }: { testimonials: Testimonial[] }) {
  const { t } = useLocale();
  return (
    <div className="space-y-4">
      <div className="card-surface p-6">
        <h3 className="mb-4 font-display text-lg font-semibold text-navy-950 dark:text-parchment-50">
          {t("adm.tabTestimonials")}
        </h3>
        <TestimonialForm />
      </div>

      {testimonials.length > 0 && (
        <div className="space-y-3">
          {testimonials.map((item) => (
            <div key={item.id} className="card-surface p-5">
              <TestimonialForm testimonial={item} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function TestimonialForm({ testimonial }: { testimonial?: Testimonial }) {
  const { t } = useLocale();
  return (
    <form action={saveTestimonial} className="space-y-4">
      {testimonial && <input type="hidden" name="id" value={testimonial.id} />}
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block">
          <span className="label-field">الاسم — Name *</span>
          <input name="name" defaultValue={testimonial?.name ?? ""} required className="input-field" />
        </label>
        <label className="block">
          <span className="label-field">الصفة — Role</span>
          <input name="role" defaultValue={testimonial?.role ?? ""} className="input-field" />
        </label>
      </div>
      <label className="block">
        <span className="label-field">الرسالة — Message *</span>
        <textarea name="message" defaultValue={testimonial?.message ?? ""} required rows={3} className="input-field resize-y" />
      </label>
      <div className="flex flex-wrap items-center gap-4">
        <label className="block w-24">
          <span className="label-field">{t("adm.colOrderNum")}</span>
          <input name="sort_order" type="number" defaultValue={testimonial?.sort_order ?? 0} className="input-field" />
        </label>
        <label className="mt-6 flex cursor-pointer items-center gap-2 text-sm text-navy-900/80 dark:text-parchment-100/80">
          <input type="checkbox" name="is_visible" defaultChecked={testimonial?.is_visible ?? true} className="h-4 w-4 rounded accent-[#ee7124]" />
          {t("adm.visible")}
        </label>
        <div className="ms-auto mt-6 flex gap-2">
          <button type="submit" className="btn-primary h-9 px-4 text-xs">
            {testimonial ? t("common.save") : <><Plus className="h-3.5 w-3.5" strokeWidth={1.75} />{t("adm.newCategory") === "New category" ? "Add" : "إضافة"}</>}
          </button>
        </div>
      </div>
      {testimonial && (
        <div className="border-t border-navy-900/10 pt-3 dark:border-parchment-100/10">
          <button
            type="submit"
            formAction={deleteTestimonial}
            className="btn-ghost h-8 px-3 text-xs text-red-600 dark:text-red-400"
          >
            <Trash2 className="h-3.5 w-3.5" strokeWidth={1.75} />
            {t("adm.delete")}
          </button>
        </div>
      )}
    </form>
  );
}

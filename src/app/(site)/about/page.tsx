import { Compass, Feather, Library } from "lucide-react";
import { LogoMark } from "@/components/brand/logo";
import { getSiteContent } from "@/lib/data";
import { getLocaleT } from "@/lib/locale-server";

const VALUE_ICONS = [Library, Feather, Compass];

export default async function AboutPage() {
  const { locale, t } = await getLocaleT();
  const content = await getSiteContent("about_page", locale);

  return (
    <div>
      <section className="bg-navy-950 py-16 text-parchment-50 sm:py-20">
        <div className="container-page flex flex-col items-center gap-8 text-center">
          <LogoMark className="h-16 w-16 animate-scale-in" />
          <div className="max-w-3xl animate-fade-up">
            <span className="section-eyebrow !text-brand-400">{t("about.eyebrow")}</span>
            <h1 className="heading-display !text-parchment-50 text-3xl sm:text-4xl">
              {t("about.title")}
            </h1>
            <p className="mt-5 text-base leading-relaxed text-parchment-100/70">
              {content.story}
            </p>
          </div>
        </div>
      </section>

      <section className="container-page py-16 sm:py-20">
        <div className="card-surface mx-auto max-w-3xl p-8 text-center sm:p-12 animate-fade-up">
          <span className="section-eyebrow">{t("about.missionEyebrow")}</span>
          <p className="font-display text-xl leading-relaxed text-navy-950 dark:text-parchment-50 sm:text-2xl">
            {content.mission}
          </p>
        </div>
      </section>

      <section className="container-page pb-16 sm:pb-20">
        <div className="mb-10 text-center">
          <span className="section-eyebrow">{t("about.valuesEyebrow")}</span>
          <h2 className="heading-display text-2xl sm:text-3xl">{t("about.valuesTitle")}</h2>
        </div>
        <div className="grid gap-5 md:grid-cols-3">
          {content.values.map((value, index) => {
            const Icon = VALUE_ICONS[index % VALUE_ICONS.length];
            return (
              <div
                key={value.title}
                className="card-surface-hover p-8 text-center animate-fade-up"
                style={{ animationDelay: `${Math.min(index * 100, 300)}ms` }}
              >
                <span className="mx-auto mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-500/10 text-brand-600 dark:text-brand-400">
                  <Icon className="h-5 w-5" strokeWidth={1.5} />
                </span>
                <h3 className="font-display text-lg font-semibold text-navy-950 dark:text-parchment-50">
                  {value.title}
                </h3>
                <p className="mt-2.5 text-sm leading-relaxed text-muted">{value.description}</p>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}

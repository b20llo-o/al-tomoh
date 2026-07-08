import { Gift, HeadphonesIcon, PackageSearch, Truck } from "lucide-react";
import { getSiteContent } from "@/lib/data";
import { getLocaleT } from "@/lib/locale-server";

const SERVICE_ICONS = [Truck, Gift, PackageSearch, HeadphonesIcon];

export default async function ServicesPage() {
  const { locale, t } = await getLocaleT();
  const content = await getSiteContent("services_page", locale);

  return (
    <div className="container-page py-14 sm:py-16">
      <div className="mb-12 max-w-2xl animate-fade-up">
        <span className="section-eyebrow">{t("services.eyebrow")}</span>
        <h1 className="heading-display text-3xl sm:text-4xl">{t("services.title")}</h1>
        <p className="mt-3 text-sm leading-relaxed text-muted sm:text-base">{content.intro}</p>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        {content.services.map((service, index) => {
          const Icon = SERVICE_ICONS[index % SERVICE_ICONS.length];
          return (
            <div
              key={service.title}
              className="card-surface-hover p-8 animate-fade-up"
              style={{ animationDelay: `${Math.min(index * 80, 320)}ms` }}
            >
              <span className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-500/10 text-brand-600 dark:text-brand-400">
                <Icon className="h-5 w-5" strokeWidth={1.5} />
              </span>
              <h2 className="font-display text-xl font-semibold text-navy-950 dark:text-parchment-50">
                {service.title}
              </h2>
              <p className="mt-2.5 text-sm leading-relaxed text-muted">{service.description}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}

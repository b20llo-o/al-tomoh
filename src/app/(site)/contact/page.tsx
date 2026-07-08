import { Clock, Mail, MapPin, Phone } from "lucide-react";
import { ContactForm } from "@/components/contact/contact-form";
import { getSiteContent } from "@/lib/data";
import { getLocaleT } from "@/lib/locale-server";

export default async function ContactPage() {
  const { locale, t } = await getLocaleT();
  const contact = await getSiteContent("contact_info", locale);

  const details = [
    { icon: Mail, label: t("contact.emailLabel"), value: contact.email, ltr: true },
    { icon: Phone, label: t("contact.phoneLabel"), value: contact.phone, ltr: true },
    { icon: MapPin, label: t("contact.addressLabel"), value: contact.address, ltr: false },
    { icon: Clock, label: t("contact.hoursLabel"), value: contact.working_hours, ltr: false },
  ];

  return (
    <div className="container-page py-14 sm:py-16">
      <div className="mb-12 max-w-2xl animate-fade-up">
        <span className="section-eyebrow">{t("contact.eyebrow")}</span>
        <h1 className="heading-display text-3xl sm:text-4xl">{t("contact.title")}</h1>
        <p className="mt-3 text-sm leading-relaxed text-muted sm:text-base">{t("contact.desc")}</p>
      </div>

      <div className="grid gap-8 lg:grid-cols-5">
        <div className="card-surface p-8 lg:col-span-3 animate-fade-up">
          <h2 className="mb-6 font-display text-xl font-semibold text-navy-950 dark:text-parchment-50">
            {t("contact.formTitle")}
          </h2>
          <ContactForm />
        </div>

        <div className="flex flex-col gap-5 lg:col-span-2">
          <div className="card-surface p-8 animate-fade-up animation-delay-100">
            <h2 className="mb-6 font-display text-xl font-semibold text-navy-950 dark:text-parchment-50">
              {t("contact.visitTitle")}
            </h2>
            <ul className="space-y-5">
              {details.map((item) => (
                <li key={item.label} className="flex items-start gap-3.5">
                  <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-brand-500/10 text-brand-600 dark:text-brand-400">
                    <item.icon className="h-4 w-4" strokeWidth={1.75} />
                  </span>
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wider text-muted">
                      {item.label}
                    </p>
                    <p
                      className={`mt-0.5 text-sm text-navy-950 dark:text-parchment-100 ${item.ltr ? "force-ltr" : ""}`}
                    >
                      {item.value}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          <div className="card-surface overflow-hidden animate-fade-up animation-delay-200">
            <iframe
              src={contact.map_embed_url}
              title={t("contact.mapTitle")}
              className="h-64 w-full border-0"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

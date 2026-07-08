"use client";

import Link from "next/link";
import { Mail, MapPin, Phone } from "lucide-react";
import { BrandWordmark } from "@/components/brand/logo";
import { NewsletterForm } from "@/components/home/newsletter-form";
import { useLocale } from "@/components/providers/locale-provider";

export function Footer({
  contact,
}: {
  contact: { email: string; phone: string; address: string };
}) {
  const { t } = useLocale();

  const shopLinks = [
    { href: "/categories", label: t("footer.browseCategories") },
    { href: "/search", label: t("footer.allBooks") },
    { href: "/search?availability=in-stock", label: t("footer.inStock") },
    { href: "/cart", label: t("footer.shoppingCart") },
  ];

  const companyLinks = [
    { href: "/about", label: t("nav.about") },
    { href: "/services", label: t("nav.services") },
    { href: "/contact", label: t("nav.contact") },
    { href: "/login", label: t("footer.myAccount") },
  ];

  return (
    <footer className="border-t border-navy-900/10 bg-navy-950 text-parchment-100 dark:border-parchment-100/10">
      <div className="container-page py-14">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-4">
          <div>
            <div className="[&_span]:!text-parchment-50">
              <BrandWordmark />
            </div>
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-parchment-100/60">
              {t("footer.tagline")}
            </p>
          </div>

          <div>
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-[0.15em] text-brand-400">
              {t("footer.bookstore")}
            </h3>
            <ul className="space-y-2.5">
              {shopLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-parchment-100/70 transition-colors hover:text-brand-400"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-[0.15em] text-brand-400">
              {t("footer.company")}
            </h3>
            <ul className="space-y-2.5">
              {companyLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-parchment-100/70 transition-colors hover:text-brand-400"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-[0.15em] text-brand-400">
              {t("footer.stayInTouch")}
            </h3>
            <ul className="space-y-3 text-sm text-parchment-100/70">
              <li className="flex items-start gap-2.5">
                <Mail className="mt-0.5 h-4 w-4 shrink-0 text-brand-400" strokeWidth={1.75} />
                <span className="force-ltr">{contact.email}</span>
              </li>
              <li className="flex items-start gap-2.5">
                <Phone className="mt-0.5 h-4 w-4 shrink-0 text-brand-400" strokeWidth={1.75} />
                <span className="force-ltr">{contact.phone}</span>
              </li>
              <li className="flex items-start gap-2.5">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-brand-400" strokeWidth={1.75} />
                {contact.address}
              </li>
            </ul>
            <div className="mt-5">
              <NewsletterForm variant="footer" />
            </div>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-3 border-t border-parchment-100/10 pt-6 text-xs text-parchment-100/50 sm:flex-row">
          <p>
            © {new Date().getFullYear()} Al-Tomoh — {t("footer.rights")}
          </p>
          <p>{t("footer.physicalOnly")}</p>
        </div>
      </div>
    </footer>
  );
}

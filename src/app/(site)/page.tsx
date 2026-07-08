import Link from "next/link";
import {
  ArrowRight,
  BadgeCheck,
  BookOpen,
  Gift,
  HeadphonesIcon,
  Quote,
  Truck,
} from "lucide-react";
import { BookGrid } from "@/components/store/book-grid";
import { SectionHeading } from "@/components/store/section-heading";
import { NewsletterForm } from "@/components/home/newsletter-form";
import { LogoMark } from "@/components/brand/logo";
import {
  getActiveCategories,
  getSiteContent,
  getVisibleBooks,
  getVisibleTestimonials,
} from "@/lib/data";
import { getLocaleT } from "@/lib/locale-server";
import { categoryName, categoryDescription } from "@/lib/localize";

const WHY_ICONS = [BadgeCheck, Truck, Gift, HeadphonesIcon];

export default async function HomePage() {
  const { locale, t } = await getLocaleT();

  const [featured, newArrivals, bestsellers, categories, testimonials, homepage] =
    await Promise.all([
      getVisibleBooks({ featured: true, limit: 5 }),
      getVisibleBooks({ newArrival: true, limit: 5 }),
      getVisibleBooks({ bestseller: true, limit: 5 }),
      getActiveCategories(),
      getVisibleTestimonials(),
      getSiteContent("homepage", locale),
    ]);

  return (
    <div>
      {/* ── Hero ─────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-navy-950 text-parchment-50">
        <div
          className="pointer-events-none absolute -end-40 -top-40 h-[480px] w-[480px] rounded-full bg-brand-500/20 blur-3xl"
          aria-hidden="true"
        />
        <div
          className="pointer-events-none absolute -bottom-48 -start-24 h-[400px] w-[400px] rounded-full bg-navy-700/30 blur-3xl"
          aria-hidden="true"
        />
        <div className="container-page relative flex flex-col items-center gap-8 py-20 text-center sm:py-28">
          <div className="flex flex-col items-center gap-3 animate-scale-in">
            <LogoMark className="h-20 w-20 sm:h-24 sm:w-24" />
            <span className="section-eyebrow !mb-0 !text-brand-400">{t("home.heroEyebrow")}</span>
          </div>
          <div className="max-w-3xl animate-fade-up animation-delay-100">
            <h1 className="heading-display !text-parchment-50 text-4xl leading-tight sm:text-5xl lg:text-6xl">
              {homepage.hero_title}
            </h1>
            <p className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-parchment-100/70 sm:text-lg">
              {homepage.hero_subtitle}
            </p>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-3 animate-fade-up animation-delay-200">
            <Link href="/categories" className="btn-primary px-7 py-3 text-base">
              {t("home.explore")}
              <ArrowRight className="h-4 w-4 rtl:rotate-180" strokeWidth={1.75} />
            </Link>
            <Link
              href="/about"
              className="btn border border-parchment-100/25 px-7 py-3 text-base text-parchment-100 hover:border-brand-400 hover:text-brand-400"
            >
              {t("home.ourStory")}
            </Link>
          </div>
        </div>
      </section>

      {/* ── Featured books ───────────────────────────────────────────── */}
      <section className="container-page py-16 sm:py-20">
        <SectionHeading
          eyebrow={t("home.featuredEyebrow")}
          title={t("home.featuredTitle")}
          description={t("home.featuredDesc")}
          href="/search"
          linkLabel={t("home.browseAll")}
        />
        <BookGrid books={featured} emptyMessage={t("home.featuredEmpty")} />
      </section>

      {/* ── New arrivals ─────────────────────────────────────────────── */}
      <section className="bg-parchment-100/60 py-16 dark:bg-ink-900/50 sm:py-20">
        <div className="container-page">
          <SectionHeading
            eyebrow={t("home.newEyebrow")}
            title={t("home.newTitle")}
            description={t("home.newDesc")}
            href="/search?sort=newest"
            linkLabel={t("common.viewAll")}
          />
          <BookGrid books={newArrivals} emptyMessage={t("home.newEmpty")} />
        </div>
      </section>

      {/* ── Best sellers ─────────────────────────────────────────────── */}
      <section className="container-page py-16 sm:py-20">
        <SectionHeading
          eyebrow={t("home.bestEyebrow")}
          title={t("home.bestTitle")}
          description={t("home.bestDesc")}
          href="/search?sort=bestselling"
          linkLabel={t("common.viewAll")}
        />
        <BookGrid books={bestsellers} emptyMessage={t("home.bestEmpty")} />
      </section>

      {/* ── Category showcase ────────────────────────────────────────── */}
      {categories.length > 0 && (
        <section className="bg-navy-950 py-16 text-parchment-50 sm:py-20">
          <div className="container-page">
            <div className="mb-10 max-w-2xl">
              <span className="section-eyebrow !text-brand-400">{t("home.catEyebrow")}</span>
              <h2 className="heading-display !text-parchment-50 text-2xl sm:text-3xl">
                {t("home.catTitle")}
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-parchment-100/60 sm:text-base">
                {t("home.catDesc")}
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
              {categories.slice(0, 8).map((category) => (
                <Link
                  key={category.id}
                  href={`/categories/${category.slug}`}
                  className="group rounded-2xl border border-parchment-100/10 bg-parchment-100/5 p-6 transition-all duration-300 hover:-translate-y-1 hover:border-brand-500/50 hover:bg-parchment-100/10"
                >
                  <BookOpen
                    className="mb-4 h-6 w-6 text-brand-400 transition-transform duration-300 group-hover:scale-110"
                    strokeWidth={1.5}
                  />
                  <h3 className="font-display text-lg font-semibold">
                    {categoryName(category, locale)}
                  </h3>
                  {categoryDescription(category, locale) && (
                    <p className="mt-1.5 text-xs leading-relaxed text-parchment-100/50 line-clamp-2">
                      {categoryDescription(category, locale)}
                    </p>
                  )}
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── Why choose us ────────────────────────────────────────────── */}
      <section className="container-page py-16 sm:py-20">
        <SectionHeading
          eyebrow={t("home.whyEyebrow")}
          title={t("home.whyTitle")}
          description={t("home.whyDesc")}
        />
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {homepage.why_choose_us.map((item, index) => {
            const Icon = WHY_ICONS[index % WHY_ICONS.length];
            return (
              <div key={item.title} className="card-surface-hover p-6">
                <span className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-brand-500/10 text-brand-600 dark:text-brand-400">
                  <Icon className="h-5 w-5" strokeWidth={1.5} />
                </span>
                <h3 className="font-display text-lg font-semibold text-navy-950 dark:text-parchment-50">
                  {item.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-muted">{item.description}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* ── Testimonials ─────────────────────────────────────────────── */}
      {testimonials.length > 0 && (
        <section className="bg-parchment-100/60 py-16 dark:bg-ink-900/50 sm:py-20">
          <div className="container-page">
            <SectionHeading
              eyebrow={t("home.testiEyebrow")}
              title={t("home.testiTitle")}
              description={t("home.testiDesc")}
            />
            <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              {testimonials.slice(0, 6).map((testimonial) => (
                <figure key={testimonial.id} className="card-surface p-6">
                  <Quote
                    className="mb-4 h-6 w-6 text-brand-500/60"
                    strokeWidth={1.5}
                    aria-hidden="true"
                  />
                  <blockquote className="text-sm leading-relaxed text-navy-900/80 dark:text-parchment-100/80">
                    {testimonial.message}
                  </blockquote>
                  <figcaption className="mt-5 border-t border-navy-900/10 pt-4 dark:border-parchment-100/10">
                    <span className="block font-display text-sm font-semibold text-navy-950 dark:text-parchment-50">
                      {testimonial.name}
                    </span>
                    {testimonial.role && (
                      <span className="text-xs text-muted">{testimonial.role}</span>
                    )}
                  </figcaption>
                </figure>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── Newsletter ───────────────────────────────────────────────── */}
      <section className="container-page py-16 sm:py-20">
        <div className="card-surface relative overflow-hidden p-8 sm:p-12">
          <div
            className="pointer-events-none absolute -end-24 -top-24 h-64 w-64 rounded-full bg-brand-500/10 blur-3xl"
            aria-hidden="true"
          />
          <div className="relative grid items-center gap-8 lg:grid-cols-2">
            <div>
              <span className="section-eyebrow">{t("home.newsEyebrow")}</span>
              <h2 className="heading-display text-2xl sm:text-3xl">{t("home.newsTitle")}</h2>
              <p className="mt-3 max-w-md text-sm leading-relaxed text-muted sm:text-base">
                {t("home.newsDesc")}
              </p>
            </div>
            <div className="lg:justify-self-end lg:w-full lg:max-w-md">
              <NewsletterForm />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

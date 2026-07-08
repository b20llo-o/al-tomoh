import Link from "next/link";
import { LogoMark } from "@/components/brand/logo";
import { getLocaleT } from "@/lib/locale-server";

export default async function NotFound() {
  const { t } = await getLocaleT();

  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center gap-6 px-4 text-center">
      <LogoMark className="h-16 w-16" />
      <div>
        <p className="section-eyebrow">404</p>
        <h1 className="heading-display text-3xl">{t("nf.title")}</h1>
        <p className="mt-3 max-w-md text-sm text-muted">{t("nf.desc")}</p>
      </div>
      <Link href="/" className="btn-primary">
        {t("nf.back")}
      </Link>
    </div>
  );
}

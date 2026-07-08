import "server-only";
import { cookies } from "next/headers";
import { DEFAULT_LOCALE, LOCALE_COOKIE, getT, isLocale, type Locale } from "./i18n";

/** Read the visitor's locale from the cookie (Arabic by default). */
export async function getLocale(): Promise<Locale> {
  const value = (await cookies()).get(LOCALE_COOKIE)?.value;
  return isLocale(value) ? value : DEFAULT_LOCALE;
}

/** Locale + bound translator in one call for server components. */
export async function getLocaleT() {
  const locale = await getLocale();
  return { locale, t: getT(locale) };
}

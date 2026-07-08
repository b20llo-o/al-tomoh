import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { getSiteContent } from "@/lib/data";
import { getLocale } from "@/lib/locale-server";

export default async function SiteLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  // No auth round-trip here — the navbar resolves the session client-side,
  // so public pages render without waiting on Supabase auth.
  const locale = await getLocale();
  const contact = await getSiteContent("contact_info", locale);

  return (
    <>
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer contact={contact} />
    </>
  );
}

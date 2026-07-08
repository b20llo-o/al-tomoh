import { notFound } from "next/navigation";
import { AdminShell } from "@/components/admin/admin-shell";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

/**
 * Hidden host console. This layout is a hard gate: any visitor who is not a
 * verified, non-suspended admin receives a 404 — the console never reveals
 * its own existence. The middleware performs the same check first, so an
 * unauthorized request never even renders this tree.
 */
export default async function HostConsoleLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) notFound();

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, role, is_suspended")
    .eq("id", user.id)
    .maybeSingle();

  if (!profile || profile.role !== "admin" || profile.is_suspended) {
    notFound();
  }

  return (
    <AdminShell adminName={profile.full_name ?? user.email ?? "Administrator"}>
      {children}
    </AdminShell>
  );
}

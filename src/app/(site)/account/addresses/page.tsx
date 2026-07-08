import { createClient } from "@/lib/supabase/server";
import { AddressManager } from "@/components/account/address-manager";
import type { Address } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function AddressesPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data } = await supabase
    .from("addresses")
    .select("*")
    .eq("user_id", user!.id)
    .order("is_default", { ascending: false })
    .order("created_at", { ascending: false });

  return <AddressManager addresses={(data as Address[]) ?? []} />;
}

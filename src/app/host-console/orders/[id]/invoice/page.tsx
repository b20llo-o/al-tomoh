import { notFound } from "next/navigation";
import { Invoice } from "@/components/store/invoice";
import { createClient } from "@/lib/supabase/server";
import { getSiteContent } from "@/lib/data";
import type { Order, OrderItem } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function AdminInvoicePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data } = await supabase
    .from("orders")
    .select("*, order_items(*)")
    .eq("id", id)
    .maybeSingle();

  if (!data) notFound();
  const contact = await getSiteContent("contact_info");

  return <Invoice order={data as Order & { order_items: OrderItem[] }} contact={contact} />;
}

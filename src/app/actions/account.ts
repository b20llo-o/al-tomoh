"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getLocaleT } from "@/lib/locale-server";

export interface AccountResult {
  success: boolean;
  message: string;
}

async function requireUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return { supabase, user };
}

export async function updateProfile(
  _prev: AccountResult | null,
  formData: FormData
): Promise<AccountResult> {
  const { t } = await getLocaleT();
  const { supabase, user } = await requireUser();
  if (!user) return { success: false, message: t("common.signInFirst") };

  const fullName = String(formData.get("full_name") ?? "").trim();
  const phone = String(formData.get("phone") ?? "").trim();
  if (!fullName) return { success: false, message: t("acc.nameRequired") };

  const { error } = await supabase
    .from("profiles")
    .update({ full_name: fullName, phone: phone || null })
    .eq("id", user.id);
  if (error) return { success: false, message: t("common.error") };

  revalidatePath("/account");
  return { success: true, message: t("acc.profileSaved") };
}

export async function saveAddress(
  _prev: AccountResult | null,
  formData: FormData
): Promise<AccountResult> {
  const { t } = await getLocaleT();
  const { supabase, user } = await requireUser();
  if (!user) return { success: false, message: t("common.signInFirst") };

  const id = String(formData.get("id") ?? "").trim();
  const payload = {
    user_id: user.id,
    label: String(formData.get("label") ?? "Home").trim() || "Home",
    full_name: String(formData.get("full_name") ?? "").trim(),
    phone: String(formData.get("phone") ?? "").trim(),
    country: String(formData.get("country") ?? "").trim(),
    city: String(formData.get("city") ?? "").trim(),
    district: String(formData.get("district") ?? "").trim() || null,
    postal_code: String(formData.get("postal_code") ?? "").trim() || null,
    address_line: String(formData.get("address_line") ?? "").trim(),
    is_default: formData.get("is_default") === "on",
  };

  if (!payload.full_name || !payload.phone || !payload.country || !payload.city || !payload.address_line) {
    return { success: false, message: t("acc.addressInvalid") };
  }

  // Only one default address per customer.
  if (payload.is_default) {
    await supabase.from("addresses").update({ is_default: false }).eq("user_id", user.id);
  }

  const { error } = id
    ? await supabase.from("addresses").update(payload).eq("id", id).eq("user_id", user.id)
    : await supabase.from("addresses").insert(payload);

  if (error) return { success: false, message: t("common.error") };

  revalidatePath("/account/addresses");
  return { success: true, message: t("acc.addressSaved") };
}

export async function deleteAddress(formData: FormData): Promise<void> {
  const { supabase, user } = await requireUser();
  if (!user) return;
  const id = String(formData.get("id") ?? "").trim();
  if (!id) return;
  await supabase.from("addresses").delete().eq("id", id).eq("user_id", user.id);
  revalidatePath("/account/addresses");
}

export async function removeFromWishlist(formData: FormData): Promise<void> {
  const { supabase, user } = await requireUser();
  if (!user) return;
  const bookId = String(formData.get("book_id") ?? "").trim();
  if (!bookId) return;
  await supabase.from("wishlists").delete().eq("user_id", user.id).eq("book_id", bookId);
  revalidatePath("/account/wishlist");
}

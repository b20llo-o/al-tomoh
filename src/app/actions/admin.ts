"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { ADMIN_PATH } from "@/lib/defaults";
import { slugify } from "@/lib/utils";
import type {
  OrderStatus,
  SiteContentKey,
  StoreSettingsKey,
} from "@/lib/types";

export interface AdminResult {
  success: boolean;
  message: string;
}

/** Verifies the caller is a non-suspended admin. Every mutation goes through this. */
async function requireAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { supabase, user: null, isAdmin: false };
  const { data: profile } = await supabase
    .from("profiles")
    .select("role, is_suspended")
    .eq("id", user.id)
    .maybeSingle();
  const isAdmin = profile?.role === "admin" && !profile.is_suspended;
  return { supabase, user, isAdmin };
}

async function logActivity(
  action: string,
  entity: string,
  entityId: string | null,
  details?: Record<string, unknown>
) {
  const { supabase, user, isAdmin } = await requireAdmin();
  if (!isAdmin || !user) return;
  await supabase.from("activity_logs").insert({
    admin_id: user.id,
    action,
    entity,
    entity_id: entityId,
    details: details ?? null,
  });
}

const DENIED: AdminResult = {
  success: false,
  message: "You are not authorized to perform this action.",
};

// ── Books ──────────────────────────────────────────────────────────────

function parseBookForm(formData: FormData) {
  const title = String(formData.get("title") ?? "").trim();
  const providedSlug = String(formData.get("slug") ?? "").trim();
  const priceTry = Number(formData.get("price_try"));
  const priceUsdRaw = String(formData.get("price_usd") ?? "").trim();
  const galleryRaw = String(formData.get("gallery") ?? "").trim();

  // Multi-category: all checked category ids; the first is the primary.
  const categoryIds = formData
    .getAll("category_ids")
    .map((v) => String(v).trim())
    .filter(Boolean);
  const primaryCategory =
    String(formData.get("category_id") ?? "").trim() || categoryIds[0] || null;

  return {
    title,
    title_en: String(formData.get("title_en") ?? "").trim() || null,
    slug: providedSlug ? slugify(providedSlug) : slugify(title),
    author: String(formData.get("author") ?? "").trim(),
    author_en: String(formData.get("author_en") ?? "").trim() || null,
    publisher: String(formData.get("publisher") ?? "").trim() || null,
    publisher_en: String(formData.get("publisher_en") ?? "").trim() || null,
    isbn: String(formData.get("isbn") ?? "").trim() || null,
    description: String(formData.get("description") ?? "").trim() || null,
    description_en: String(formData.get("description_en") ?? "").trim() || null,
    category_id: primaryCategory,
    category_ids: categoryIds,
    price_try: Number.isFinite(priceTry) ? priceTry : 0,
    price_usd: priceUsdRaw ? Number(priceUsdRaw) : null,
    pages: formData.get("pages") ? Number(formData.get("pages")) : null,
    language: String(formData.get("language") ?? "").trim() || null,
    publication_year: formData.get("publication_year")
      ? Number(formData.get("publication_year"))
      : null,
    stock: Number(formData.get("stock")) || 0,
    is_featured: formData.get("is_featured") === "on",
    is_bestseller: formData.get("is_bestseller") === "on",
    is_new_arrival: formData.get("is_new_arrival") === "on",
    is_visible: formData.get("is_visible") === "on",
    cover_url: String(formData.get("cover_url") ?? "").trim() || null,
    gallery: galleryRaw
      ? galleryRaw.split(/[\n,]/).map((s) => s.trim()).filter(Boolean)
      : [],
  };
}

export async function saveBook(
  _prev: AdminResult | null,
  formData: FormData
): Promise<AdminResult> {
  const { supabase, isAdmin } = await requireAdmin();
  if (!isAdmin) return DENIED;

  const id = String(formData.get("id") ?? "").trim();
  const payload = parseBookForm(formData);
  if (!payload.title || !payload.author || !payload.slug) {
    return { success: false, message: "Title, author, and slug are required." };
  }
  if (payload.price_try <= 0) {
    return { success: false, message: "Please enter a valid SYP price." };
  }

  if (id) {
    const { error } = await supabase
      .from("books")
      .update({ ...payload, updated_at: new Date().toISOString() })
      .eq("id", id);
    if (error) {
      return { success: false, message: humanizeError(error.message) };
    }
    await logActivity("update", "book", id, { title: payload.title });
  } else {
    const { data, error } = await supabase
      .from("books")
      .insert(payload)
      .select("id")
      .single();
    if (error) {
      return { success: false, message: humanizeError(error.message) };
    }
    await logActivity("create", "book", data?.id ?? null, { title: payload.title });
  }

  revalidateTag("books");
  revalidatePath(`${ADMIN_PATH}/books`);
  return { success: true, message: "Book saved." };
}

export async function setBookVisibility(formData: FormData): Promise<void> {
  const { supabase, isAdmin } = await requireAdmin();
  if (!isAdmin) return;
  const id = String(formData.get("id") ?? "").trim();
  const visible = formData.get("visible") === "true";
  if (!id) return;
  await supabase.from("books").update({ is_visible: visible }).eq("id", id);
  await logActivity(visible ? "show" : "hide", "book", id);
  revalidateTag("books");
  revalidatePath(`${ADMIN_PATH}/books`);
}

export async function softDeleteBook(formData: FormData): Promise<void> {
  const { supabase, isAdmin } = await requireAdmin();
  if (!isAdmin) return;
  const id = String(formData.get("id") ?? "").trim();
  const restore = formData.get("restore") === "true";
  if (!id) return;
  await supabase
    .from("books")
    .update({ is_deleted: !restore, is_visible: restore })
    .eq("id", id);
  await logActivity(restore ? "restore" : "delete", "book", id);
  revalidateTag("books");
  revalidatePath(`${ADMIN_PATH}/books`);
}

// ── Categories ─────────────────────────────────────────────────────────

export async function saveCategory(
  _prev: AdminResult | null,
  formData: FormData
): Promise<AdminResult> {
  const { supabase, isAdmin } = await requireAdmin();
  if (!isAdmin) return DENIED;

  const id = String(formData.get("id") ?? "").trim();
  const name = String(formData.get("name") ?? "").trim();
  if (!name) return { success: false, message: "Category name is required." };

  const payload = {
    name,
    name_en: String(formData.get("name_en") ?? "").trim() || null,
    slug: slugify(String(formData.get("slug") ?? "").trim() || name),
    description: String(formData.get("description") ?? "").trim() || null,
    description_en: String(formData.get("description_en") ?? "").trim() || null,
    sort_order: Number(formData.get("sort_order")) || 0,
    is_active: formData.get("is_active") === "on",
  };

  const { error } = id
    ? await supabase.from("categories").update(payload).eq("id", id)
    : await supabase.from("categories").insert(payload);
  if (error) return { success: false, message: humanizeError(error.message) };

  await logActivity(id ? "update" : "create", "category", id || null, { name });
  revalidateTag("categories");
  revalidateTag("books");
  revalidatePath(`${ADMIN_PATH}/categories`);
  return { success: true, message: "Category saved." };
}

export async function deleteCategory(formData: FormData): Promise<void> {
  const { supabase, isAdmin } = await requireAdmin();
  if (!isAdmin) return;
  const id = String(formData.get("id") ?? "").trim();
  if (!id) return;
  await supabase.from("categories").delete().eq("id", id);
  await logActivity("delete", "category", id);
  revalidateTag("categories");
  revalidateTag("books");
  revalidatePath(`${ADMIN_PATH}/categories`);
}

// ── Orders ─────────────────────────────────────────────────────────────

export async function updateOrder(
  _prev: AdminResult | null,
  formData: FormData
): Promise<AdminResult> {
  const { supabase, isAdmin } = await requireAdmin();
  if (!isAdmin) return DENIED;

  const id = String(formData.get("id") ?? "").trim();
  if (!id) return { success: false, message: "Missing order." };

  const status = String(formData.get("status") ?? "") as OrderStatus;
  const paymentStatus = String(formData.get("payment_status") ?? "");
  const tracking = String(formData.get("tracking_number") ?? "").trim() || null;

  const { error } = await supabase
    .from("orders")
    .update({
      status,
      payment_status: paymentStatus,
      tracking_number: tracking,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);
  if (error) return { success: false, message: humanizeError(error.message) };

  await logActivity("update", "order", id, { status, paymentStatus });
  revalidatePath(`${ADMIN_PATH}/orders`);
  return { success: true, message: "Order updated." };
}

// ── Customers ──────────────────────────────────────────────────────────

export async function setUserSuspended(formData: FormData): Promise<void> {
  const { supabase, user, isAdmin } = await requireAdmin();
  if (!isAdmin) return;
  const id = String(formData.get("id") ?? "").trim();
  const suspend = formData.get("suspend") === "true";
  if (!id || id === user?.id) return; // never suspend yourself
  await supabase.from("profiles").update({ is_suspended: suspend }).eq("id", id);
  await logActivity(suspend ? "suspend" : "reinstate", "user", id);
  revalidatePath(`${ADMIN_PATH}/customers`);
}

// ── Content & settings ─────────────────────────────────────────────────

/**
 * Save a content block. `rowKey` is the storage key: the block key for Arabic
 * (e.g. "about_page") or the block key + "__en" for English (e.g.
 * "about_page__en"). This lets each page block hold both languages.
 */
export async function saveSiteContent(
  rowKey: string,
  value: unknown
): Promise<AdminResult> {
  const { supabase, isAdmin } = await requireAdmin();
  if (!isAdmin) return DENIED;

  const { error } = await supabase
    .from("site_content")
    .upsert({ key: rowKey, value, updated_at: new Date().toISOString() }, { onConflict: "key" });
  if (error) return { success: false, message: humanizeError(error.message) };

  await logActivity("update", "site_content", rowKey);
  revalidateTag("content");
  revalidatePath("/", "layout");
  return { success: true, message: "Content saved." };
}

export async function saveStoreSetting(
  key: StoreSettingsKey,
  value: unknown
): Promise<AdminResult> {
  const { supabase, isAdmin } = await requireAdmin();
  if (!isAdmin) return DENIED;

  const { error } = await supabase
    .from("store_settings")
    .upsert({ key, value, updated_at: new Date().toISOString() }, { onConflict: "key" });
  if (error) return { success: false, message: humanizeError(error.message) };

  await logActivity("update", "store_settings", key);
  revalidateTag("settings");
  revalidatePath("/", "layout");
  return { success: true, message: "Settings saved." };
}

// ── Testimonials ───────────────────────────────────────────────────────

export async function saveTestimonial(formData: FormData): Promise<void> {
  const { supabase, isAdmin } = await requireAdmin();
  if (!isAdmin) return;

  const id = String(formData.get("id") ?? "").trim();
  const payload = {
    name: String(formData.get("name") ?? "").trim(),
    role: String(formData.get("role") ?? "").trim() || null,
    message: String(formData.get("message") ?? "").trim(),
    is_visible: formData.get("is_visible") === "on",
    sort_order: Number(formData.get("sort_order")) || 0,
  };
  if (!payload.name || !payload.message) return;

  if (id) {
    await supabase.from("testimonials").update(payload).eq("id", id);
  } else {
    await supabase.from("testimonials").insert(payload);
  }

  await logActivity(id ? "update" : "create", "testimonial", id || null);
  revalidateTag("content");
  revalidatePath(`${ADMIN_PATH}/content`);
}

export async function deleteTestimonial(formData: FormData): Promise<void> {
  const { supabase, isAdmin } = await requireAdmin();
  if (!isAdmin) return;
  const id = String(formData.get("id") ?? "").trim();
  if (!id) return;
  await supabase.from("testimonials").delete().eq("id", id);
  await logActivity("delete", "testimonial", id);
  revalidateTag("content");
  revalidatePath(`${ADMIN_PATH}/content`);
}

function humanizeError(message: string): string {
  if (/duplicate key/i.test(message) && /slug/i.test(message)) {
    return "That slug is already in use. Please choose another.";
  }
  if (/duplicate key/i.test(message)) {
    return "A record with these details already exists.";
  }
  return message;
}

"use server";

import { createClient } from "@/lib/supabase/server";
import { slugify } from "@/lib/utils";

export interface UploadResult {
  success: boolean;
  url?: string;
  message?: string;
}

const BUCKET = "book-covers";
const MAX_BYTES = 5 * 1024 * 1024;
const ALLOWED = ["image/jpeg", "image/png", "image/webp", "image/avif"];

/** Uploads a book cover to Supabase Storage and returns its public URL. Admin-only. */
export async function uploadBookCover(formData: FormData): Promise<UploadResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { success: false, message: "Not authorized." };

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, is_suspended")
    .eq("id", user.id)
    .maybeSingle();
  if (profile?.role !== "admin" || profile.is_suspended) {
    return { success: false, message: "Not authorized." };
  }

  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) {
    return { success: false, message: "Please choose an image." };
  }
  if (file.size > MAX_BYTES) {
    return { success: false, message: "Image must be 5 MB or smaller." };
  }
  if (!ALLOWED.includes(file.type)) {
    return { success: false, message: "Use a JPG, PNG, WebP, or AVIF image." };
  }

  const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
  const base = slugify(file.name.replace(/\.[^.]+$/, "")) || "cover";
  const path = `${base}-${Date.now()}.${ext}`;

  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(path, file, { cacheControl: "3600", upsert: false, contentType: file.type });
  if (error) {
    return {
      success: false,
      message:
        "Upload failed. Ensure the 'book-covers' storage bucket exists and is public.",
    };
  }

  const {
    data: { publicUrl },
  } = supabase.storage.from(BUCKET).getPublicUrl(path);
  return { success: true, url: publicUrl };
}

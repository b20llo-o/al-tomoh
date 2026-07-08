"use server";

import { createClient } from "@/lib/supabase/server";
import { getLocaleT } from "@/lib/locale-server";

export interface ActionResult {
  success: boolean;
  message: string;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function subscribeToNewsletter(
  _prev: ActionResult | null,
  formData: FormData
): Promise<ActionResult> {
  const { t } = await getLocaleT();
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  if (!EMAIL_RE.test(email)) {
    return { success: false, message: t("news.invalid") };
  }

  try {
    const supabase = await createClient();
    const { error } = await supabase.from("newsletter_subscribers").insert({ email });
    if (error) {
      if (error.code === "23505") {
        return { success: true, message: t("news.already") };
      }
      return { success: false, message: t("common.error") };
    }
    return { success: true, message: t("news.success") };
  } catch {
    return { success: false, message: t("common.error") };
  }
}

export async function sendContactMessage(
  _prev: ActionResult | null,
  formData: FormData
): Promise<ActionResult> {
  const { t } = await getLocaleT();
  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const subject = String(formData.get("subject") ?? "").trim();
  const message = String(formData.get("message") ?? "").trim();

  if (!name || !message || !EMAIL_RE.test(email)) {
    return { success: false, message: t("contact.invalid") };
  }
  if (message.length > 5000) {
    return { success: false, message: t("contact.tooLong") };
  }

  try {
    const supabase = await createClient();
    const { error } = await supabase
      .from("contact_messages")
      .insert({ name, email, subject: subject || null, message });
    if (error) {
      return { success: false, message: t("common.error") };
    }
    return { success: true, message: t("contact.success") };
  } catch {
    return { success: false, message: t("common.error") };
  }
}

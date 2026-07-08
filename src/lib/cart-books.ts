import { createClient } from "@/lib/supabase/client";
import { BOOK_SELECT } from "@/lib/queries";
import type { Book } from "@/lib/types";

/**
 * Fetch the current, purchasable version of each book in the cart directly
 * from Supabase. Books that have been hidden, deleted, or removed simply
 * fall out of the cart — prices are never trusted from the client.
 */
export async function fetchCartBooks(bookIds: string[]): Promise<Book[]> {
  if (bookIds.length === 0) return [];
  const supabase = createClient();
  const { data, error } = await supabase
    .from("books")
    .select(BOOK_SELECT)
    .in("id", bookIds)
    .eq("is_visible", true)
    .eq("is_deleted", false);
  if (error) return [];
  return (data ?? []) as Book[];
}

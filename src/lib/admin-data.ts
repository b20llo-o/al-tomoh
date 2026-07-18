import "server-only";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import type { Book, Category, Order, OrderItem, Profile } from "@/lib/types";

interface DashboardBook {
  id: string;
  title: string;
  author: string | null;
  stock: number;
  slug: string;
  created_at: string;
}

/** Confirms the current session belongs to a non-suspended admin. */
export async function assertAdmin(): Promise<boolean> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return false;
    const { data } = await supabase
      .from("profiles")
      .select("role, is_suspended")
      .eq("id", user.id)
      .maybeSingle();
    return data?.role === "admin" && !data.is_suspended;
  } catch {
    return false;
  }
}

export interface DashboardStats {
  customerCount: number;
  bookCount: number;
  categoryCount: number;
  lowStockCount: number;
  lowStockBooks: DashboardBook[];
  recentBooks: DashboardBook[];
}

/**
 * Ordering happens over WhatsApp, so the dashboard is catalogue-focused: it
 * surfaces what the bookseller actually manages here — stock to replenish and
 * recently added titles — rather than order/revenue figures.
 */
export async function getDashboardStats(): Promise<DashboardStats> {
  const supabase = await createClient();

  const [customersRes, booksRes, categoriesRes, stockRes, recentRes] =
    await Promise.all([
      supabase.from("profiles").select("id", { count: "exact", head: true }).eq("role", "customer"),
      supabase.from("books").select("id", { count: "exact", head: true }).eq("is_deleted", false),
      supabase.from("categories").select("id", { count: "exact", head: true }),
      supabase
        .from("books")
        .select("id, title, author, stock, slug, created_at")
        .eq("is_deleted", false)
        .lte("stock", 3)
        .order("stock", { ascending: true })
        .limit(8),
      supabase
        .from("books")
        .select("id, title, author, stock, slug, created_at")
        .eq("is_deleted", false)
        .order("created_at", { ascending: false })
        .limit(6),
    ]);

  const lowStockBooks = (stockRes.data as DashboardBook[]) ?? [];

  return {
    customerCount: customersRes.count ?? 0,
    bookCount: booksRes.count ?? 0,
    categoryCount: categoriesRes.count ?? 0,
    lowStockCount: lowStockBooks.length,
    lowStockBooks,
    recentBooks: (recentRes.data as DashboardBook[]) ?? [],
  };
}

export async function getAllBooks(): Promise<Book[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("books")
    .select("*, category:categories(*)")
    .order("created_at", { ascending: false });
  return (data as Book[]) ?? [];
}

export async function getAllCategories(): Promise<Category[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("categories")
    .select("*")
    .order("sort_order", { ascending: true });
  return (data as Category[]) ?? [];
}

export async function getAllOrders(): Promise<(Order & { order_items: OrderItem[] })[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("orders")
    .select("*, order_items(*)")
    .order("created_at", { ascending: false });
  return (data as (Order & { order_items: OrderItem[] })[]) ?? [];
}

export async function getAllCustomers(): Promise<
  (Profile & { order_count: number; email: string | null })[]
> {
  const supabase = await createClient();
  const { data: profiles } = await supabase
    .from("profiles")
    .select("*")
    .order("created_at", { ascending: false });
  const { data: orders } = await supabase.from("orders").select("user_id");

  const counts = new Map<string, number>();
  for (const o of orders ?? []) {
    counts.set(o.user_id, (counts.get(o.user_id) ?? 0) + 1);
  }

  // Emails live in auth.users, not profiles — read them with the service-role
  // client. Degrades to null when the key isn't configured.
  const emailById = new Map<string, string>();
  const admin = createAdminClient();
  if (admin) {
    try {
      const { data } = await admin.auth.admin.listUsers({ page: 1, perPage: 1000 });
      for (const u of data?.users ?? []) {
        if (u.email) emailById.set(u.id, u.email);
      }
    } catch {
      // ignore — the table still renders without emails
    }
  }

  return ((profiles as Profile[]) ?? []).map((p) => ({
    ...p,
    order_count: counts.get(p.id) ?? 0,
    email: emailById.get(p.id) ?? null,
  }));
}

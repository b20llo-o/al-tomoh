import "server-only";
import { createClient } from "@/lib/supabase/server";
import type { Book, Category, Order, OrderItem, Profile } from "@/lib/types";

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
  revenue: number;
  orderCount: number;
  pendingOrders: number;
  customerCount: number;
  bookCount: number;
  lowStockCount: number;
  recentOrders: (Order & { order_items: OrderItem[] })[];
  bestSellers: { title: string; author: string | null; sold: number }[];
}

export async function getDashboardStats(): Promise<DashboardStats> {
  const supabase = await createClient();

  const [ordersRes, paidRes, customersRes, booksRes, itemsRes] = await Promise.all([
    supabase.from("orders").select("id, status", { count: "exact" }),
    supabase.from("orders").select("total, currency, exchange_rate").eq("payment_status", "paid"),
    supabase.from("profiles").select("id", { count: "exact", head: true }).eq("role", "customer"),
    supabase.from("books").select("id, stock", { count: "exact" }).eq("is_deleted", false),
    supabase.from("order_items").select("title, author, quantity"),
  ]);

  // Revenue is normalized to TRY so mixed-currency orders total consistently.
  const revenue = (paidRes.data ?? []).reduce((sum, o) => {
    const inTry = o.currency === "USD" ? o.total * (o.exchange_rate || 1) : o.total;
    return sum + inTry;
  }, 0);

  const pendingOrders = (ordersRes.data ?? []).filter(
    (o) => o.status === "pending" || o.status === "processing"
  ).length;

  const lowStockCount = (booksRes.data ?? []).filter((b) => b.stock <= 3).length;

  const soldMap = new Map<string, { title: string; author: string | null; sold: number }>();
  for (const item of itemsRes.data ?? []) {
    const existing = soldMap.get(item.title);
    if (existing) {
      existing.sold += item.quantity;
    } else {
      soldMap.set(item.title, { title: item.title, author: item.author, sold: item.quantity });
    }
  }
  const bestSellers = Array.from(soldMap.values())
    .sort((a, b) => b.sold - a.sold)
    .slice(0, 5);

  const { data: recent } = await supabase
    .from("orders")
    .select("*, order_items(id, quantity)")
    .order("created_at", { ascending: false })
    .limit(6);

  return {
    revenue,
    orderCount: ordersRes.count ?? 0,
    pendingOrders,
    customerCount: customersRes.count ?? 0,
    bookCount: booksRes.count ?? 0,
    lowStockCount,
    recentOrders: (recent as (Order & { order_items: OrderItem[] })[]) ?? [],
    bestSellers,
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
  (Profile & { order_count: number })[]
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

  return ((profiles as Profile[]) ?? []).map((p) => ({
    ...p,
    order_count: counts.get(p.id) ?? 0,
  }));
}

export type UserRole = "customer" | "admin";

export type OrderStatus =
  | "pending"
  | "processing"
  | "shipped"
  | "delivered"
  | "cancelled";

export type PaymentStatus = "pending" | "paid" | "failed" | "refunded";

export type Currency = "TRY" | "USD";

export interface Profile {
  id: string;
  full_name: string | null;
  phone: string | null;
  role: UserRole;
  is_suspended: boolean;
  created_at: string;
}

export interface Category {
  id: string;
  name: string;
  /** Optional English name; falls back to `name` when empty. */
  name_en: string | null;
  slug: string;
  description: string | null;
  /** Optional English description; falls back to `description` when empty. */
  description_en: string | null;
  sort_order: number;
  is_active: boolean;
  created_at: string;
}

export interface Book {
  id: string;
  title: string;
  /** Optional English variants; fall back to the primary field when empty. */
  title_en: string | null;
  slug: string;
  author: string;
  author_en: string | null;
  publisher: string | null;
  publisher_en: string | null;
  isbn: string | null;
  description: string | null;
  description_en: string | null;
  category_id: string | null;
  /** Additional category ids for multi-category books (primary is category_id). */
  category_ids: string[];
  price_try: number;
  price_usd: number | null;
  pages: number | null;
  language: string | null;
  publication_year: number | null;
  stock: number;
  is_featured: boolean;
  is_bestseller: boolean;
  is_new_arrival: boolean;
  is_visible: boolean;
  is_deleted: boolean;
  cover_url: string | null;
  gallery: string[];
  created_at: string;
  updated_at: string;
  /** Primary category (joined). */
  category?: Category | null;
  /** All extra categories (joined via book_categories). */
  categories?: Category[];
}

export interface Address {
  id: string;
  user_id: string;
  label: string;
  full_name: string;
  phone: string;
  country: string;
  city: string;
  district: string | null;
  postal_code: string | null;
  address_line: string;
  is_default: boolean;
  created_at: string;
}

export interface Order {
  id: string;
  order_number: string;
  user_id: string;
  status: OrderStatus;
  payment_status: PaymentStatus;
  payment_provider: string | null;
  payment_reference: string | null;
  currency: Currency;
  exchange_rate: number;
  subtotal: number;
  shipping_cost: number;
  tax_amount: number;
  total: number;
  shipping_full_name: string;
  shipping_phone: string;
  shipping_country: string;
  shipping_city: string;
  shipping_district: string | null;
  shipping_postal_code: string | null;
  shipping_address_line: string;
  tracking_number: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
  order_items?: OrderItem[];
  profile?: Profile | null;
}

export interface OrderItem {
  id: string;
  order_id: string;
  book_id: string | null;
  title: string;
  author: string | null;
  unit_price: number;
  quantity: number;
  book?: Book | null;
}

export interface WishlistItem {
  id: string;
  user_id: string;
  book_id: string;
  created_at: string;
  book?: Book | null;
}

export interface Testimonial {
  id: string;
  name: string;
  role: string | null;
  message: string;
  is_visible: boolean;
  sort_order: number;
}

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  subject: string | null;
  message: string;
  is_read: boolean;
  created_at: string;
}

export interface ActivityLog {
  id: string;
  admin_id: string | null;
  action: string;
  entity: string;
  entity_id: string | null;
  details: Record<string, unknown> | null;
  created_at: string;
  admin?: Profile | null;
}

/** Editable site content blocks stored as JSON in `site_content` */
export interface SiteContentMap {
  contact_info: {
    email: string;
    phone: string;
    address: string;
    map_embed_url: string;
    working_hours: string;
  };
  about_page: {
    story: string;
    mission: string;
    values: { title: string; description: string }[];
  };
  homepage: {
    hero_title: string;
    hero_subtitle: string;
    why_choose_us: { title: string; description: string }[];
  };
  services_page: {
    intro: string;
    services: { title: string; description: string }[];
  };
}

export type SiteContentKey = keyof SiteContentMap;

/** Store configuration stored as JSON in `store_settings` */
export interface StoreSettingsMap {
  currency: {
    /** How many TRY one USD buys — used to derive USD prices when a book has no explicit USD price */
    try_per_usd: number;
  };
  shipping: {
    domestic_flat_try: number;
    international_flat_usd: number;
    free_shipping_threshold_try: number;
  };
  tax: {
    /** VAT percentage applied at checkout, e.g. 0 for tax-inclusive prices */
    vat_percent: number;
    prices_include_tax: boolean;
  };
  payments: {
    enable_card_payments: boolean;
    enable_bank_transfer: boolean;
    bank_transfer_instructions: string;
  };
}

export type StoreSettingsKey = keyof StoreSettingsMap;

export interface CartLine {
  bookId: string;
  quantity: number;
}

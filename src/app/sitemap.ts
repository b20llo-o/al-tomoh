import type { MetadataRoute } from "next";
import { getActiveCategories, getVisibleBooks } from "@/lib/data";

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://al-tomoh.example";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes = ["", "/categories", "/services", "/about", "/contact", "/login", "/search"].map(
    (path) => ({
      url: `${BASE_URL}${path}`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: path === "" ? 1 : 0.7,
    })
  );

  const [books, categories] = await Promise.all([
    getVisibleBooks({ limit: 200 }),
    getActiveCategories(),
  ]);

  const bookRoutes = books.map((book) => ({
    url: `${BASE_URL}/books/${book.slug}`,
    lastModified: new Date(book.updated_at),
    changeFrequency: "weekly" as const,
    priority: 0.6,
  }));

  const categoryRoutes = categories.map((category) => ({
    url: `${BASE_URL}/categories/${category.slug}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.5,
  }));

  return [...staticRoutes, ...categoryRoutes, ...bookRoutes];
}

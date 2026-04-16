import type { MetadataRoute } from "next";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL;
const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://artsandcraftstudio.in";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticUrls: MetadataRoute.Sitemap = [
    {
      url: siteUrl,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1.0,
    },
    {
      url: `${siteUrl}/products`,
      lastModified: new Date(),
      changeFrequency: "hourly",
      priority: 0.9,
    },
    {
      url: `${siteUrl}/custom-art`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${siteUrl}/about-us`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: `${siteUrl}/contact`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.4,
    },
    {
      url: `${siteUrl}/faq/collector`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.4,
    },
    {
      url: `${siteUrl}/faq/seller`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.4,
    },
    {
      url: `${siteUrl}/terms`,
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 0.2,
    },
    {
      url: `${siteUrl}/privacy`,
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 0.2,
    },
    {
      url: `${siteUrl}/shipping-policy`,
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 0.2,
    },
    {
      url: `${siteUrl}/cancellation-policy`,
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 0.2,
    },
  ];

  // Fetch all published products
  let productUrls: MetadataRoute.Sitemap = [];
  try {
    const res = await fetch(
      `${API_BASE}/api/products/all-products?take=500&skip=0`,
      { next: { revalidate: 3600 } }
    );
    if (res.ok) {
      const result = await res.json();
      if (result.status === 1 && Array.isArray(result.data)) {
        productUrls = result.data.map((p: { id: string; updated_at?: string }) => ({
          url: `${siteUrl}/products/${p.id}`,
          lastModified: p.updated_at ? new Date(p.updated_at) : new Date(),
          changeFrequency: "weekly" as const,
          priority: 0.7,
        }));
      }
    }
  } catch {
    // silently skip if API is unavailable during build
  }

  // Fetch all artists
  let artistUrls: MetadataRoute.Sitemap = [];
  try {
    const res = await fetch(
      `${API_BASE}/api/user/artists-dropdown?take=500&skip=0`,
      { next: { revalidate: 3600 } }
    );
    if (res.ok) {
      const result = await res.json();
      if (result.status === 1 && Array.isArray(result.data)) {
        artistUrls = result.data.map((a: { id: string }) => ({
          url: `${siteUrl}/artist/${a.id}`,
          lastModified: new Date(),
          changeFrequency: "weekly" as const,
          priority: 0.6,
        }));
      }
    }
  } catch {
    // silently skip if API is unavailable during build
  }

  return [...staticUrls, ...productUrls, ...artistUrls];
}

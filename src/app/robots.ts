import type { MetadataRoute } from "next";

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://artsandcraftstudio.in";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: [
          "/",
          "/products",
          "/artist",
          "/about-us",
          "/contact",
          "/faq",
          "/custom-art",
          "/terms",
          "/shipping-policy",
          "/cancellation-policy",
        ],
        disallow: [
          "/dashboard/",
          "/seller/",
          "/cart",
          "/checkout/",
          "/login",
          "/signup",
          "/auth/",
          "/api/",
        ],
      },
    ],
    sitemap: `${siteUrl}/sitemap.xml`,
    host: siteUrl,
  };
}

import type { Metadata } from "next";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "Browse Artworks",
  description:
    "Explore a curated collection of handcrafted paintings, sculptures, prints, and custom art from independent artists on Arts & Craft Studio.",
  path: "/products",
});

export default function ProductsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

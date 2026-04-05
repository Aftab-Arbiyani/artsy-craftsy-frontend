import type { Metadata } from "next";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "FAQ for Artists & Sellers",
  description:
    "Everything artists need to know about listing artworks, accepting commissions, getting paid, and managing their shop on Arts & Craft Studio.",
  path: "/faq/seller",
});

export default function FAQSellerLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

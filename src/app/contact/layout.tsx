import type { Metadata } from "next";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "Contact Us",
  description:
    "Get in touch with Arts & Craft Studio. Email us at support.artsandcraftstudio@gmail.com — we typically respond within 24 hours.",
  path: "/contact",
});

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

import type { Metadata } from "next";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "FAQ for Collectors",
  description:
    "Find answers to common questions about buying art, placing orders, commissions, payments, and shipping on Arts & Craft Studio.",
  path: "/faq/collector",
});

export default function FAQCollectorLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

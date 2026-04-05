import type { Metadata } from "next";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "Commission Custom Art",
  description:
    "Request a one-of-a-kind custom artwork tailored to your vision. Describe your idea and connect with a skilled artist on Arts & Craft Studio.",
  path: "/custom-art",
});

export default function CustomArtLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

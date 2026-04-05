import type { Metadata } from "next";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "Sign Up",
  description: "Create your Arts & Craft Studio account.",
  path: "/signup",
  noindex: true,
});

export default function SignupLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

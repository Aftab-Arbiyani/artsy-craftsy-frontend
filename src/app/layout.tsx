import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { CartProvider } from "@/context/CartProvider";
import { Suspense } from "react";
import HeaderSkeleton from "@/components/skeletons/HeaderSkeleton";
import { PageTransitionProvider } from "@/context/PageTransitionProvider";
import PageTransitionLoader from "@/components/layout/PageTransitionLoader";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://artsandcraftstudio.in";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Arts & Craft Studio — Discover & Commission Unique Art",
    template: "%s | Arts & Craft Studio",
  },
  description:
    "Buy, sell, and commission handcrafted art pieces from independent artists. Explore paintings, sculptures, custom artwork and more.",
  keywords: [
    "handmade art",
    "commission art",
    "buy original artwork",
    "craft studio",
    "independent artists",
    "custom art India",
  ],
  authors: [{ name: "Arts & Craft Studio", url: siteUrl }],
  creator: "Arts & Craft Studio",
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large" },
  },
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: siteUrl,
    siteName: "Arts & Craft Studio",
    title: "Arts & Craft Studio — Discover & Commission Unique Art",
    description:
      "Buy, sell, and commission handcrafted art from independent artists.",
    images: [
      {
        url: "/og-default.jpg",
        width: 1200,
        height: 630,
        alt: "Arts & Craft Studio",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Arts & Craft Studio",
    description: "Discover & commission unique handcrafted art.",
    images: ["/og-default.jpg"],
  },
  icons: {
    icon: [
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
    ],
    apple: "/apple-touch-icon.png",
  },
};

const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "Arts & Craft Studio",
  url: siteUrl,
  logo: `${siteUrl}/icon-512x512.png`,
  contactPoint: {
    "@type": "ContactPoint",
    email: "support.artsandcraftstudio@gmail.com",
    contactType: "customer support",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="font-body antialiased flex flex-col min-h-screen" suppressHydrationWarning>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
        />
        <Suspense fallback={null}>
          <PageTransitionProvider>
            <CartProvider>
              <Suspense fallback={<HeaderSkeleton />}>
                <Header />
              </Suspense>

              <main className="flex-grow container mx-auto px-4 py-8">
                {children}
              </main>

              <Footer />
              <Toaster />

              <Suspense fallback={null}>
                <PageTransitionLoader />
              </Suspense>
            </CartProvider>
          </PageTransitionProvider>
        </Suspense>
      </body>
    </html>
  );
}

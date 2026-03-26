import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { CartProvider } from "@/context/CartProvider";
import { Suspense } from "react";
import HeaderSkeleton from "@/components/skeletons/HeaderSkeleton";
import { PageTransitionProvider } from "@/context/PageTransitionProvider";
import PageTransitionLoader from "@/components/layout/PageTransitionLoader";

export const metadata: Metadata = {
  title: "A&C Studio - Your destination for unique art",
  description: "Discover and commission beautiful art pieces on A&C Studio.",
  icons: {
    icon: [
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
    ],
    apple: "/apple-touch-icon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="font-body antialiased flex flex-col min-h-screen" suppressHydrationWarning>
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

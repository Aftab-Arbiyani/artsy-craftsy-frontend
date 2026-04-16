import type { Metadata } from "next";
import { Suspense } from "react";
import ProductsListing from "./ProductsListing";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import ProductCardSkeleton from "@/components/skeletons/ProductCardSkeleton";

export const metadata: Metadata = {
  title: "Browse Artworks",
  description:
    "Explore paintings, sculptures, custom artwork and more from independent artists across India. Filter by category, artist, orientation and price.",
  alternates: { canonical: "/products" },
  openGraph: {
    type: "website",
    title: "Browse Artworks | Arts & Craft Studio",
    description:
      "Explore paintings, sculptures, and custom artwork from independent artists across India.",
  },
};

export default function ProductsPage() {
  return (
    <Suspense
      fallback={
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
          <aside className="lg:col-span-1 lg:sticky top-24">
            <Card className="p-4">
              <CardContent className="p-0">
                <div className="space-y-4">
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full" />
                </div>
              </CardContent>
            </Card>
          </aside>
          <main className="lg:col-span-3 space-y-6">
            <div className="flex justify-center">
              <Skeleton className="h-10 w-full max-w-md" />
            </div>
            <div className="columns-1 sm:columns-2 lg:columns-3 gap-6 space-y-6">
              {Array.from({ length: 9 }).map((_, index) => (
                <div key={index} className="break-inside-avoid">
                  <ProductCardSkeleton />
                </div>
              ))}
            </div>
          </main>
        </div>
      }
    >
      <ProductsListing />
    </Suspense>
  );
}

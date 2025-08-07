"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useRouter, useParams, useSearchParams } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import ArtworkUploadForm from "@/components/seller/ArtworkUploadForm";
import type { Category } from "@/lib/types";
import { Loader2, ArrowLeft, Edit } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

function EditProductPageComponent() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const { id: artworkId } = params;
  const { toast } = useToast();

  const [artwork, setArtwork] = useState(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const isViewMode = searchParams.get("view") === "true";

  useEffect(() => {
    const fetchInitialData = async () => {
      const token = localStorage.getItem("authToken");
      if (!token) {
        toast({
          title: "Authentication Error",
          description: "You must be logged in.",
          variant: "destructive",
        });
        router.push("/login");
        return;
      }

      try {
        // Fetch Categories
        const categoryResponse = await fetch(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/category/dropdown`,
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        );
        if (categoryResponse.ok) {
          const catResult = await categoryResponse.json();
          if (catResult.status === 1) setCategories(catResult.data);
        }

        // Fetch Artwork Details
        if (artworkId) {
          const artworkResponse = await fetch(
            `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/products/product-details/${artworkId}`,
            {
              headers: { Authorization: `Bearer ${token}` },
            },
          );

          if (artworkResponse.ok) {
            const artworkResult = await artworkResponse.json();
            if (artworkResult.status === 1) {
              setArtwork(artworkResult.data);
            } else {
              toast({
                title: "Error",
                description: artworkResult.message,
                variant: "destructive",
              });
            }
          } else {
            toast({
              title: "Error",
              description: "Failed to fetch artwork details.",
              variant: "destructive",
            });
          }
        }
      } catch (error) {
        console.error("Failed to fetch data:", error);
        toast({
          title: "Error",
          description: "Could not connect to the server.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchInitialData();
  }, [artworkId, router, toast]);

  const handleSuccess = () => {
    router.push("/seller/my-artworks");
  };

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="ml-4 text-muted-foreground">Loading Artwork Details...</p>
      </div>
    );
  }

  const title = isViewMode ? "View Artwork Details" : "Edit Artwork";
  const description = isViewMode
    ? "Review the details for your artwork."
    : "Update the details for your artwork below.";

  return (
    <div className="container mx-auto max-w-6xl py-8">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <Link href="/seller/my-artworks" passHref>
            <Button variant="outline" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="font-headline text-2xl sm:text-3xl font-semibold">
              {title}
            </h1>
            <p className="text-muted-foreground">{description}</p>
          </div>
        </div>
        {isViewMode && (
          <Link href={`/seller/edit-product/${artworkId}`} passHref>
            <Button>
              <Edit className="mr-2 h-4 w-4" />
              Edit Artwork
            </Button>
          </Link>
        )}
      </div>

      <ArtworkUploadForm
        artworkNumber={1}
        categories={categories}
        onSubmitSuccess={handleSuccess}
        isStandalone={true}
        artwork={artwork}
        isViewMode={isViewMode}
      />
    </div>
  );
}

export default function EditProductPage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-screen items-center justify-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
        </div>
      }
    >
      <EditProductPageComponent />
    </Suspense>
  );
}

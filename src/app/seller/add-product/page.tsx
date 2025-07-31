"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import ArtworkUploadForm from "@/components/seller/ArtworkUploadForm";
import type { Category } from "@/lib/types";
import { Loader2, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function AddProductPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isFetchingCategories, setIsFetchingCategories] = useState(true);
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    const fetchInitialData = async () => {
      const token = localStorage.getItem("authToken");
      if (!token) {
        toast({
          title: "Authentication Error",
          description: "You must be logged in to add a product.",
          variant: "destructive",
        });
        router.push("/login");
        return;
      }

      // Fetch Categories
      try {
        const categoryResponse = await fetch(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/category/dropdown`,
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        );

        if (categoryResponse.ok) {
          const result = await categoryResponse.json();
          if (result.status === 1 && Array.isArray(result.data)) {
            setCategories(result.data);
          } else {
            toast({
              title: "Error",
              description: "Could not load categories.",
              variant: "destructive",
            });
          }
        } else {
          toast({
            title: "Error",
            description: "Failed to fetch categories from the server.",
            variant: "destructive",
          });
        }
      } catch (error) {
        console.error("Failed to fetch categories:", error);
        toast({
          title: "Error",
          description: "Could not connect to the server.",
          variant: "destructive",
        });
      } finally {
        setIsFetchingCategories(false);
      }
    };

    fetchInitialData();
  }, [router, toast]);

  const handleSuccess = () => {
    // Redirect to dashboard or products page after successful submission
    router.push("/seller/my-artworks");
  };

  if (isFetchingCategories) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="ml-4 text-muted-foreground">Loading...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-6xl py-8">
      <div className="flex items-center gap-4 mb-8">
        <Link href="/seller/my-artworks" passHref>
          <Button variant="outline" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="font-headline text-2xl sm:text-3xl font-semibold">
            Add a New Artwork
          </h1>
          <p className="text-muted-foreground">
            Fill in the details below to list your artwork for sale.
          </p>
        </div>
      </div>

      <ArtworkUploadForm
        artworkNumber={1}
        categories={categories}
        onSubmitSuccess={handleSuccess}
        isStandalone={true}
      />
    </div>
  );
}

"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import ProductCard from "@/components/products/ProductCard";
import {
  Loader2,
  User,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import type { Product } from "@/lib/types";
import { Separator } from "@/components/ui/separator";

interface ArtistDetails {
  id: string;
  name: string;
  email?: string;
  bio: string;
  profile_picture?: string;
  address?: {
    city: string;
    country: string;
  };
}

const PRODUCTS_PER_PAGE = 8;

export default function ArtistProfilePage() {
  const params = useParams();
  const { id } = params;
  const [artist, setArtist] = useState<ArtistDetails | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);

  useEffect(() => {
    if (!id) {
      setError("Artist ID is missing.");
      setIsLoading(false);
      return;
    }

    const fetchArtistData = async () => {
      setIsLoading(true);
      try {
        // Fetch artist details and products in parallel
        const [artistResponse, productsResponse] = await Promise.all([
          fetch(
            `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/user/artist-profile/${id}`,
          ),
          fetch(
            `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/products/artist-products/${id}?take=${PRODUCTS_PER_PAGE}&skip=${(currentPage - 1) * PRODUCTS_PER_PAGE}`,
          ),
        ]);

        // Process artist details
        const artistResult = await artistResponse.json();
        if (artistResponse.ok && artistResult.status === 1) {
          const artistData = artistResult.data;
          const artistAddress = artistData.addresses && artistData.addresses.length > 0 ? {
              city: artistData.addresses[0].city,
              country: artistData.addresses[0].country || 'India', // Assuming country, add fallback
          } : undefined;

          setArtist({
            id: artistData.id,
            name: artistData.name,
            bio: artistData.bio,
            profile_picture: artistData.profile_picture,
            address: artistAddress
          });
        } else {
          setError(artistResult.message || "Failed to fetch artist details.");
          setIsLoading(false);
          return;
        }

        // Process artist products
        const productsResult = await productsResponse.json();
        if (productsResponse.ok && productsResult.status === 1) {
          const transformedProducts: Product[] = productsResult.data.map(
            (item: any) => ({
              id: item.id,
              name: item.title,
              description: item.description || "",
              price: parseFloat(item.listing_price),
              discount: item.discount ? parseFloat(item.discount) : undefined,
              category: item.category?.name || "Uncategorized",
              imageUrls: item.media?.map((m: any) =>
                m.file_path
                  ? `${process.env.NEXT_PUBLIC_IMAGE_BASE_URL}${m.file_path}`
                  : "https://placehold.co/600x400.png",
              ) || ["https://placehold.co/600x400.png"],
              artist: artistResult.data?.name || "Unknown Artist",
              medium: item.materials?.name,
              dataAiHint: item.category?.name?.toLowerCase() || "artwork",
            }),
          );
          setProducts(transformedProducts);
          setTotalProducts(productsResult.total);
        } else {
          // It's not an error if an artist has no products
          setProducts([]);
          setTotalProducts(0);
        }

        setError(null);
      } catch (err) {
        setError("An unexpected error occurred. Please try again later.");
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchArtistData();
  }, [id, currentPage]);

  const totalPages = Math.ceil(totalProducts / PRODUCTS_PER_PAGE);

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-[50vh]">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <AlertTriangle className="mx-auto h-16 w-16 text-destructive mb-4" />
        <h1 className="font-headline text-3xl mb-4">Error</h1>
        <p className="text-muted-foreground">{error}</p>
      </div>
    );
  }

  if (!artist) {
    return (
      <div className="text-center py-12">
        <User className="mx-auto h-16 w-16 text-muted-foreground mb-4" />
        <h1 className="font-headline text-3xl mb-4">Artist Not Found</h1>
        <p className="text-muted-foreground">
          The artist you are looking for does not exist.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <header className="bg-card p-8 rounded-lg shadow-lg">
      <div className="flex flex-col md:flex-row items-center gap-8">
        <Avatar className="h-32 w-32 border-4 border-background shadow-md overflow-hidden rounded-full">
        <Image
          src={
          artist.profile_picture
            ? `${process.env.NEXT_PUBLIC_IMAGE_BASE_URL}${artist.profile_picture}`
            : "https://placehold.co/128x128.png"
          }
          alt={artist.name}
          data-ai-hint="artist portrait"
          width={128}
          height={128}
          className="object-cover w-full h-full"
        />
        <AvatarFallback>{artist.name.charAt(0)}</AvatarFallback>
        </Avatar>
        <div className="text-center md:text-left">
          <h1 className="font-headline text-4xl font-bold">{artist.name}</h1>
          <p className="text-muted-foreground mt-1">
            {artist.address?.city || "Location not available"},{" "}
            {artist.address?.country}
          </p>
          <div className="mt-4 prose prose-sm text-muted-foreground max-w-2xl">
            <p>{artist.bio}</p>
          </div>
        </div>
      </div>
      </header>

      <Separator />

      <main>
        {products.length > 0 ? (
          <>
            <div className="columns-2 sm:columns-2 md:columns-3 lg:columns-4 gap-6 space-y-6">
              {products.map((product) => (
                <div key={product.id} className="break-inside-avoid">
                  <ProductCard product={product} />
                </div>
              ))}
            </div>
            {totalPages > 1 && (
              <div className="flex justify-center items-center space-x-4 mt-12">
                <Button
                  variant="outline"
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="mr-2 h-4 w-4" /> Previous
                </Button>
                <span className="text-sm font-medium">
                  Page {currentPage} of {totalPages}
                </span>
                <Button
                  variant="outline"
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                >
                  Next <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            )}
          </>
        ) : (
          <p className="text-center text-muted-foreground py-8">
            This artist has not listed any artworks yet.
          </p>
        )}
      </main>
    </div>
  );
}

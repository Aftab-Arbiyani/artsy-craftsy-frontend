"use client";

import React from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import type { Product } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { ShoppingCart, Zap } from "lucide-react";
import { useCart } from "@/context/CartProvider";
import { useToast } from "@/hooks/use-toast";
import { Separator } from "@/components/ui/separator";
import Link from "next/link";
import { useState, useEffect } from "react";
import ProductDetailsSkeleton from "@/components/skeletons/ProductDetailsSkeleton";
import { cn } from "@/lib/utils";
import MinimalProductCard from "@/components/products/MinimalProductCard";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const DetailRow = ({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) => {
  if (!value) return null;
  return (
    <React.Fragment>
      <dt className="text-sm text-muted-foreground">{label}</dt>
      <dd className="text-sm text-foreground">{value}</dd>
    </React.Fragment>
  );
};

export default function ProductDetailsPage() {
  const params = useParams();
  const { id } = params;
  const router = useRouter();
  const [product, setProduct] = useState<Product | undefined | null>(undefined);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState<string>("");

  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [artistProducts, setArtistProducts] = useState<Product[]>([]);

  const { addItem } = useCart();
  const { toast } = useToast();

  useEffect(() => {
    if (!id) {
      setIsLoading(false);
      setProduct(null);
      return;
    }

    const fetchProductAndRelated = async () => {
      setIsLoading(true);
      try {
        // Fetch main product
        const productResponse = await fetch(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/products/${id}`,
        );
        if (!productResponse.ok) {
          setProduct(null);
          return;
        }
        const productResult = await productResponse.json();

        if (productResult.status === 1 && productResult.data) {
          const apiProduct = productResult.data;
          const imageUrls = apiProduct.media?.map((m: any) =>
            m.file_path
              ? `${process.env.NEXT_PUBLIC_IMAGE_BASE_URL}${m.file_path}`
              : "https://placehold.co/600x400.png",
          ) || ["https://placehold.co/600x400.png"];

          const transformedProduct: Product = {
            id: apiProduct.id,
            name: apiProduct.title,
            description: apiProduct.description,
            price: parseFloat(apiProduct.listing_price),
            discount: apiProduct.discount
              ? parseFloat(apiProduct.discount)
              : undefined,
            category: apiProduct.category?.name || "Uncategorized",
            imageUrls: imageUrls,
            artist: apiProduct.user?.name || "Unknown Artist",
            medium: apiProduct.materials?.name,
            dimensions:
              apiProduct.width && apiProduct.height
                ? `${apiProduct.width}x${apiProduct.height} inches`
                : undefined,
            dataAiHint: apiProduct.category?.name?.toLowerCase() || "artwork",
            year: apiProduct.year_of_artwork,
          };
          setProduct(transformedProduct);
          if (transformedProduct.imageUrls.length > 0) {
            setSelectedImage(transformedProduct.imageUrls[0]);
          }

          // Fetch related and artist products
          const relatedResponse = await fetch(
            `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/products/related-products/${id}`,
          );
          if (relatedResponse.ok) {
            const relatedResult = await relatedResponse.json();
            if (relatedResult.status === 1 && relatedResult.data) {
              const transformApiProduct = (item: any): Product => ({
                id: item.id,
                name: item.title,
                description: item.description || "",
                price: item.listing_price
                  ? parseFloat(item.listing_price)
                  : undefined,
                imageUrls: item.media?.map((m: any) =>
                  m.file_path
                    ? `${process.env.NEXT_PUBLIC_IMAGE_BASE_URL}${m.file_path}`
                    : "https://placehold.co/600x400.png",
                ) || ["https://placehold.co/600x400.png"],
                artist: item.user?.name || "Unknown Artist",
                category: item.category?.name || "Uncategorized",
              });

              if (Array.isArray(relatedResult.data.related_products)) {
                setRelatedProducts(
                  relatedResult.data.related_products.map(transformApiProduct),
                );
              }
              if (Array.isArray(relatedResult.data.related_artist_products)) {
                setArtistProducts(
                  relatedResult.data.related_artist_products.map(
                    transformApiProduct,
                  ),
                );
              }
            }
          }
        } else {
          setProduct(null);
        }
      } catch (error) {
        console.error("Failed to fetch product details:", error);
        setProduct(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProductAndRelated();
  }, [id]);

  if (isLoading) {
    return <ProductDetailsSkeleton />;
  }

  if (product === null) {
    return (
      <div className="text-center py-12">
        <h1 className="font-headline text-3xl mb-4">Product Not Found</h1>
        <p className="text-muted-foreground mb-6">
          Sorry, we couldn't find the product you're looking for.
        </p>
        <Link href="/products">
          <Button variant="outline">Back to Products</Button>
        </Link>
      </div>
    );
  }

  if (!product) return null;

  const handleAddToCart = () => {
    if (!product.price) return; // Or handle it differently
    addItem(product as Product & { price: number });
    toast({
      title: "Added to Cart",
      description: `${product.name} has been added to your cart.`,
      variant: "success",
    });
  };

  const handleBuyNow = () => {
    if (!product.price) return;
    addItem(product as Product & { price: number });
    router.push("/checkout");
  };

  const hasDiscount =
    !!product.discount && product.discount > 0 && product.price;
  const discountedPrice =
    hasDiscount && product.price !== undefined
      ? product.price * (1 - (product.discount ?? 0) / 100)
      : (product.price ?? 0);

  return (
    <div className="space-y-12">
      {/* Centered Image Gallery */}
      <div className="w-full max-w-2xl mx-auto space-y-4">
        <div className="relative aspect-auto w-full overflow-hidden rounded-lg shadow-lg">
          {hasDiscount && (
            <div className="absolute top-3 right-3 bg-destructive text-destructive-foreground text-xs font-bold px-2.5 py-1 rounded-full z-10">
              {product.discount}% OFF
            </div>
          )}
          <Image
            src={selectedImage || (product.imageUrls && product.imageUrls[0])}
            alt={product.name}
            width={600}
            height={600}
            className="object-contain w-full h-auto transition-opacity duration-300"
            priority
            data-ai-hint={product.dataAiHint || "art product detail"}
          />
        </div>
        {product.imageUrls && product.imageUrls.length > 1 && (
          <div className="flex justify-center gap-2">
            {product.imageUrls.map((imgUrl, index) => (
              <div
                key={index}
                onClick={() => setSelectedImage(imgUrl)}
                className={cn(
                  "relative w-20 h-20 rounded-md overflow-hidden cursor-pointer border-2 transition-all",
                  selectedImage === imgUrl
                    ? "border-primary"
                    : "border-transparent hover:border-muted-foreground",
                )}
              >
                <Image
                  src={imgUrl}
                  alt={`${product.name} thumbnail ${index + 1}`}
                  fill
                  sizes="80px"
                  className="object-contain"
                />
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="max-w-4xl mx-auto space-y-10">
        {/* Title and Price */}
        <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
          <div className="space-y-2">
            <h1 className="font-headline text-4xl lg:text-5xl font-bold">
              {product.name}
            </h1>
            {product.price && (
              <div className="flex items-baseline gap-4">
                <p className="text-2xl text-primary font-semibold">
                  ₹{discountedPrice?.toLocaleString("en-IN")}
                </p>
                {hasDiscount && (
                  <p className="text-xl text-muted-foreground line-through">
                    ₹{product.price.toLocaleString("en-IN")}
                  </p>
                )}
              </div>
            )}
          </div>
          {product.price && (
            <div className="flex items-center gap-2 w-full md:w-auto">
              <Button
                size="lg"
                onClick={handleAddToCart}
                className="flex-1 bg-primary hover:bg-primary/90"
              >
                <ShoppingCart className="mr-2 h-5 w-5" /> Add to Cart
              </Button>
              <Button
                size="lg"
                onClick={handleBuyNow}
                variant="outline"
                className="flex-1"
              >
                <Zap className="mr-2 h-5 w-5" /> Buy Now
              </Button>
            </div>
          )}
        </div>

        <Separator />

        <div className="grid lg:grid-cols-2 gap-x-12 gap-y-8">
          <div className="lg:col-span-1 space-y-8">
            <div className="space-y-4">
              <h2 className="font-headline text-2xl font-semibold">
                Specifications
              </h2>
              <dl className="grid grid-cols-2 gap-x-4 gap-y-2">
                <DetailRow label="Category:" value={product.category} />
                <DetailRow label="Style:" value={"Contemporary"} />
                <DetailRow label="Medium:" value={product.medium} />
                <DetailRow label="Created in:" value={product.year} />
                <DetailRow label="Dimensions:" value={product.dimensions} />
              </dl>
            </div>
          </div>

          <div className="lg:col-span-1">
            {product.artist && (
              <div className="space-y-8 sticky top-24">
                <div className="flex items-center gap-4">
                  <Avatar className="h-16 w-16">
                    <AvatarImage
                      src="https://placehold.co/100x100.png"
                      alt={product.artist}
                      data-ai-hint="artist portrait"
                    />
                    <AvatarFallback>{product.artist.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="text-lg font-bold">{product.artist}</h3>
                    <p className="text-sm text-muted-foreground">
                      Kolkata, India
                    </p>
                    <Button
                      variant="link"
                      className="p-0 h-auto text-sm text-red-500"
                    >
                      View Profile
                    </Button>
                  </div>
                </div>
                <div className="space-y-2">
                  <h3 className="text-lg font-bold">About Artist</h3>
                  <p className="text-muted-foreground text-sm">
                    (This is a placeholder bio). This artist has a unique
                    vision, blending classical techniques with modern themes to
                    create compelling narratives on canvas. With a passion for
                    color and form, their work invites viewers into a world of
                    imagination and emotion.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        <Separator />

        <div className="space-y-2">
          <h2 className="font-headline text-2xl font-semibold">Description</h2>
          <p className="text-base leading-relaxed text-muted-foreground">
            {product.description}
          </p>
        </div>
      </div>

      {artistProducts.length > 0 && (
        <div className="max-w-4xl mx-auto space-y-8">
          <Separator />
          <div>
            <h2 className="font-headline text-3xl font-semibold mb-6 text-left">
              More from this Artist
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {artistProducts.slice(0, 4).map((artistProduct) => (
                <MinimalProductCard
                  key={artistProduct.id}
                  product={artistProduct}
                />
              ))}
            </div>
          </div>
        </div>
      )}

      {relatedProducts.length > 0 && (
        <div className="max-w-4xl mx-auto space-y-8">
          <Separator />
          <div>
            <h2 className="font-headline text-3xl font-semibold mb-6 text-left">
              Related Artwork
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {relatedProducts.slice(0, 4).map((relatedProduct) => (
                <MinimalProductCard
                  key={relatedProduct.id}
                  product={relatedProduct}
                />
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

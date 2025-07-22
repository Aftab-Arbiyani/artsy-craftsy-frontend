"use client";

import { useParams } from "next/navigation";
import Image from "next/image";
import type { Product } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  ShoppingCart,
  Ruler,
  Palette as PaletteIcon,
  User,
} from "lucide-react";
import { useCart } from "@/context/CartProvider";
import { useToast } from "@/hooks/use-toast";
import { Separator } from "@/components/ui/separator";
import Link from "next/link";
import { useState, useEffect } from "react";
import ProductDetailsSkeleton from "@/components/skeletons/ProductDetailsSkeleton";
import { cn } from "@/lib/utils";
import { mockProducts } from "@/lib/mockData";
import MinimalProductCard from "@/components/products/MinimalProductCard";

export default function ProductDetailsPage() {
  const params = useParams();
  const { id } = params;
  const [product, setProduct] = useState<Product | undefined | null>(undefined);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState<string>("");

  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);

  const { addItem } = useCart();
  const { toast } = useToast();

  useEffect(() => {
    if (!id) {
      setIsLoading(false);
      setProduct(null);
      return;
    }

    const fetchProduct = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/products/${id}`,
        );
        if (!response.ok) {
          setProduct(null);
          return;
        }
        const result = await response.json();
        if (result.status === 1 && result.data) {
          const apiProduct = result.data;
          const imageUrls = apiProduct.media?.map((m: any) =>
            m.file_path
              ? `${process.env.NEXT_PUBLIC_API_BASE_URL}/${m.file_path}`
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
          };
          setProduct(transformedProduct);
          if (transformedProduct.imageUrls.length > 0) {
            setSelectedImage(transformedProduct.imageUrls[0]);
          }

          // Mock fetching related products
          const filteredRelated = mockProducts
            .filter(
              (p) =>
                p.category === transformedProduct.category &&
                p.id !== transformedProduct.id,
            )
            .slice(0, 3);
          setRelatedProducts(filteredRelated);
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

    fetchProduct();
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
    addItem(product);
    toast({
      title: "Added to Cart",
      description: `${product.name} has been added to your cart.`,
      variant: "success",
    });
  };

  const hasDiscount = !!product.discount && product.discount > 0;
  const discountedPrice = hasDiscount
    ? product.price * (1 - (product.discount ?? 0) / 100)
    : product.price;

  return (
    <div className="space-y-16">
      <div className="grid md:grid-cols-2 gap-8 lg:gap-12 items-start">
        {/* Image Gallery */}
        <div className="space-y-4 sticky top-24">
          <div className="relative aspect-[4/3] w-full overflow-hidden rounded-lg shadow-lg">
            {hasDiscount && (
              <div className="absolute top-3 right-3 bg-destructive text-destructive-foreground text-xs font-bold px-2.5 py-1 rounded-full z-10">
                {product.discount}% OFF
              </div>
            )}
            <Image
              src={selectedImage || product.imageUrls[0]}
              alt={product.name}
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-cover transition-opacity duration-300"
              priority
              data-ai-hint={product.dataAiHint || "art product detail"}
            />
          </div>
          {product.imageUrls.length > 1 && (
            <div className="flex gap-2">
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
                    className="object-cover"
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Product Info */}
        <div className="space-y-6">
          <div>
            <h1 className="font-headline text-3xl lg:text-4xl font-bold">
              {product.name}
            </h1>
            {product.artist && (
              <p className="text-lg text-muted-foreground mt-1">
                By{" "}
                <Link href="#" className="text-primary hover:underline">
                  {product.artist}
                </Link>
              </p>
            )}
          </div>

          <p className="text-base leading-relaxed text-muted-foreground">
            {product.description}
          </p>

          <Card>
            <CardContent className="p-4 grid grid-cols-2 gap-4 text-sm">
              <div className="flex items-center gap-2">
                <PaletteIcon className="h-5 w-5 text-primary" />
                <div>
                  <span className="font-semibold text-foreground">
                    Category
                  </span>
                  <p className="text-muted-foreground">{product.category}</p>
                </div>
              </div>
              {product.medium && (
                <div className="flex items-center gap-2">
                  <PaletteIcon className="h-5 w-5 text-primary" />
                  <div>
                    <span className="font-semibold text-foreground">
                      Medium
                    </span>
                    <p className="text-muted-foreground">{product.medium}</p>
                  </div>
                </div>
              )}
              {product.dimensions && (
                <div className="flex items-center gap-2">
                  <Ruler className="h-5 w-5 text-primary" />
                  <div>
                    <span className="font-semibold text-foreground">
                      Dimensions
                    </span>
                    <p className="text-muted-foreground">
                      {product.dimensions}
                    </p>
                  </div>
                </div>
              )}
              {product.artist && (
                <div className="flex items-center gap-2">
                  <User className="h-5 w-5 text-primary" />
                  <div>
                    <span className="font-semibold text-foreground">
                      Artist
                    </span>
                    <p className="text-muted-foreground">{product.artist}</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Separator />

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-baseline gap-3">
              <p className="text-3xl sm:text-4xl font-semibold text-primary">
                ₹{discountedPrice.toLocaleString("en-IN")}
              </p>
              {hasDiscount && (
                <p className="text-xl text-muted-foreground line-through">
                  ₹{product.price.toLocaleString("en-IN")}
                </p>
              )}
            </div>
            <Button
              size="lg"
              onClick={handleAddToCart}
              className="w-full sm:w-auto bg-primary hover:bg-primary/90"
            >
              <ShoppingCart className="mr-2 h-5 w-5" /> Add to Cart
            </Button>
          </div>
        </div>
      </div>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <div>
          <h2 className="font-headline text-3xl font-semibold mb-6">
            Related Artwork
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {relatedProducts.map((relatedProduct) => (
              <MinimalProductCard
                key={relatedProduct.id}
                product={relatedProduct}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

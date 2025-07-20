"use client";

import { useParams } from "next/navigation";
import Image from "next/image";
import type { Product } from "@/lib/types";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
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

export default function ProductDetailsPage() {
  const params = useParams();
  const { id } = params;
  const [product, setProduct] = useState<Product | undefined | null>(undefined); // null for not found, undefined for loading
  const [isLoading, setIsLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState<string>("");

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

  const hasDiscount =
    typeof product.discount === "number" && product.discount > 0;
  const discountedPrice =
    hasDiscount && product.discount !== undefined
      ? product.price * (1 - product.discount / 100)
      : product.price;

  return (
    <div className="space-y-12">
      <Card className="overflow-hidden shadow-xl">
        <div className="grid md:grid-cols-2 gap-0">
          <div className="p-4">
            <div className="relative aspect-[4/3] md:aspect-auto min-h-[300px] md:min-h-[500px] w-full overflow-hidden rounded-lg">
              {hasDiscount && (
                <div className="absolute top-4 right-4 bg-destructive text-destructive-foreground text-sm font-bold px-3 py-1.5 rounded-full z-10">
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
              <div className="flex gap-2 mt-4">
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
          <div className="p-6 md:p-10 flex flex-col justify-center">
            <CardHeader className="p-0 mb-4">
              <CardTitle className="font-headline text-4xl lg:text-5xl mb-2">
                {product.name}
              </CardTitle>
              {product.artist && (
                <p className="text-lg text-muted-foreground flex items-center">
                  <User className="mr-2 h-5 w-5" /> By {product.artist}
                </p>
              )}
            </CardHeader>
            <CardContent className="p-0 space-y-4">
              <CardDescription className="text-base leading-relaxed">
                {product.description}
              </CardDescription>
              <Separator />
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex items-center">
                  <PaletteIcon className="mr-2 h-5 w-5 text-primary" />
                  <span>
                    <strong>Category:</strong> {product.category}
                  </span>
                </div>
                {product.medium && (
                  <div className="flex items-center">
                    <PaletteIcon className="mr-2 h-5 w-5 text-primary" />
                    <span>
                      <strong>Medium:</strong> {product.medium}
                    </span>
                  </div>
                )}
                {product.dimensions && (
                  <div className="flex items-center">
                    <Ruler className="mr-2 h-5 w-5 text-primary" />
                    <span>
                      <strong>Dimensions:</strong> {product.dimensions}
                    </span>
                  </div>
                )}
              </div>
              <Separator />
              <div className="flex items-center justify-between">
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
                  className="bg-primary hover:bg-primary/90"
                >
                  <ShoppingCart className="mr-2 h-5 w-5" /> Add to Cart
                </Button>
              </div>
            </CardContent>
          </div>
        </div>
      </Card>
    </div>
  );
}

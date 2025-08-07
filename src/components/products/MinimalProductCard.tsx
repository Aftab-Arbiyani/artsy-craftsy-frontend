"use client";

import type { Product } from "@/lib/types";
import Image from "next/image";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";

interface MinimalProductCardProps {
  product: Product;
}

const MinimalProductCard = ({ product }: MinimalProductCardProps) => {
  const firstImageUrl =
    product.imageUrls && product.imageUrls.length > 0
      ? product.imageUrls[0]
      : "https://placehold.co/600x400.png";

  const discount = product.discount ?? 0;
  const hasDiscount = discount > 0 && product.price;
  const discountedPrice = hasDiscount
    ? product.price * (1 - discount / 100)
    : product.price;

  return (
    <Link href={`/products/${product.id}`} className="block group">
      <Card className="overflow-hidden h-full hover:shadow-xl transition-shadow duration-300">
        <div className="relative aspect-video w-full overflow-hidden">
          <Image
            src={firstImageUrl}
            alt={product.name}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover group-hover:scale-105 transition-transform duration-300"
            data-ai-hint={product.dataAiHint || "art product"}
          />
        </div>
        <CardContent className="p-4">
          <h3
            className="font-headline text-lg font-semibold truncate group-hover:text-primary transition-colors"
            title={product.name}
          >
            {product.name}
          </h3>
          <p className="text-sm text-muted-foreground mb-2">
            {product.artist ? `by ${product.artist}` : ""}
          </p>
          {product.price && (
            <div className="flex items-baseline gap-2 mt-2">
              <p className="font-semibold text-md text-primary">
                ₹{discountedPrice?.toLocaleString("en-IN")}
              </p>
              {hasDiscount && (
                <p className="text-sm text-muted-foreground line-through">
                  ₹{product.price.toLocaleString("en-IN")}
                </p>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </Link>
  );
};

export default MinimalProductCard;

"use client";

import type { Product } from "@/lib/types";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ShoppingCart, Eye } from "lucide-react";
import { useCart } from "@/context/CartProvider";
import { useToast } from "@/hooks/use-toast";

interface ProductCardProps {
  product: Product;
}

const ProductCard = ({ product }: ProductCardProps) => {
  const { addItem } = useCart();
  const { toast } = useToast();

  const handleAddToCart = () => {
    addItem(product);
    toast({
      title: "Added to Cart",
      description: `${product.name} has been added to your cart.`,
      variant: "success",
    });
  };

  const firstImageUrl =
    product.imageUrls && product.imageUrls.length > 0
      ? product.imageUrls[0]
      : "https://placehold.co/600x400.png";
  const discountValue = product.discount ?? 0;
  const hasDiscount = discountValue > 0;
  const discountedPrice = hasDiscount
    ? product.price * (1 - discountValue / 100)
    : product.price;

  return (
    <Card className="flex flex-col overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300">
      <CardHeader className="p-0">
        <Link href={`/products/${product.id}`} className="block group">
          <div className="relative w-full overflow-hidden">
            <Image
              src={firstImageUrl}
              alt={product.name}
              width={600}
              height={400}
              className="object-cover w-full h-auto group-hover:scale-105 transition-transform duration-300"
              data-ai-hint={product.dataAiHint || "art product"}
            />
            {hasDiscount && (
              <div className="absolute top-2 right-2 bg-destructive text-destructive-foreground text-xs font-bold px-2 py-1 rounded-full">
                {product.discount}% OFF
              </div>
            )}
          </div>
        </Link>
      </CardHeader>
      <CardContent className="p-4 flex-grow flex flex-col">
        <div className="flex-grow">
          <Link href={`/products/${product.id}`} className="block">
            <CardTitle
              className="font-headline text-xl mb-1 truncate"
              title={product.name}
            >
              {product.name}
            </CardTitle>
          </Link>
          <p className="text-sm text-muted-foreground mb-2">
            {product.artist ? `by ${product.artist}` : ""}
          </p>
          <div className="text-sm text-muted-foreground space-y-1">
            <p>{product.category}</p>
            {product.medium && <p>{product.medium}</p>}
          </div>
        </div>
        <div className="flex justify-between items-center mt-4">
          <div className="flex flex-col items-start">
            <p className="font-semibold text-lg text-primary">
              ₹{discountedPrice.toLocaleString("en-IN")}
            </p>
            {hasDiscount && (
              <p className="text-sm text-muted-foreground line-through">
                ₹{product.price.toLocaleString("en-IN")}
              </p>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Button
              onClick={handleAddToCart}
              size="icon"
              className="bg-primary hover:bg-primary/90"
            >
              <ShoppingCart className="h-4 w-4" />
            </Button>
            <Link href={`/products/${product.id}`} passHref>
              <Button
                variant="outline"
                size="icon"
                className="border-primary text-primary hover:bg-primary/10"
              >
                <Eye className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProductCard;

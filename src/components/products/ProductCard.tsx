"use client";

import type { Product } from "@/lib/types";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ShoppingCart, Eye } from "lucide-react";
import { useCart } from "@/context/CartProvider";
import { useToast } from "@/hooks/use-toast";
import { usePageTransition } from "@/context/PageTransitionProvider";

interface ProductCardProps {
  product: Product;
}

const ProductCard = ({ product }: ProductCardProps) => {
  const { addItem } = useCart();
  const { toast } = useToast();
  const { startTransition } = usePageTransition();

  const handleAddToCart = () => {
    addItem({ ...product, price: product.price ?? 0 });
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
  const priceValue = product.price ?? 0;
  const discountedPrice = hasDiscount
    ? priceValue * (1 - discountValue / 100)
    : priceValue;

  return (
    <Card className="flex flex-col overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300 h-full">
      <CardHeader className="p-0">
        <Link
          href={`/products/${product.id}`}
          className="block group"
          onClick={startTransition}
        >
          <div className="relative w-full overflow-hidden aspect-auto">
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
      <CardContent className="p-3 flex-grow">
        <Link
          href={`/products/${product.id}`}
          className="block"
          onClick={startTransition}
        >
          <CardTitle
            className="font-headline text-base font-semibold mb-1 truncate"
            title={product.name}
          >
            {product.name}
          </CardTitle>
        </Link>
        <p className="text-xs text-muted-foreground mb-2 truncate">
          {product.artist ? `by ${product.artist}` : ""}
        </p>
        <div className="text-xs text-muted-foreground space-y-0.5">
          <p className="truncate">{product.category}</p>
          {product.medium && <p className="truncate">{product.medium}</p>}
        </div>
      </CardContent>
      <CardFooter className="p-3 pt-0 flex justify-between items-center gap-2">
        <div className="flex flex-col items-start">
          <p className="font-semibold text-base text-primary">
            ₹{discountedPrice.toLocaleString("en-IN")}
          </p>
          {hasDiscount && (
            <p className="text-xs text-muted-foreground line-through">
              ₹{(product.price ?? 0).toLocaleString("en-IN")}
            </p>
          )}
        </div>
        <div className="flex items-center gap-1">
          <Button
            onClick={handleAddToCart}
            size="icon"
            className="bg-primary hover:bg-primary/90 h-8 w-8"
          >
            <ShoppingCart className="h-4 w-4" />
          </Button>
          <Link
            href={`/products/${product.id}`}
            passHref
            onClick={startTransition}
          >
            <Button
              variant="outline"
              size="icon"
              className="border-primary text-primary hover:bg-primary/10 h-8 w-8"
            >
              <Eye className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </CardFooter>
    </Card>
  );
};

export default ProductCard;

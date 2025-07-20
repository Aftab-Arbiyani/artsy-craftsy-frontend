"use client";

import { useCart } from "@/context/CartProvider";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Trash2, ShoppingBag, Minus, Plus } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import CartItemSkeleton from "@/components/skeletons/CartItemSkeleton";
import { useState, useEffect } from "react";

export default function CartView() {
  const {
    items,
    removeItem,
    updateQuantity,
    getTotalPrice,
    clearCart,
    getItemCount,
  } = useCart();
  const [isLoading, setIsLoading] = useState(true); // For overall cart view, items themselves rely on CartProvider state

  // Simulate initial loading for the cart page appearance if needed,
  // but actual item loading is handled by CartProvider's localStorage effect.
  // This loading state is more for the page structure itself if it were complex.
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 500); // Short delay for cart, as items load from localStorage quickly
    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    // Show skeleton for the whole cart structure including summary
    return (
      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <CardHeader className="px-0 pt-0">
            <Skeleton className="h-9 w-3/4" />
          </CardHeader>
          <CartItemSkeleton />
          <CartItemSkeleton />
        </div>
        <div className="lg:col-span-1">
          <Card className="sticky top-24 shadow-lg">
            <CardHeader>
              <Skeleton className="h-8 w-1/2" />
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between">
                <Skeleton className="h-5 w-1/4" />
                <Skeleton className="h-5 w-1/4" />
              </div>
              <div className="flex justify-between">
                <Skeleton className="h-5 w-1/4" />
                <Skeleton className="h-5 w-1/4" />
              </div>
              <Separator />
              <div className="flex justify-between">
                <Skeleton className="h-6 w-1/3" />
                <Skeleton className="h-6 w-1/3" />
              </div>
            </CardContent>
            <CardFooter className="flex-col gap-2">
              <Skeleton className="h-12 w-full rounded-md" />
              <Skeleton className="h-10 w-full rounded-md" />
            </CardFooter>
          </Card>
        </div>
      </div>
    );
  }

  if (getItemCount() === 0) {
    return (
      <div className="text-center py-12 bg-card p-8 rounded-lg shadow-lg">
        <ShoppingBag className="mx-auto h-24 w-24 text-muted-foreground mb-6" />
        <h2 className="font-headline text-3xl font-semibold mb-4">
          Your Cart is Empty
        </h2>
        <p className="text-muted-foreground mb-8">
          Looks like you haven't added any artwork yet. Explore our collection!
        </p>
        <Link href="/products" passHref>
          <Button
            size="lg"
            className="bg-primary hover:bg-primary/90 text-primary-foreground"
          >
            Browse Products
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="grid lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2 space-y-6">
        <CardHeader className="px-0 pt-0">
          <CardTitle className="font-headline text-3xl flex justify-between items-center">
            <span>Shopping Cart ({getItemCount()} items)</span>
            <Button
              variant="outline"
              onClick={clearCart}
              disabled={items.length === 0}
              className="text-sm"
            >
              <Trash2 className="mr-2 h-4 w-4" /> Clear Cart
            </Button>
          </CardTitle>
        </CardHeader>
        {items.map((item) => (
          <Card
            key={item.product.id}
            className="flex flex-col sm:flex-row items-start sm:items-center gap-4 p-4 shadow-sm"
          >
            <div className="relative w-full sm:w-24 h-32 sm:h-24 aspect-square rounded-md overflow-hidden shrink-0">
              <Image
                src={item.product.imageUrls[0]}
                alt={item.product.name}
                fill
                sizes="100px"
                className="object-cover"
                data-ai-hint={item.product.dataAiHint || "cart item"}
              />
            </div>
            <div className="flex-grow">
              <Link
                href={`/products/${item.product.id}`}
                className="hover:underline"
              >
                <h3 className="font-headline text-lg font-semibold">
                  {item.product.name}
                </h3>
              </Link>
              <p className="text-sm text-muted-foreground">
                {item.product.category}
              </p>
              <p className="text-md font-semibold mt-1">
                ₹{item.product.price.toLocaleString("en-IN")}
              </p>
            </div>
            <div className="flex items-center space-x-2 sm:ml-auto shrink-0">
              <Button
                variant="outline"
                size="icon"
                onClick={() =>
                  updateQuantity(item.product.id, item.quantity - 1)
                }
                className="h-8 w-8"
              >
                <Minus className="h-4 w-4" />
              </Button>
              <Input
                type="number"
                value={item.quantity}
                onChange={(e) =>
                  updateQuantity(item.product.id, parseInt(e.target.value))
                }
                className="h-8 w-14 text-center hide-arrows [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                min="1"
              />
              <Button
                variant="outline"
                size="icon"
                onClick={() =>
                  updateQuantity(item.product.id, item.quantity + 1)
                }
                className="h-8 w-8"
              >
                <Plus className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => removeItem(item.product.id)}
                className="text-destructive hover:bg-destructive/10 hover:text-destructive h-8 w-8"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </Card>
        ))}
      </div>

      <div className="lg:col-span-1">
        <Card className="sticky top-24 shadow-lg">
          <CardHeader>
            <CardTitle className="font-headline text-2xl">
              Order Summary
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span>₹{getTotalPrice().toLocaleString("en-IN")}</span>
            </div>
            <div className="flex justify-between">
              <span>Shipping</span>
              <span>Free</span>
            </div>
            <Separator />
            <div className="flex justify-between font-bold text-xl">
              <span>Total</span>
              <span>₹{getTotalPrice().toLocaleString("en-IN")}</span>
            </div>
          </CardContent>
          <CardFooter className="flex-col gap-2">
            <Link href="/checkout" passHref className="w-full">
              <Button
                size="lg"
                className="w-full bg-primary hover:bg-primary/90"
              >
                Proceed to Checkout
              </Button>
            </Link>
            <Link href="/products" passHref className="w-full">
              <Button variant="outline" className="w-full">
                Continue Shopping
              </Button>
            </Link>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}

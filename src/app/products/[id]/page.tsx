
'use client';

import { useParams } from 'next/navigation';
import Image from 'next/image';
import { mockProducts } from '@/lib/mockData';
import type { Product } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ShoppingCart, Tag, Ruler, Palette as PaletteIcon, User } from 'lucide-react';
import { useCart } from '@/context/CartProvider';
import { useToast } from '@/hooks/use-toast';
import { Separator } from '@/components/ui/separator';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import ProductDetailsSkeleton from '@/components/skeletons/ProductDetailsSkeleton';
import MinimalProductCardSkeleton from '@/components/skeletons/MinimalProductCardSkeleton'; // For related items

export default function ProductDetailsPage() {
  const params = useParams();
  const { id } = params;
  const [product, setProduct] = useState<Product | undefined | null>(undefined); // null for not found, undefined for loading
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const { addItem } = useCart();
  const { toast } = useToast();

  useEffect(() => {
    setIsLoading(true);
    const timer = setTimeout(() => {
      const foundProduct = mockProducts.find((p) => p.id === id);
      setProduct(foundProduct || null);
      if (foundProduct) {
        setRelatedProducts(mockProducts.filter(p => p.category === foundProduct.category && p.id !== foundProduct.id).slice(0,3));
      }
      setIsLoading(false);
    }, 1200);
    return () => clearTimeout(timer);
  }, [id]);

  if (isLoading) {
    return <ProductDetailsSkeleton />;
  }

  if (product === null) { // Explicitly check for null (not found) after loading
    return (
      <div className="text-center py-12">
        <h1 className="font-headline text-3xl mb-4">Product Not Found</h1>
        <p className="text-muted-foreground mb-6">Sorry, we couldn't find the product you're looking for.</p>
        <Link href="/products">
          <Button variant="outline">Back to Products</Button>
        </Link>
      </div>
    );
  }
  
  if (!product) return null; // Should not happen if isLoading is false and product is not null

  const handleAddToCart = () => {
    addItem(product);
    toast({
      title: "Added to Cart",
      description: `${product.name} has been added to your cart.`,
    });
  };

  return (
    <div className="space-y-12">
      <Card className="overflow-hidden shadow-xl">
        <div className="grid md:grid-cols-2 gap-0">
          <div className="relative aspect-[4/3] md:aspect-auto min-h-[300px] md:min-h-[500px]">
            <Image
              src={product.imageUrl}
              alt={product.name}
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-cover"
              priority
              data-ai-hint={product.dataAiHint || 'art product detail'}
            />
          </div>
          <div className="p-6 md:p-10 flex flex-col justify-center">
            <CardHeader className="p-0 mb-4">
              <CardTitle className="font-headline text-4xl lg:text-5xl mb-2">{product.name}</CardTitle>
              {product.artist && (
                <p className="text-lg text-muted-foreground flex items-center">
                  <User className="mr-2 h-5 w-5" /> By {product.artist}
                </p>
              )}
            </CardHeader>
            <CardContent className="p-0 space-y-4">
              <CardDescription className="text-base leading-relaxed">{product.description}</CardDescription>
              <Separator />
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex items-center">
                  <PaletteIcon className="mr-2 h-5 w-5 text-primary" />
                  <span><strong>Category:</strong> {product.category}</span>
                </div>
                {product.medium && (
                  <div className="flex items-center">
                    <PaletteIcon className="mr-2 h-5 w-5 text-primary" />
                    <span><strong>Medium:</strong> {product.medium}</span>
                  </div>
                )}
                {product.dimensions && (
                  <div className="flex items-center">
                    <Ruler className="mr-2 h-5 w-5 text-primary" />
                    <span><strong>Dimensions:</strong> {product.dimensions}</span>
                  </div>
                )}
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <p className="text-3xl sm:text-4xl font-semibold text-primary">${product.price.toFixed(2)}</p>
                <Button size="lg" onClick={handleAddToCart} className="bg-primary hover:bg-primary/90">
                  <ShoppingCart className="mr-2 h-5 w-5" /> Add to Cart
                </Button>
              </div>
            </CardContent>
          </div>
        </div>
      </Card>
      
      {relatedProducts.length > 0 && (
        <section>
          <h2 className="font-headline text-3xl font-semibold mb-6">Related Products</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {relatedProducts.map(rp => (
              <Link key={rp.id} href={`/products/${rp.id}`} className="block group">
                <Card className="overflow-hidden h-full hover:shadow-lg transition-shadow">
                  <div className="relative aspect-video">
                    <Image src={rp.imageUrl} alt={rp.name} fill className="object-cover group-hover:scale-105 transition-transform" data-ai-hint={rp.dataAiHint || 'related art'}/>
                  </div>
                  <CardContent className="p-4">
                    <h3 className="font-headline text-lg font-medium truncate group-hover:text-primary">{rp.name}</h3>
                    <p className="text-sm text-muted-foreground">{rp.category}</p>
                    <p className="text-md font-semibold mt-1">${rp.price.toFixed(2)}</p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

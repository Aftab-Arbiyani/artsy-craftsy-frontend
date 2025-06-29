
'use client';

import type { Product } from '@/lib/types';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ShoppingCart, Eye } from 'lucide-react';
import { useCart } from '@/context/CartProvider';
import { useToast } from '@/hooks/use-toast';

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

  return (
    <Card className="flex flex-col h-full overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300">
      <CardHeader className="p-0">
        <Link href={`/products/${product.id}`} className="block group">
          <div className="aspect-[4/3] relative w-full overflow-hidden">
            <Image
              src={product.imageUrl}
              alt={product.name}
              fill
              sizes="(max-width: 639px) 100vw, (max-width: 767px) 50vw, (max-width: 1023px) 33vw, 25vw"
              className="object-cover group-hover:scale-105 transition-transform duration-300"
              data-ai-hint={product.dataAiHint || 'art product'}
            />
          </div>
        </Link>
      </CardHeader>
      <CardContent className="p-4 flex-grow">
        <Link href={`/products/${product.id}`} className="block">
          <CardTitle className="font-headline text-xl mb-1 truncate" title={product.name}>{product.name}</CardTitle>
        </Link>
        <p className="text-sm text-muted-foreground mb-2">{product.category}{product.artist ? ` by ${product.artist}` : ''}</p>
        <CardDescription className="text-sm line-clamp-3 mb-3">{product.description}</CardDescription>
        <p className="font-semibold text-lg text-primary">${product.price.toFixed(2)}</p>
      </CardContent>
      <CardFooter className="p-4 grid grid-cols-2 gap-2">
        <Button onClick={handleAddToCart} className="w-full bg-primary hover:bg-primary/90">
          <ShoppingCart className="mr-2 h-4 w-4" /> Add to Cart
        </Button>
        <Link href={`/products/${product.id}`} passHref>
          <Button variant="outline" className="w-full border-primary text-primary hover:bg-primary/10">
            <Eye className="mr-2 h-4 w-4" /> View
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
};

export default ProductCard;


'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import ProductCard from '@/components/products/ProductCard';
import { mockProducts } from '@/lib/mockData';
import Image from 'next/image';
import { Palette, Lightbulb, Users } from 'lucide-react';
import ProductCardSkeleton from '@/components/skeletons/ProductCardSkeleton';
import { useState, useEffect } from 'react';

export default function Home() {
  const [isLoadingFeatured, setIsLoadingFeatured] = useState(true);
  const featuredProducts = mockProducts.slice(0, 3);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoadingFeatured(false);
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="space-y-16">
      {/* Hero Section */}
      <section className="text-center py-16 bg-card rounded-lg shadow-lg">
        <div className="container mx-auto px-4">
          <h1 className="font-headline text-5xl md:text-6xl font-bold mb-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
            Discover Unique Art, Create Your Own
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700 delay-200">
            ArtsyCraftsy is your premier destination for exquisite paintings, sculptures, and custom art commissions.
          </p>
          <div className="space-x-4 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-400">
            <Link href="/products" passHref>
              <Button size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground">
                Explore Collection <Palette className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link href="/custom-art" passHref>
              <Button size="lg" variant="outline" className="border-accent text-accent hover:bg-accent/10">
                Request Custom Art <Lightbulb className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Featured Products Section */}
      <section>
        <h2 className="font-headline text-4xl font-semibold mb-8 text-center animate-in fade-in slide-in-from-bottom-4 duration-700">Featured Artwork</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {isLoadingFeatured ? (
            Array.from({ length: 3 }).map((_, index) => (
              <div key={index} className={`animate-in fade-in slide-in-from-bottom-4 duration-500 delay-[${index * 150 + 300}ms]`}>
                <ProductCardSkeleton />
              </div>
            ))
          ) : (
            featuredProducts.map((product, index) => (
              <div key={product.id} className={`animate-in fade-in slide-in-from-bottom-4 duration-500 delay-[${index * 150 + 300}ms]`}>
                <ProductCard product={product} />
              </div>
            ))
          )}
        </div>
        <div className="text-center mt-12">
          <Link href="/products" passHref>
            <Button variant="secondary" size="lg">View All Products</Button>
          </Link>
        </div>
      </section>

      {/* Why Choose Us Section */}
      <section className="py-16 bg-card rounded-lg shadow-lg">
        <div className="container mx-auto px-4">
          <h2 className="font-headline text-4xl font-semibold mb-12 text-center animate-in fade-in slide-in-from-bottom-4 duration-700">Why ArtsyCraftsy?</h2>
          <div className="grid md:grid-cols-3 gap-8 text-center">
            <div className="p-6 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-200">
              <Palette className="mx-auto mb-4 h-12 w-12 text-primary" />
              <h3 className="font-headline text-2xl font-semibold mb-2">Curated Selection</h3>
              <p className="text-muted-foreground">Handpicked art from talented artists worldwide.</p>
            </div>
            <div className="p-6 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-400">
              <Lightbulb className="mx-auto mb-4 h-12 w-12 text-accent" />
              <h3 className="font-headline text-2xl font-semibold mb-2">Custom Creations</h3>
              <p className="text-muted-foreground">Bring your vision to life with our custom art service.</p>
            </div>
            <div className="p-6 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-600">
              <Users className="mx-auto mb-4 h-12 w-12 text-primary" />
              <h3 className="font-headline text-2xl font-semibold mb-2">Artist Community</h3>
              <p className="text-muted-foreground">Supporting artists and fostering creativity.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Custom Art CTA */}
      <section className="text-center py-16">
         <div className="container mx-auto px-4 relative overflow-hidden rounded-lg shadow-lg p-12 bg-secondary">
            <Image 
              src="https://placehold.co/1200x400.png" 
              alt="Artistic background"
              fill
              className="object-cover opacity-20"
              data-ai-hint="abstract art background"
            />
            <div className="relative z-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
              <h2 className="font-headline text-4xl font-semibold mb-6">Have a Vision?</h2>
              <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
                Let our artists create a masterpiece just for you. Describe your idea, and we'll make it happen.
              </p>
              <Link href="/custom-art" passHref>
                <Button size="lg" className="bg-accent hover:bg-accent/90 text-accent-foreground">
                  Start Your Custom Request <Lightbulb className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            </div>
         </div>
      </section>
    </div>
  );
}

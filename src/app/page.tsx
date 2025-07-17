
'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import ProductCard from '@/components/products/ProductCard';
import type { Product } from '@/lib/types';
import Image from 'next/image';
import { Palette, Lightbulb, Users } from 'lucide-react';
import ProductCardSkeleton from '@/components/skeletons/ProductCardSkeleton';
import { useState, useEffect } from 'react';
import type { Category } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';

export default function Home() {
  const [isLoadingFeatured, setIsLoadingFeatured] = useState(true);
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [isLoadingCategories, setIsLoadingCategories] = useState(true);
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    const fetchFeaturedProducts = async () => {
      try {
        setIsLoadingFeatured(true);
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/products/dashboard`);
        const result = await response.json();
        if (response.ok && result.status === 1 && Array.isArray(result.data)) {
          const transformedProducts: Product[] = result.data.map((item: any) => ({
            id: item.id,
            name: item.title,
            description: item.description || '', // Assuming description might be missing
            price: parseFloat(item.listing_price),
            category: item.category?.name || 'Uncategorized',
            imageUrl: item.media?.[0]?.file_path ? `${process.env.NEXT_PUBLIC_API_BASE_URL}/${item.media[0].file_path}` : 'https://placehold.co/600x400.png',
            artist: item.user?.name || 'Unknown Artist',
            medium: item.materials?.name,
            dataAiHint: item.category?.name?.toLowerCase() || 'artwork'
          }));
          setFeaturedProducts(transformedProducts.slice(0, 8)); // Display up to 8 products
        } else {
          setFeaturedProducts([]);
        }
      } catch (error) {
        console.error("Failed to fetch featured products:", error);
        setFeaturedProducts([]);
      } finally {
        setIsLoadingFeatured(false);
      }
    };

    fetchFeaturedProducts();
  }, []);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setIsLoadingCategories(true);
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/category?take=6&skip=0`);
        const result = await response.json();
        if (response.ok && result.status === 1 && Array.isArray(result.data)) {
          setCategories(result.data.map((cat: any) => ({
            ...cat,
            image: cat.image ? `${process.env.NEXT_PUBLIC_API_BASE_URL}/${cat.image}` : `https://placehold.co/400x400.png`,
          })));
        } else {
          setCategories([]);
        }
      } catch (error) {
        console.error("Failed to fetch categories:", error);
        setCategories([]);
      } finally {
        setIsLoadingCategories(false);
      }
    };

    fetchCategories();
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
          <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-4 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-400">
            <Link href="/products" passHref className="w-full sm:w-auto">
              <Button size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground w-full">
                Explore Collection <Palette className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link href="/custom-art" passHref className="w-full sm:w-auto">
              <Button size="lg" variant="outline" className="border-accent text-accent hover:bg-accent/10 hover:text-accent w-full">
                Request Custom Art <Lightbulb className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section>
        <h2 className="font-headline text-4xl font-semibold mb-8 text-center animate-in fade-in slide-in-from-bottom-4 duration-700">Browse by Category</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
          {isLoadingCategories ? (
            Array.from({ length: 6 }).map((_, index) => (
              <div key={index} className="text-center">
                <Skeleton className="aspect-square w-full rounded-lg mb-2" />
                <Skeleton className="h-5 w-3/4 mx-auto" />
              </div>
            ))
          ) : (
            categories.map((category, index) => (
              <Link href={`/products?category=${category.slug}`} key={category.id} passHref>
                <div className="group text-center animate-in fade-in slide-in-from-bottom-4 duration-500" style={{ animationDelay: `${index * 100}ms` }}>
                  <div className="aspect-square relative w-full overflow-hidden rounded-lg mb-2 shadow-md group-hover:shadow-xl transition-shadow">
                    <Image
                      src={category.image || `https://placehold.co/400x400.png`}
                      alt={category.name}
                      fill
                      sizes="(max-width: 639px) 50vw, (max-width: 767px) 33vw, (max-width: 1023px) 25vw, 16vw"
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                      data-ai-hint={category.name.toLowerCase()}
                    />
                  </div>
                  <h3 className="font-medium text-sm text-foreground group-hover:text-primary transition-colors">{category.name}</h3>
                </div>
              </Link>
            ))
          )}
        </div>
      </section>

      {/* Featured Products Section */}
      <section>
        <h2 className="font-headline text-4xl font-semibold mb-8 text-center animate-in fade-in slide-in-from-bottom-4 duration-700">Featured Artwork</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {isLoadingFeatured ? (
            Array.from({ length: 8 }).map((_, index) => (
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
      <section className="relative h-80 w-full">
        <Image
          src="http://localhost:3000/public/images/banner.png"
          alt="Artistic background banner"
          fill
          className="object-cover"
          data-ai-hint="abstract art background"
        />
        <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center text-center p-4">
          <div className="relative z-10 animate-in fade-in slide-in-from-bottom-4 duration-700 text-white">
            <h2 className="font-headline text-4xl font-semibold mb-6">Have a Vision?</h2>
            <p className="text-lg md:text-xl text-white/90 mb-8 max-w-2xl mx-auto">
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

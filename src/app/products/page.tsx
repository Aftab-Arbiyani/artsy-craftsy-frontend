
'use client';

import type { ChangeEvent } from 'react';
import React, { useState, useMemo, useEffect } from 'react';
import ProductCard from '@/components/products/ProductCard';
import { mockProducts } from '@/lib/mockData';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Filter, ListRestart } from 'lucide-react';
import ProductCardSkeleton from '@/components/skeletons/ProductCardSkeleton';

const categories = ['All', ...new Set(mockProducts.map(p => p.category))];
const sortOptions = [
  { value: 'name-asc', label: 'Name (A-Z)' },
  { value: 'name-desc', label: 'Name (Z-A)' },
  { value: 'price-asc', label: 'Price (Low to High)' },
  { value: 'price-desc', label: 'Price (High to Low)' },
];

export default function ProductsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [sortBy, setSortBy] = useState('name-asc');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  const filteredAndSortedProducts = useMemo(() => {
    let products = mockProducts;

    if (searchTerm) {
      products = products.filter(product =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (product.artist && product.artist.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    if (selectedCategory !== 'All') {
      products = products.filter(product => product.category === selectedCategory);
    }

    products = [...products].sort((a, b) => {
      switch (sortBy) {
        case 'name-asc':
          return a.name.localeCompare(b.name);
        case 'name-desc':
          return b.name.localeCompare(a.name);
        case 'price-asc':
          return a.price - b.price;
        case 'price-desc':
          return b.price - a.price;
        default:
          return 0;
      }
    });

    return products;
  }, [searchTerm, selectedCategory, sortBy]);

  const handleSearchChange = (event: ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };
  
  const resetFilters = () => {
    setSearchTerm('');
    setSelectedCategory('All');
    setSortBy('name-asc');
  };

  return (
    <div className="space-y-8">
      <section className="bg-card p-6 rounded-lg shadow">
        <h1 className="font-headline text-4xl font-semibold mb-6 text-center">Our Artwork Collection</h1>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 items-end">
          <div className="md:col-span-1">
            <label htmlFor="search" className="block text-sm font-medium mb-1">Search Art</label>
            <div className="relative">
              <Input
                type="text"
                id="search"
                placeholder="Search by name, artist, keyword..."
                value={searchTerm}
                onChange={handleSearchChange}
                className="pl-10"
              />
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            </div>
          </div>
          <div>
            <label htmlFor="category" className="block text-sm font-medium mb-1">Category</label>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger id="category">
                <SelectValue placeholder="Filter by category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map(category => (
                  <SelectItem key={category} value={category}>{category}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <label htmlFor="sort" className="block text-sm font-medium mb-1">Sort By</label>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger id="sort">
                <SelectValue placeholder="Sort products" />
              </SelectTrigger>
              <SelectContent>
                {sortOptions.map(option => (
                  <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="flex justify-end">
          <Button variant="outline" onClick={resetFilters}>
            <ListRestart className="mr-2 h-4 w-4" /> Reset Filters
          </Button>
        </div>
      </section>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, index) => (
            <ProductCardSkeleton key={index} />
          ))}
        </div>
      ) : filteredAndSortedProducts.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filteredAndSortedProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <Filter className="mx-auto h-16 w-16 text-muted-foreground mb-4" />
          <p className="text-xl text-muted-foreground">No products match your criteria.</p>
          <p className="text-sm text-muted-foreground mt-2">Try adjusting your search or filters.</p>
        </div>
      )}
    </div>
  );
}

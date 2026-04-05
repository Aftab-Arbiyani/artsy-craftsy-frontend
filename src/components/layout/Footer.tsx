"use client";

import Link from "next/link";
import Image from "next/image";
import { Separator } from "@/components/ui/separator";
import { Icons } from "@/components/shared/Icons";
import { useEffect, useState } from "react";
import type { Category } from "@/lib/types";
import { Skeleton } from "../ui/skeleton";

interface Artist {
  id: string;
  name: string;
}

const Footer = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [artists, setArtists] = useState<Artist[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const currentYear = new Date().getFullYear();

  useEffect(() => {
    const fetchFooterData = async () => {
      try {
        setIsLoading(true);
        const [categoriesResponse, artistsResponse] = await Promise.all([
          fetch(
            `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/category?take=4&skip=0`,
          ),
          fetch(
            `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/user/artists-dropdown?take=4&skip=0`,
          ),
        ]);

        // Handle Categories
        const categoriesResult = await categoriesResponse.json();
        if (
          categoriesResponse.ok &&
          categoriesResult.status === 1 &&
          Array.isArray(categoriesResult.data)
        ) {
          setCategories(categoriesResult.data);
        } else {
          setCategories([]);
        }

        // Handle Artists
        const artistsResult = await artistsResponse.json();
        if (
          artistsResponse.ok &&
          artistsResult.status === 1 &&
          Array.isArray(artistsResult.data)
        ) {
          setArtists(artistsResult.data);
        } else {
          setArtists([]);
        }
      } catch (error) {
        console.error("Failed to fetch footer data:", error);
        setCategories([]);
        setArtists([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchFooterData();
  }, []);

  return (
    <footer className="bg-card border-t border-border mt-auto">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
          {/* Left Section */}
          <div className="md:col-span-4 lg:col-span-3 space-y-4">
            <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
              <Image src="/icon-192x192.png" alt="Arts&Craft Studio" width={40} height={40} className="h-10 w-10" />
              <span className="font-bold text-base text-foreground">Arts&Craft Studio</span>
            </Link>
            <p className="text-sm text-muted-foreground">
              A premier platform for discovering, buying, and commissioning
              unique artwork from talented artists.
            </p>
            <div className="flex space-x-3">
              <Link
                href="#"
                className="text-muted-foreground hover:text-primary"
              >
                <Icons.twitter className="h-5 w-5" />
              </Link>
              <Link
                href="#"
                className="text-muted-foreground hover:text-primary"
              >
                <Icons.linkedin className="h-5 w-5" />
              </Link>
              <Link
                href="#"
                className="text-muted-foreground hover:text-primary"
              >
                <Icons.instagram className="h-5 w-5" />
              </Link>
              <Link
                href="#"
                className="text-muted-foreground hover:text-primary"
              >
                <Icons.youtube className="h-5 w-5" />
              </Link>
            </div>
          </div>

          {/* Right Section */}
          <div className="md:col-span-8 lg:col-span-9 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-8">
            <div>
              <h3 className="font-semibold text-foreground mb-4">
                FOR COLLECTORS
              </h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link
                    href="/faq/collector"
                    className="text-muted-foreground hover:text-primary"
                  >
                    Collector's FAQ
                  </Link>
                </li>
                <li>
                  <Link
                    href="/products"
                    className="text-muted-foreground hover:text-primary"
                  >
                    Browse Art
                  </Link>
                </li>
                <li>
                  <Link
                    href="/custom-art"
                    className="text-muted-foreground hover:text-primary"
                  >
                    Custom Art
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-foreground mb-4">
                FOR ARTISTS
              </h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link
                    href="/signup?type=artist"
                    className="text-muted-foreground hover:text-primary"
                  >
                    Sell Your Art
                  </Link>
                </li>
                <li>
                  <Link
                    href="/faq/seller"
                    className="text-muted-foreground hover:text-primary"
                  >
                    Seller's FAQ
                  </Link>
                </li>
                <li>
                  <Link
                    href="/seller/my-artworks"
                    className="text-muted-foreground hover:text-primary"
                  >
                    My Artworks
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-foreground mb-4">CATEGORIES</h3>
              <ul className="space-y-2 text-sm">
                {isLoading
                  ? Array.from({ length: 4 }).map((_, index) => (
                      <li key={index}>
                        <Skeleton className="h-4 w-3/4" />
                      </li>
                    ))
                  : categories.map((category) => (
                      <li key={category.id}>
                        <Link
                          href={`/products?category=${category.id}`}
                          className="text-muted-foreground hover:text-primary"
                        >
                          {category.name}
                        </Link>
                      </li>
                    ))}
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-foreground mb-4">ARTISTS</h3>
              <ul className="space-y-2 text-sm">
                {isLoading
                  ? Array.from({ length: 4 }).map((_, index) => (
                      <li key={index}>
                        <Skeleton className="h-4 w-3/4" />
                      </li>
                    ))
                  : artists.map((artist) => (
                      <li key={artist.id}>
                        <Link
                          href={`/artist/${artist.id}`}
                          className="text-muted-foreground hover:text-primary"
                        >
                          {artist.name}
                        </Link>
                      </li>
                    ))}
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-foreground mb-4">COMPANY</h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link
                    href="/about-us"
                    className="text-muted-foreground hover:text-primary"
                  >
                    About Us
                  </Link>
                </li>
                <li>
                  <Link
                    href="/contact"
                    className="text-muted-foreground hover:text-primary"
                  >
                    Contact
                  </Link>
                </li>
                <li>
                  <Link
                    href="/shipping-policy"
                    className="text-muted-foreground hover:text-primary"
                  >
                    Shipping & Delivery
                  </Link>
                </li>
                <li>
                  <Link
                    href="/cancellation-policy"
                    className="text-muted-foreground hover:text-primary"
                  >
                    Cancellation & Refund
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <Separator className="my-8" />

        <div className="flex flex-col sm:flex-row justify-between items-center text-sm text-muted-foreground">
          <p>
            &copy; {currentYear} Arts&Craft Studio. All rights reserved.
          </p>
          <div className="flex space-x-4 mt-2 sm:mt-0">
            <Link href="#" className="hover:text-primary">
              Privacy Policy
            </Link>
            <Link href="/terms" className="hover:text-primary">
              Terms & Conditions
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

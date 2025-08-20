"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import Link from "next/link";
import Logo from "../shared/Logo";
import { Separator } from "@/components/ui/separator";
import { useState, useEffect } from "react";
import type { Category } from "@/lib/types";
import { Skeleton } from "@/components/ui/skeleton";

interface Artist {
  id: string;
  name: string;
}

const Footer = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [artists, setArtists] = useState<Artist[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [categoryResponse, artistResponse] = await Promise.all([
          fetch(
            `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/category?take=6&skip=0`,
          ),
          fetch(
            `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/user/artists-dropdown?take=6&skip=0`,
          ),
        ]);

        const categoryResult = await categoryResponse.json();
        if (
          categoryResponse.ok &&
          categoryResult.status === 1 &&
          Array.isArray(categoryResult.data)
        ) {
          setCategories(categoryResult.data);
        } else {
          setCategories([]);
        }

        const artistResult = await artistResponse.json();
        if (
          artistResponse.ok &&
          artistResult.status === 1 &&
          Array.isArray(artistResult.data)
        ) {
          setArtists(artistResult.data);
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

    fetchData();
  }, []);

  return (
    <footer className="bg-card border-t border-border mt-auto">
      <div className="container mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <div className="flex justify-center mb-4">
            <Logo />
          </div>
          <p className="mt-4 text-sm text-muted-foreground max-w-4xl mx-auto">
            ArtsyCraftsy is India&apos;s leading online art platform, offering
            an exclusive collection of curated Indian art paintings. Discover
            and buy original paintings online in India, with ease and
            convenience, powered by innovative technology and seamless
            transactions.
          </p>
        </div>

        <Separator className="my-8" />

        <div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-x-8 gap-y-8 text-left">
            <div className="col-span-1">
              <h3 className="font-semibold text-foreground mb-4">
                FOR COLLECTORS
              </h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link
                    href="#"
                    className="text-muted-foreground hover:text-primary"
                  >
                    Collector&apos;s FAQ
                  </Link>
                </li>
                <li>
                  <Link
                    href="#"
                    className="text-muted-foreground hover:text-primary"
                  >
                    Resell Works
                  </Link>
                </li>
              </ul>
            </div>
            <div className="col-span-1">
              <h3 className="font-semibold text-foreground mb-4">
                FOR SELLERS
              </h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link
                    href="/seller/my-artworks"
                    className="text-muted-foreground hover:text-primary"
                  >
                    Sell Your Art
                  </Link>
                </li>
                <li>
                  <Link
                    href="#"
                    className="text-muted-foreground hover:text-primary"
                  >
                    Seller&apos;s FAQ
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold text-foreground mb-4">
                ART CATEGORY
              </h3>
              <ul className="space-y-2 text-sm">
                {isLoading
                  ? Array.from({ length: 6 }).map((_, index) => (
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
                  ? Array.from({ length: 6 }).map((_, index) => (
                      <li key={index}>
                        <Skeleton className="h-4 w-3/4" />
                      </li>
                    ))
                  : artists.map((artist) => (
                      <li key={artist.id}>
                        <Link
                          href={`/products?artist=${artist.id}`}
                          className="text-muted-foreground hover:text-primary"
                        >
                          {artist.name}
                        </Link>
                      </li>
                    ))}
              </ul>
            </div>

            <div>
              <h3 className="font-semibold text-foreground mb-4">ABOUT</h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link
                    href="#"
                    className="text-muted-foreground hover:text-primary"
                  >
                    The Team
                  </Link>
                </li>
                <li>
                  <Link
                    href="#"
                    className="text-muted-foreground hover:text-primary"
                  >
                    Testimonials
                  </Link>
                </li>
                <li>
                  <Link
                    href="#"
                    className="text-muted-foreground hover:text-primary"
                  >
                    Work With Us
                  </Link>
                </li>
                <li>
                  <Link
                    href="/contact"
                    className="text-muted-foreground hover:text-primary"
                  >
                    Contact Us
                  </Link>
                </li>
                <li>
                  <Link
                    href="#"
                    className="text-muted-foreground hover:text-primary"
                  >
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link
                    href="#"
                    className="text-muted-foreground hover:text-primary"
                  >
                    Terms & Conditions
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t text-center text-sm text-muted-foreground">
          <p>
            &copy; {new Date().getFullYear()} ArtsyCraftsy. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

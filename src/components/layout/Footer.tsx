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

const Footer = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/category/dropdown`,
        );
        const result = await response.json();
        if (response.ok && result.status === 1 && Array.isArray(result.data)) {
          setCategories(result.data.slice(0, 6)); // Take first 6 categories
        } else {
          setCategories([]);
        }
      } catch (error) {
        console.error("Failed to fetch categories:", error);
        setCategories([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCategories();
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

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          <div className="lg:col-span-3 grid grid-cols-2 sm:grid-cols-3 gap-8">
            <div>
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
              <h3 className="font-semibold text-foreground mb-4 mt-6">
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
                    href="#"
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
          <div className="lg:col-span-2 lg:pl-8">
            <div className="mt-8 md:mt-0">
              <h3 className="font-semibold text-foreground mb-4">
                Get In Touch With Us
              </h3>
              <form className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input placeholder="Your Name" />
                  <Input type="email" placeholder="Your Email" />
                </div>
                <Textarea placeholder="Your Message" rows={4} />
                <Button
                  type="submit"
                  className="bg-primary hover:bg-primary/90 text-primary-foreground"
                >
                  Send Message
                </Button>
              </form>
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

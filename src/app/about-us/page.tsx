import type { Metadata } from "next";
import { buildMetadata } from "@/lib/seo";
import Link from "next/link";

export const metadata: Metadata = buildMetadata({
  title: "About Us",
  description:
    "Learn about Arts & Craft Studio — our mission to connect independent artists with art lovers and support handmade craft across India.",
  path: "/about-us",
});
import {
  ChevronLeft,
  Palette,
  PenTool,
  Sparkles,
  Eye,
  Heart,
  ShieldCheck,
} from "lucide-react";

export default function AboutUsPage() {
  return (
    <div className="max-w-3xl mx-auto py-12 px-4">
      <Link
        href="/"
        className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors"
      >
        <ChevronLeft className="h-4 w-4 mr-1" />
        Back to Home
      </Link>

      <div className="flex items-center gap-3 mb-8">
        <Palette className="h-8 w-8 text-primary" />
        <h1 className="font-headline text-3xl sm:text-4xl font-bold">
          About Us
        </h1>
      </div>

      <div className="space-y-8">
        <div>
          <p className="text-muted-foreground leading-relaxed">
            We are building a platform dedicated to empowering artists and
            making original artwork more accessible to everyone.
          </p>
          <p className="text-muted-foreground leading-relaxed mt-4">
            Our marketplace connects talented artists with buyers who value
            creativity, authenticity, and unique expression. Whether you&apos;re
            an emerging creator or an experienced artist, our goal is to provide
            a space where your work can be discovered, appreciated, and sold
            without unnecessary barriers.
          </p>
        </div>

        <div>
          <h2 className="font-headline text-2xl font-semibold mb-4">
            What We Offer
          </h2>

          <div className="space-y-6">
            <div className="flex gap-4">
              <Palette className="h-6 w-6 text-primary mt-1 shrink-0" />
              <div>
                <h3 className="font-headline text-lg font-semibold mb-1">
                  A Marketplace for Original Art
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  Artists can easily register, showcase their work, and sell
                  directly to buyers. We focus on giving creators full control
                  over their portfolio while ensuring a smooth buying experience
                  for customers.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <PenTool className="h-6 w-6 text-primary mt-1 shrink-0" />
              <div>
                <h3 className="font-headline text-lg font-semibold mb-1">
                  Custom Artwork Requests
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  We understand that sometimes you&apos;re looking for something
                  specific. Our platform allows users to request custom artwork
                  based on their ideas, giving artists the opportunity to create
                  personalized pieces and buyers the chance to own something
                  truly one-of-a-kind.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <Sparkles className="h-6 w-6 text-primary mt-1 shrink-0" />
              <div>
                <h3 className="font-headline text-lg font-semibold mb-1">
                  AI-Powered Creative Studio
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  Creativity meets technology in our AI Studio. Artists can
                  explore new ideas, generate concepts, and find inspiration
                  using AI tools designed to enhance—not replace—the creative
                  process.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div>
          <h2 className="font-headline text-2xl font-semibold mb-4">
            Our Vision
          </h2>
          <p className="text-muted-foreground leading-relaxed mb-4">
            We aim to build a thriving creative ecosystem where:
          </p>
          <ul className="space-y-3">
            <li className="flex items-start gap-3 text-muted-foreground">
              <Eye className="h-5 w-5 text-primary mt-0.5 shrink-0" />
              <span>Artists can grow and monetize their talent</span>
            </li>
            <li className="flex items-start gap-3 text-muted-foreground">
              <Heart className="h-5 w-5 text-primary mt-0.5 shrink-0" />
              <span>Buyers can discover meaningful and unique art</span>
            </li>
            <li className="flex items-start gap-3 text-muted-foreground">
              <Sparkles className="h-5 w-5 text-primary mt-0.5 shrink-0" />
              <span>Technology enhances creativity without limiting it</span>
            </li>
          </ul>
        </div>

        <div>
          <h2 className="font-headline text-2xl font-semibold mb-4">
            Our Commitment
          </h2>
          <p className="text-muted-foreground leading-relaxed mb-4">
            We are committed to:
          </p>
          <ul className="space-y-3">
            <li className="flex items-start gap-3 text-muted-foreground">
              <Heart className="h-5 w-5 text-primary mt-0.5 shrink-0" />
              <span>Supporting artists at every stage of their journey</span>
            </li>
            <li className="flex items-start gap-3 text-muted-foreground">
              <PenTool className="h-5 w-5 text-primary mt-0.5 shrink-0" />
              <span>Promoting originality and creative freedom</span>
            </li>
            <li className="flex items-start gap-3 text-muted-foreground">
              <ShieldCheck className="h-5 w-5 text-primary mt-0.5 shrink-0" />
              <span>
                Providing a secure and transparent platform for transactions
              </span>
            </li>
          </ul>
        </div>
      </div>

      <div className="mt-16 p-8 bg-primary/5 rounded-2xl border border-primary/10 text-center">
        <h3 className="font-headline text-xl font-bold mb-2">
          Whether you&apos;re here to sell, buy, or simply explore
        </h3>
        <p className="text-muted-foreground mb-6 text-sm">
          We&apos;re excited to have you as part of our creative community.
        </p>
        <Link
          href="/"
          className="inline-flex items-center justify-center rounded-md bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground shadow hover:bg-primary/90 transition-colors"
        >
          Explore the Marketplace
        </Link>
      </div>
    </div>
  );
}

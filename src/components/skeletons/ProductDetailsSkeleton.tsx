"use client";

import React from "react";
import { Skeleton } from "@/components/ui/skeleton";
import MinimalProductCardSkeleton from "./MinimalProductCardSkeleton";
import { Separator } from "../ui/separator";

export default function ProductDetailsSkeleton() {
  return (
    <div className="space-y-12">
      {/* Centered Image Gallery Skeleton */}
      <div className="w-full max-w-2xl mx-auto space-y-4">
        <Skeleton className="relative aspect-auto w-full h-[500px] rounded-lg" />
        <div className="flex justify-center gap-2">
          <Skeleton className="w-20 h-20 rounded-md" />
          <Skeleton className="w-20 h-20 rounded-md" />
          <Skeleton className="w-20 h-20 rounded-md" />
        </div>
      </div>

      <div className="max-w-4xl mx-auto space-y-10">
        {/* Title and Button Skeleton */}
        <div className="flex justify-between items-center">
          <div className="space-y-2 w-3/5">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-6 w-1/3" />
          </div>
          <Skeleton className="h-12 w-48 rounded-md" />
        </div>

        <Separator />

        {/* Specs and Artist Skeleton Grid */}
        <div className="grid lg:grid-cols-2 gap-12">
          <div className="lg:col-span-1 space-y-8">
            {/* Specifications Skeleton */}
            <div className="space-y-4">
              <Skeleton className="h-8 w-1/2 mb-4" />
              <div className="grid grid-cols-[max-content_1fr] gap-x-4 gap-y-3">
                {Array.from({ length: 6 }).map((_, i) => (
                  <React.Fragment key={i}>
                    <Skeleton className="h-5 w-20" />
                    <Skeleton className="h-5 w-3/4" />
                  </React.Fragment>
                ))}
              </div>
            </div>
          </div>

          <div className="lg:col-span-1">
            {/* Artist Skeleton */}
            <div className="space-y-8 sticky top-24">
              <div className="flex items-center gap-4">
                <Skeleton className="h-16 w-16 rounded-full" />
                <div className="space-y-2 w-1/2">
                  <Skeleton className="h-5 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
              </div>
              <div className="space-y-3">
                <Skeleton className="h-6 w-1/3" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-5/6" />
              </div>
            </div>
          </div>
        </div>

        <Separator />

        {/* Description Skeleton */}
        <div className="space-y-2">
          <Skeleton className="h-8 w-1/3 mb-4" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-4/5" />
          </div>
        </div>
      </div>

      {/* Related Products Skeleton */}
      <div className="max-w-4xl mx-auto space-y-8">
        <Separator />
        <div>
          <Skeleton className="h-8 w-1/3 mb-6" />
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
            {Array.from({ length: 5 }).map((_, i) => (
              <MinimalProductCardSkeleton key={i} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

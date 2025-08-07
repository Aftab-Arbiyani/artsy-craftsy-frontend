"use client";

import { usePageTransition } from "@/context/PageTransitionProvider";
import { Loader2 } from "lucide-react";

export default function PageTransitionLoader() {
  const { isLoading } = usePageTransition();

  if (!isLoading) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-[9999]">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="text-muted-foreground">Loading...</p>
      </div>
    </div>
  );
}

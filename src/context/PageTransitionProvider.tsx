"use client";

import type { ReactNode } from "react";
import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
} from "react";
import { usePathname, useSearchParams } from "next/navigation";

interface PageTransitionContextType {
  isLoading: boolean;
  startTransition: () => void;
  endTransition: () => void;
}

const PageTransitionContext = createContext<
  PageTransitionContextType | undefined
>(undefined);

export const PageTransitionProvider = ({
  children,
}: {
  children: ReactNode;
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const startTransition = useCallback(() => {
    setIsLoading(true);
  }, []);

  const endTransition = useCallback(() => {
    setIsLoading(false);
  }, []);

  useEffect(() => {
    // End transition whenever the path changes
    endTransition();
  }, [pathname, searchParams, endTransition]);

  return (
    <PageTransitionContext.Provider
      value={{ isLoading, startTransition, endTransition }}
    >
      {children}
    </PageTransitionContext.Provider>
  );
};

export const usePageTransition = (): PageTransitionContextType => {
  const context = useContext(PageTransitionContext);
  if (context === undefined) {
    throw new Error(
      "usePageTransition must be used within a PageTransitionProvider",
    );
  }
  return context;
};

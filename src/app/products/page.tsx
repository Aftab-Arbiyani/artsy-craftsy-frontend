"use client";

import React, {
  useState,
  useEffect,
  useMemo,
  Suspense,
  useCallback,
} from "react";
import { useSearchParams, useRouter } from "next/navigation";
import ProductCard from "@/components/products/ProductCard";
import type { Product } from "@/lib/types";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Search,
  ListRestart,
  ChevronLeft,
  ChevronRight,
  X,
  SlidersHorizontal,
  Tag,
  User,
  Check,
  IndianRupee,
  LayoutTemplate,
} from "lucide-react";
import ProductCardSkeleton from "@/components/skeletons/ProductCardSkeleton";
import { Card, CardContent } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const PRODUCTS_PER_PAGE = 30;
const ARTISTS_PER_PAGE = 5;

const orientationOptions = ["portrait", "landscape", "square", "circular"];
const DEFAULT_PRICE_RANGE: [number, number] = [0, 100000];

function ProductsPageComponent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [products, setProducts] = useState<Product[]>([]);
  const [allCategories, setAllCategories] = useState<
    { id: string; name: string }[]
  >([]);
  const [allArtists, setAllArtists] = useState<{ id: string; name: string }[]>(
    [],
  );

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedOrientations, setSelectedOrientations] = useState<string[]>(
    [],
  );
  const [selectedArtists, setSelectedArtists] = useState<string[]>([]);
  const [priceRange, setPriceRange] =
    useState<[number, number]>(DEFAULT_PRICE_RANGE);
  const [isPriceFilterActive, setIsPriceFilterActive] = useState(false);
  const [minPriceInput, setMinPriceInput] = useState(
    String(DEFAULT_PRICE_RANGE[0]),
  );
  const [maxPriceInput, setMaxPriceInput] = useState(
    String(DEFAULT_PRICE_RANGE[1]),
  );

  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);

  const [artistPagination, setArtistPagination] = useState({
    skip: 0,
    total: 0,
    hasMore: true,
  });
  const [isLoadingMoreArtists, setIsLoadingMoreArtists] = useState(false);

  const fetchProducts = useCallback(
    async (filters: {
      page: number;
      search: string;
      categories: string[];
      orientations: string[];
      artists: string[];
      price?: [number, number];
    }) => {
      setIsLoading(true);
      try {
        const params = new URLSearchParams();
        params.set("take", String(PRODUCTS_PER_PAGE));
        params.set("skip", String((filters.page - 1) * PRODUCTS_PER_PAGE));

        if (filters.search) {
          params.set("search", filters.search);
        }

        filters.categories.forEach((catId) => {
          params.append("category_id[]", catId);
        });

        filters.orientations.forEach((orientation) => {
          params.append("orientation[]", orientation);
        });

        filters.artists.forEach((artistId) => {
          params.append("artist_id[]", artistId);
        });

        if (filters.price) {
          params.set("price_from", String(filters.price[0]));
          params.set("price_to", String(filters.price[1]));
        }

        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/products/all-products?${params.toString()}`,
        );
        const result = await response.json();

        if (response.ok && result.status === 1 && Array.isArray(result.data)) {
          const transformedProducts: Product[] = result.data.map(
            (item: any) => ({
              id: item.id,
              name: item.title,
              description: item.description || "",
              price: parseFloat(item.listing_price),
              discount: item.discount ? parseFloat(item.discount) : undefined,
              category: item.category?.name || "Uncategorized",
              imageUrls: item.media?.map((m: any) =>
                m.file_path
                  ? `${process.env.NEXT_PUBLIC_IMAGE_BASE_URL}${m.file_path}`
                  : "https://placehold.co/600x400.png",
              ) || ["https://placehold.co/600x400.png"],
              artist: item.user?.name || "Unknown Artist",
              medium: item.materials?.name,
              dataAiHint: item.category?.name?.toLowerCase() || "artwork",
            }),
          );
          setProducts(transformedProducts);
          setTotalProducts(result.total);
        } else {
          setProducts([]);
          setTotalProducts(0);
        }
      } catch (error) {
        console.error("Failed to fetch products:", error);
        setProducts([]);
        setTotalProducts(0);
      } finally {
        setIsLoading(false);
      }
    },
    [],
  );

  useEffect(() => {
    const initialSearch = searchParams.get("search") || "";
    const initialCategories = searchParams.getAll("category") || [];
    const initialOrientations = searchParams.getAll("orientation") || [];
    const initialArtists = searchParams.getAll("artist") || [];
    const initialPage = Number(searchParams.get("page")) || 1;

    const initialMinPrice = searchParams.get("price_from");
    const initialMaxPrice = searchParams.get("price_to");

    let priceFilter: [number, number] | undefined = undefined;
    let priceActive = false;

    if (initialMinPrice !== null && initialMaxPrice !== null) {
      const minPrice = Number(initialMinPrice);
      const maxPrice = Number(initialMaxPrice);
      priceFilter = [minPrice, maxPrice];
      setPriceRange([minPrice, maxPrice]);
      setMinPriceInput(String(minPrice));
      setMaxPriceInput(String(maxPrice));
      priceActive = true;
    } else {
      setPriceRange(DEFAULT_PRICE_RANGE);
      setMinPriceInput(String(DEFAULT_PRICE_RANGE[0]));
      setMaxPriceInput(String(DEFAULT_PRICE_RANGE[1]));
    }

    setIsPriceFilterActive(priceActive);
    setSearchTerm(initialSearch);
    setSelectedCategories(initialCategories);
    setSelectedOrientations(initialOrientations);
    setSelectedArtists(initialArtists);
    setCurrentPage(initialPage);

    fetchProducts({
      page: initialPage,
      search: initialSearch,
      categories: initialCategories,
      orientations: initialOrientations,
      artists: initialArtists,
      price: priceActive ? priceFilter : undefined,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  const fetchArtists = useCallback(
    async (currentSkip: number) => {
      setIsLoadingMoreArtists(true);
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/user/artists-dropdown?take=${ARTISTS_PER_PAGE}&skip=${currentSkip}`,
        );
        const result = await response.json();
        if (response.ok && result.status === 1) {
          setAllArtists((prev) =>
            currentSkip === 0 ? result.data : [...prev, ...result.data],
          );
          const newTotal = result.total;
          const newLoadedCount =
            (currentSkip === 0 ? 0 : allArtists.length) + result.data.length;
          setArtistPagination({
            skip: newLoadedCount,
            total: newTotal,
            hasMore: newLoadedCount < newTotal,
          });
        }
      } catch (error) {
        console.error("Failed to fetch artists:", error);
      } finally {
        setIsLoadingMoreArtists(false);
      }
    },
    [allArtists.length],
  );

  useEffect(() => {
    const fetchInitialFilters = async () => {
      // Fetch Categories
      try {
        const catResponse = await fetch(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/category/dropdown`,
        );
        const catResult = await catResponse.json();
        if (catResponse.ok && catResult.status === 1) {
          setAllCategories(catResult.data);
        }
      } catch (error) {
        console.error("Failed to fetch categories:", error);
      }
      // Fetch initial artists
      fetchArtists(0);
    };
    fetchInitialFilters();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const getCategoryNameById = (id: string) =>
    allCategories.find((cat) => cat.id === id)?.name || id;
  const getArtistNameById = (id: string) =>
    allArtists.find((artist) => artist.id === id)?.name || id;

  const handleOrientationChange = (orientation: string, checked: boolean) => {
    const newOrientations = checked
      ? [...selectedOrientations, orientation]
      : selectedOrientations.filter((o) => o !== orientation);

    setSelectedOrientations(newOrientations);
    setCurrentPage(1);
    fetchProducts({
      page: 1,
      search: searchTerm,
      categories: selectedCategories,
      orientations: newOrientations,
      artists: selectedArtists,
      price: isPriceFilterActive ? priceRange : undefined,
    });
  };

  const handleCategoryChange = (categoryId: string, checked: boolean) => {
    const newCategories = checked
      ? [...selectedCategories, categoryId]
      : selectedCategories.filter((id) => id !== categoryId);

    setSelectedCategories(newCategories);
    setCurrentPage(1);
    fetchProducts({
      page: 1,
      search: searchTerm,
      categories: newCategories,
      orientations: selectedOrientations,
      artists: selectedArtists,
      price: isPriceFilterActive ? priceRange : undefined,
    });
  };

  const handleArtistChange = (artistId: string, checked: boolean) => {
    const newArtists = checked
      ? [...selectedArtists, artistId]
      : selectedArtists.filter((id) => id !== artistId);

    setSelectedArtists(newArtists);
    setCurrentPage(1);
    fetchProducts({
      page: 1,
      search: searchTerm,
      categories: selectedCategories,
      orientations: selectedOrientations,
      artists: newArtists,
      price: isPriceFilterActive ? priceRange : undefined,
    });
  };

  const handlePriceInputChange = (type: "min" | "max", value: string) => {
    if (type === "min") {
      setMinPriceInput(value);
    } else {
      setMaxPriceInput(value);
    }
  };

  const applyPriceChange = () => {
    const newMin = parseFloat(minPriceInput) || 0;
    const newMax = parseFloat(maxPriceInput) || 100000;

    if (
      isPriceFilterActive &&
      newMin === priceRange[0] &&
      newMax === priceRange[1]
    ) {
      return;
    }

    const newPriceRange: [number, number] = [newMin, newMax];
    setPriceRange(newPriceRange);
    setIsPriceFilterActive(true);
    setCurrentPage(1);
    fetchProducts({
      page: 1,
      search: searchTerm,
      categories: selectedCategories,
      orientations: selectedOrientations,
      artists: selectedArtists,
      price: newPriceRange,
    });
  };

  const handlePriceSliderCommit = (values: [number, number]) => {
    setMinPriceInput(String(values[0]));
    setMaxPriceInput(String(values[1]));
    setPriceRange(values);
    setIsPriceFilterActive(true);
    setCurrentPage(1);
    fetchProducts({
      page: 1,
      search: searchTerm,
      categories: selectedCategories,
      orientations: selectedOrientations,
      artists: selectedArtists,
      price: values,
    });
  };

  const clearAllFilters = () => {
    setSearchTerm("");
    setSelectedCategories([]);
    setSelectedOrientations([]);
    setSelectedArtists([]);
    setPriceRange(DEFAULT_PRICE_RANGE);
    setMinPriceInput(String(DEFAULT_PRICE_RANGE[0]));
    setMaxPriceInput(String(DEFAULT_PRICE_RANGE[1]));
    setIsPriceFilterActive(false);
    setCurrentPage(1);
    fetchProducts({
      page: 1,
      search: "",
      categories: [],
      orientations: [],
      artists: [],
      price: undefined,
    });
    router.push("/products");
  };

  const removeCategoryFilter = (catId: string) =>
    handleCategoryChange(catId, false);
  const removeOrientationFilter = (orientation: string) =>
    handleOrientationChange(orientation, false);
  const removeArtistFilter = (artistId: string) =>
    handleArtistChange(artistId, false);

  const [openSections, setOpenSections] = useState<string[]>([]);

  useEffect(() => {
    if (window.innerWidth >= 1024) {
      setOpenSections(["category", "artist", "orientation", "price"]);
    }
  }, []);

  const totalPages = Math.ceil(totalProducts / PRODUCTS_PER_PAGE);

  const activeFilters = useMemo(() => {
    const catFilters = selectedCategories.map((c) => ({
      type: "category",
      value: c,
      label: getCategoryNameById(c),
    }));
    const orientFilters = selectedOrientations.map((o) => ({
      type: "orientation",
      value: o,
      label: o.charAt(0).toUpperCase() + o.slice(1),
    }));
    const artistFilters = selectedArtists.map((a) => ({
      type: "artist",
      value: a,
      label: getArtistNameById(a),
    }));
    return [...catFilters, ...orientFilters, ...artistFilters];
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    selectedCategories,
    selectedOrientations,
    selectedArtists,
    allCategories,
    allArtists,
  ]);

  const handlePageChange = (newPage: number) => {
    if (newPage < 1 || newPage > totalPages) return;
    setCurrentPage(newPage);
    fetchProducts({
      page: newPage,
      search: searchTerm,
      categories: selectedCategories,
      orientations: selectedOrientations,
      artists: selectedArtists,
      price: isPriceFilterActive ? priceRange : undefined,
    });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
      {/* Filters Sidebar */}
      <aside className="lg:col-span-1 lg:sticky top-24">
        <div className="rounded-2xl border bg-card shadow-sm overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4 border-b bg-muted/40">
            <div className="flex items-center gap-2">
              <SlidersHorizontal className="h-4 w-4 text-primary" />
              <span className="font-semibold text-sm">Filters</span>
              {(activeFilters.length > 0 || isPriceFilterActive) && (
                <span className="bg-primary text-primary-foreground text-[10px] font-bold rounded-full px-1.5 py-0.5 leading-none">
                  {activeFilters.length + (isPriceFilterActive ? 1 : 0)}
                </span>
              )}
            </div>
            {(activeFilters.length > 0 || isPriceFilterActive) && (
              <button
                onClick={clearAllFilters}
                className="text-xs text-muted-foreground hover:text-destructive transition-colors font-medium"
              >
                Clear all
              </button>
            )}
          </div>

          <Accordion
            type="multiple"
            value={openSections}
            onValueChange={setOpenSections}
            className="w-full"
          >
            {/* Category */}
            <AccordionItem value="category" className="border-b">
              <AccordionTrigger className="px-5 py-3 text-sm font-semibold hover:no-underline hover:bg-muted/30">
                <div className="flex items-center gap-2 flex-1">
                  <Tag className="h-3.5 w-3.5 text-muted-foreground" />
                  Category
                  {selectedCategories.length > 0 && (
                    <span className="bg-primary text-primary-foreground text-[10px] font-bold rounded-full px-1.5 py-0.5 leading-none">
                      {selectedCategories.length}
                    </span>
                  )}
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-3 pb-3">
                <div className="space-y-0.5">
                  {allCategories.length === 0
                    ? Array.from({ length: 4 }).map((_, i) => (
                        <Skeleton key={i} className="h-9 w-full rounded-lg" />
                      ))
                    : allCategories.map((category) => {
                        const isSelected = selectedCategories.includes(
                          category.id,
                        );
                        return (
                          <button
                            key={category.id}
                            onClick={() =>
                              handleCategoryChange(category.id, !isSelected)
                            }
                            className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-all ${
                              isSelected
                                ? "bg-primary/10 text-primary font-semibold"
                                : "hover:bg-muted text-foreground"
                            }`}
                          >
                            <span>{category.name}</span>
                            {isSelected && (
                              <Check className="h-3.5 w-3.5 shrink-0" />
                            )}
                          </button>
                        );
                      })}
                </div>
              </AccordionContent>
            </AccordionItem>

            {/* Artist */}
            <AccordionItem value="artist" className="border-b">
              <AccordionTrigger className="px-5 py-3 text-sm font-semibold hover:no-underline hover:bg-muted/30">
                <div className="flex items-center gap-2 flex-1">
                  <User className="h-3.5 w-3.5 text-muted-foreground" />
                  Artist
                  {selectedArtists.length > 0 && (
                    <span className="bg-primary text-primary-foreground text-[10px] font-bold rounded-full px-1.5 py-0.5 leading-none">
                      {selectedArtists.length}
                    </span>
                  )}
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-3 pb-3">
                <div className="space-y-0.5">
                  {allArtists.length === 0 && !isLoadingMoreArtists
                    ? Array.from({ length: 4 }).map((_, i) => (
                        <Skeleton key={i} className="h-9 w-full rounded-lg" />
                      ))
                    : allArtists.map((artist) => {
                        const isSelected = selectedArtists.includes(artist.id);
                        return (
                          <button
                            key={artist.id}
                            onClick={() =>
                              handleArtistChange(artist.id, !isSelected)
                            }
                            className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-all ${
                              isSelected
                                ? "bg-primary/10 text-primary font-semibold"
                                : "hover:bg-muted text-foreground"
                            }`}
                          >
                            <span
                              className={`flex items-center justify-center h-6 w-6 rounded-full text-[10px] font-bold shrink-0 ${
                                isSelected
                                  ? "bg-primary text-primary-foreground"
                                  : "bg-muted text-muted-foreground"
                              }`}
                            >
                              {artist.name.charAt(0).toUpperCase()}
                            </span>
                            <span className="flex-1 text-left">
                              {artist.name}
                            </span>
                            {isSelected && (
                              <Check className="h-3.5 w-3.5 shrink-0" />
                            )}
                          </button>
                        );
                      })}
                  {artistPagination.hasMore && (
                    <button
                      onClick={() => fetchArtists(artistPagination.skip)}
                      disabled={isLoadingMoreArtists}
                      className="w-full mt-1.5 py-1.5 text-xs text-primary hover:underline disabled:opacity-50 font-medium"
                    >
                      {isLoadingMoreArtists ? "Loading..." : "+ Load more"}
                    </button>
                  )}
                </div>
              </AccordionContent>
            </AccordionItem>

            {/* Orientation */}
            <AccordionItem value="orientation" className="border-b">
              <AccordionTrigger className="px-5 py-3 text-sm font-semibold hover:no-underline hover:bg-muted/30">
                <div className="flex items-center gap-2 flex-1">
                  <LayoutTemplate className="h-3.5 w-3.5 text-muted-foreground" />
                  Orientation
                  {selectedOrientations.length > 0 && (
                    <span className="bg-primary text-primary-foreground text-[10px] font-bold rounded-full px-1.5 py-0.5 leading-none">
                      {selectedOrientations.length}
                    </span>
                  )}
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-4 pb-4">
                <div className="grid grid-cols-2 gap-2">
                  {[
                    {
                      key: "portrait",
                      shape: (
                        <div className="w-3 h-5 rounded-sm border-[2.5px] border-current" />
                      ),
                      label: "Portrait",
                    },
                    {
                      key: "landscape",
                      shape: (
                        <div className="w-5 h-3 rounded-sm border-[2.5px] border-current" />
                      ),
                      label: "Landscape",
                    },
                    {
                      key: "square",
                      shape: (
                        <div className="w-4 h-4 rounded-sm border-[2.5px] border-current" />
                      ),
                      label: "Square",
                    },
                    {
                      key: "circular",
                      shape: (
                        <div className="w-4 h-4 rounded-full border-[2.5px] border-current" />
                      ),
                      label: "Circular",
                    },
                  ].map(({ key, shape, label }) => {
                    const isSelected = selectedOrientations.includes(key);
                    return (
                      <button
                        key={key}
                        onClick={() =>
                          handleOrientationChange(key, !isSelected)
                        }
                        className={`flex flex-col items-center gap-2 py-3 rounded-xl border-2 text-xs font-medium transition-all ${
                          isSelected
                            ? "border-primary bg-primary/10 text-primary"
                            : "border-border hover:border-muted-foreground/40 hover:bg-muted text-muted-foreground"
                        }`}
                      >
                        {shape}
                        {label}
                      </button>
                    );
                  })}
                </div>
              </AccordionContent>
            </AccordionItem>

            {/* Price Range */}
            <AccordionItem value="price" className="border-b-0">
              <AccordionTrigger className="px-5 py-3 text-sm font-semibold hover:no-underline hover:bg-muted/30">
                <div className="flex items-center gap-2 flex-1">
                  <IndianRupee className="h-3.5 w-3.5 text-muted-foreground" />
                  Price Range
                  {isPriceFilterActive && (
                    <span className="bg-primary text-primary-foreground text-[10px] font-bold rounded-full px-1.5 py-0.5 leading-none">
                      ✓
                    </span>
                  )}
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-5 pb-5">
                <div className="space-y-4">
                  <div className="flex justify-between text-xs font-medium">
                    <span className="bg-muted px-2 py-1 rounded-md text-muted-foreground">
                      ₹{Number(priceRange[0]).toLocaleString("en-IN")}
                    </span>
                    <span className="bg-muted px-2 py-1 rounded-md text-muted-foreground">
                      ₹{Number(priceRange[1]).toLocaleString("en-IN")}
                    </span>
                  </div>
                  <Slider
                    min={0}
                    max={100000}
                    step={1000}
                    value={priceRange}
                    onValueChange={(values: [number, number]) => {
                      setPriceRange(values);
                      setMinPriceInput(String(values[0]));
                      setMaxPriceInput(String(values[1]));
                    }}
                    onValueCommit={handlePriceSliderCommit}
                  />
                  <div className="flex gap-2 items-center">
                    <div className="flex-1 relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground font-medium">
                        ₹
                      </span>
                      <Input
                        type="number"
                        placeholder="Min"
                        value={minPriceInput}
                        onChange={(e) =>
                          handlePriceInputChange("min", e.target.value)
                        }
                        onBlur={applyPriceChange}
                        className="pl-6 h-9 text-sm hide-number-arrows"
                      />
                    </div>
                    <div className="h-px w-3 bg-border shrink-0" />
                    <div className="flex-1 relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground font-medium">
                        ₹
                      </span>
                      <Input
                        type="number"
                        placeholder="Max"
                        value={maxPriceInput}
                        onChange={(e) =>
                          handlePriceInputChange("max", e.target.value)
                        }
                        onBlur={applyPriceChange}
                        className="pl-6 h-9 text-sm hide-number-arrows"
                      />
                    </div>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </aside>

      {/* Main Content */}
      <main className="lg:col-span-3">
        <div className="space-y-6">
          {activeFilters.length > 0 && (
            <div className="flex items-center gap-2 flex-wrap bg-muted/30 px-4 py-3 rounded-xl border">
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide">
                Active:
              </span>
              {activeFilters.map((filter) => (
                <button
                  key={`${filter.type}-${filter.value}`}
                  onClick={() => {
                    if (filter.type === "category")
                      removeCategoryFilter(filter.value);
                    if (filter.type === "orientation")
                      removeOrientationFilter(filter.value);
                    if (filter.type === "artist")
                      removeArtistFilter(filter.value);
                  }}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary border border-primary/20 hover:bg-destructive/10 hover:text-destructive hover:border-destructive/30 transition-colors"
                >
                  {filter.label}
                  <X className="h-3 w-3" />
                </button>
              ))}
              <button
                onClick={clearAllFilters}
                className="inline-flex items-center gap-1 px-2 py-1 text-xs text-muted-foreground hover:text-destructive transition-colors font-medium"
              >
                <ListRestart className="h-3 w-3" /> Clear all
              </button>
            </div>
          )}

          {isLoading ? (
            <div className="columns-2 sm:columns-2 lg:columns-3 gap-6 space-y-6">
              {Array.from({ length: 9 }).map((_, index) => (
                <div key={index} className="break-inside-avoid">
                  <ProductCardSkeleton />
                </div>
              ))}
            </div>
          ) : products.length > 0 ? (
            <>
              <div className="columns-2 sm:columns-2 lg:columns-3 gap-6 space-y-6">
                {products.map((product) => (
                  <div key={product.id} className="break-inside-avoid">
                    <ProductCard product={product} />
                  </div>
                ))}
              </div>
              {totalPages > 1 && (
                <div className="flex justify-center items-center space-x-4 mt-8">
                  <Button
                    variant="outline"
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                  >
                    <ChevronLeft className="mr-2 h-4 w-4" /> Previous
                  </Button>
                  <span className="text-sm font-medium">
                    Page {currentPage} of {totalPages}
                  </span>
                  <Button
                    variant="outline"
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                  >
                    Next <ChevronRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-12 col-span-full">
              <Search className="mx-auto h-16 w-16 text-muted-foreground mb-4" />
              <p className="text-xl text-muted-foreground">
                No artworks match your criteria.
              </p>
              <p className="text-sm text-muted-foreground mt-2">
                Try adjusting your search or filters.
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default function ProductsPage() {
  return (
    <Suspense
      fallback={
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
          <aside className="lg:col-span-1 lg:sticky top-24">
            <Card className="p-4">
              <CardContent className="p-0">
                <div className="space-y-4">
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full" />
                </div>
              </CardContent>
            </Card>
          </aside>
          <main className="lg:col-span-3 space-y-6">
            <div className="flex justify-center">
              <Skeleton className="h-10 w-full max-w-md" />
            </div>
            <div className="columns-1 sm:columns-2 lg:columns-3 gap-6 space-y-6">
              {Array.from({ length: 9 }).map((_, index) => (
                <div key={index} className="break-inside-avoid">
                  <ProductCardSkeleton />
                </div>
              ))}
            </div>
          </main>
        </div>
      }
    >
      <ProductsPageComponent />
    </Suspense>
  );
}

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
} from "lucide-react";
import ProductCardSkeleton from "@/components/skeletons/ProductCardSkeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const PRODUCTS_PER_PAGE = 12;

const orientationOptions = ["portrait", "landscape", "square", "circular"];

function ProductsPageComponent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [products, setProducts] = useState<Product[]>([]);
  const [allCategories, setAllCategories] = useState<
    { id: string; name: string }[]
  >([]);

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedOrientations, setSelectedOrientations] = useState<string[]>(
    [],
  );
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 100000]);
  const [minPriceInput, setMinPriceInput] = useState("0");
  const [maxPriceInput, setMaxPriceInput] = useState("100000");

  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);

  const fetchProducts = useCallback(
    async (filters: {
      page: number;
      search: string;
      categories: string[];
      orientations: string[];
      price: [number, number];
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

        params.set("price_from", String(filters.price[0]));
        params.set("price_to", String(filters.price[1]));

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
                  ? `${process.env.NEXT_PUBLIC_API_BASE_URL}/${m.file_path}`
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
    const initialPage = Number(searchParams.get("page")) || 1;
    const initialMinPrice = Number(searchParams.get("price_from")) || 0;
    const initialMaxPrice = Number(searchParams.get("price_to")) || 100000;
    const initialPriceRange: [number, number] = [
      initialMinPrice,
      initialMaxPrice,
    ];

    setSearchTerm(initialSearch);
    setSelectedCategories(initialCategories);
    setSelectedOrientations(initialOrientations);
    setCurrentPage(initialPage);
    setPriceRange(initialPriceRange);
    setMinPriceInput(String(initialMinPrice));
    setMaxPriceInput(String(initialMaxPrice));

    fetchProducts({
      page: initialPage,
      search: initialSearch,
      categories: initialCategories,
      orientations: initialOrientations,
      price: initialPriceRange,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]); // Re-fetch only when URL params change

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/category/dropdown`,
        );
        const result = await response.json();
        if (response.ok && result.status === 1) {
          setAllCategories(result.data);
        }
      } catch (error) {
        console.error("Failed to fetch categories:", error);
      }
    };
    fetchCategories();
  }, []);

  const getCategoryNameById = (id: string) => {
    return allCategories.find((cat) => cat.id === id)?.name || id;
  };

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
      price: priceRange,
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
      price: priceRange,
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

    // Only call API if the price range has actually changed
    if (newMin === priceRange[0] && newMax === priceRange[1]) {
      return;
    }

    const newPriceRange: [number, number] = [newMin, newMax];
    setPriceRange(newPriceRange);
    setCurrentPage(1);
    fetchProducts({
      page: 1,
      search: searchTerm,
      categories: selectedCategories,
      orientations: selectedOrientations,
      price: newPriceRange,
    });
  };

  const handlePriceSliderCommit = (values: [number, number]) => {
    setMinPriceInput(String(values[0]));
    setMaxPriceInput(String(values[1]));
    setPriceRange(values);
    setCurrentPage(1);
    fetchProducts({
      page: 1,
      search: searchTerm,
      categories: selectedCategories,
      orientations: selectedOrientations,
      price: values,
    });
  };

  const clearAllFilters = () => {
    setSearchTerm("");
    setSelectedCategories([]);
    setSelectedOrientations([]);
    setPriceRange([0, 100000]);
    setMinPriceInput("0");
    setMaxPriceInput("100000");
    setCurrentPage(1);
    fetchProducts({
      page: 1,
      search: "",
      categories: [],
      orientations: [],
      price: [0, 100000],
    });
    router.push("/products");
  };

  const removeCategoryFilter = (catId: string) => {
    handleCategoryChange(catId, false);
  };

  const removeOrientationFilter = (orientation: string) => {
    handleOrientationChange(orientation, false);
  };

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
    return [...catFilters, ...orientFilters];
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCategories, selectedOrientations, allCategories]);

  const handlePageChange = (newPage: number) => {
    if (newPage < 1 || newPage > totalPages) return;
    setCurrentPage(newPage);
    fetchProducts({
      page: newPage,
      search: searchTerm,
      categories: selectedCategories,
      orientations: selectedOrientations,
      price: priceRange,
    });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
      {/* Filters Sidebar */}
      <aside className="lg:col-span-1 lg:sticky top-24">
        <Card className="p-4">
          <CardContent className="p-0">
            <Accordion type="multiple" className="w-full">
              <AccordionItem value="category">
                <AccordionTrigger className="text-base font-semibold py-2">
                  Category
                </AccordionTrigger>
                <AccordionContent className="pt-2">
                  <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
                    {allCategories.length === 0
                      ? Array.from({ length: 4 }).map((_, i) => (
                          <div key={i} className="flex items-center space-x-2">
                            <Skeleton className="h-4 w-4" />
                            <Skeleton className="h-4 w-3/4" />
                          </div>
                        ))
                      : allCategories.map((category) => (
                          <div
                            key={category.id}
                            className="flex items-center space-x-2"
                          >
                            <Checkbox
                              id={`cat-${category.id}`}
                              checked={selectedCategories.includes(category.id)}
                              onCheckedChange={(checked) =>
                                handleCategoryChange(category.id, !!checked)
                              }
                            />
                            <label
                              htmlFor={`cat-${category.id}`}
                              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                            >
                              {category.name}
                            </label>
                          </div>
                        ))}
                  </div>
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="orientation">
                <AccordionTrigger className="text-base font-semibold py-2">
                  Orientation
                </AccordionTrigger>
                <AccordionContent className="pt-2">
                  <div className="space-y-2 pr-2">
                    {orientationOptions.map((orientation) => (
                      <div
                        key={orientation}
                        className="flex items-center space-x-2"
                      >
                        <Checkbox
                          id={`orient-${orientation}`}
                          checked={selectedOrientations.includes(orientation)}
                          onCheckedChange={(checked) =>
                            handleOrientationChange(orientation, !!checked)
                          }
                        />
                        <label
                          htmlFor={`orient-${orientation}`}
                          className="text-sm font-medium leading-none capitalize peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                          {orientation}
                        </label>
                      </div>
                    ))}
                  </div>
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="price" className="border-b-0">
                <AccordionTrigger className="text-base font-semibold py-2">
                  Price Range (₹)
                </AccordionTrigger>
                <AccordionContent className="pt-2">
                  <div className="space-y-4">
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
                    <div className="flex justify-between items-center gap-2">
                      <div className="relative w-full">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
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
                          className="w-full h-9 pl-6 hide-number-arrows"
                        />
                      </div>
                      <span className="text-muted-foreground">-</span>
                      <div className="relative w-full">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
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
                          className="w-full h-9 pl-6 hide-number-arrows"
                        />
                      </div>
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </CardContent>
        </Card>
      </aside>

      {/* Main Content */}
      <main className="lg:col-span-3">
        <div className="space-y-6">
          {activeFilters.length > 0 && (
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm font-medium">Active Filters:</span>
              {activeFilters.map((filter) => (
                <Button
                  key={`${filter.type}-${filter.value}`}
                  variant="secondary"
                  size="sm"
                  onClick={() =>
                    filter.type === "category"
                      ? removeCategoryFilter(filter.value)
                      : removeOrientationFilter(filter.value)
                  }
                >
                  {filter.label}
                  <X className="ml-2 h-4 w-4" />
                </Button>
              ))}
              <Button
                variant="ghost"
                size="sm"
                onClick={clearAllFilters}
                className="text-sm text-primary hover:text-primary/80"
              >
                <ListRestart className="mr-2 h-4 w-4" /> Clear all
              </Button>
            </div>
          )}

          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 items-start">
              {Array.from({ length: 9 }).map((_, index) => (
                <ProductCardSkeleton key={index} />
              ))}
            </div>
          ) : products.length > 0 ? (
            <>
              <div className="columns-1 sm:columns-2 lg:columns-3 gap-6 space-y-6">
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
              <CardHeader className="p-2 pt-0">
                <Skeleton className="h-8 w-1/2" />
              </CardHeader>
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
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 items-start">
              {Array.from({ length: 9 }).map((_, index) => (
                <ProductCardSkeleton key={index} />
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

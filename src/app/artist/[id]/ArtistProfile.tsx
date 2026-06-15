"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import ProductCard from "@/components/products/ProductCard";
import {
  Loader2,
  User,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  UserPlus,
  UserCheck,
  MapPin,
  Palette,
} from "lucide-react";
import type { Product } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { usePageTransition } from "@/context/PageTransitionProvider";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface ArtistDetails {
  id: string;
  name: string;
  email?: string;
  bio: string;
  profile_picture?: string;
  followersCount?: number;
  address?: {
    city: string;
    country: string;
  };
}

const PRODUCTS_PER_PAGE = 8;

export default function ArtistProfile({
  initialArtist,
  initialProducts,
  initialTotal,
}: {
  initialArtist?: ArtistDetails | null;
  initialProducts?: Product[];
  initialTotal?: number;
}) {
  const params = useParams();
  const { id } = params;
  const router = useRouter();
  const { toast } = useToast();
  const { startTransition } = usePageTransition();
  const [artist, setArtist] = useState<ArtistDetails | null>(
    initialArtist !== undefined ? initialArtist : null
  );
  const [products, setProducts] = useState<Product[]>(initialProducts ?? []);
  const [isLoading, setIsLoading] = useState(initialArtist === undefined);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalProducts, setTotalProducts] = useState(initialTotal ?? 0);

  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);
  const [isSelf, setIsSelf] = useState(false);
  const [isFollowLoading, setIsFollowLoading] = useState(false);
  const [isBioExpanded, setIsBioExpanded] = useState(false);
  const [followersCount, setFollowersCount] = useState<number>(
    initialArtist?.followersCount ?? 0
  );

  const artistId = Array.isArray(id) ? id[0] : id;

  useEffect(() => {
    const token = localStorage.getItem("authToken");
    setIsLoggedIn(!!token);

    if (!token || !artistId) return;

    const fetchFollowStatus = async () => {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/follow/status/${artistId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        const result = await res.json();
        if (res.ok && result.status === 1) {
          setIsFollowing(!!result.data?.isFollowing);
          setIsSelf(!!result.data?.isSelf);
          if (typeof result.data?.followerCount === "number") {
            setFollowersCount(result.data.followerCount);
          }
        }
      } catch {
        // Non-blocking: leave the button in its default (not following) state.
      }
    };

    fetchFollowStatus();
  }, [artistId]);

  const handleAuthRedirect = (path: string) => {
    startTransition();
    router.push(path);
  };

  const handleToggleFollow = async () => {
    const token = localStorage.getItem("authToken");
    if (!token || !artistId) return;

    setIsFollowLoading(true);
    const nextFollowing = !isFollowing;

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/follow/${artistId}`,
        {
          method: nextFollowing ? "POST" : "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const result = await res.json();

      if (res.ok && result.status === 1) {
        setIsFollowing(result.data?.isFollowing ?? nextFollowing);
        if (typeof result.data?.followerCount === "number") {
          setFollowersCount(result.data.followerCount);
        }
      } else {
        toast({
          title: "Error",
          description: result.message || "Something went wrong. Please try again.",
          variant: "destructive",
        });
      }
    } catch {
      toast({
        title: "Error",
        description: "Unable to update follow status. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsFollowLoading(false);
    }
  };

  useEffect(() => {
    if (!id) {
      setError("Artist ID is missing.");
      setIsLoading(false);
      return;
    }

    // Page 1 data was already provided by the server — skip the initial fetch
    if (currentPage === 1 && initialArtist !== undefined) {
      return;
    }

    const fetchArtistData = async () => {
      setIsLoading(true);
      try {
        const [artistResponse, productsResponse] = await Promise.all([
          fetch(
            `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/user/artist-profile/${id}`,
          ),
          fetch(
            `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/products/artist-products/${id}?take=${PRODUCTS_PER_PAGE}&skip=${(currentPage - 1) * PRODUCTS_PER_PAGE}`,
          ),
        ]);

        const artistResult = await artistResponse.json();
        if (artistResponse.ok && artistResult.status === 1) {
          const artistData = artistResult.data;
          const artistAddress =
            artistData.addresses && artistData.addresses.length > 0
              ? {
                  city: artistData.addresses[0].city,
                  country: artistData.addresses[0].country || "India",
                }
              : undefined;

          setArtist({
            id: artistData.id,
            name: artistData.name,
            bio: artistData.bio,
            profile_picture: artistData.profile_picture,
            followersCount: artistData.followers_count ?? 0,
            address: artistAddress,
          });
          setFollowersCount(artistData.followers_count ?? 0);
        } else {
          setError(artistResult.message || "Failed to fetch artist details.");
          setIsLoading(false);
          return;
        }

        const productsResult = await productsResponse.json();
        if (productsResponse.ok && productsResult.status === 1) {
          const transformedProducts: Product[] = productsResult.data.map(
            (item: any) => ({
              id: item.id,
              name: item.title,
              description: item.description || "",
              price: parseFloat(item.listing_price),
              discount: item.discount ? parseFloat(item.discount) : undefined,
              category: item.category?.name || "Uncategorized",
              imageUrls:
                item.media?.map((m: any) =>
                  m.file_path
                    ? `${process.env.NEXT_PUBLIC_IMAGE_BASE_URL}${m.file_path}`
                    : "https://placehold.co/600x400.png",
                ) || ["https://placehold.co/600x400.png"],
              artist: artistResult.data?.name || "Unknown Artist",
              medium: item.materials?.name,
              dataAiHint: item.category?.name?.toLowerCase() || "artwork",
            }),
          );
          setProducts(transformedProducts);
          setTotalProducts(productsResult.total);
        } else {
          setProducts([]);
          setTotalProducts(0);
        }

        setError(null);
      } catch (err) {
        setError("An unexpected error occurred. Please try again later.");
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchArtistData();
  }, [id, currentPage]);

  const totalPages = Math.ceil(totalProducts / PRODUCTS_PER_PAGE);

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-[50vh]">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <AlertTriangle className="mx-auto h-16 w-16 text-destructive mb-4" />
        <h1 className="font-headline text-3xl mb-4">Error</h1>
        <p className="text-muted-foreground">{error}</p>
      </div>
    );
  }

  if (!artist) {
    return (
      <div className="text-center py-12">
        <User className="mx-auto h-16 w-16 text-muted-foreground mb-4" />
        <h1 className="font-headline text-3xl mb-4">Artist Not Found</h1>
        <p className="text-muted-foreground">
          The artist you are looking for does not exist.
        </p>
      </div>
    );
  }

  const locationLabel = artist.address?.city
    ? `${artist.address.city}, ${artist.address.country}`
    : "Location not available";

  const artistInitials = artist.name
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <h1 className="font-headline text-2xl font-bold md:text-3xl">
        Artist Profile
      </h1>

      <section className="rounded-xl border bg-card p-6 shadow-sm md:p-8">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-start">
          <Avatar className="h-28 w-28 shrink-0 self-center overflow-hidden rounded-full border-4 border-background text-2xl shadow-md ring-2 ring-primary/15 sm:self-start md:h-36 md:w-36 md:text-3xl">
            {artist.profile_picture && (
              <AvatarImage
                src={`${process.env.NEXT_PUBLIC_IMAGE_BASE_URL}${artist.profile_picture}`}
                alt={artist.name}
                data-ai-hint="artist portrait"
              />
            )}
            <AvatarFallback className="bg-gradient-to-br from-primary/20 to-accent/20 font-semibold text-primary">
              {artistInitials}
            </AvatarFallback>
          </Avatar>

          <div className="min-w-0 flex-1">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="font-headline text-2xl font-bold md:text-3xl">
                    {artist.name}
                  </h2>
                  <Badge
                    variant="outline"
                    className="border-accent/30 bg-accent/10 text-accent"
                  >
                    <Palette className="mr-1 h-3 w-3" />
                    Artist
                  </Badge>
                </div>
                <p className="mt-1 flex items-center gap-1.5 text-sm text-muted-foreground">
                  <MapPin className="h-3.5 w-3.5 shrink-0" />
                  {locationLabel}
                </p>
              </div>

              <div className="flex shrink-0 items-center gap-2">
                {!isSelf &&
                  (isLoggedIn ? (
                    <Button
                      onClick={handleToggleFollow}
                      disabled={isFollowLoading}
                      variant={isFollowing ? "outline" : "default"}
                      className={
                        isFollowing
                          ? "border-primary text-primary hover:bg-primary/10 hover:text-primary"
                          : "bg-primary hover:bg-primary/90"
                      }
                    >
                      {isFollowLoading ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : isFollowing ? (
                        <UserCheck className="mr-2 h-4 w-4" />
                      ) : (
                        <UserPlus className="mr-2 h-4 w-4" />
                      )}
                      {isFollowing ? "Following" : "Follow"}
                    </Button>
                  ) : (
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button className="bg-primary hover:bg-primary/90">
                          <UserPlus className="mr-2 h-4 w-4" />
                          Follow
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>
                            Authentication Required
                          </AlertDialogTitle>
                          <AlertDialogDescription>
                            Please log in or create an account to follow this
                            artist.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() =>
                              handleAuthRedirect("/signup?type=customer")
                            }
                            className="bg-secondary hover:bg-secondary/80 text-secondary-foreground"
                          >
                            Sign Up
                          </AlertDialogAction>
                          <AlertDialogAction
                            onClick={() => handleAuthRedirect("/login")}
                          >
                            Log In
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  ))}
              </div>
            </div>

            <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm">
              <span>
                <span className="font-semibold text-foreground">
                  {totalProducts}
                </span>{" "}
                <span className="text-muted-foreground">
                  {totalProducts === 1 ? "Artwork" : "Artworks"}
                </span>
              </span>
              <span aria-hidden className="text-muted-foreground/40">
                |
              </span>
              <span>
                <span className="font-semibold text-foreground">
                  {followersCount}
                </span>{" "}
                <span className="text-muted-foreground">
                  {followersCount === 1 ? "Follower" : "Followers"}
                </span>
              </span>
            </div>

            {artist.bio && (
              <div className="mt-5">
                <h3 className="mb-1.5 font-semibold text-foreground">
                  About Artist
                </h3>
                <p
                  className={`text-sm leading-relaxed text-muted-foreground ${
                    isBioExpanded ? "" : "line-clamp-3"
                  }`}
                >
                  {artist.bio}
                </p>
                {artist.bio.length > 180 && (
                  <button
                    type="button"
                    onClick={() => setIsBioExpanded((v) => !v)}
                    className="mt-1.5 text-sm font-medium text-primary hover:underline"
                  >
                    {isBioExpanded ? "Show less" : "Read more"}
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </section>

      <main className="space-y-6">
        <div className="flex flex-wrap items-end justify-between gap-4 border-b pb-4">
          <div>
            <h2 className="font-headline text-2xl font-bold md:text-3xl">
              Artworks
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {totalProducts} {totalProducts === 1 ? "piece" : "pieces"} by{" "}
              {artist.name}
            </p>
          </div>
        </div>
        {products.length > 0 ? (
          <>
            <div className="columns-2 sm:columns-2 md:columns-3 lg:columns-4 gap-6 space-y-6">
              {products.map((product) => (
                <div key={product.id} className="break-inside-avoid">
                  <ProductCard product={product} />
                </div>
              ))}
            </div>
            {totalPages > 1 && (
              <div className="flex justify-center items-center space-x-4 mt-12">
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
          <p className="text-center text-muted-foreground py-8">
            This artist has not listed any artworks yet.
          </p>
        )}
      </main>
    </div>
  );
}

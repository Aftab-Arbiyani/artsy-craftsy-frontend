"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import {
  PlusCircle,
  Edit,
  Trash2,
  ArrowLeft,
  Image as ImageIcon,
  Loader2,
  ChevronLeft,
  ChevronRight,
  Eye,
} from "lucide-react";
import type { Product } from "@/lib/types";
import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import TableRowSkeleton from "@/components/skeletons/TableRowSkeleton";
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
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";

type ArtworkStatus = "active" | "in_active" | "sold" | "archived";
type Artwork = Product & {
  status: ArtworkStatus;
  stock: number;
  discount: number;
  amountReceivable: number;
  createdAt: string;
  medium?: string;
};

const PRODUCTS_PER_PAGE = 10;

const STATUS_MAP: Record<
  ArtworkStatus,
  { text: string; variant: "default" | "secondary" | "outline" | "destructive" }
> = {
  active: { text: "Active", variant: "default" },
  in_active: { text: "Inactive", variant: "secondary" },
  sold: { text: "Sold", variant: "outline" },
  archived: { text: "Archived", variant: "destructive" },
};

export default function MyArtworksPage() {
  const [artworks, setArtworks] = useState<Artwork[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalArtworks, setTotalArtworks] = useState(0);
  const { toast } = useToast();
  const router = useRouter();

  const fetchArtworks = useCallback(
    async (page: number) => {
      setIsLoading(true);
      const token = localStorage.getItem("authToken");
      if (!token) {
        toast({
          title: "Unauthorized",
          description: "Please log in to view your artworks.",
          variant: "destructive",
        });
        router.push("/login");
        return;
      }

      try {
        const params = new URLSearchParams({
          take: String(PRODUCTS_PER_PAGE),
          skip: String((page - 1) * PRODUCTS_PER_PAGE),
        });
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/products/my-products?${params.toString()}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        );

        if (response.ok) {
          const result = await response.json();
          if (result.status === 1 && Array.isArray(result.data)) {
            const transformedArtworks: Artwork[] = result.data.map(
              (item: any) => ({
                id: item.id,
                name: item.title,
                price: parseFloat(item.listing_price),
                status: item.status,
                imageUrls: item.media?.map((m: any) =>
                  m.file_path
                    ? `${process.env.NEXT_PUBLIC_IMAGE_BASE_URL}${m.file_path}`
                    : "https://placehold.co/600x400.png",
                ) || ["https://placehold.co/600x400.png"],
                category: item.category?.name || "Uncategorized",
                description: item.description || "",
                stock: item.quantity || 0,
                discount: parseFloat(item.discount) || 0,
                amountReceivable: parseFloat(item.amount_receivable) || 0,
                createdAt: item.created_at,
                medium: item.materials?.name,
              }),
            );
            setArtworks(transformedArtworks);
            setTotalArtworks(result.total);
          }
        } else {
          toast({
            title: "Error",
            description: "Could not fetch your artworks.",
            variant: "destructive",
          });
        }
      } catch (error) {
        toast({
          title: "Network Error",
          description: "Could not connect to the server.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    },
    [router, toast],
  );

  useEffect(() => {
    fetchArtworks(currentPage);
  }, [currentPage, fetchArtworks]);

  const handlePageChange = (newPage: number) => {
    if (newPage > 0 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  const handleDelete = async (artworkId: string) => {
    const token = localStorage.getItem("authToken");
    if (!token) {
      toast({
        title: "Unauthorized",
        description: "Please log in again.",
        variant: "destructive",
      });
      return;
    }

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/products/${artworkId}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      const result = await response.json();
      if (response.ok && result.status === 1) {
        toast({
          title: "Artwork Deleted",
          description:
            result.message || "The artwork has been successfully removed.",
          variant: "success",
        });
        fetchArtworks(currentPage); // Refresh the list
      } else {
        toast({
          title: "Deletion Failed",
          description: result.message || "Could not delete the artwork.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Network Error",
        description: "Could not connect to the server.",
        variant: "destructive",
      });
    }
  };

  const totalPages = Math.ceil(totalArtworks / PRODUCTS_PER_PAGE);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/dashboard" passHref>
            <Button variant="outline" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <h1 className="hidden sm:block font-headline text-2xl sm:text-3xl font-semibold">
            My Artworks
          </h1>
        </div>
        <Link href="/seller/add-product" passHref>
          <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">
            <PlusCircle className="mr-2 h-4 w-4" /> Add New Artwork
          </Button>
        </Link>
      </div>

      <Card className="shadow-lg">
        <CardContent className="p-0">
          {isLoading ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[80px]">Image</TableHead>
                  <TableHead>Title</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Material</TableHead>
                  <TableHead>Price (₹)</TableHead>
                  <TableHead>Discount (%)</TableHead>
                  <TableHead>Stock</TableHead>
                  <TableHead>You Receive (₹)</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date Listed</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRowSkeleton columns={11} rowCount={5} />
              </TableBody>
            </Table>
          ) : artworks.length > 0 ? (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[80px]">Image</TableHead>
                    <TableHead>Title</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Material</TableHead>
                    <TableHead>Price (₹)</TableHead>
                    <TableHead>Discount (%)</TableHead>
                    <TableHead>Stock</TableHead>
                    <TableHead>You Receive (₹)</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Date Listed</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {artworks.map((artwork) => (
                    <TableRow key={artwork.id}>
                      <TableCell>
                        <div className="relative h-16 w-16 rounded-md overflow-hidden border">
                          <Image
                            src={artwork.imageUrls[0]}
                            alt={artwork.name}
                            fill
                            sizes="64px"
                            className="object-cover"
                          />
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">
                        {artwork.name}
                      </TableCell>
                      <TableCell>{artwork.category}</TableCell>
                      <TableCell>{artwork.medium}</TableCell>
                      <TableCell>
                        {artwork.price?.toLocaleString("en-IN") ?? "N/A"}
                      </TableCell>
                      <TableCell>{artwork.discount || 0}%</TableCell>
                      <TableCell>{artwork.stock}</TableCell>
                      <TableCell>
                        {artwork.amountReceivable.toLocaleString("en-IN")}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            STATUS_MAP[artwork.status]?.variant || "secondary"
                          }
                        >
                          {STATUS_MAP[artwork.status]?.text || artwork.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {new Date(artwork.createdAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-right">
                        <Link
                          href={`/seller/edit-product/${artwork.id}?view=true`}
                          passHref
                        >
                          <Button variant="ghost" size="icon">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </Link>
                        <Link
                          href={`/seller/edit-product/${artwork.id}`}
                          passHref
                        >
                          <Button variant="ghost" size="icon">
                            <Edit className="h-4 w-4" />
                          </Button>
                        </Link>

                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="text-destructive hover:text-destructive hover:bg-destructive/10"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>
                                Are you absolutely sure?
                              </AlertDialogTitle>
                              <AlertDialogDescription>
                                This action cannot be undone. This will
                                permanently delete your artwork and remove its
                                data from our servers.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDelete(artwork.id)}
                                className="bg-destructive hover:bg-destructive/90"
                              >
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {totalPages > 1 && (
                <div className="flex justify-center items-center space-x-4 p-4 border-t">
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
            <div className="text-center py-12">
              <ImageIcon className="mx-auto h-16 w-16 text-muted-foreground mb-4" />
              <p className="text-xl text-muted-foreground">
                You haven't listed any artworks yet.
              </p>
              <Link href="/seller/add-product" className="mt-4 inline-block">
                <Button>Add Your First Artwork</Button>
              </Link>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

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
  ArrowLeft,
  Edit3,
  Image as ImageIcon,
  Loader2,
  MoreHorizontal,
  Eye,
  Download,
} from "lucide-react";
import type { AssignedArtRequest } from "@/lib/types";
import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import TableRowSkeleton from "@/components/skeletons/TableRowSkeleton";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import RequestDetailsDrawer from "@/components/seller/RequestDetailsDrawer";
import SendQuoteDrawer from "@/components/seller/SendQuoteDrawer";

const REQUESTS_PER_PAGE = 10;

const STATUS_MAP: Record<
  AssignedArtRequest["status"],
  { text: string; variant: "secondary" | "outline" | "default" | "destructive" }
> = {
  requested: { text: "Requested", variant: "outline" },
  replied: { text: "Replied", variant: "secondary" },
  accepted: { text: "Accepted", variant: "default" },
  rejected: { text: "Rejected", variant: "destructive" },
};

export default function AssignedRequestsPage() {
  const [requests, setRequests] = useState<AssignedArtRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalRequests, setTotalRequests] = useState(0);
  const { toast } = useToast();
  const router = useRouter();

  const [selectedRequestIdForDetails, setSelectedRequestIdForDetails] =
    useState<string | null>(null);
  const [isDetailsDrawerOpen, setIsDetailsDrawerOpen] = useState(false);

  const [selectedRequestIdForQuote, setSelectedRequestIdForQuote] = useState<
    string | null
  >(null);
  const [isQuoteDrawerOpen, setIsQuoteDrawerOpen] = useState(false);

  const fetchRequests = useCallback(
    async (page: number) => {
      setIsLoading(true);
      const token = localStorage.getItem("authToken");
      if (!token) {
        toast({
          title: "Unauthorized",
          description: "Please log in to view assigned requests.",
          variant: "destructive",
        });
        router.push("/login");
        return;
      }

      try {
        const params = new URLSearchParams({
          take: String(REQUESTS_PER_PAGE),
          skip: String((page - 1) * REQUESTS_PER_PAGE),
        });
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/custom-art/assigned-requests?${params.toString()}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        );

        if (response.ok) {
          const result = await response.json();
          if (result.status === 1 && Array.isArray(result.data)) {
            setRequests(result.data);
            setTotalRequests(result.total);
          }
        } else {
          toast({
            title: "Error",
            description: "Could not fetch your assigned requests.",
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
    fetchRequests(currentPage);
  }, [currentPage, fetchRequests]);

  const handleViewDetails = (requestId: string) => {
    setSelectedRequestIdForDetails(requestId);
    setIsDetailsDrawerOpen(true);
  };

  const handleSendQuote = (requestId: string) => {
    setSelectedRequestIdForQuote(requestId);
    setIsQuoteDrawerOpen(true);
  };

  const handleQuotationSent = () => {
    setIsQuoteDrawerOpen(false);
    fetchRequests(currentPage); // Re-fetch to show updated status
  };

  const handleDownloadImage = async (imagePath: string | null) => {
    if (!imagePath) {
      toast({
        title: "No Image",
        description: "There is no image to download for this request.",
        variant: "destructive",
      });
      return;
    }

    const token = localStorage.getItem("authToken");
    if (!token) {
      toast({
        title: "Unauthorized",
        description: "Please log in to download the image.",
        variant: "destructive",
      });
      return;
    }

    try {
      // 1. Get the signed URL from your backend
      const getFileResponse = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/upload/get-file`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ filepath: imagePath }),
        },
      );

      const getFileResult = await getFileResponse.json();

      if (!getFileResponse.ok || getFileResult.status !== 1) {
        throw new Error(getFileResult.message || "Failed to get download URL.");
      }

      const signedUrl = getFileResult.data.url;

      // 2. Open the signed URL in a new tab
      window.open(signedUrl, "_blank");
      toast({
        title: "Success",
        description: "Image is opening in a new tab.",
        variant: "success",
      });
    } catch (error: any) {
      console.error("Download error:", error);
      toast({
        title: "Download Failed",
        description:
          error.message ||
          "Could not download the image. The URL might be expired or invalid.",
        variant: "destructive",
      });
    }
  };

  const totalPages = Math.ceil(totalRequests / REQUESTS_PER_PAGE);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/dashboard" passHref>
            <Button variant="outline" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <h1 className="font-headline text-2xl sm:text-3xl font-semibold">
            Assigned Custom Art Requests
          </h1>
        </div>
      </div>

      <Card className="shadow-lg">
        <CardContent className="p-0">
          {isLoading ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Image</TableHead>
                  <TableHead>Request ID</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Budget</TableHead>
                  <TableHead>Dimensions</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Reply</TableHead>
                  <TableHead>Price (₹)</TableHead>
                  <TableHead>You Receive (₹)</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRowSkeleton columns={11} rowCount={5} />
              </TableBody>
            </Table>
          ) : requests.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Image</TableHead>
                  <TableHead>Request ID</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Budget</TableHead>
                  <TableHead>Dimensions</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Reply</TableHead>
                  <TableHead>Price (₹)</TableHead>
                  <TableHead>You Receive (₹)</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {requests.map((request) => (
                  <TableRow
                    key={request.id}
                    onClick={() => handleViewDetails(request.id)}
                    className="cursor-pointer"
                  >
                    <TableCell>
                      <div className="relative h-16 w-16 rounded-md overflow-hidden border">
                        <Image
                          src={
                            request.reference_image
                              ? `${process.env.NEXT_PUBLIC_IMAGE_BASE_URL}${request.reference_image}`
                              : "https://placehold.co/100x100.png"
                          }
                          alt="Reference"
                          fill
                          sizes="64px"
                          className="object-cover"
                        />
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">
                      {request.request_id}
                    </TableCell>
                    <TableCell>
                      {request.description.substring(0, 50)}...
                    </TableCell>
                    <TableCell>{request.budget_range || "N/A"}</TableCell>
                    <TableCell>{request.dimensions || "N/A"}</TableCell>
                    <TableCell>
                      {new Date(request.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell>{request.reply || "N/A"}</TableCell>
                    <TableCell>
                      {parseFloat(request.price) > 0
                        ? parseFloat(request.price).toLocaleString("en-IN")
                        : "-"}
                    </TableCell>
                    <TableCell>
                      {parseFloat(request.amount_receivable) > 0
                        ? parseFloat(request.amount_receivable).toLocaleString(
                            "en-IN",
                          )
                        : "-"}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          STATUS_MAP[request.status]?.variant || "secondary"
                        }
                      >
                        {STATUS_MAP[request.status]?.text || request.status}
                      </Badge>
                    </TableCell>
                    <TableCell
                      className="text-right"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Open menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onSelect={() => handleViewDetails(request.id)}
                          >
                            <Eye className="mr-2 h-4 w-4" />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onSelect={() =>
                              handleDownloadImage(request.reference_image)
                            }
                          >
                            <Download className="mr-2 h-4 w-4" />
                            Download Image
                          </DropdownMenuItem>
                          {request.status === "requested" && (
                            <DropdownMenuItem
                              onSelect={() => handleSendQuote(request.id)}
                            >
                              Send Quote
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-12">
              <Edit3 className="mx-auto h-16 w-16 text-muted-foreground mb-4" />
              <p className="text-xl text-muted-foreground">
                No custom art requests have been assigned to you yet.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      <RequestDetailsDrawer
        requestId={selectedRequestIdForDetails}
        open={isDetailsDrawerOpen}
        onOpenChange={setIsDetailsDrawerOpen}
        onQuotationSent={() => {
          setIsDetailsDrawerOpen(false);
          handleSendQuote(selectedRequestIdForDetails!);
        }}
      />

      <SendQuoteDrawer
        requestId={selectedRequestIdForQuote}
        open={isQuoteDrawerOpen}
        onOpenChange={setIsQuoteDrawerOpen}
        onQuotationSent={handleQuotationSent}
      />
    </div>
  );
}

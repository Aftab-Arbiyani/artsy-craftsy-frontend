"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
  Edit3,
  PlusCircle,
  ArrowLeft,
  Loader2,
  Image as ImageIcon,
  MoreHorizontal,
  Trash2,
  ShoppingCart,
  Eye,
} from "lucide-react";
import type { CustomArtRequest } from "@/lib/types";
import { useState, useEffect, Suspense, useCallback } from "react";
import TableRowSkeleton from "@/components/skeletons/TableRowSkeleton";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import RequestDetailsDrawer from "@/components/requests/RequestDetailsDrawer";

const STATUS_MAP: Record<
  string,
  { text: string; variant: "secondary" | "outline" | "default" | "destructive" }
> = {
  requested: { text: "Requested", variant: "outline" },
  replied: { text: "Replied", variant: "secondary" },
  accepted: { text: "Accepted", variant: "default" },
  rejected: { text: "Rejected", variant: "destructive" },
};

function MyRequestsComponent() {
  const [requests, setRequests] = useState<CustomArtRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const router = useRouter();

  const [selectedRequestId, setSelectedRequestId] = useState<string | null>(
    null,
  );
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const fetchRequests = useCallback(async () => {
    setIsLoading(true);
    const token = localStorage.getItem("authToken");
    if (!token) {
      toast({
        title: "Unauthorized",
        description: "Please log in to view your requests.",
        variant: "destructive",
      });
      router.push("/login");
      return;
    }

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/custom-art/my-requests`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      if (response.ok) {
        const result = await response.json();
        if (result.status === 1 && Array.isArray(result.data)) {
          const transformedRequests: CustomArtRequest[] = result.data.map(
            (item: any) => ({
              id: item.id,
              requestId: item.request_id,
              description: item.description,
              status: item.status,
              createdAt: new Date(item.created_at),
              reference_image: item.reference_image,
              budget_range: item.budget_range,
              dimensions: item.dimensions,
              reply: item.reply,
              price: item.price,
            }),
          );
          setRequests(transformedRequests);
        } else {
          setRequests([]);
        }
      } else {
        setRequests([]);
        toast({
          title: "Error",
          description: "Failed to fetch your requests.",
          variant: "destructive",
        });
      }
    } catch (error) {
      setRequests([]);
      toast({
        title: "Network Error",
        description: "Could not connect to the server.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [router, toast]);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  const handleViewDetails = (requestId: string) => {
    setSelectedRequestId(requestId);
    setIsDrawerOpen(true);
  };

  return (
    <>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/dashboard" passHref>
              <Button variant="outline" size="icon">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            <h1 className="font-headline text-2xl sm:text-3xl font-semibold">
              My Custom Art Requests
            </h1>
          </div>
          <Link href="/custom-art" passHref>
            <Button className="bg-accent hover:bg-accent/90 text-accent-foreground">
              <PlusCircle className="mr-2 h-4 w-4" /> New Request
            </Button>
          </Link>
        </div>

        <Card className="shadow-lg">
          <CardContent>
            {isLoading ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Image</TableHead>
                    <TableHead>Request ID</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Budget</TableHead>
                    <TableHead>Dimensions</TableHead>
                    <TableHead>Artist's Reply</TableHead>
                    <TableHead>Quoted Price</TableHead>
                    <TableHead>Date Submitted</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRowSkeleton columns={10} rowCount={3} />
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
                    <TableHead>Artist's Reply</TableHead>
                    <TableHead>Quoted Price</TableHead>
                    <TableHead>Date Submitted</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {requests.map((request) => (
                    <TableRow key={request.id}>
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
                        {request.requestId}
                      </TableCell>
                      <TableCell>
                        {request.description.substring(0, 40)}...
                      </TableCell>
                      <TableCell>{request.budget_range || "N/A"}</TableCell>
                      <TableCell>{request.dimensions || "N/A"}</TableCell>
                      <TableCell>{request.reply || "-"}</TableCell>
                      <TableCell>
                        {request.price && parseFloat(request.price) > 0
                          ? `₹${parseFloat(request.price).toLocaleString("en-IN")}`
                          : "-"}
                      </TableCell>
                      <TableCell>
                        {request.createdAt.toLocaleDateString()}
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
                      <TableCell className="text-right">
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
                            {request.status === "replied" && (
                              <DropdownMenuItem>
                                <ShoppingCart className="mr-2 h-4 w-4" />
                                Place Order
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuItem className="text-destructive">
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete
                            </DropdownMenuItem>
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
                  You haven't made any custom art requests yet.
                </p>
                <Link href="/custom-art" className="mt-4 inline-block">
                  <Button>Create a Request</Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <RequestDetailsDrawer
        requestId={selectedRequestId}
        open={isDrawerOpen}
        onOpenChange={setIsDrawerOpen}
        onActionCompleted={fetchRequests}
      />
    </>
  );
}

export default function MyRequestsPage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-screen items-center justify-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
        </div>
      }
    >
      <MyRequestsComponent />
    </Suspense>
  );
}

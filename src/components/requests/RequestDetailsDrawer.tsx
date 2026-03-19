"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
  SheetClose,
} from "@/components/ui/sheet";
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
import { Separator } from "@/components/ui/separator";
import { Loader2, AlertTriangle, ShoppingCart, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { usePageTransition } from "@/context/PageTransitionProvider";
import type { Product } from "@/lib/types";

interface RequestDetailsDrawerProps {
  requestId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onActionCompleted: () => void;
}

interface RequestDetails {
  id: string;
  created_at: string;
  dimensions: string | null;
  request_id: string;
  description: string;
  budget_range: string | null;
  reference_image: string | null;
  reply: string | null;
  status: "requested" | "replied" | "accepted" | "rejected";
  price: string;
}

const STATUS_MAP: Record<
  RequestDetails["status"],
  { text: string; variant: "secondary" | "outline" | "default" | "destructive" }
> = {
  requested: { text: "Requested", variant: "outline" },
  replied: { text: "Replied", variant: "secondary" },
  accepted: { text: "Accepted", variant: "default" },
  rejected: { text: "Rejected", variant: "destructive" },
};

const DetailRow = ({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) => {
  if (!value) return null;
  return (
    <div>
      <p className="text-sm font-medium text-muted-foreground">{label}</p>
      <div className="text-base text-foreground">{value}</div>
    </div>
  );
};

export default function RequestDetailsDrawer({
  requestId,
  open,
  onOpenChange,
  onActionCompleted,
}: RequestDetailsDrawerProps) {
  const [details, setDetails] = useState<RequestDetails | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const router = useRouter();
  const { startTransition } = usePageTransition();

  useEffect(() => {
    if (requestId && open) {
      const fetchDetails = async () => {
        setIsLoading(true);
        setDetails(null);
        const token = localStorage.getItem("authToken");
        if (!token) {
          toast({
            title: "Unauthorized",
            description: "Please log in.",
            variant: "destructive",
          });
          setIsLoading(false);
          return;
        }

        try {
          const response = await fetch(
            `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/custom-art/details/${requestId}`,
            {
              headers: { Authorization: `Bearer ${token}` },
            },
          );
          if (response.ok) {
            const result = await response.json();
            if (result.status === 1) {
              setDetails(result.data);
            } else {
              toast({
                title: "Error",
                description: result.message,
                variant: "destructive",
              });
            }
          } else {
            toast({
              title: "Error",
              description: "Failed to fetch request details.",
              variant: "destructive",
            });
          }
        } catch (error) {
          toast({
            title: "NetworkError",
            description: "Could not connect to the server.",
            variant: "destructive",
          });
        } finally {
          setIsLoading(false);
        }
      };
      fetchDetails();
    }
  }, [requestId, open, toast]);

  const handleOpenChange = (isOpen: boolean) => {
    onOpenChange(isOpen);
    if (!isOpen) {
      setDetails(null); // Clear details when closing
    }
  };

  const handlePlaceOrder = () => {
    if (!details || !details.price || parseFloat(details.price) <= 0) {
      toast({
        title: "Cannot Place Order",
        description: "A valid price has not been quoted for this request.",
        variant: "destructive",
      });
      return;
    }

    const customOrderItem: Product & { price: number } = {
      id: details.id,
      name: `Custom Artwork Request - ${details.request_id}`,
      description: details.description,
      price: parseFloat(details.price),
      imageUrls: details.reference_image
        ? [
            `${process.env.NEXT_PUBLIC_IMAGE_BASE_URL}${details.reference_image}`,
          ]
        : ["https://placehold.co/600x400.png"],
      category: "Custom Artwork",
      // The backend will know this is a custom order, so some fields can be generic
    };

    // Use sessionStorage to pass the item to the custom checkout page
    sessionStorage.setItem("customOrderItem", JSON.stringify(customOrderItem));

    startTransition();
    router.push("/checkout/custom");
    onOpenChange(false);
  };

  const handleDeleteRequest = async () => {
    if (!requestId) return;

    const token = localStorage.getItem("authToken");
    if (!token) {
      toast({
        title: "Unauthorized",
        description: "Please log in.",
        variant: "destructive",
      });
      return;
    }

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/custom-art/${requestId}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      const result = await response.json();

      if (response.ok && result.status === 1) {
        toast({
          title: "Success",
          description: "Your request has been deleted.",
          variant: "success",
        });
        onActionCompleted();
        handleOpenChange(false);
      } else {
        toast({
          title: "Error",
          description: result.message || "Failed to delete request.",
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

  return (
    <Sheet open={open} onOpenChange={handleOpenChange}>
      <SheetContent className="sm:max-w-lg w-[90vw] overflow-y-auto flex flex-col">
        <SheetHeader className="pr-12">
          <SheetTitle className="font-headline text-2xl">
            Request Details
          </SheetTitle>
          {details && (
            <SheetDescription>
              Request ID: {details.request_id}
            </SheetDescription>
          )}
        </SheetHeader>

        <div className="py-2 flex-grow">
          {isLoading && (
            <div className="flex justify-center items-center h-64">
              <Loader2 className="h-12 w-12 animate-spin text-primary" />
            </div>
          )}
          {!isLoading && !details && (
            <div className="flex flex-col justify-center items-center h-64 text-center">
              <AlertTriangle className="h-12 w-12 text-destructive mb-4" />
              <p className="text-muted-foreground">
                Could not load request details.
              </p>
            </div>
          )}
          {details && (
            <div className="space-y-4">
              {details.reference_image && (
                <div className="space-y-2">
                  <h3 className="text-base font-semibold text-foreground">
                    Reference Image
                  </h3>
                  <div className="relative aspect-video w-full rounded-md overflow-hidden border">
                    <Image
                      src={`${process.env.NEXT_PUBLIC_IMAGE_BASE_URL}${details.reference_image}`}
                      alt="Reference"
                      fill
                      sizes="100%"
                      className="object-contain"
                    />
                  </div>
                </div>
              )}

              <Separator className="my-2" />

              <div className="grid grid-cols-1 gap-y-4">
                <DetailRow
                  label="Status"
                  value={
                    <Badge
                      variant={
                        STATUS_MAP[details.status]?.variant || "secondary"
                      }
                    >
                      {STATUS_MAP[details.status]?.text || details.status}
                    </Badge>
                  }
                />
                <DetailRow
                  label="Your Description"
                  value={details.description}
                />
                <DetailRow
                  label="Budget Range"
                  value={details.budget_range || "Not specified"}
                />
                <DetailRow
                  label="Dimensions"
                  value={details.dimensions || "Not specified"}
                />
                <DetailRow
                  label="Date Requested"
                  value={new Date(details.created_at).toLocaleString()}
                />
              </div>

              <Separator className="my-2" />

              <div className="grid grid-cols-1 gap-y-4">
                <DetailRow
                  label="Artist's Reply"
                  value={details.reply || "Awaiting reply..."}
                />
                <DetailRow
                  label="Quoted Price"
                  value={
                    parseFloat(details.price) > 0
                      ? `₹${parseFloat(details.price).toLocaleString("en-IN")}`
                      : "Awaiting quote..."
                  }
                />
              </div>
            </div>
          )}
        </div>

        {details && (
          <SheetFooter className="mt-auto pt-4 border-t space-y-2 sm:space-y-0 sm:flex sm:flex-col sm:gap-2">
            {details.status === "replied" && (
              <Button className="w-full" onClick={handlePlaceOrder}>
                <ShoppingCart className="mr-2 h-4 w-4" />
                Place Order
              </Button>
            )}
            {details.status === "requested" && (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" className="w-full">
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete Request
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>
                      Are you absolutely sure?
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                      This action cannot be undone. This will permanently delete
                      your custom art request.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleDeleteRequest}
                      className="bg-destructive hover:bg-destructive/80"
                    >
                      Delete
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
            <SheetClose asChild>
              <Button variant="outline" className="w-full">
                Close
              </Button>
            </SheetClose>
          </SheetFooter>
        )}
      </SheetContent>
    </Sheet>
  );
}

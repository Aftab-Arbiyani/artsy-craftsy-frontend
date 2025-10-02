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
} from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import { Loader2, AlertTriangle, Send } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface RequestDetailsDrawerProps {
  requestId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onQuotationSent: () => void;
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
  amount_receivable: string;
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
  onQuotationSent,
}: RequestDetailsDrawerProps) {
  const [details, setDetails] = useState<RequestDetails | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

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

  return (
    <Sheet open={open} onOpenChange={handleOpenChange}>
      <SheetContent className="sm:max-w-lg w-[90vw] overflow-y-auto flex flex-col">
        <SheetHeader>
          <SheetTitle className="font-headline text-2xl">
            Request Details
          </SheetTitle>
          {details && (
            <SheetDescription>
              Request ID: {details.request_id}
            </SheetDescription>
          )}
        </SheetHeader>
        <Separator className="my-4" />
        <div className="space-y-6 py-4 flex-grow">
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
            <>
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
                <DetailRow label="Description" value={details.description} />
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

              <Separator />

              <div className="grid grid-cols-1 gap-y-4">
                <DetailRow
                  label="Your Reply"
                  value={details.reply || "No reply yet"}
                />
                <DetailRow
                  label="Quoted Price"
                  value={
                    parseFloat(details.price) > 0
                      ? `₹${parseFloat(details.price).toLocaleString("en-IN")}`
                      : "Not quoted"
                  }
                />
                <DetailRow
                  label="Amount Receivable"
                  value={
                    parseFloat(details.amount_receivable) > 0
                      ? `₹${parseFloat(details.amount_receivable).toLocaleString("en-IN")}`
                      : "Not applicable"
                  }
                />
              </div>
            </>
          )}
        </div>

        {details && (
          <SheetFooter className="mt-auto pt-4 border-t">
            {details.status === "requested" && (
              <Button className="w-full" onClick={onQuotationSent}>
                <Send className="mr-2 h-4 w-4" />
                Send Quotation
              </Button>
            )}
            <Button
              variant="outline"
              className="w-full"
              onClick={() => handleOpenChange(false)}
            >
              Close
            </Button>
          </SheetFooter>
        )}
      </SheetContent>
    </Sheet>
  );
}

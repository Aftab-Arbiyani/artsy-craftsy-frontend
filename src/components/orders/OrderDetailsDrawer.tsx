"use client";

import React, { useState, useEffect, useRef } from "react";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import {
  Loader2,
  AlertTriangle,
  Package,
  Calendar,
  CreditCard,
  Tag,
  Truck,
  XCircle,
  User,
  Info,
  Upload,
  CheckCircle,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface OrderDetails {
  id: string;
  order_number: string;
  status: string;
  created_at: string;
  updated_at: string;
  total_amount: string;
  tax_amount: string;
  discount_amount: string;
  tracking_number: string | null;
  courier_name: string | null;
  shipped_at: string | null;
  courier_reciept: string | null;
  cancelled_at: string | null;
  cancel_reason: string | null;
  items: {
    id: string;
    quantity: number;
    status: string;
    shipped_at: string | null;
    courier_name: string | null;
    tracking_number: string | null;
    courier_reciept: string | null;
    price: string;
    total: string;
    product: {
      id: string;
      title: string;
      description: string;
      media?: {
        id: string;
        file_path: string;
      }[];
      user?: {
        id: string;
        name: string;
        profile_picture: string | null;
      };
    };
  }[];
  custom_request: {
    id: string;
    request_id: string;
    description: string;
    dimensions: string | null;
    reference_image: string | null;
    price: string;
    artist?: {
      id: string;
      name: string;
      profile_picture: string | null;
    };
  } | null;
}

const STATUS_MAP: Record<
  string,
  { text: string; variant: "default" | "secondary" | "outline" | "destructive" }
> = {
  confirmed: { text: "Confirmed", variant: "secondary" },
  processing: { text: "Processing", variant: "outline" },
  shipped: { text: "Shipped", variant: "outline" },
  delivered: { text: "Delivered", variant: "default" },
  cancelled: { text: "Cancelled", variant: "destructive" },
  returned: { text: "Returned", variant: "destructive" },
  failed: { text: "Failed", variant: "destructive" },
};

export default function OrderDetailsDrawer({
  orderId,
  open,
  onOpenChange,
  onOrderCancelled,
}: {
  orderId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onOrderCancelled?: () => void;
}) {
  const [details, setDetails] = useState<OrderDetails | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);
  const [cancelReason, setCancelReason] = useState("");
  const [userType, setUserType] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);
  const { toast } = useToast();

  // Out for Delivery States
  const [isOutForDeliveryOpen, setIsOutForDeliveryOpen] = useState(false);
  const [trackingNumber, setTrackingNumber] = useState("");
  const [courierName, setCourierName] = useState("");
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [receiptPreview, setReceiptPreview] = useState<string | null>(null);
  const [isSubmittingDelivery, setIsSubmittingDelivery] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setMounted(true);
    const userData = localStorage.getItem("user");
    if (userData) {
      try {
        const user = JSON.parse(userData);
        setUserType(user.type || null);
      } catch (e) {
        console.error("Failed to parse user data", e);
      }
    }
  }, []);

  const fetchDetails = async () => {
    if (!orderId) return;
    setIsLoading(true);
    const token = localStorage.getItem("authToken");
    try {
      const url =
        userType === "artist"
          ? `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/orders/assigned-order-details/${orderId}`
          : `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/orders/details/${orderId}`;

      const response = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const result = await response.json();
      if (response.ok && result.status === 1) {
        setDetails(result.data);
      } else {
        toast({
          title: "Error",
          description: result.message || "Failed to fetch order details.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Network error occurred.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (orderId && open) {
      fetchDetails();
    } else if (!open) {
      setDetails(null);
      setCancelReason("");
      setTrackingNumber("");
      setReceiptFile(null);
      setReceiptPreview(null);
    }
  }, [orderId, open]);

  const handleCancelOrder = async () => {
    if (!orderId) return;

    if (!cancelReason.trim()) {
      toast({
        title: "Reason Required",
        description: "Please provide a reason for cancellation.",
        variant: "destructive",
      });
      return;
    }

    setIsCancelling(true);
    const token = localStorage.getItem("authToken");
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/orders/cancel-order`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            order_id: orderId,
            cancel_reason: cancelReason,
          }),
        },
      );
      const result = await response.json();
      if (response.ok && result.status === 1) {
        toast({
          title: "Order Cancelled",
          description:
            result.message || "Your order has been successfully cancelled.",
          variant: "success",
        });
        setCancelReason("");
        if (onOrderCancelled) onOrderCancelled();
        fetchDetails();
      } else {
        toast({
          title: "Cancellation Failed",
          description: result.message || "Could not cancel the order.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An unexpected error occurred.",
        variant: "destructive",
      });
    } finally {
      setIsCancelling(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setReceiptFile(file);
      setReceiptPreview(URL.createObjectURL(file));
    }
  };

  const handleMarkShipped = async () => {
    if (!orderId || !details) return;
    if (!courierName.trim()) {
      toast({
        title: "Courier Name Required",
        description: "Please enter the courier name.",
        variant: "destructive",
      });
      return;
    }
    if (!trackingNumber.trim()) {
      toast({
        title: "Tracking Required",
        description: "Please enter a tracking number.",
        variant: "destructive",
      });
      return;
    }
    if (!receiptFile) {
      toast({
        title: "Receipt Required",
        description: "Please upload the courier receipt.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmittingDelivery(true);
    const token = localStorage.getItem("authToken");

    try {
      // 1. Upload the receipt first
      const formData = new FormData();
      formData.append("image", receiptFile);
      formData.append("folder", "order_receipts");

      const uploadResponse = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/upload/image`,
        {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
          body: formData,
        },
      );

      const uploadResult = await uploadResponse.json();
      if (!uploadResponse.ok || uploadResult.status !== 1) {
        throw new Error(
          uploadResult.message || "Failed to upload courier receipt.",
        );
      }

      const receiptUrl = uploadResult.data.image;

      // 2. Call the mark-shipped API
      const isCustom = !!details.custom_request;
      const endpoint = isCustom
        ? `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/orders/custom-mark-shipped`
        : `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/orders/mark-shipped`;

      const payload: any = {
        order: details.id,
        courier_name: courierName,
        tracking_number: trackingNumber,
        courier_reciept: receiptUrl,
        items: details.items.map((item) => item.id),
      };

      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json();
      if (response.ok && result.status === 1) {
        toast({
          title: "Order Shipped",
          description:
            result.message || "Order marked as shipped successfully.",
          variant: "success",
        });
        setIsOutForDeliveryOpen(false);
        fetchDetails();
      } else {
        toast({
          title: "Update Failed",
          description: result.message || "Could not update order status.",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "An unexpected error occurred.",
        variant: "destructive",
      });
    } finally {
      setIsSubmittingDelivery(false);
    }
  };

  const canCancel =
    mounted &&
    details &&
    userType !== "artist" &&
    !details.custom_request &&
    details.status === "confirmed" &&
    new Date().getTime() - new Date(details.created_at).getTime() <
      24 * 60 * 60 * 1000;

  const isArtistAndConfirmed =
    details && userType === "artist" && details.status === "confirmed";

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-lg w-[95vw] overflow-y-auto">
        <SheetHeader className="text-left">
          <SheetTitle className="text-2xl font-headline">
            Order Details
          </SheetTitle>
          {details && (
            <div className="flex items-center gap-2 mt-1">
              <span className="text-muted-foreground text-sm">
                Order #{details.order_number}
              </span>
              <Badge variant={STATUS_MAP[details.status]?.variant || "outline"}>
                {STATUS_MAP[details.status]?.text || details.status}
              </Badge>
            </div>
          )}
        </SheetHeader>

        <div className="mt-8 space-y-8">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-20 space-y-4">
              <Loader2 className="animate-spin h-10 w-10 text-primary" />
              <p className="text-sm text-muted-foreground">
                Retrieving your order details...
              </p>
            </div>
          ) : !details ? (
            <div className="text-center py-20 text-muted-foreground">
              <AlertTriangle className="mx-auto mb-4 h-12 w-12 opacity-20" />
              <p>No details found for this order.</p>
            </div>
          ) : (
            <>
              {/* Cancellation Info */}
              {details.cancelled_at && (
                <div className="p-4 border border-destructive/20 rounded-xl bg-destructive/5 flex items-start gap-3">
                  <XCircle className="h-5 w-5 text-destructive mt-0.5" />
                  <div className="space-y-1">
                    <p className="text-xs font-bold text-destructive uppercase">
                      Order Cancelled
                    </p>
                    <p className="text-xs text-muted-foreground">
                      On {mounted ? new Date(details.cancelled_at).toLocaleString() : ""}
                    </p>
                    <p className="text-sm italic mt-1">
                      "{details.cancel_reason}"
                    </p>
                  </div>
                </div>
              )}

              {/* Key Order Info */}
              <div className="grid grid-cols-2 gap-6 bg-muted/30 p-4 rounded-xl border">
                <div className="space-y-1">
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider flex items-center gap-1 font-bold">
                    <Calendar className="h-3 w-3" /> Ordered On
                  </p>
                  <p className="text-sm font-semibold">
                    {mounted ? new Date(details.created_at).toLocaleDateString() : ""}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider flex items-center gap-1 font-bold">
                    <CreditCard className="h-3 w-3" /> Total Paid
                  </p>
                  <p className="text-sm font-semibold">
                    ₹{parseFloat(details.total_amount).toLocaleString("en-IN")}
                  </p>
                </div>
              </div>

              {/* Tracking if available — order-level for custom orders only */}
              {details.custom_request && details.tracking_number && (
                <div className="p-4 border border-primary/20 rounded-xl bg-primary/5 flex items-start gap-3">
                  <Truck className="h-5 w-5 text-primary mt-0.5" />
                  <div className="space-y-1">
                    <p className="text-xs font-bold text-primary uppercase">
                      Shipping Update
                    </p>
                    {details.courier_name && (
                      <p className="text-sm">
                        Courier:{" "}
                        <span className="font-medium">{details.courier_name}</span>
                      </p>
                    )}
                    <p className="text-sm">
                      Tracking ID:{" "}
                      <span className="font-mono font-medium">
                        {details.tracking_number}
                      </span>
                    </p>
                  </div>
                </div>
              )}

              {/* Items Section */}
              <div className="space-y-4">
                <h3 className="font-headline text-lg font-bold flex items-center gap-2">
                  <Package className="h-5 w-5" />{" "}
                  {details.custom_request
                    ? "Commission Details"
                    : "Purchase List"}
                </h3>

                {details.custom_request ? (
                  <div className="space-y-4">
                    <div className="flex gap-4 items-start bg-card border p-4 rounded-xl shadow-sm">
                      {details.custom_request.reference_image && (
                        <div className="relative h-24 w-24 rounded-lg overflow-hidden border shrink-0 bg-muted">
                          <Image
                            src={`${process.env.NEXT_PUBLIC_IMAGE_BASE_URL}${details.custom_request.reference_image}`}
                            alt="Custom Artwork Reference"
                            fill
                            className="object-cover"
                          />
                        </div>
                      )}
                      <div className="space-y-2 py-1 flex-grow">
                        <div>
                          <p className="font-bold text-base">
                            Custom Request #{details.custom_request.request_id}
                          </p>
                          <p className="text-xs text-muted-foreground line-clamp-3 mt-1 leading-relaxed">
                            {details.custom_request.description}
                          </p>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {details.custom_request.dimensions && (
                            <Badge
                              variant="secondary"
                              className="text-[10px] font-normal px-2 py-0 h-5"
                            >
                              {details.custom_request.dimensions}
                            </Badge>
                          )}
                          <Badge
                            variant="outline"
                            className="text-[10px] font-normal px-2 py-0 h-5 border-accent/30 text-accent"
                          >
                            Commissioned Art
                          </Badge>
                        </div>
                        <p className="text-sm font-bold text-primary pt-1">
                          ₹
                          {parseFloat(
                            details.custom_request.price,
                          ).toLocaleString("en-IN")}
                        </p>
                      </div>
                    </div>
                    {details.custom_request.artist && (
                      <div className="flex items-center gap-3 p-3 bg-accent/5 rounded-lg border border-accent/10">
                        <Avatar className="h-8 w-8">
                          <AvatarImage
                            src={
                              details.custom_request.artist.profile_picture
                                ? `${process.env.NEXT_PUBLIC_IMAGE_BASE_URL}${details.custom_request.artist.profile_picture}`
                                : ""
                            }
                          />
                          <AvatarFallback>
                            <User className="h-4 w-4" />
                          </AvatarFallback>
                        </Avatar>
                        <div className="text-xs">
                          <p className="text-muted-foreground font-medium uppercase tracking-tight">
                            Assigned Artist
                          </p>
                          <p className="font-bold text-foreground">
                            {details.custom_request.artist.name}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="space-y-3">
                    {details.items.map((item) => (
                      <div key={item.id} className="space-y-2">
                        <div className="flex gap-4 items-center bg-card border p-4 rounded-xl shadow-sm">
                          <div className="relative h-16 w-16 rounded-lg overflow-hidden border shrink-0 bg-muted">
                            <Image
                              src={
                                item.product.media &&
                                item.product.media.length > 0
                                  ? `${process.env.NEXT_PUBLIC_IMAGE_BASE_URL}${item.product.media[0].file_path}`
                                  : "https://placehold.co/100x100.png"
                              }
                              alt={item.product.title}
                              fill
                              className="object-cover"
                            />
                          </div>
                          <div className="flex-grow space-y-1">
                            <div className="flex justify-between items-start">
                              <p className="font-bold text-base leading-tight">
                                {item.product.title}
                              </p>
                              <Badge
                                variant="outline"
                                className="text-[9px] capitalize py-0 px-1.5 h-4"
                              >
                                {item.status}
                              </Badge>
                            </div>
                            <div className="flex items-center gap-2">
                              <p className="text-xs text-muted-foreground">
                                ₹
                                {parseFloat(item.price).toLocaleString("en-IN")}
                              </p>
                              <span className="text-[10px] text-muted-foreground/50">
                                •
                              </span>
                              <p className="text-[10px] font-medium">
                                Qty: {item.quantity}
                              </p>
                            </div>
                          </div>
                          <div className="text-right shrink-0">
                            <p className="font-bold text-primary">
                              ₹{parseFloat(item.total).toLocaleString("en-IN")}
                            </p>
                          </div>
                        </div>
                        {item.product.user && (
                          <div className="flex items-center gap-2 px-2">
                            <Avatar className="h-5 w-5">
                              <AvatarImage
                                src={
                                  item.product.user.profile_picture
                                    ? `${process.env.NEXT_PUBLIC_IMAGE_BASE_URL}${item.product.user.profile_picture}`
                                    : ""
                                }
                              />
                              <AvatarFallback>
                                <User className="h-2 w-2" />
                              </AvatarFallback>
                            </Avatar>
                            <p className="text-[10px] text-muted-foreground">
                              Art by{" "}
                              <span className="font-bold text-foreground">
                                {item.product.user.name}
                              </span>
                            </p>
                          </div>
                        )}
                        {item.tracking_number && (
                          <div className="mx-0 p-3 border border-primary/20 rounded-lg bg-primary/5 flex items-start gap-2">
                            <Truck className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                            <div className="space-y-0.5">
                              <p className="text-[10px] font-bold text-primary uppercase">
                                Shipment Info
                              </p>
                              {item.courier_name && (
                                <p className="text-xs">
                                  Courier:{" "}
                                  <span className="font-medium">
                                    {item.courier_name}
                                  </span>
                                </p>
                              )}
                              <p className="text-xs">
                                Tracking:{" "}
                                <span className="font-mono font-medium">
                                  {item.tracking_number}
                                </span>
                              </p>
                              {item.shipped_at && (
                                <p className="text-[10px] text-muted-foreground">
                                  Shipped on{" "}
                                  {mounted ? new Date(item.shipped_at).toLocaleDateString() : ""}
                                </p>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <Separator />

              {/* Pricing Breakdown */}
              <div className="bg-muted/40 p-5 rounded-xl space-y-3 border">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="font-medium">
                    ₹
                    {(
                      parseFloat(details.total_amount) -
                      parseFloat(details.tax_amount) +
                      parseFloat(details.discount_amount)
                    ).toLocaleString("en-IN")}
                  </span>
                </div>

                {parseFloat(details.discount_amount) > 0 && (
                  <div className="flex justify-between text-sm text-success font-semibold">
                    <span className="flex items-center gap-1">
                      <Tag className="h-3 w-3" /> Order Discount
                    </span>
                    <span>
                      - ₹
                      {parseFloat(details.discount_amount).toLocaleString(
                        "en-IN",
                      )}
                    </span>
                  </div>
                )}

                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Estimated Tax</span>
                  <span className="font-medium">
                    ₹{parseFloat(details.tax_amount).toLocaleString("en-IN")}
                  </span>
                </div>

                <Separator className="bg-border/50 my-2" />

                <div className="flex justify-between items-baseline pt-1">
                  <span className="font-headline font-bold text-lg">
                    Final Amount
                  </span>
                  <span className="font-headline font-bold text-2xl text-primary">
                    ₹{parseFloat(details.total_amount).toLocaleString("en-IN")}
                  </span>
                </div>
              </div>
            </>
          )}
        </div>

        <SheetFooter className="mt-10 flex flex-col gap-3 sm:flex-col">
          {/* Artist Actions */}
          {isArtistAndConfirmed && (
            <Dialog
              open={isOutForDeliveryOpen}
              onOpenChange={setIsOutForDeliveryOpen}
            >
              <DialogTrigger asChild>
                <Button className="w-full h-12 gap-2 bg-accent hover:bg-accent/90 text-accent-foreground">
                  <Truck className="h-4 w-4" />
                  Mark as Out for Delivery
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Shipment Details</DialogTitle>
                  <DialogDescription>
                    Provide the tracking information and upload the courier
                    receipt to update the order status.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-6 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="courier-name">Courier Name *</Label>
                    <Input
                      id="courier-name"
                      placeholder="Enter courier name"
                      value={courierName}
                      onChange={(e) => setCourierName(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="tracking-number">Tracking Number *</Label>
                    <Input
                      id="tracking-number"
                      placeholder="Enter courier tracking ID"
                      value={trackingNumber}
                      onChange={(e) => setTrackingNumber(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Courier Receipt *</Label>
                    <div
                      className="border-2 border-dashed rounded-lg p-4 text-center cursor-pointer hover:bg-muted/50 transition-colors"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <input
                        type="file"
                        ref={fileInputRef}
                        className="hidden"
                        accept="image/*"
                        onChange={handleFileChange}
                      />
                      {receiptPreview ? (
                        <div className="space-y-2">
                          <img
                            src={receiptPreview}
                            alt="Receipt Preview"
                            className="mx-auto h-32 object-contain rounded"
                          />
                          <p className="text-xs text-primary font-medium">
                            Click to change
                          </p>
                        </div>
                      ) : (
                        <div className="py-4 space-y-2">
                          <Upload className="mx-auto h-8 w-8 text-muted-foreground" />
                          <p className="text-sm text-muted-foreground">
                            Upload receipt image
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => setIsOutForDeliveryOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleMarkShipped}
                    disabled={
                      isSubmittingDelivery ||
                      !courierName.trim() ||
                      !trackingNumber.trim() ||
                      !receiptFile
                    }
                    className="gap-2"
                  >
                    {isSubmittingDelivery ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <CheckCircle className="h-4 w-4" />
                    )}
                    Confirm Shipment
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}

          {/* Customer Actions */}
          {canCancel && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="destructive"
                  className="w-full h-12 gap-2"
                  disabled={isCancelling}
                >
                  {isCancelling ? (
                    <Loader2 className="animate-spin h-4 w-4" />
                  ) : (
                    <XCircle className="h-4 w-4" />
                  )}
                  Cancel Order
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Cancel Order</AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to cancel this order? This action
                    cannot be undone and refunds will be processed according to
                    our policy.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <div className="py-4 space-y-4">
                  <div className="space-y-2">
                    <Label
                      htmlFor="cancel-reason"
                      className="text-xs font-bold uppercase tracking-tight text-muted-foreground flex items-center gap-1"
                    >
                      <Info className="h-3 w-3" /> Reason for cancellation *
                    </Label>
                    <Textarea
                      id="cancel-reason"
                      placeholder="Please tell us why you need to cancel..."
                      value={cancelReason}
                      onChange={(e) => setCancelReason(e.target.value)}
                      className="min-h-[100px] text-sm focus-visible:ring-destructive"
                    />
                  </div>
                </div>
                <AlertDialogFooter>
                  <AlertDialogCancel onClick={() => setCancelReason("")}>
                    Keep Order
                  </AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleCancelOrder}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    disabled={!cancelReason.trim() || isCancelling}
                  >
                    Confirm Cancellation
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
          <SheetClose asChild>
            <Button variant="outline" className="w-full h-12 text-base">
              Close Summary
            </Button>
          </SheetClose>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}

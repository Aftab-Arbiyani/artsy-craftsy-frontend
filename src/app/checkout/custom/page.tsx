"use client";

import { useForm, type SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import Link from "next/link";
import { AlertTriangle, Lock, Home, Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { Separator } from "@/components/ui/separator";
import Image from "next/image";
import { useState, useEffect, useCallback } from "react";
import type { Address, Product } from "@/lib/types";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Loader2 } from "lucide-react";
import { usePageTransition } from "@/context/PageTransitionProvider";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";

const checkoutSchema = z.object({
  fullName: z
    .string()
    .min(2, { message: "Full name must be at least 2 characters." }),
  phoneNumber: z.string().min(10, "Please enter a valid phone number."),
});

type CheckoutFormValues = z.infer<typeof checkoutSchema>;

interface User {
  name: string;
  email: string;
}

function AddressFormDialog({ onSave }: { onSave: () => void }) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [open, setOpen] = useState(false);

  const addressFormSchema = z.object({
    street: z.string().min(5, "Address is required"),
    city: z.string().min(2, "City is required"),
    state: z.string().min(2, "State is required"),
    zip_code: z.string().min(5, "Pincode is required"),
    country: z.string().min(2, "Country is required"),
    type: z.enum(["home", "work", "other"]),
  });
  type AddressFormValues = z.infer<typeof addressFormSchema>;

  const form = useForm<AddressFormValues>({
    resolver: zodResolver(addressFormSchema),
    defaultValues: {
      street: "",
      city: "",
      state: "",
      zip_code: "",
      country: "India",
      type: "home",
    },
  });

  const onSubmit: SubmitHandler<AddressFormValues> = async (data) => {
    setIsLoading(true);
    const token = localStorage.getItem("authToken");
    if (!token) {
      toast({
        title: "Authentication Error",
        description: "Please log in.",
        variant: "destructive",
      });
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/user-address`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(data),
        },
      );
      const result = await response.json();
      if (response.ok && result.status === 1) {
        toast({
          title: "Address Added",
          description: result.message,
          variant: "success",
        });
        onSave();
        setOpen(false);
      } else {
        toast({
          title: "Error",
          description: result.message || "An error occurred.",
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
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <div className="flex items-center justify-center gap-2 rounded-lg border-2 border-dashed p-4 text-center cursor-pointer hover:border-primary hover:text-primary h-full">
          <Plus className="h-6 w-6" />
          <span className="font-semibold text-primary">Add New Address</span>
        </div>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Add New Address</DialogTitle>
          <DialogDescription>
            Fill in the details for your new address.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="street"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Street Address</FormLabel>
                  <FormControl>
                    <Input placeholder="Street address" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="city"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>City</FormLabel>
                    <FormControl>
                      <Input placeholder="City" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="state"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>State</FormLabel>
                    <FormControl>
                      <Input placeholder="State" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="zip_code"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Pincode</FormLabel>
                    <FormControl>
                      <Input placeholder="Pincode" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="country"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Country</FormLabel>
                    <FormControl>
                      <Input {...field} disabled />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem className="space-y-3">
                  <FormLabel>Address Type</FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      className="flex flex-row space-x-4"
                    >
                      <FormItem className="flex items-center space-x-3 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="home" />
                        </FormControl>
                        <FormLabel className="font-normal">Home</FormLabel>
                      </FormItem>
                      <FormItem className="flex items-center space-x-3 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="work" />
                        </FormControl>
                        <FormLabel className="font-normal">Work</FormLabel>
                      </FormItem>
                      <FormItem className="flex items-center space-x-3 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="other" />
                        </FormControl>
                        <FormLabel className="font-normal">Other</FormLabel>
                      </FormItem>
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <DialogClose asChild>
                <Button type="button" variant="outline">
                  Cancel
                </Button>
              </DialogClose>
              <Button type="submit" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Add Address
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

export default function CustomCheckoutPage() {
  const { toast } = useToast();
  const router = useRouter();
  const { startTransition } = usePageTransition();
  const [item, setItem] = useState<(Product & { price: number }) | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  const total = item?.price ?? 0;

  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<
    string | undefined
  >();
  const [isAddressLoading, setIsAddressLoading] = useState(true);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  const form = useForm<CheckoutFormValues>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      fullName: "",
      phoneNumber: "",
    },
  });

  useEffect(() => {
    try {
      const itemString = sessionStorage.getItem("customOrderItem");
      if (itemString) {
        const parsedItem = JSON.parse(itemString);
        setItem(parsedItem);
      } else {
        toast({
          title: "Order Error",
          description: "No custom order item found. Redirecting...",
          variant: "destructive",
        });
        router.push("/dashboard/my-requests");
      }
    } catch (error) {
      toast({
        title: "Order Error",
        description: "Could not read order item. Redirecting...",
        variant: "destructive",
      });
      router.push("/dashboard/my-requests");
    } finally {
      setIsLoaded(true);
    }
  }, [router, toast]);

  const fetchAddresses = useCallback(async () => {
    setIsAddressLoading(true);
    const token = localStorage.getItem("authToken");
    if (!token) {
      setIsAddressLoading(false);
      return;
    }
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/user-address`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      const result = await response.json();
      if (response.ok && result.status === 1) {
        setAddresses(result.data);
        if (result.data.length > 0) {
          const defaultAddress = result.data[0];
          setSelectedAddressId(defaultAddress.id);
        }
      } else {
        setAddresses([]);
      }
    } catch (error) {
      toast({
        title: "Network Error",
        description: "Could not fetch addresses.",
        variant: "destructive",
      });
    } finally {
      setIsAddressLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    const userString = localStorage.getItem("user");
    if (userString) {
      const user = JSON.parse(userString);
      setCurrentUser({ name: user.name, email: user.email });
      form.setValue("fullName", user.name || "");
      if (user.phone_number) {
        form.setValue("phoneNumber", user.phone_number);
      }
    }
    fetchAddresses();
  }, [fetchAddresses, form]);

  const handleAddressSelect = (addressId: string) => {
    setSelectedAddressId(addressId);
  };

  const handlePayment = async (data: CheckoutFormValues) => {
    if (!selectedAddressId) {
      toast({
        title: "Address Required",
        description: "Please select a delivery address.",
        variant: "destructive",
      });
      return;
    }

    if (!item) {
      toast({
        title: "Item Missing",
        description: "No item to checkout.",
        variant: "destructive",
      });
      return;
    }

    const token = localStorage.getItem("authToken");
    if (!token) {
      toast({
        title: "Authentication Error",
        description: "Please log in to proceed.",
        variant: "destructive",
      });
      return;
    }
    setIsProcessingPayment(true);

    try {
      const orderPayload = {
        address: selectedAddressId,
        total_amount: total,
        custom_request: item.id,
      };

      const customOrderResponse = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/orders/custom-order`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(orderPayload),
        },
      );

      const customOrderResult = await customOrderResponse.json();

      if (!customOrderResponse.ok || customOrderResult.status !== 1) {
        throw new Error(
          customOrderResult.message ||
            "Failed to create order with your backend.",
        );
      }

      let { razorpay_order } = customOrderResult.data;

      if (typeof razorpay_order === "string") {
        try {
          razorpay_order = JSON.parse(razorpay_order);
        } catch (e) {
          throw new Error(
            "Failed to parse Razorpay order details from the API response.",
          );
        }
      }

      if (!razorpay_order || !razorpay_order.id || !razorpay_order.amount) {
        throw new Error(
          "Razorpay order details are missing or invalid in the API response.",
        );
      }

      const { amount, id: razorpay_order_id, currency } = razorpay_order;

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: amount,
        currency: currency,
        name: "Arts&Craft Studio",
        description: "Art Transaction",
        order_id: razorpay_order_id,
        method: {
          netbanking: true,
          card: true,
          upi: true,
          wallet: false,
          emi: false, // ❌ disable EMI
          paylater: false,
        },
        handler: async function (response: any) {
          const verificationResponse = await fetch(
            `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/payment/verify-payment`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
              },
              body: JSON.stringify({
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_order_id: response.razorpay_order_id,
                razorpay_signature: response.razorpay_signature,
              }),
            },
          );

          const verificationResult = await verificationResponse.json();

          if (verificationResponse.ok && verificationResult.status === 1) {
            toast({
              title: "Payment Successful",
              description:
                "Your order has been placed. Thank you for shopping with us!",
              variant: "success",
            });
            sessionStorage.removeItem("customOrderItem");
            startTransition();
            router.push("/dashboard/order-history");
          } else {
            throw new Error(
              verificationResult.message || "Payment verification failed.",
            );
          }
        },
        prefill: {
          name: currentUser?.name || "",
          email: currentUser?.email || "",
          contact: data.phoneNumber,
        },
        theme: {
          color: "#4285F4", // primary color
        },
      };

      const loadRazorpay = () =>
        new Promise<void>((resolve, reject) => {
          if ((window as any).Razorpay) {
            resolve();
            return;
          }
          const script = document.createElement("script");
          script.src = "https://checkout.razorpay.com/v1/checkout.js";
          script.onload = () => resolve();
          script.onerror = () =>
            reject(new Error("Failed to load Razorpay SDK."));
          document.body.appendChild(script);
        });

      await loadRazorpay();

      if (!(window as any).Razorpay) {
        throw new Error("Razorpay SDK is not available.");
      }

      const rzp = new (window as any).Razorpay(options);
      rzp.open();
    } catch (error: any) {
      toast({
        title: "Payment Error",
        description:
          error.message || "An unexpected error occurred during payment.",
        variant: "destructive",
      });
    } finally {
      setIsProcessingPayment(false);
    }
  };

  if (!isLoaded || !item) {
    return (
      <div className="container mx-auto py-8">
        <Skeleton className="h-9 w-48 mb-8" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-1/2" />
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Skeleton className="h-4 w-1/4" />
                  <Skeleton className="h-10 w-full" />
                </div>
                <div className="space-y-2">
                  <Skeleton className="h-4 w-1/4" />
                  <Skeleton className="h-10 w-full" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-3/4" />
              </CardHeader>
              <CardContent className="space-y-4">
                <Skeleton className="h-20 w-full rounded-lg" />
              </CardContent>
            </Card>
          </div>
          <div className="bg-muted/30 p-6 rounded-lg">
            <Skeleton className="h-7 w-1/2 mb-6" />
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <Skeleton className="h-16 w-16 rounded-md" />
                <div className="flex-grow space-y-2">
                  <Skeleton className="h-5 w-3/4" />
                  <Skeleton className="h-4 w-1/4" />
                </div>
                <Skeleton className="h-5 w-1/4" />
              </div>
            </div>
            <Separator className="my-6" />
            <div className="space-y-3">
              <div className="flex justify-between">
                <Skeleton className="h-7 w-1/4" />
                <Skeleton className="h-7 w-1/3" />
              </div>
            </div>
            <Skeleton className="h-12 w-full mt-6" />
          </div>
        </div>
      </div>
    );
  }

  if (!item) {
    return (
      <div className="text-center py-12">
        <AlertTriangle className="mx-auto h-16 w-16 text-destructive mb-4" />
        <h1 className="font-headline text-3xl mb-4">No item to checkout!</h1>
        <Link href="/dashboard/my-requests">
          <Button variant="outline">Back to My Requests</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8">Checkout Custom Order</h1>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
        <Form {...form}>
          <form
            id="checkout-form"
            onSubmit={form.handleSubmit(handlePayment)}
            className="space-y-6"
          >
            <Card>
              <CardHeader>
                <CardTitle>Contact Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="fullName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Full name *</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter full name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="phoneNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone number *</FormLabel>
                      <FormControl>
                        <Input
                          type="tel"
                          placeholder="Enter phone number"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Select a delivery address</CardTitle>
              </CardHeader>
              <CardContent>
                {isAddressLoading ? (
                  <p>Loading addresses...</p>
                ) : (
                  <RadioGroup
                    value={selectedAddressId}
                    onValueChange={handleAddressSelect}
                    className="grid grid-cols-1 md:grid-cols-2 gap-4"
                  >
                    {addresses.map((address) => (
                      <Label
                        key={address.id}
                        htmlFor={address.id}
                        className="block rounded-lg border p-4 cursor-pointer has-[:checked]:border-primary h-full"
                      >
                        <RadioGroupItem
                          value={address.id}
                          id={address.id}
                          className="sr-only"
                        />
                        <div className="space-y-1">
                          <p className="font-semibold">
                            {address.street}, {address.city}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {address.state} - {address.zip_code}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {address.country}
                          </p>
                        </div>
                        <Badge variant="outline" className="mt-2 capitalize">
                          {address.type}
                        </Badge>
                      </Label>
                    ))}
                    <AddressFormDialog onSave={fetchAddresses} />
                  </RadioGroup>
                )}
              </CardContent>
            </Card>
          </form>
        </Form>

        <div className="bg-muted/30 p-6 rounded-lg sticky top-24">
          <h2 className="text-xl font-semibold mb-6">Review your order</h2>
          <div className="space-y-4">
            <div key={item.id} className="flex items-center gap-4">
              <div className="relative h-16 w-16 rounded-md overflow-hidden border">
                <Image
                  src={item.imageUrls[0]}
                  alt={item.name}
                  fill
                  sizes="64px"
                  className="object-cover"
                />
              </div>
              <div className="flex-grow">
                <p className="font-medium">{item.name}</p>
                <p className="text-sm text-muted-foreground">Quantity: 1</p>
              </div>
              <p className="font-medium">
                ₹{item.price.toLocaleString("en-IN")}
              </p>
            </div>
          </div>
          <Separator className="my-6" />
          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <p className="text-muted-foreground">Shipping</p>
              <p className="font-medium">Free</p>
            </div>
            <Separator className="my-4" />
            <div className="flex justify-between font-bold text-lg">
              <p>
                Total{" "}
                <span className="text-xs font-normal text-muted-foreground">
                  (incl. of all taxes)
                </span>
              </p>
              <p>₹{total.toLocaleString("en-IN")}</p>
            </div>
          </div>

          <Button
            type="submit"
            form="checkout-form"
            size="lg"
            className="w-full mt-6"
            disabled={isProcessingPayment}
          >
            {isProcessingPayment ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Lock className="mr-2 h-4 w-4" />
            )}
            Pay Now
          </Button>

          <div className="flex items-center justify-center mt-4 text-sm text-muted-foreground">
            <Lock className="mr-2 h-4 w-4" />
            <span>Secure Checkout - SSL Encrypted</span>
          </div>
        </div>
      </div>
    </div>
  );
}


'use client';

import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useCart } from '@/context/CartProvider';
import Link from 'next/link';
import { CreditCard, AlertTriangle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';

const checkoutSchema = z.object({
  fullName: z.string().min(2, { message: "Full name must be at least 2 characters." }),
  email: z.string().email({ message: "Invalid email address." }),
  address: z.string().min(5, { message: "Address must be at least 5 characters." }),
  city: z.string().min(2, { message: "City must be at least 2 characters." }),
  postalCode: z.string().min(3, { message: "Postal code must be at least 3 characters." }),
  country: z.string().min(2, { message: "Country must be at least 2 characters." }),
  cardNumber: z.string().length(16, { message: "Card number must be 16 digits." }).regex(/^\d+$/, "Card number must be digits only."),
  expiryDate: z.string().regex(/^(0[1-9]|1[0-2])\/\d{2}$/, { message: "Expiry date must be MM/YY format." }),
  cvv: z.string().length(3, { message: "CVV must be 3 digits." }).regex(/^\d+$/, "CVV must be digits only."),
});

type CheckoutFormValues = z.infer<typeof checkoutSchema>;

export default function CheckoutPage() {
  const { getTotalPrice, clearCart, items } = useCart();
  const { toast } = useToast();
  const router = useRouter();

  const form = useForm<CheckoutFormValues>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      fullName: '',
      email: '',
      address: '',
      city: '',
      postalCode: '',
      country: '',
      cardNumber: '',
      expiryDate: '',
      cvv: '',
    },
  });

  const onSubmit: SubmitHandler<CheckoutFormValues> = (data) => {
    // Placeholder for payment processing
    console.log('Checkout data:', data);
    toast({
      title: "Order Placed (Simulation)",
      description: "Your order has been successfully placed. Thank you for shopping with ArtsyCraftsy!",
      variant: "success",
    });
    clearCart();
    router.push('/dashboard/order-history'); // Redirect to a success or order history page
  };

  if (items.length === 0) {
    return (
      <div className="text-center py-12">
        <AlertTriangle className="mx-auto h-16 w-16 text-destructive mb-4" />
        <h1 className="font-headline text-3xl mb-4">Your cart is empty!</h1>
        <p className="text-muted-foreground mb-6">You need items in your cart to proceed to checkout.</p>
        <Link href="/products">
          <Button variant="outline">Browse Products</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <Card className="shadow-xl">
        <CardHeader>
          <CardTitle className="font-headline text-2xl sm:text-3xl text-center">Checkout</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <section>
                <h2 className="font-headline text-lg sm:text-xl mb-3">Shipping Information</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="fullName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Full Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter your full name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input type="email" placeholder="Enter your email" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <FormField
                  control={form.control}
                  name="address"
                  render={({ field }) => (
                    <FormItem className="mt-4">
                      <FormLabel>Street Address</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter your street address" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
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
                    name="postalCode"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Postal Code</FormLabel>
                        <FormControl>
                          <Input placeholder="Postal Code" {...field} />
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
                          <Input placeholder="Country" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </section>

              <section>
                <h2 className="font-headline text-lg sm:text-xl mb-3">Payment Details (Simulation)</h2>
                 <FormField
                  control={form.control}
                  name="cardNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Card Number</FormLabel>
                      <FormControl>
                        <div className="relative">
                           <Input placeholder="XXXX XXXX XXXX XXXX" {...field} className="pl-10"/>
                           <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="grid grid-cols-2 gap-4 mt-4">
                  <FormField
                    control={form.control}
                    name="expiryDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Expiry Date</FormLabel>
                        <FormControl>
                          <Input placeholder="MM/YY" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="cvv"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>CVV</FormLabel>
                        <FormControl>
                          <Input placeholder="XXX" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </section>
              
              <div className="text-right font-bold text-lg sm:text-xl my-6">
                Total: ₹{getTotalPrice().toLocaleString('en-IN')}
              </div>
              
              <Button type="submit" size="lg" className="w-full bg-primary hover:bg-primary/90">
                Place Order (Simulated)
              </Button>
            </form>
          </Form>
        </CardContent>
        <CardFooter>
           <p className="text-xs text-muted-foreground text-center w-full">
            This is a simulated checkout. No real payment will be processed.
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}

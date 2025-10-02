"use client";

import React, { useState, useEffect } from "react";
import { useForm, type SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
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
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Send } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const quoteSchema = z.object({
  reply: z.string().min(1, "Reply message is required."),
  price: z.coerce.number().positive("Price must be a positive number."),
  amountReceivable: z.coerce.number().optional(),
});

type QuoteFormValues = z.infer<typeof quoteSchema>;

interface SendQuoteDrawerProps {
  requestId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onQuotationSent: () => void;
}

const COMMISSION_RATE = 0.15;

export default function SendQuoteDrawer({
  requestId,
  open,
  onOpenChange,
  onQuotationSent,
}: SendQuoteDrawerProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const form = useForm<QuoteFormValues>({
    resolver: zodResolver(quoteSchema),
    defaultValues: {
      reply: "",
      price: undefined,
      amountReceivable: undefined,
    },
  });

  const { watch, setValue, handleSubmit, reset } = form;
  const watchedPrice = watch("price");

  useEffect(() => {
    if (watchedPrice && watchedPrice > 0) {
      const receivable = watchedPrice * (1 - COMMISSION_RATE);
      setValue("amountReceivable", parseFloat(receivable.toFixed(2)));
    } else {
      setValue("amountReceivable", undefined);
    }
  }, [watchedPrice, setValue]);

  useEffect(() => {
    if (!open) {
      reset(); // Reset form when drawer closes
    }
  }, [open, reset]);

  const onSubmit: SubmitHandler<QuoteFormValues> = async (data) => {
    if (!requestId) return;
    setIsSubmitting(true);

    const token = localStorage.getItem("authToken");
    if (!token) {
      toast({
        title: "Unauthorized",
        description: "Please log in.",
        variant: "destructive",
      });
      setIsSubmitting(false);
      return;
    }

    try {
      const payload = {
        reply: data.reply,
        price: data.price,
        amount_receivable: data.amountReceivable,
      };

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/custom-art/reply/${requestId}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        },
      );

      const result = await response.json();

      if (response.ok && result.status === 1) {
        toast({
          title: "Quote Sent!",
          description:
            result.message || "Your quote has been sent to the customer.",
          variant: "success",
        });
        onQuotationSent();
      } else {
        toast({
          title: "Error",
          description: result.message || "Failed to send quote.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Network Error",
        description: "Could not send quote. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="sm:max-w-lg w-[90vw] overflow-y-auto flex flex-col"
      >
        <SheetHeader>
          <SheetTitle className="font-headline text-2xl">
            Send Quotation
          </SheetTitle>
          <SheetDescription>
            Respond to the custom art request with your message and price.
          </SheetDescription>
        </SheetHeader>
        <Form {...form}>
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="space-y-6 py-4 flex-grow"
          >
            <FormField
              control={form.control}
              name="reply"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Your Reply</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Write your message to the customer here..."
                      rows={5}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Quoted Price (₹)</FormLabel>
                    <FormControl>
                      <div className="relative mt-2">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                          ₹
                        </span>
                        <Input
                          type="number"
                          placeholder="e.g. 50000"
                          {...field}
                          className="pl-6"
                          value={field.value ?? ""}
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="amountReceivable"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>You Will Receive (₹)</FormLabel>
                    <FormControl>
                      <div className="relative mt-2">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                          ₹
                        </span>
                        <Input
                          type="number"
                          placeholder="Calculated amount"
                          {...field}
                          value={field.value ?? ""}
                          className="pl-6 bg-muted"
                          disabled
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <p className="text-xs text-muted-foreground">
              The "You Will Receive" amount is calculated after deducting our
              15% platform commission from your quoted price.
            </p>
            <SheetFooter className="mt-auto pt-4 border-t">
              <SheetClose asChild>
                <Button type="button" variant="outline" className="w-full">
                  Cancel
                </Button>
              </SheetClose>
              <Button type="submit" disabled={isSubmitting} className="w-full">
                {isSubmitting ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Send className="mr-2 h-4 w-4" />
                )}
                Send Quote
              </Button>
            </SheetFooter>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  );
}

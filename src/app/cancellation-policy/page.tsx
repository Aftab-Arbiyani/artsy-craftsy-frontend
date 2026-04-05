import type { Metadata } from "next";
import { buildMetadata } from "@/lib/seo";
import Link from "next/link";
import { ChevronLeft, RotateCcw } from "lucide-react";

export const metadata: Metadata = buildMetadata({
  title: "Cancellation & Refund Policy",
  description:
    "Understand the cancellation and refund policy for orders and commissions placed on Arts & Craft Studio.",
  path: "/cancellation-policy",
});

export default function CancellationPolicyPage() {
  return (
    <div className="max-w-3xl mx-auto py-12 px-4">
      <Link
        href="/"
        className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors"
      >
        <ChevronLeft className="h-4 w-4 mr-1" />
        Back to Home
      </Link>

      <div className="flex items-center gap-3 mb-4">
        <RotateCcw className="h-8 w-8 text-primary" />
        <h1 className="font-headline text-3xl sm:text-4xl font-bold">
          Cancellation & Refund Policy
        </h1>
      </div>
      <p className="text-xs text-muted-foreground mb-8">Last updated: April 2025</p>

      <p className="text-muted-foreground mb-10 leading-relaxed">
        Arts&Craft Studio believes in helping its customers as far as possible, and
        has therefore a liberal cancellation policy. Under this policy:
      </p>

      <div className="space-y-8">
        <div>
          <h2 className="font-headline text-lg font-semibold mb-2">
            Cancellation Window
          </h2>
          <p className="text-muted-foreground leading-relaxed">
            Cancellations will be considered only if the request is made within
            24 hours of placing the order. However, the cancellation request may
            not be entertained if the orders have been communicated to the
            vendors/merchants and they have initiated the process of shipping
            them. On cancellation of the order, 90% of the order amount will be
            refunded.
          </p>
        </div>

        <div>
          <h2 className="font-headline text-lg font-semibold mb-2">
            Perishable Items
          </h2>
          <p className="text-muted-foreground leading-relaxed">
            Arts&Craft Studio does not accept cancellation requests for perishable
            items like flowers, eatables etc. However, refund/replacement can be
            made if the customer establishes that the quality of product
            delivered is not good.
          </p>
        </div>

        <div>
          <h2 className="font-headline text-lg font-semibold mb-2">
            Damaged or Defective Items
          </h2>
          <p className="text-muted-foreground leading-relaxed">
            In case of receipt of damaged or defective items please report the
            same to our Customer Service team. The request will, however, be
            entertained once the merchant has checked and determined the same at
            his own end. This should be reported within 7 days of receipt of the
            products.
          </p>
        </div>

        <div>
          <h2 className="font-headline text-lg font-semibold mb-2">
            Custom Orders
          </h2>
          <p className="text-muted-foreground leading-relaxed">
            Custom orders are non-cancellable and non-refundable. Since custom
            products are made specifically to order based on your requirements,
            we are unable to accept cancellation or refund requests once the
            order has been placed.
          </p>
        </div>

        <div>
          <h2 className="font-headline text-lg font-semibold mb-2">
            Refund Processing
          </h2>
          <p className="text-muted-foreground leading-relaxed">
            In case of any refunds approved by Arts&Craft Studio, it will take 8-10
            days for the refund to be processed to the end customer.
          </p>
        </div>
      </div>

      <div className="mt-16 p-8 bg-primary/5 rounded-2xl border border-primary/10 text-center">
        <h3 className="font-headline text-xl font-bold mb-2">
          Have questions about cancellations or refunds?
        </h3>
        <p className="text-muted-foreground mb-6 text-sm">
          Our team is happy to help resolve any concerns.
        </p>
        <Link
          href="/contact"
          className="inline-flex items-center justify-center rounded-md bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground shadow hover:bg-primary/90 transition-colors"
        >
          Contact Us
        </Link>
      </div>
    </div>
  );
}

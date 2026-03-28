import Link from "next/link";
import { ChevronLeft, Truck } from "lucide-react";

export default function ShippingPolicyPage() {
  return (
    <div className="max-w-3xl mx-auto py-12 px-4">
      <Link
        href="/"
        className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors"
      >
        <ChevronLeft className="h-4 w-4 mr-1" />
        Back to Home
      </Link>

      <div className="flex items-center gap-3 mb-8">
        <Truck className="h-8 w-8 text-primary" />
        <h1 className="font-headline text-3xl sm:text-4xl font-bold">
          Shipping & Delivery Policy
        </h1>
      </div>

      <div className="space-y-8">
        <div>
          <h2 className="font-headline text-lg font-semibold mb-2">
            International Shipping
          </h2>
          <p className="text-muted-foreground leading-relaxed">
            For international buyers, orders are shipped and delivered through
            registered international courier companies and/or International speed
            post only.
          </p>
        </div>

        <div>
          <h2 className="font-headline text-lg font-semibold mb-2">
            Domestic Shipping
          </h2>
          <p className="text-muted-foreground leading-relaxed">
            For domestic buyers, orders are shipped through registered domestic
            courier companies and/or speed post only.
          </p>
        </div>

        <div>
          <h2 className="font-headline text-lg font-semibold mb-2">
            Shipping Timeline
          </h2>
          <p className="text-muted-foreground leading-relaxed">
            Orders are shipped within 10-15 days or as per the delivery date
            agreed at the time of order confirmation and delivering of the
            shipment subject to Courier Company / post office norms.
          </p>
        </div>

        <div>
          <h2 className="font-headline text-lg font-semibold mb-2">
            Delivery Liability
          </h2>
          <p className="text-muted-foreground leading-relaxed">
            Aftab Arbiyani is not liable for any delay in delivery by the
            courier company / postal authorities and only guarantees to hand over
            the consignment to the courier company or postal authorities within
            10-15 days from the date of the order and payment or as per the
            delivery date agreed at the time of order confirmation.
          </p>
        </div>

        <div>
          <h2 className="font-headline text-lg font-semibold mb-2">
            Delivery Address
          </h2>
          <p className="text-muted-foreground leading-relaxed">
            Delivery of all orders will be to the address provided by the buyer.
            Delivery of our services will be confirmed on your mail ID as
            specified during registration.
          </p>
        </div>

        <div>
          <h2 className="font-headline text-lg font-semibold mb-2">
            Need Help?
          </h2>
          <p className="text-muted-foreground leading-relaxed">
            For any issues in utilizing our services you may contact our helpdesk
            on{" "}
            <a
              href="tel:8511474162"
              className="text-primary hover:underline"
            >
              8511474162
            </a>{" "}
            or{" "}
            <a
              href="mailto:aftabarbiyani@gmail.com"
              className="text-primary hover:underline"
            >
              aftabarbiyani@gmail.com
            </a>
            .
          </p>
        </div>
      </div>

      <div className="mt-16 p-8 bg-primary/5 rounded-2xl border border-primary/10 text-center">
        <h3 className="font-headline text-xl font-bold mb-2">
          Have questions about shipping?
        </h3>
        <p className="text-muted-foreground mb-6 text-sm">
          Our team is happy to help with any delivery concerns.
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

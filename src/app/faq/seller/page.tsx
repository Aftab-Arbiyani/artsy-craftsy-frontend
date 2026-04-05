"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ChevronLeft, Store } from "lucide-react";
import React from "react";

const sellerFaqs: { question: string; answer: React.ReactNode }[] = [
  {
    question: "How do I start selling my art?",
    answer:
      "Register as an Artist, complete your profile details (bio, profile picture, address), and upload at least 3 high-quality artworks. Once our team reviews your profile, your works will be live for collectors to purchase.",
  },
  {
    question: "What is the platform commission?",
    answer:
      "Arts&Craft Studio charges a flat 15% commission on every successful sale. This fee covers platform maintenance, marketing, payment gateway charges, and artist support. The 'Amount Receivable' shown when you list a product is the final amount you will get.",
  },
  {
    question: "How do I get paid?",
    answer:
      "Payments are processed within 21 business days after the artwork is successfully delivered to the customer and the return window has closed. Funds are transferred directly to the bank account provided in your profile settings.",
  },
  {
    question: "Who handles the shipping?",
    answer:
      "Artists are responsible for securely packaging and shipping the artwork. You must use a reliable courier service. Once shipped, you need to update the tracking ID and upload the receipt in your dashboard to inform the buyer.",
  },
  {
    question: "Can I sell custom art requests?",
    answer:
      "Yes! Collectors can send you custom art commission requests based on your style. You will see these in your 'Assigned Requests' tab. You can discuss the brief, quote a price, and start working once the collector pays.",
  },
  {
    question: "What are the image requirements for listings?",
    answer:
      "Images should be sharp, well-lit, and show the artwork clearly. Minimum size is 1024px on any side, and file size should be between 3MB and 5MB. We recommend uploading multiple shots, including a close-up and a framed view if applicable.",
  },
  {
    question: "How to courier your art?",
    answer: (
      <div className="space-y-2">
        <p>There are 3 rules to couriering your art:</p>
        <ol className="list-decimal list-inside space-y-1 pl-2">
          <li>Courier it fast - within 3 working days of a confirmed sale.</li>
          <li>Use a reliable courier to ensure a good impression on the buyer.</li>
          <li>Make sure you track it and upload the details to your dashboard.</li>
        </ol>
        <p>
          Remember to include a colour printout of the Authenticity Certificate
          (in an envelope) and the printed, signed invoice inside the package.
          You will receive your payment once delivery is confirmed by the
          collector.
        </p>
      </div>
    ),
  },
  {
    question: "How will I be informed of the sale of my work?",
    answer: (
      <div className="space-y-2">
        <p>
          You will be informed of the sale of your work via email on the
          contact details provided at the time of registration. It is essential
          to remain contactable - please provide alternate numbers wherever
          possible.
        </p>
        <p>
          There is also a <strong>Notifications</strong> section on your
          dashboard where details of all sold pieces will appear. Keep logging in
          to Arts&Craft Studio to check your notifications.
        </p>
      </div>
    ),
  },
  {
    question: "Can you give me the complete guidelines to packing my artwork?",
    answer: (
      <div className="space-y-4">
        <p>
          Packing your artwork neatly and professionally minimizes the chances
          of damage during couriering. You will need the following materials:
        </p>
        <ol className="list-decimal list-inside space-y-1 pl-2">
          <li>Glassine Paper / Butter Paper</li>
          <li>Bubble Wrap / Thermocol</li>
          <li>Sealant (sellotape / brown packing tape)</li>
          <li>Masking tape</li>
          <li>A container - a tube for rolls, a crate for framed/stretched artwork</li>
        </ol>
        <p className="font-medium">Here&apos;s how to pack your art:</p>
        <ol className="list-decimal list-inside space-y-2 pl-2">
          <li>
            Ensure paintings are completely dry before packing. Research the
            correct drying time and add a few extra days as buffer.
          </li>
          <li>
            Protect the painted surface with a layer of butter paper. Any
            material contacting the surface could damage it.
          </li>
          <li>
            Use glassine / butter paper as the first layer between the painting
            and any packing material. <strong>Do not</strong> use printed paper
            or newspaper as the first layer.
          </li>
          <li>
            Roll the canvas/paper and cover it in bubble wrap to protect from
            moisture.
          </li>
          <li>
            Insert the roll into a PVC or cardboard tube and seal both ends.
          </li>
          <li>
            For stretched or framed artwork, secure the glass with masking tape
            in a cross pattern.
          </li>
          <li>
            Cover in bubble wrap (paying special attention to edges), then place
            in a wooden crate with thermocol on all sides, seal, and courier.
          </li>
        </ol>
      </div>
    ),
  },
];

export default function SellerFaqPage() {
  return (
    <div className="max-w-3xl mx-auto py-12 px-4">
      <Link
        href="/dashboard"
        className="inline-flex items-center text-sm text-muted-foreground hover:text-primary mb-8 transition-colors"
      >
        <ChevronLeft className="mr-1 h-4 w-4" /> Back to Dashboard
      </Link>

      <div className="flex items-center gap-3 mb-8 text-accent">
        <Store className="h-8 w-8" />
        <h1 className="font-headline text-3xl sm:text-4xl font-bold text-foreground">
          Seller&apos;s FAQ
        </h1>
      </div>

      <p className="text-muted-foreground mb-10">
        Everything you need to know about listing your art, managing orders, and
        growing your presence on Arts&Craft Studio.
      </p>

      <Accordion type="single" collapsible className="w-full space-y-4">
        {sellerFaqs.map((faq, index) => (
          <AccordionItem
            key={index}
            value={`item-${index}`}
            className="bg-card border rounded-lg px-4"
          >
            <AccordionTrigger className="text-left font-semibold py-4 hover:no-underline">
              {faq.question}
            </AccordionTrigger>
            <AccordionContent className="text-muted-foreground pb-4 leading-relaxed">
              {faq.answer}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>

      <div className="mt-16 p-8 bg-accent/5 rounded-2xl border border-accent/10 text-center">
        <h3 className="font-headline text-xl font-bold mb-2">
          Need technical help?
        </h3>
        <p className="text-muted-foreground mb-6 text-sm">
          Reach out to our artist support team for any listing or payment
          issues.
        </p>
        <Link href="/contact">
          <Button variant="default" className="bg-accent hover:bg-accent/90">
            Contact Seller Support
          </Button>
        </Link>
      </div>
    </div>
  );
}

"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ChevronLeft, HelpCircle } from "lucide-react";

const collectorFaqs = [
  {
    question:
      "I don’t know what to buy. How can I get some help with choosing art?",
    answer:
      "ArtsyCraftsy tries to help you choose art carefully through many features on our site. Remember, there is no ‘right’ way to select art, so you should just choose what appeals to you. First, try using our filters on the Artworks section. They let you shortlist artworks by category, orientation, and price, which will really help narrow your choices down. As you browse, you can explore detailed descriptions and artist bios to connect with the work.",
  },
  {
    question: "How do I purchase an artwork on ArtsyCraftsy?",
    answer:
      "Simply browse our collection, click on an artwork you like, and select 'Add to Cart' or 'Buy Now'. You can then proceed to checkout, provide your delivery address, and complete the payment using our secure Razorpay gateway.",
  },
  {
    question: "What are the shipping charges?",
    answer:
      "Shipping charges vary based on the artist's location and your delivery address. Many artists offer free shipping within India. The total amount including shipping (if any) will be shown at the checkout page before you pay.",
  },
  {
    question: "How does the 'Custom Art' service work?",
    answer:
      "You can either use our AI Creative Studio to visualize your idea or fill out a direct commission form. We connect you with artists who match your style. Once an artist accepts and quotes a price, you can pay to start the work. Your unique masterpiece is then shipped to you upon completion.",
  },
  {
    question: "What is your return policy?",
    answer:
      "Art is unique, delicate, and exclusive. It often takes days, sometimes months to complete a single work of art. Due to its fragile and singular nature we are unable to allow returns. Hence, we urge you to be certain of your decision before purchasing. We are always available to ensure the art you see, is the art you get. If you're in doubt, you can always ask for additional images of the artwork.",
  },
  {
    question: "How can I track my order?",
    answer:
      "Once the artist marks your order as 'Shipped', a tracking number will be provided in your Order History dashboard. You can use this ID on the respective courier's website to track your package.",
  },
  {
    question: "How long will it take for me to receive my ordered artwork?",
    answer:
      "The anxiety around receiving a couriered artwork can indeed be great. Depending on where you are in the world, the delivery of your artwork will take approximately 7-15 days from the time that you place the order. We will do our best to keep you informed at every stage, and you will be notified of the courier details by email. In most cases, you can also track the shipment online.",
  },
  {
    question: "When will I receive my order?",
    answer:
      "The anxiety around receiving a couriered artwork can indeed be great. However, ArtsyCrafsty has a Studio2Home feature and your artwork will be sent to you straight from the artists’ studio or seller’s home. Depending on where you are in the world, the delivery of your artwork will take approximately 7-15 days from the time that the artist dispatches it. We will do our best to keep you informed at every stage, and you will be notified of the courier details. In most cases, you can also track the shipment online.",
  },
  {
    question: "How do I know if the artist has sent my artwork?",
    answer:
      "ArtsyCraftsy tries its best to get your artwork to your home as soon as possible. You will receive Emails from us at every stage of the process, but don’t forget to ensure that your contact details with us are updated, and correct!",
  },
  {
    question: "What are prints?",
    answer:
      "Prints are reproduction of an original artwork, printed on paper or canvas. Prints are a great starting point for someone wishing to start collecting art as they are affordable and low maintenance. Buy a print of a great piece of original art if you really want to see how art can transform a room or a space. They’re also great for young collectors, transit apartments, bachelor pads, hostel rooms and the like. However, prints will never have the same impact as the original artwork, not the least because the medium and size are different than the original. Also, they don’t have intrinsic value, and so can’t be looked upon as investments.",
  },
];

export default function CollectorFaqPage() {
  return (
    <div className="max-w-3xl mx-auto py-12 px-4">
      <Link
        href="/"
        className="inline-flex items-center text-sm text-muted-foreground hover:text-primary mb-8 transition-colors"
      >
        <ChevronLeft className="mr-1 h-4 w-4" /> Back to Home
      </Link>

      <div className="flex items-center gap-3 mb-8 text-primary">
        <HelpCircle className="h-8 w-8" />
        <h1 className="font-headline text-3xl sm:text-4xl font-bold text-foreground">
          Collector's FAQ
        </h1>
      </div>

      <p className="text-muted-foreground mb-10">
        Find answers to common questions about buying, tracking, and
        commissioning art on ArtsyCraftsy.
      </p>

      <Accordion type="single" collapsible className="w-full space-y-4">
        {collectorFaqs.map((faq, index) => (
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

      <div className="mt-16 p-8 bg-primary/5 rounded-2xl border border-primary/10 text-center">
        <h3 className="font-headline text-xl font-bold mb-2">
          Still have questions?
        </h3>
        <p className="text-muted-foreground mb-6 text-sm">
          Our support team is here to help you find your perfect piece.
        </p>
        <Link href="/contact">
          <Button variant="default">Contact Support</Button>
        </Link>
      </div>
    </div>
  );
}

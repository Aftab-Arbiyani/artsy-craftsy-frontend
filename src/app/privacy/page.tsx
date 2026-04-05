import type { Metadata } from "next";
import { buildMetadata } from "@/lib/seo";
import Link from "next/link";
import {
  ChevronLeft,
  ShieldCheck,
  Database,
  Eye,
  Share2,
  Cookie,
  Lock,
  UserCheck,
  Mail,
} from "lucide-react";

export const metadata: Metadata = buildMetadata({
  title: "Privacy Policy",
  description:
    "Learn how Arts & Craft Studio collects, uses, and protects your personal information when you use our platform.",
  path: "/privacy",
});

export default function PrivacyPage() {
  return (
    <div className="max-w-3xl mx-auto py-12 px-4">
      <Link
        href="/"
        className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors"
      >
        <ChevronLeft className="h-4 w-4 mr-1" />
        Back to Home
      </Link>

      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <ShieldCheck className="h-8 w-8 text-primary" />
        <h1 className="font-headline text-3xl sm:text-4xl font-bold">
          Privacy Policy
        </h1>
      </div>
      <p className="text-xs text-muted-foreground mb-4">
        Last updated: April 2025
      </p>
      <p className="text-muted-foreground leading-relaxed mb-12">
        Arts &amp; Craft Studio is a marketplace that connects independent
        artists with collectors who appreciate handcrafted, original work. To
        make that connection possible — processing orders, handling payouts to
        artists, and delivering art to your door — we need to collect some
        personal information. This page explains exactly what we collect, why
        we need it, and how it is protected. We only collect what is genuinely
        necessary. If anything here is unclear, write to us at{" "}
        <a
          href="mailto:support.artsandcraftstudio@gmail.com"
          className="text-primary underline underline-offset-2"
        >
          support.artsandcraftstudio@gmail.com
        </a>{" "}
        and we will get back to you within 2 business days.
      </p>

      <div className="space-y-10">

        {/* What we collect */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <Database className="h-5 w-5 text-primary" />
            <h2 className="font-headline text-xl font-semibold">
              What we collect
            </h2>
          </div>
          <div className="space-y-4 text-sm text-muted-foreground">
            <div className="border border-border rounded-lg overflow-hidden">
              <table className="w-full">
                <thead className="bg-muted/50">
                  <tr>
                    <th className="text-left px-4 py-2 font-semibold text-foreground w-1/3">
                      Data
                    </th>
                    <th className="text-left px-4 py-2 font-semibold text-foreground">
                      Why we need it
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  <tr>
                    <td className="px-4 py-3 align-top font-medium text-foreground">
                      Name &amp; email
                    </td>
                    <td className="px-4 py-3 align-top">
                      To create your account, send order confirmations, and
                      respond to support requests.
                    </td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 align-top font-medium text-foreground">
                      Delivery address
                    </td>
                    <td className="px-4 py-3 align-top">
                      To ship artwork to you. Only shared with our logistics
                      partner for your specific order.
                    </td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 align-top font-medium text-foreground">
                      Payment info
                    </td>
                    <td className="px-4 py-3 align-top">
                      Processed entirely by{" "}
                      <span className="font-medium text-foreground">
                        Razorpay
                      </span>
                      . We never see or store your card or UPI credentials.
                    </td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 align-top font-medium text-foreground">
                      Bank account{" "}
                      <span className="text-xs font-normal">(sellers)</span>
                    </td>
                    <td className="px-4 py-3 align-top">
                      To transfer your earnings via Razorpay payouts. Stored
                      encrypted, never shared publicly.
                    </td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 align-top font-medium text-foreground">
                      Usage data
                    </td>
                    <td className="px-4 py-3 align-top">
                      Pages visited, device type, browser, and IP address —
                      collected automatically to fix bugs and improve the site.
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* How we use it */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <Eye className="h-5 w-5 text-primary" />
            <h2 className="font-headline text-xl font-semibold">
              How we use it
            </h2>
          </div>
          <ul className="space-y-2 text-sm text-muted-foreground list-none">
            {[
              "Process your orders and communicate shipping updates",
              "Verify seller and artist identities before activating payouts",
              "Show you relevant artworks and personalise your feed",
              "Send transactional emails (receipts, order updates, support replies)",
              "Send marketing emails only if you have opted in — you can unsubscribe anytime",
              "Detect and prevent fraudulent activity",
            ].map((item) => (
              <li key={item} className="flex items-start gap-2">
                <span className="mt-1 h-1.5 w-1.5 rounded-full bg-primary flex-shrink-0" />
                {item}
              </li>
            ))}
          </ul>
          <p className="mt-4 text-sm text-muted-foreground">
            We do <span className="font-semibold text-foreground">not</span>{" "}
            sell your data, use it for advertising on other platforms, or share
            it with any party not listed below.
          </p>
        </section>

        {/* Who we share with */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <Share2 className="h-5 w-5 text-primary" />
            <h2 className="font-headline text-xl font-semibold">
              Who we share data with
            </h2>
          </div>
          <div className="space-y-3">
            {[
              {
                name: "Razorpay",
                purpose:
                  "Payment processing and seller payouts. Subject to Razorpay's own privacy policy.",
              },
              {
                name: "Shipping partners",
                purpose:
                  "Your name and delivery address, shared only when an order is dispatched.",
              },
              {
                name: "Amazon Web Services (AWS)",
                purpose:
                  "Artwork images and platform media are stored on and delivered via AWS S3 and CloudFront CDN.",
              },
              {
                name: "Analytics tools",
                purpose:
                  "Aggregate, anonymised usage data to help us understand what's working on the site.",
              },
              {
                name: "Law enforcement",
                purpose:
                  "Only when legally required — we will notify you unless prohibited from doing so.",
              },
            ].map(({ name, purpose }) => (
              <div
                key={name}
                className="flex gap-3 p-3 rounded-lg border border-border bg-muted/20"
              >
                <span className="font-semibold text-foreground text-sm min-w-[140px]">
                  {name}
                </span>
                <span className="text-sm text-muted-foreground">{purpose}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Cookies */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <Cookie className="h-5 w-5 text-primary" />
            <h2 className="font-headline text-xl font-semibold">Cookies</h2>
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed mb-3">
            We use cookies for two purposes only:
          </p>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li className="flex items-start gap-2">
              <span className="mt-1 h-1.5 w-1.5 rounded-full bg-primary flex-shrink-0" />
              <span>
                <span className="font-medium text-foreground">
                  Essential cookies
                </span>{" "}
                — keep you logged in and remember your cart. The site cannot
                function without these.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-1 h-1.5 w-1.5 rounded-full bg-primary flex-shrink-0" />
              <span>
                <span className="font-medium text-foreground">
                  Analytics cookies
                </span>{" "}
                — help us understand page performance. No personal information
                is tied to these. You can block them in your browser settings
                without losing any functionality.
              </span>
            </li>
          </ul>
          <p className="mt-3 text-sm text-muted-foreground">
            We do <span className="font-semibold text-foreground">not</span> use
            third-party advertising cookies.
          </p>
        </section>

        {/* Security */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <Lock className="h-5 w-5 text-primary" />
            <h2 className="font-headline text-xl font-semibold">
              How we protect your data
            </h2>
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed">
            All data is transmitted over HTTPS. Sensitive fields (like bank
            account numbers) are stored encrypted at rest. Access to production
            data is restricted to a small number of team members. We conduct
            periodic security reviews. No system is 100% secure — if you ever
            suspect unauthorised access to your account, change your password
            immediately and contact us.
          </p>
          <p className="mt-3 text-sm text-muted-foreground">
            We retain your data for as long as your account is active. If you
            delete your account, personal data is removed within{" "}
            <span className="font-medium text-foreground">30 days</span>, except
            where retention is required by Indian tax or accounting law (typically
            5 years for transaction records).
          </p>
        </section>

        {/* Your rights */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <UserCheck className="h-5 w-5 text-primary" />
            <h2 className="font-headline text-xl font-semibold">
              Your rights
            </h2>
          </div>
          <p className="text-sm text-muted-foreground mb-3">
            You can do any of the following at any time — just email us:
          </p>
          <ul className="space-y-2 text-sm text-muted-foreground">
            {[
              "Request a copy of the personal data we hold about you",
              "Ask us to correct inaccurate information",
              "Ask us to delete your account and associated personal data",
              "Unsubscribe from marketing emails (link is in every email we send)",
            ].map((right) => (
              <li key={right} className="flex items-start gap-2">
                <span className="mt-1 h-1.5 w-1.5 rounded-full bg-primary flex-shrink-0" />
                {right}
              </li>
            ))}
          </ul>
          <p className="mt-4 text-sm text-muted-foreground">
            This platform is intended for users aged{" "}
            <span className="font-medium text-foreground">18 and above</span>.
            If you believe a minor has created an account, contact us and we
            will remove it promptly.
          </p>
        </section>

        {/* Contact */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <Mail className="h-5 w-5 text-primary" />
            <h2 className="font-headline text-xl font-semibold">
              Questions or requests
            </h2>
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed">
            For anything related to your data — access, correction, deletion, or
            a general question about this policy — reach out at{" "}
            <a
              href="mailto:support.artsandcraftstudio@gmail.com"
              className="text-primary underline underline-offset-2"
            >
              support.artsandcraftstudio@gmail.com
            </a>
            . We will respond within{" "}
            <span className="font-medium text-foreground">2 business days</span>
            .
          </p>
        </section>
      </div>

      <div className="mt-16 p-8 bg-primary/5 rounded-2xl border border-primary/10 text-center">
        <h3 className="font-headline text-xl font-bold mb-2">
          Still have questions?
        </h3>
        <p className="text-muted-foreground mb-6 text-sm">
          We are happy to explain anything in this policy in plain language.
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

import Link from "next/link";
import { ChevronLeft, ScrollText } from "lucide-react";

const sections = [
  {
    title: "1. Acceptance of Terms",
    content:
      "By accessing or using the A&C Studio platform, you agree to be bound by these Terms & Conditions. If you do not agree with any part of these terms, you must not use our services. We reserve the right to update these terms at any time, and continued use of the platform constitutes acceptance of any changes.",
  },
  {
    title: "2. Account Registration",
    content:
      "To access certain features, you must create an account and provide accurate, complete information. You are responsible for maintaining the confidentiality of your login credentials and for all activity under your account. You must be at least 18 years old to create an account. A&C Studio reserves the right to suspend or terminate accounts that violate these terms.",
  },
  {
    title: "3. Buying Artwork",
    content:
      "All artwork listed on the platform is sold by independent sellers. Prices are set by sellers and displayed in the currency indicated on the listing. By placing an order, you agree to pay the listed price plus any applicable shipping and taxes. Orders are subject to acceptance by the seller. A&C Studio acts as an intermediary and does not guarantee the availability or condition of any artwork.",
  },
  {
    title: "4. Selling Artwork",
    content:
      "Sellers must ensure that all artwork listed is original or that they hold the necessary rights to sell it. Sellers are responsible for accurate descriptions, pricing, and timely fulfillment of orders. A&C Studio may charge a commission on each sale as outlined in the seller agreement. We reserve the right to remove listings that violate our policies.",
  },
  {
    title: "5. AI Studio & Custom Art",
    content:
      "The AI Studio feature allows users to generate artwork using AI tools. Any artwork generated through the AI Studio is subject to our usage policies. Users may not use AI-generated content for unlawful purposes. A&C Studio does not guarantee exclusive ownership of AI-generated designs, as similar outputs may be produced for other users.",
  },
  {
    title: "6. Payments",
    content:
      "Payments are processed through our secure payment partners. All transactions are final unless the item is damaged, defective, or significantly not as described.",
  },
  {
    title: "7. Refunds & Returns",
    content:
      "Art is unique, delicate, and exclusive. It often takes days, sometimes months to complete a single work of art. Due to its fragile and singular nature we are unable to allow returns. Hence, we urge you to be certain of your decision before purchasing. We are always available to ensure the art you see, is the art you get. If you're in doubt, you can always ask for additional images of the artwork. However, there may be times when you receive an item in damaged condition, in which case we will ensure a resolution keeping in mind your interests. This may be through repair, exchange, or return of the product.",
  },
  {
    title: "8. Intellectual Property",
    content:
      "All content on the platform, including logos, designs, and text, is the property of A&C Studio or its licensors. Artwork listed by sellers remains the intellectual property of the respective artists unless otherwise transferred through a sale. Users may not reproduce, distribute, or create derivative works from any content without explicit permission.",
  },
  {
    title: "9. Prohibited Conduct",
    content:
      "Users must not: post fraudulent, misleading, or infringing content; manipulate reviews or ratings; use automated tools to scrape or access the platform; harass other users; or engage in any activity that disrupts the platform. Violations may result in immediate account termination.",
  },
  {
    title: "10. Limitation of Liability",
    content:
      "A&C Studio is provided on an \"as is\" basis. We do not warrant that the platform will be uninterrupted or error-free. To the maximum extent permitted by law, A&C Studio shall not be liable for any indirect, incidental, or consequential damages arising from your use of the platform, including loss of data, revenue, or profits.",
  },
  {
    title: "11. Privacy",
    content:
      "Your use of the platform is also governed by our Privacy Policy. By using A&C Studio, you consent to the collection and use of your information as described therein. We take reasonable measures to protect your personal data but cannot guarantee absolute security.",
  },
  {
    title: "12. Governing Law",
    content:
      "These Terms & Conditions are governed by and construed in accordance with the laws of the jurisdiction in which A&C Studio operates. Any disputes shall be resolved through binding arbitration or in the courts of the applicable jurisdiction.",
  },
  {
    title: "13. Contact Us",
    content:
      "If you have any questions about these Terms & Conditions, please contact us through our Contact page or email us at support@acstudio.com.",
  },
  {
    title: "14. Disclaimer of Warranties",
    content:
      "Neither we nor any third parties provide any warranty or guarantee as to the accuracy, timeliness, performance, completeness or suitability of the information and materials found or offered on this website for any particular purpose. You acknowledge that such information and materials may contain inaccuracies or errors and we expressly exclude liability for any such inaccuracies or errors to the fullest extent permitted by law.",
  },
  {
    title: "15. Use at Your Own Risk",
    content:
      "Your use of any information or materials on our website and/or product pages is entirely at your own risk, for which we shall not be liable. It shall be your own responsibility to ensure that any products, services or information available through our website and/or product pages meet your specific requirements.",
  },
  {
    title: "16. Website Material",
    content:
      "Our website contains material which is owned by or licensed to us. This material includes, but is not limited to, the design, layout, look, appearance and graphics. Reproduction is prohibited other than in accordance with the copyright notice, which forms part of these terms and conditions.",
  },
  {
    title: "17. Trademarks",
    content:
      "All trademarks reproduced in our website which are not the property of, or licensed to, the operator are acknowledged on the website.",
  },
  {
    title: "18. Unauthorized Use",
    content:
      "Unauthorized use of information provided by us shall give rise to a claim for damages and/or be a criminal offense.",
  },
  {
    title: "19. External Links",
    content:
      "From time to time our website may also include links to other websites. These links are provided for your convenience to provide further information.",
  },
  {
    title: "20. Linking Policy",
    content:
      "You may not create a link to our website from another website or document without Aftab Arbiyani's prior written consent.",
  },
  {
    title: "21. Governing Jurisdiction",
    content:
      "Any dispute arising out of use of our website and/or purchase with us and/or any engagement with us is subject to the laws of India.",
  },
  {
    title: "22. Transaction Liability",
    content:
      "We shall be under no liability whatsoever in respect of any loss or damage arising directly or indirectly out of the decline of authorization for any Transaction, on Account of the Cardholder having exceeded the preset limit mutually agreed by us with our acquiring bank from time to time.",
  },
];

export default function TermsPage() {
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
        <ScrollText className="h-8 w-8 text-primary" />
        <h1 className="font-headline text-3xl sm:text-4xl font-bold">
          Terms & Conditions
        </h1>
      </div>

      <p className="text-muted-foreground mb-10 leading-relaxed">
        For the purpose of these Terms and Conditions, The term "we", "us", "our" used anywhere on this page shall mean Aftab Arbiyani, whose registered/operational office is B-204 Dayaar, Sheikh Oaf Road, Opposite Harmain 33, Sarkhej Ahmedabad GUJARAT 380055 . "you", "your", "user", "visitor" shall mean any natural or legal person who is visiting our website and/or agreed to purchase from us.
      </p>

      <div className="space-y-8">
        {sections.map((section) => (
          <div key={section.title}>
            <h2 className="font-headline text-lg font-semibold mb-2">
              {section.title}
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              {section.content}
            </p>
          </div>
        ))}
      </div>

      <div className="mt-16 p-8 bg-primary/5 rounded-2xl border border-primary/10 text-center">
        <h3 className="font-headline text-xl font-bold mb-2">
          Have questions about our terms?
        </h3>
        <p className="text-muted-foreground mb-6 text-sm">
          Our team is happy to clarify anything. Reach out to us anytime.
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

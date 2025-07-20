import CustomArtForm from "@/components/custom-art/CustomArtForm";
import ArtIdeaGenerator from "@/components/custom-art/ArtIdeaGenerator";
import { Separator } from "@/components/ui/separator";

export default function CustomArtPage() {
  return (
    <div className="space-y-12">
      <div>
        <h1 className="font-headline text-3xl sm:text-4xl font-semibold mb-4 text-center">
          Create Your Unique Artwork
        </h1>
        <p className="text-base md:text-lg text-muted-foreground text-center max-w-3xl mx-auto">
          Have a specific vision or need some inspiration? You're in the right
          place. Submit your detailed request, or use our AI tool to brainstorm
          ideas.
        </p>
      </div>

      <div className="grid lg:grid-cols-5 gap-12">
        <div className="lg:col-span-3">
          <CustomArtForm />
        </div>
        <div className="lg:col-span-2">
          <ArtIdeaGenerator />
        </div>
      </div>

      <Separator className="my-16" />

      <section className="text-center">
        <h2 className="font-headline text-2xl sm:text-3xl font-semibold mb-4">
          How It Works
        </h2>
        <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto text-left">
          <div className="bg-card p-6 rounded-lg shadow">
            <h3 className="font-headline text-lg sm:text-xl font-semibold mb-2 text-primary">
              1. Submit Your Idea
            </h3>
            <p className="text-sm text-muted-foreground">
              Use the form to detail your custom art request. The more specific,
              the better! Upload reference images if you have them.
            </p>
          </div>
          <div className="bg-card p-6 rounded-lg shadow">
            <h3 className="font-headline text-lg sm:text-xl font-semibold mb-2 text-primary">
              2. Artist Consultation
            </h3>
            <p className="text-sm text-muted-foreground">
              We'll review your request and connect you with a suitable artist.
              You'll discuss specifics, timeline, and pricing.
            </p>
          </div>
          <div className="bg-card p-6 rounded-lg shadow">
            <h3 className="font-headline text-lg sm:text-xl font-semibold mb-2 text-primary">
              3. Creation & Delivery
            </h3>
            <p className="text-sm text-muted-foreground">
              Once confirmed, the artist begins creating your piece. We'll keep
              you updated until your unique artwork is delivered.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}

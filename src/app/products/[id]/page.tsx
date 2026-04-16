import type { Metadata } from "next";
import type { Product } from "@/lib/types";
import ProductDetails from "./ProductDetails";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL;
const IMAGE_BASE = process.env.NEXT_PUBLIC_IMAGE_BASE_URL ?? "";
const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://artsandcraftstudio.in";

async function fetchProductData(id: string) {
  try {
    const res = await fetch(`${API_BASE}/api/products/${id}`, {
      next: { revalidate: 3600 },
    });
    if (!res.ok) return null;
    const result = await res.json();
    if (result.status !== 1 || !result.data) return null;
    return result.data;
  } catch {
    return null;
  }
}

function transformProduct(p: any): Product {
  const imageUrls: string[] =
    p.media?.map((m: any) =>
      m.file_path
        ? `${IMAGE_BASE}${m.file_path}`
        : "https://placehold.co/600x400.png"
    ) || ["https://placehold.co/600x400.png"];

  return {
    id: p.id,
    name: p.title,
    description: p.description,
    price: parseFloat(p.listing_price),
    discount: p.discount ? parseFloat(p.discount) : undefined,
    category: p.category?.name || "Uncategorized",
    imageUrls,
    artist: p.user?.name || "Unknown Artist",
    artistId: p.user?.id,
    artistBio: p.user?.bio,
    artistImage: p.user?.profile_picture
      ? `${IMAGE_BASE}${p.user.profile_picture}`
      : undefined,
    medium: p.materials?.name,
    dimensions:
      p.width && p.height ? `${p.width}x${p.height} inches` : undefined,
    dataAiHint: p.category?.name?.toLowerCase() || "artwork",
    year: p.year_of_artwork,
    city: p?.city || "Unknown City",
  };
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const p = await fetchProductData(id);
  if (!p) return {};

  const title = p.title as string;
  const description: string =
    p.description ||
    `${title} — original artwork by ${p.user?.name ?? "an artist"} on Arts & Craft Studio.`;
  const imageUrl: string = p.media?.[0]?.file_path
    ? `${IMAGE_BASE}${p.media[0].file_path}`
    : `${SITE_URL}/og-default.jpg`;
  const canonical = `${SITE_URL}/products/${id}`;

  return {
    title,
    description,
    alternates: { canonical },
    openGraph: {
      type: "article",
      url: canonical,
      title,
      description,
      images: [{ url: imageUrl, width: 1200, height: 630, alt: title }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [imageUrl],
    },
  };
}

export default async function ProductDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const rawProduct = await fetchProductData(id);
  const initialProduct = rawProduct ? transformProduct(rawProduct) : null;

  const canonical = `${SITE_URL}/products/${id}`;
  const imageUrl = rawProduct?.media?.[0]?.file_path
    ? `${IMAGE_BASE}${rawProduct.media[0].file_path}`
    : `${SITE_URL}/og-default.jpg`;

  const productSchema = initialProduct
    ? {
        "@context": "https://schema.org",
        "@type": "Product",
        name: initialProduct.name,
        description: initialProduct.description,
        image: imageUrl,
        url: canonical,
        offers: {
          "@type": "Offer",
          priceCurrency: "INR",
          price: initialProduct.price,
          availability: "https://schema.org/InStock",
          seller: {
            "@type": "Person",
            name: initialProduct.artist,
          },
        },
        ...(initialProduct.artist && {
          creator: {
            "@type": "Person",
            name: initialProduct.artist,
            ...(initialProduct.artistId && {
              url: `${SITE_URL}/artist/${initialProduct.artistId}`,
            }),
          },
        }),
      }
    : null;

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: SITE_URL,
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Products",
        item: `${SITE_URL}/products`,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: initialProduct?.name ?? "Product",
        item: canonical,
      },
    ],
  };

  return (
    <>
      {productSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(productSchema) }}
        />
      )}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <ProductDetails initialProduct={initialProduct} />
    </>
  );
}

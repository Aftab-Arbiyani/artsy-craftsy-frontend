import type { Metadata } from "next";
import type { Product } from "@/lib/types";
import ArtistProfile from "./ArtistProfile";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL;
const IMAGE_BASE = process.env.NEXT_PUBLIC_IMAGE_BASE_URL ?? "";
const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://artsandcraftstudio.in";

const PRODUCTS_PER_PAGE = 8;

async function fetchArtistData(id: string) {
  try {
    const res = await fetch(`${API_BASE}/api/user/artist-profile/${id}`, {
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

async function fetchArtistProducts(id: string) {
  try {
    const res = await fetch(
      `${API_BASE}/api/products/artist-products/${id}?take=${PRODUCTS_PER_PAGE}&skip=0`,
      { next: { revalidate: 3600 } }
    );
    if (!res.ok) return { products: [], total: 0 };
    const result = await res.json();
    if (result.status !== 1) return { products: [], total: 0 };
    return { products: result.data ?? [], total: result.total ?? 0 };
  } catch {
    return { products: [], total: 0 };
  }
}

function transformArtistProduct(item: any, artistName: string): Product {
  return {
    id: item.id,
    name: item.title,
    description: item.description || "",
    price: parseFloat(item.listing_price),
    discount: item.discount ? parseFloat(item.discount) : undefined,
    category: item.category?.name || "Uncategorized",
    imageUrls:
      item.media?.map((m: any) =>
        m.file_path
          ? `${IMAGE_BASE}${m.file_path}`
          : "https://placehold.co/600x400.png"
      ) || ["https://placehold.co/600x400.png"],
    artist: artistName,
    medium: item.materials?.name,
    dataAiHint: item.category?.name?.toLowerCase() || "artwork",
  };
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const artist = await fetchArtistData(id);
  if (!artist) return {};

  const name = artist.name as string;
  const description: string =
    artist.bio || `Discover artworks by ${name} on Arts & Craft Studio.`;
  const imageUrl: string = artist.profile_picture
    ? `${IMAGE_BASE}${artist.profile_picture}`
    : `${SITE_URL}/og-default.jpg`;
  const canonical = `${SITE_URL}/artist/${id}`;

  return {
    title: name,
    description,
    alternates: { canonical },
    openGraph: {
      type: "profile",
      url: canonical,
      title: `${name} | Arts & Craft Studio`,
      description,
      images: [{ url: imageUrl, width: 1200, height: 630, alt: name }],
    },
    twitter: {
      card: "summary_large_image",
      title: name,
      description,
      images: [imageUrl],
    },
  };
}

export default async function ArtistProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const [rawArtist, { products: rawProducts, total }] = await Promise.all([
    fetchArtistData(id),
    fetchArtistProducts(id),
  ]);

  const canonical = `${SITE_URL}/artist/${id}`;

  const initialArtist = rawArtist
    ? {
        id: rawArtist.id,
        name: rawArtist.name as string,
        bio: rawArtist.bio as string,
        profile_picture: rawArtist.profile_picture as string | undefined,
        followersCount: (rawArtist.followers_count as number) ?? 0,
        address:
          rawArtist.addresses?.length > 0
            ? {
                city: rawArtist.addresses[0].city,
                country: rawArtist.addresses[0].country || "India",
              }
            : undefined,
      }
    : null;

  const initialProducts: Product[] = rawArtist
    ? rawProducts.map((item: any) =>
        transformArtistProduct(item, rawArtist.name)
      )
    : [];

  const personSchema = rawArtist
    ? {
        "@context": "https://schema.org",
        "@type": "Person",
        name: rawArtist.name,
        description:
          rawArtist.bio ||
          `Independent artist on Arts & Craft Studio.`,
        url: canonical,
        ...(rawArtist.profile_picture && {
          image: `${IMAGE_BASE}${rawArtist.profile_picture}`,
        }),
        ...(rawArtist.addresses?.length > 0 && {
          address: {
            "@type": "PostalAddress",
            addressLocality: rawArtist.addresses[0].city,
            addressCountry: rawArtist.addresses[0].country || "IN",
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
        name: rawArtist?.name ?? "Artist",
        item: canonical,
      },
    ],
  };

  return (
    <>
      {personSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(personSchema) }}
        />
      )}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <ArtistProfile
        initialArtist={initialArtist}
        initialProducts={initialProducts}
        initialTotal={total}
      />
    </>
  );
}

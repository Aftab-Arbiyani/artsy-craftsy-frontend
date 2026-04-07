export type Product = {
  id: string;
  name: string;
  description: string;
  price?: number;
  category: string; // Allow any string for category name
  imageUrls: string[];
  artist?: string;
  artistId?: string;
  artistBio?: string;
  artistImage?: string;
  dimensions?: string;
  medium?: string;
  dataAiHint?: string;
  discount?: number;
  year?: string;
  stock?: number;
  city?: string;
};

export type CartItem = {
  product: Product & { price: number }; // Ensure product in cart always has a price
  quantity: number;
};

export type CustomArtRequest = {
  id: string;
  requestId?: string;
  description: string;
  reference_image?: string;
  budget_range?: string;
  dimensions?: string;
  status: string;
  createdAt: Date;
  reply?: string;
  price?: string;
};

export interface Category {
  id: string;
  name: string;
  slug: string;
  image: string;
}

export type AssignedArtRequest = {
  id: string;
  created_at: string;
  dimensions: string | null;
  request_id: string;
  description: string;
  budget_range: string | null;
  reference_image: string | null;
  reply: string | null;
  status: "requested" | "replied" | "accepted" | "rejected";
  price: string;
  amount_receivable: string;
};

export interface Address {
  id: string;
  street: string;
  city: string;
  state: string;
  zip_code: string;
  country: string;
  type: "home" | "work" | "other";
}

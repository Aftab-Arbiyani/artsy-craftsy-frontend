export type Product = {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string; // Allow any string for category name
  imageUrl: string;
  artist?: string;
  dimensions?: string;
  medium?: string;
  dataAiHint?: string;
};

export type CartItem = {
  product: Product;
  quantity: number;
};

export type CustomArtRequest = {
  id: string;
  description: string;
  imageUrl?: string;
  status: 'Pending' | 'In Progress' | 'Completed' | 'Cancelled';
  createdAt: Date;
  userName?: string; // Assuming user context might provide this
  userEmail?: string;
};

export interface Category {
  id: string;
  name: string;
  slug: string;
  image: string;
}

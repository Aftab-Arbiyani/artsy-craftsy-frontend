export type Product = {
  id: string;
  name: string;
  description: string;
  price: number;
  category: 'Painting' | 'Sculpture' | 'Digital Art' | 'Photography';
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

"use client";

import type { ReactNode } from "react";
import React, {
  createContext,
  useContext,
  useReducer,
  useEffect,
  useCallback,
  useState,
} from "react";
import type { Product, CartItem } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";

interface CartState {
  items: CartItem[];
  isLoaded: boolean;
}

type CartAction =
  | { type: "ADD_ITEM"; payload: CartItem }
  | { type: "REMOVE_ITEM"; payload: string } // productId
  | {
      type: "UPDATE_QUANTITY";
      payload: { productId: string; quantity: number };
    }
  | { type: "CLEAR_CART" }
  | { type: "SET_CART"; payload: CartItem[] };

interface CartContextType extends CartState {
  addItem: (product: Product & { price: number }) => Promise<void>;
  removeItem: (productId: string) => Promise<void>;
  updateQuantity: (productId: string, quantity: number) => Promise<void>;
  clearCart: () => Promise<void>;
  getTotalPrice: () => number;
  getItemCount: () => number;
  fetchCart: () => Promise<void>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const cartReducer = (state: CartState, action: CartAction): CartState => {
  switch (action.type) {
    case "SET_CART":
      return { ...state, items: action.payload, isLoaded: true };
    case "ADD_ITEM": {
      const existingItem = state.items.find(
        (item) => item.product.id === action.payload.product.id,
      );
      if (existingItem) {
        return {
          ...state,
          items: state.items.map((item) =>
            item.product.id === action.payload.product.id
              ? { ...item, quantity: item.quantity + 1 }
              : item,
          ),
        };
      }
      return {
        ...state,
        items: [...state.items, action.payload],
      };
    }
    case "REMOVE_ITEM":
      return {
        ...state,
        items: state.items.filter((item) => item.product.id !== action.payload),
      };
    case "UPDATE_QUANTITY": {
      if (action.payload.quantity <= 0) {
        return {
          ...state,
          items: state.items.filter(
            (item) => item.product.id !== action.payload.productId,
          ),
        };
      }
      return {
        ...state,
        items: state.items.map((item) =>
          item.product.id === action.payload.productId
            ? { ...item, quantity: action.payload.quantity }
            : item,
        ),
      };
    }
    case "CLEAR_CART":
      return { ...state, items: [] };
    default:
      return state;
  }
};

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [state, dispatch] = useReducer(cartReducer, {
    items: [],
    isLoaded: false,
  });
  const { toast } = useToast();
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    setToken(localStorage.getItem("authToken"));
  }, []);

  const fetchCart = useCallback(async () => {
    const currentToken = localStorage.getItem("authToken");
    if (!currentToken) {
      dispatch({ type: "SET_CART", payload: [] });
      return;
    }
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/cart/items`,
        {
          headers: { Authorization: `Bearer ${currentToken}` },
        },
      );
      const result = await response.json();
      if (response.ok && result.status === 1) {
        const cartItems: CartItem[] = result.data.map((item: any) => ({
          product: {
            id: item.product.id,
            name: item.product.title,
            price: parseFloat(item.price),
            imageUrls: item.product.media?.map((m: any) =>
              m.file_path
                ? `${process.env.NEXT_PUBLIC_IMAGE_BASE_URL}${m.file_path}`
                : "https://placehold.co/600x400.png",
            ) || ["https://placehold.co/600x400.png"],
            category: item.product.category?.name || "Uncategorized",
            description: item.product.description || "",
            artist: item.product.user?.name,
            medium: item.product.materials?.name,
            discount: parseFloat(item.product.discount) || 0,
          },
          quantity: item.quantity,
        }));
        dispatch({ type: "SET_CART", payload: cartItems });
      } else {
        dispatch({ type: "SET_CART", payload: [] });
      }
    } catch (error) {
      console.error("Failed to fetch cart", error);
      dispatch({ type: "SET_CART", payload: [] });
    }
  }, []);

  useEffect(() => {
    fetchCart();
  }, [token, fetchCart]);

  const addItem = async (product: Product & { price: number }) => {
    const currentToken = localStorage.getItem("authToken");
    if (!currentToken) {
      toast({
        title: "Please log in",
        description: "You need to be logged in to add items to the cart.",
        variant: "destructive",
      });
      return;
    }
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/cart/add-item`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${currentToken}`,
          },
          body: JSON.stringify({ product: product.id }),
        },
      );

      const result = await response.json();
      if (response.ok && result.status === 1) {
        await fetchCart();
        toast({
          title: "Added to Cart",
          description: `${product.name} has been added to your cart.`,
          variant: "success",
        });
      } else {
        toast({
          title: "Error",
          description: result.message || "Could not add item to cart.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Network Error",
        description: "Could not connect to server.",
        variant: "destructive",
      });
    }
  };

  const removeItem = async (productId: string) => {
    const currentToken = localStorage.getItem("authToken");
    if (!currentToken) return;
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/cart/items`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${currentToken}`,
          },
          body: JSON.stringify({ product: productId }),
        },
      );
      const result = await response.json();
      if (response.ok && result.status === 1) {
        dispatch({ type: "REMOVE_ITEM", payload: productId });
        toast({
          title: "Item Removed",
          description: "The item has been removed from your cart.",
          variant: "success",
        });
      } else {
        toast({
          title: "Error",
          description: result.message || "Could not remove item from cart.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error(error);
      toast({
        title: "Network Error",
        description: "Could not remove item.",
        variant: "destructive",
      });
    }
  };

  const updateQuantity = async (productId: string, quantity: number) => {
    const existingItem = state.items.find(
      (item) => item.product.id === productId,
    );
    if (!existingItem) return;

    if (quantity > existingItem.quantity) {
      await addItem(existingItem.product);
      return;
    }

    if (quantity < existingItem.quantity) {
      const currentToken = localStorage.getItem("authToken");
      if (!currentToken) return;

      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/cart/remove-item`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${currentToken}`,
            },
            body: JSON.stringify({ product: productId }),
          },
        );

        const result = await response.json();
        if (response.ok && result.status === 1) {
          await fetchCart();
        } else {
          toast({
            title: "Error",
            description: result.message || "Could not update quantity.",
            variant: "destructive",
          });
        }
      } catch (error) {
        console.error(error);
        toast({
          title: "Network Error",
          description: "Could not update quantity.",
          variant: "destructive",
        });
      }
      return;
    }
  };

  const clearCart = async () => {
    const currentToken = localStorage.getItem("authToken");
    if (!currentToken) return;
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/cart/clear`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${currentToken}` },
        },
      );
      const result = await response.json();
      if (response.ok && result.status === 1) {
        dispatch({ type: "CLEAR_CART" });
        toast({
          title: "Cart Cleared",
          description: "Your shopping cart is now empty.",
          variant: "success",
        });
      } else {
        toast({
          title: "Error",
          description: result.message || "Could not clear the cart.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error(error);
      toast({
        title: "Network Error",
        description: "Could not clear the cart.",
        variant: "destructive",
      });
    }
  };

  const getTotalPrice = () => {
    return state.items.reduce((total, item) => {
      const price =
        item.product.discount && item.product.discount > 0
          ? item.product.price * (1 - item.product.discount / 100)
          : item.product.price;
      return total + price * item.quantity;
    }, 0);
  };

  const getItemCount = () => {
    return state.items.reduce((count, item) => count + item.quantity, 0);
  };

  return (
    <CartContext.Provider
      value={{
        ...state,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        getTotalPrice,
        getItemCount,
        fetchCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = (): CartContextType => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
};

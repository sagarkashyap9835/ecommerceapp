import React, {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";
import { Product } from "../constants/types";
import { useAuth } from "@clerk/expo";
import { useRouter } from "expo-router";
import Toast from "react-native-toast-message";
import api from "../constants/api";

export type CartItem = {
  id: string; // unique item identifier (productId + size)
  productId: string;
  product: Product;
  quantity: number;
  size: string;
  price: number;
};

type CartContextType = {
  cartItems: CartItem[];
  addToCart: (product: Product, size: string) => Promise<void>;
  removeFromCart: (itemId: string) => Promise<void>;
  updateQuantity: (
    itemId: string,
    quantity: number,
    size: string
  ) => Promise<void>;
  clearCart: () => Promise<void>;
  cartTotal: number;
  itemCount: number;
  isLoading: boolean;
};

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const { getToken, isSignedIn } = useAuth();
  const router = useRouter();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [cartTotal, setCartTotal] = useState(0);

  const mapServerCart = (items: any[]): CartItem[] => {
    if (!Array.isArray(items)) return [];
    return items.map((item: any) => {
      const prodObj = typeof item.product === "object" ? item.product : {};
      const prodId = prodObj._id || item.product;
      const sizeVal = item.size || "";
      return {
        id: `${prodId}-${sizeVal}`,
        productId: prodId,
        product: {
          _id: prodId,
          name: prodObj.name || item.name || "Product",
          price: item.price || prodObj.price || 0,
          images: prodObj.images || (item.image ? [item.image] : ["https://via.placeholder.com/150"]),
          description: prodObj.description || "",
          stock: prodObj.stock ?? 99,
          ratings: prodObj.ratings || { average: 4.8, count: 10 },
          isFeatured: prodObj.isFeatured || false,
          isActive: prodObj.isActive ?? true,
          createdAt: prodObj.createdAt || new Date().toISOString(),
          category: prodObj.category || "Other",
        },
        quantity: item.quantity,
        size: sizeVal,
        price: item.price || prodObj.price || 0,
      };
    });
  };

  const fetchCart = async () => {
    if (!isSignedIn) {
      setCartItems([]);
      return;
    }

    try {
      setIsLoading(true);
      const token = await getToken();
      const { data } = await api.get("/cart", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (data.success && data.data?.items) {
        setCartItems(mapServerCart(data.data.items));
      }
    } catch (error) {
      console.error("Error fetching user cart:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const addToCart = async (product: Product, size: string) => {
    if (!isSignedIn) {
      Toast.show({
        type: "info",
        text1: "Please Sign In",
        text2: "Please login to add items to your cart.",
      });
      router.push("/(auth)/sign-in" as any);
      return;
    }

    if (product.sizes && product.sizes.length > 0 && (!size || size.trim() === "")) {
      Toast.show({
        type: "info",
        text1: "Select Size",
        text2: "Please select a size first before adding to cart.",
      });
      return;
    }

    try {
      setIsLoading(true);
      const token = await getToken();
      const { data } = await api.post(
        "/cart/add",
        {
          productId: product._id,
          quantity: 1,
          size: size || "",
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (data.success && data.data?.items) {
        setCartItems(mapServerCart(data.data.items));
        Toast.show({
          type: "success",
          text1: "Added to Cart 🎉",
          text2: `${product.name} has been added to your cart.`,
        });
      }
    } catch (error: any) {
      console.error("Error adding to cart:", error);
      Toast.show({
        type: "error",
        text1: "Failed to Add",
        text2: error.response?.data?.message || "Could not add item to cart",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const removeFromCart = async (itemId: string) => {
    if (!isSignedIn) return;

    const targetItem = cartItems.find((i) => i.id === itemId);
    if (!targetItem) return;

    try {
      const token = await getToken();
      const { data } = await api.delete(`/cart/item/${targetItem.productId}`, {
        headers: { Authorization: `Bearer ${token}` },
        data: { size: targetItem.size || "" },
      });

      if (data.success && data.data?.items) {
        setCartItems(mapServerCart(data.data.items));
        Toast.show({
          type: "info",
          text1: "Item Removed",
          text2: "Item removed from cart",
        });
      }
    } catch (error: any) {
      console.error("Error removing from cart:", error);
    }
  };

  const updateQuantity = async (
    itemId: string,
    quantity: number,
    size: string
  ) => {
    if (!isSignedIn) return;

    if (quantity <= 0) {
      await removeFromCart(itemId);
      return;
    }

    const targetItem = cartItems.find((i) => i.id === itemId);
    if (!targetItem) return;

    try {
      const token = await getToken();
      const { data } = await api.put(
        `/cart/item/${targetItem.productId}`,
        {
          quantity,
          size: size || targetItem.size || "",
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (data.success && data.data?.items) {
        setCartItems(mapServerCart(data.data.items));
      }
    } catch (error: any) {
      console.error("Error updating cart quantity:", error);
      Toast.show({
        type: "error",
        text1: "Error",
        text2: error.response?.data?.message || "Failed to update quantity",
      });
    }
  };

  const clearCart = async () => {
    if (isSignedIn) {
      try {
        const token = await getToken();
        await api.delete("/cart", {
          headers: { Authorization: `Bearer ${token}` },
        });
      } catch (error) {
        console.error("Error clearing cart:", error);
      }
    }
    setCartItems([]);
    setCartTotal(0);
  };

  useEffect(() => {
    fetchCart();
  }, [isSignedIn]);

  useEffect(() => {
    const total = cartItems.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );
    setCartTotal(total);
  }, [cartItems]);

  const itemCount = cartItems.reduce(
    (sum, item) => sum + item.quantity,
    0
  );

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        cartTotal,
        itemCount,
        isLoading,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within CartProvider");
  }
  return context;
}
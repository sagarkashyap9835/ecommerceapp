import React, {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";
import { Product } from "../constants/types";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "expo-router";
import Toast from "react-native-toast-message";
import api from "../constants/api";

export type CartItem = {
  id: string; // unique item identifier (productId + size)
  productId: string;
  product: Product;
  quantity: number;
  size: string;
  color?: string;
  price: number;
};

type CartContextType = {
  cartItems: CartItem[];
  addToCart: (product: Product, size: string, color?: string) => Promise<void>;
  removeFromCart: (itemId: string) => Promise<void>;
  updateQuantity: (
    itemId: string,
    quantity: number,
    size: string,
    color?: string
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
      const colorVal = item.color || "";
      return {
        id: `${prodId}-${sizeVal}-${colorVal}`,
        productId: prodId,
        product: {
          _id: prodId,
          name: prodObj.name || item.name || "Product",
          price: item.price || prodObj.price || 0,
          images: prodObj.images || (item.image ? [item.image] : ["https://placehold.co/150x150/png?text=Product"]),
          description: prodObj.description || "",
          stock: prodObj.stock ?? 99,
          ratings: prodObj.ratings || { average: 4.8, count: 10 },
          isFeatured: prodObj.isFeatured || false,
          isActive: prodObj.isActive ?? true,
          createdAt: prodObj.createdAt || new Date().toISOString(),
          category: prodObj.category || "Other",
          sale: prodObj.sale,
        },
        quantity: item.quantity,
        size: sizeVal,
        color: colorVal,
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
    } catch (error: any) {
      console.error("Error fetching user cart:", error.response?.data || error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const addToCart = async (product: Product, size: string, color: string = "") => {
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

    // Check if product is out of stock
    if (product.stock !== undefined && product.stock <= 0) {
      Toast.show({
        type: "error",
        text1: "Out of Stock ⚠️",
        text2: "This product is currently out of stock.",
      });
      return;
    }

    // Check if total quantity in cart would exceed stock
    const existingCartItem = cartItems.find(
      (i) => i.productId === product._id && (i.size || "") === (size || "") && (i.color || "") === (color || "")
    );
    const currentQtyInCart = existingCartItem ? existingCartItem.quantity : 0;
    if (product.stock !== undefined && currentQtyInCart + 1 > product.stock) {
      Toast.show({
        type: "error",
        text1: "Stock Limit Reached ⚠️",
        text2: product.stock > 0
          ? `Only ${product.stock} units available in stock.`
          : "This product is currently out of stock.",
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
          color: color || "",
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
      const serverMessage = error.response?.data?.message || "Could not add item to cart";
      const isOutOfStock = serverMessage.toLowerCase().includes("stock") || serverMessage.toLowerCase().includes("out of stock");

      Toast.show({
        type: "error",
        text1: isOutOfStock ? "Out of Stock ⚠️" : "Cannot Add to Cart",
        text2: serverMessage,
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
        data: { size: targetItem.size || "", color: targetItem.color || "" },
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
    size: string,
    color: string = ""
  ) => {
    if (!isSignedIn) return;

    if (quantity <= 0) {
      await removeFromCart(itemId);
      return;
    }

    const targetItem = cartItems.find((i) => i.id === itemId);
    if (!targetItem) return;

    // Check available stock on frontend before making network request
    const availableStock = targetItem.product?.stock ?? 99;
    if (quantity > availableStock) {
      Toast.show({
        type: "error",
        text1: "Stock Limit Reached ⚠️",
        text2: availableStock > 0
          ? `Only ${availableStock} units available in stock.`
          : "This product is out of stock.",
      });
      return;
    }

    try {
      const token = await getToken();
      const { data } = await api.put(
        `/cart/item/${targetItem.productId}`,
        {
          quantity,
          size: size || targetItem.size || "",
          color: color || targetItem.color || "",
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (data.success && data.data?.items) {
        setCartItems(mapServerCart(data.data.items));
      }
    } catch (error: any) {
      const errorMsg = error.response?.data?.message || "Could not update item quantity.";
      Toast.show({
        type: "error",
        text1: "Stock Limit Reached ⚠️",
        text2: errorMsg,
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
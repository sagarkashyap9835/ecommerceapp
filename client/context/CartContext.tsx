import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";
import { Product } from "../constants/types";

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
  // शुरुआत में कार्ट को खाली [] रखेंगे ताकि 0 आइटम्स दिखें
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [cartTotal, setCartTotal] = useState(0);

  const addToCart = async (product: Product, size: string) => {
    // productId और size दोनों के आधार पर चेक करें ताकि अलग साइज़ अलग आइटम बने
    const existingItem = cartItems.find(
      (item) => item.productId === product._id && item.size === size
    );

    if (existingItem) {
      const updated = cartItems.map((item) =>
        item.id === existingItem.id
          ? { ...item, quantity: item.quantity + 1 }
          : item
      );
      setCartItems(updated);
    } else {
      const newItem: CartItem = {
        id: `${product._id}-${size}`, // unique dynamic ID
        productId: product._id,
        product,
        quantity: 1,
        size,
        price: product.price,
      };
      setCartItems([...cartItems, newItem]);
    }
  };

  const removeFromCart = async (itemId: string) => {
    setCartItems(cartItems.filter((item) => item.id !== itemId));
  };

  const updateQuantity = async (
    itemId: string,
    quantity: number,
    size: string
  ) => {
    if (quantity <= 0) {
      removeFromCart(itemId);
      return;
    }

    const updated = cartItems.map((item) =>
      item.id === itemId ? { ...item, quantity, size } : item
    );
    setCartItems(updated);
  };

  const clearCart = async () => {
    setCartItems([]);
    setCartTotal(0);
  };

  // जब भी आइटम या उनकी क्वांटिटी बदले, Total Price को अपडेट करें
  useEffect(() => {
    const total = cartItems.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );
    setCartTotal(total);
  }, [cartItems]);

  // टोटल क्वांटिटी काउंट करने के लिए
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
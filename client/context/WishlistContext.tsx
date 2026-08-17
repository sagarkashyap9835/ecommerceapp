import React, { createContext, ReactNode, useContext, useEffect, useState } from "react";
import { WishlistContextType, Product } from "../constants/types";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "expo-router";
import Toast from "react-native-toast-message";
import api from "../constants/api";
import { applyFirstOrderDiscount } from "../src/utils/discountLogic";

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export function WishlistProvider({ children }: { children: ReactNode }) {
    const { getToken, isSignedIn, firstOrderOffer } = useAuth();
    const router = useRouter();
    const [wishlist, setWishlist] = useState<Product[]>([]);
    const [loading, setLoading] = useState(false);

    const fetchWishlist = async () => {
        if (!isSignedIn) {
            setWishlist([]);
            return;
        }

        try {
            setLoading(true);
            const token = await getToken();
            const { data } = await api.get("/wishlist", {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (data.success && data.data?.products) {
                let parsedProducts = data.data.products;
                if (firstOrderOffer) {
                    parsedProducts = parsedProducts.map((p: any) => applyFirstOrderDiscount(p, firstOrderOffer));
                }
                setWishlist(parsedProducts);
            }
        } catch (error: any) {
            console.error("Failed to fetch wishlist:", error.response?.data || error.message);
        } finally {
            setLoading(false);
        }
    };

    const toggleWishlist = async (product: Product) => {
        if (!isSignedIn) {
            Toast.show({
                type: "info",
                text1: "Please Sign In",
                text2: "Please login to manage your wishlist."
            });
            router.push("/(auth)/sign-in" as any);
            return;
        }

        const exists = wishlist.some((p) => p._id === product._id);

        try {
            const token = await getToken();

            if (exists) {
                const { data } = await api.delete(`/wishlist/${product._id}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });

                if (data.success && data.data?.products) {
                    setWishlist(data.data.products);
                } else {
                    setWishlist((prev) => prev.filter((p) => p._id !== product._id));
                }

                Toast.show({
                    type: "info",
                    text1: "Wishlist Updated",
                    text2: `${product.name} removed from wishlist.`
                });
            } else {
                const { data } = await api.post(`/wishlist/${product._id}`, {}, {
                    headers: { Authorization: `Bearer ${token}` }
                });

                if (data.success && data.data?.products) {
                    setWishlist(data.data.products);
                } else {
                    setWishlist((prev) => [...prev, product]);
                }

                Toast.show({
                    type: "success",
                    text1: "Wishlist Updated ❤️",
                    text2: `${product.name} added to wishlist.`
                });
            }
        } catch (error: any) {
            console.error("Failed to toggle wishlist:", error);
            Toast.show({
                type: "error",
                text1: "Error",
                text2: error.response?.data?.message || "Failed to update wishlist"
            });
        }
    };

    const isInWishlist = (productId: string) => {
        return wishlist.some((p) => p._id === productId);
    };

    useEffect(() => {
        fetchWishlist();
    }, [isSignedIn]);

    return (
        <WishlistContext.Provider value={{ wishlist, loading, isInWishlist, toggleWishlist }}>
            {children}
        </WishlistContext.Provider>
    );
}

export function useWishlist() {
    const context = useContext(WishlistContext);
    if (context === undefined) {
        throw new Error("useWishlist must be used within a WishlistProvider");
    }
    return context;
}

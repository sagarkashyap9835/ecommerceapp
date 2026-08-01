
import {
  View,
  Text,
  ActivityIndicator,
  ScrollView,
  Dimensions,
  Image,
  TouchableOpacity,
  Alert,
} from "react-native";
import React, { useEffect, useState } from "react";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Product } from "@/assets/constants/types";
import { useCart } from "../../../context/CartContext";
import { useWishlist } from "../../../context/WishlistContext";

import { SafeAreaView } from "react-native-safe-area-context";
import { COLORS } from "@/assets/constants";
import { Ionicons } from "@expo/vector-icons";
import Toast from "react-native-toast-message";
import api from "../../../constants/api";

const { width } = Dimensions.get("window");

export default function ProductDetails() {
  const { id } = useLocalSearchParams();
  const router = useRouter();

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);

  const { addToCart, cartItems, itemCount, updateQuantity } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();

  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  const fetchProduct = async () => {
    try {
      const { data } = await api.get(`/products/${id}`);
      setProduct(data.data);
    } catch (error: any) {
      Toast.show({
        type: "error",
        text1: "Failed to fetch product",
        text2: error.response?.data?.message || "Something went wrong"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProduct();
  }, [id]);

  if (loading) {
    return (
      <SafeAreaView className="flex-1 justify-center items-center">
        <ActivityIndicator size="large" color={COLORS.primary} />
      </SafeAreaView>
    );
  }

  if (!product) {
    return (
      <SafeAreaView className="flex-1 justify-center items-center">
        <Text>Product not found</Text>
      </SafeAreaView>
    );
  }

  const isLiked = isInWishlist(product._id);

  // आपके context के लॉजिक के अनुसार productId और size से सही आइटम खोजना
  const currentCartItem = cartItems.find(
    (item) => item.productId === product._id && item.size === selectedSize
  );

  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView contentContainerStyle={{ paddingBottom: 120 }} showsVerticalScrollIndicator={false}>
        {/* Image Carousel */}
        <View className="relative">
          <ScrollView
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            scrollEventThrottle={16}
            onMomentumScrollEnd={(event) => {
              const index = Math.round(
                event.nativeEvent.contentOffset.x / width
              );
              setActiveImageIndex(index);
            }}
          >
            {product.images?.map((img, index) => (
              <Image
                key={index}
                source={{ uri: img }}
                style={{
                  width,
                  height: 420,
                }}
                resizeMode="cover"
              />
            ))}
          </ScrollView>

          {/* Header Actions */}
          <View
            style={{
              position: "absolute",
              top: 20,
              left: 20,
              right: 20,
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <TouchableOpacity
              onPress={() => {
                if (router.canGoBack()) {
                  router.back();
                } else {
                  router.replace("/");
                }
              }}
              style={{
                width: 38,
                height: 38,
                borderRadius: 19,
                backgroundColor: "#FFFFFF",
                justifyContent: "center",
                alignItems: "center",
                elevation: 2,
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.1,
                shadowRadius: 2,
              }}
            >
              <Ionicons name="arrow-back" size={22} color="#111827" />
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => toggleWishlist(product)}
              style={{
                width: 38,
                height: 38,
                borderRadius: 19,
                backgroundColor: "#FFFFFF",
                justifyContent: "center",
                alignItems: "center",
                elevation: 2,
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.1,
                shadowRadius: 2,
              }}
            >
              <Ionicons
                name={isLiked ? "heart" : "heart-outline"}
                size={22}
                color={isLiked ? "#EF4444" : "#111827"}
              />
            </TouchableOpacity>
          </View>

          {/* Pagination Dots */}
          <View
            style={{
              position: "absolute",
              bottom: 15,
              width: "100%",
              flexDirection: "row",
              justifyContent: "center",
            }}
          >
            {product.images?.map((_, index) => (
              <View
                key={index}
                style={{
                  width: activeImageIndex === index ? 14 : 7,
                  height: 7,
                  borderRadius: 4,
                  marginHorizontal: 3,
                  backgroundColor:
                    activeImageIndex === index
                      ? "#111827"
                      : "rgba(17,24,39,0.2)",
                }}
              />
            ))}
          </View>
        </View>

        {/* Product Info */}
        <View style={{ backgroundColor: "#fff", paddingHorizontal: 20, paddingVertical: 24 }}>
          {/* Header Row: Title & Rating */}
          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" }}>
            <Text style={{ fontSize: 22, fontWeight: "700", color: "#111827", flex: 1, marginRight: 16 }}>
              {product.name}
            </Text>
            
            {/* Rating layout from template */}
            <View style={{ flexDirection: "row", alignItems: "center", marginTop: 4 }}>
              <Ionicons name="star" size={15} color="#FBBF24" />
              <Text style={{ marginLeft: 4, fontSize: 14, fontWeight: "700", color: "#111827" }}>
                {product?.ratings?.average ? product.ratings.average.toFixed(1) : "4.8"}
              </Text>
              <Text style={{ fontSize: 13, color: "#9CA3AF", marginLeft: 2 }}>
                ({product?.ratings?.count ?? 0})
              </Text>
            </View>
          </View>

          {/* Price Style matching template */}
          <Text style={{ fontSize: 22, fontWeight: "700", color: "#111827", marginTop: 8 }}>
            ₹{product.price.toFixed(2)}
          </Text>

          {/* Sizes Section - Borderless minimalist circles from image */}
          <View style={{ marginTop: 28 }}>
            <Text style={{ fontSize: 15, fontWeight: "700", color: "#111827", marginBottom: 16 }}>
              Size
            </Text>
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              {product.sizes?.map((size) => {
                const isSelected = selectedSize === size;
                return (
                  <TouchableOpacity
                    key={size}
                    onPress={() => setSelectedSize(size)}
                    style={{
                      width: 42,
                      height: 42,
                      borderRadius: 21,
                      backgroundColor: isSelected ? "#111827" : "transparent",
                      justifyContent: "center",
                      alignItems: "center",
                      marginRight: 14,
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 14,
                        fontWeight: isSelected ? "700" : "500",
                        color: isSelected ? "#FFFFFF" : "#4B5563",
                      }}
                    >
                      {size}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* Description */}
          <View style={{ marginTop: 28 }}>
            <Text style={{ fontSize: 15, fontWeight: "700", color: "#111827", marginBottom: 8 }}>
              Description
            </Text>
            <Text style={{ fontSize: 14, color: "#4B5563", lineHeight: 22 }}>
              {product.description}
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* Fixed Bottom Action Bar */}
      <View
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          backgroundColor: "#fff",
          paddingHorizontal: 20,
          paddingVertical: 14,
          paddingBottom: 28,
          flexDirection: "row",
          alignItems: "center",
          borderTopWidth: 1,
          borderTopColor: "#F3F4F6",
        }}
      >
        {/* Main Black Pill Button: Add To Cart / Plus Minus Toggle */}
        <View style={{ flex: 1, marginRight: 20 }}>
          {currentCartItem ? (
            /* Quantity Counter Mode inside Black Pill */
            <View
              style={{
                height: 52,
                backgroundColor: "#111827",
                borderRadius: 26,
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
                paddingHorizontal: 20,
              }}
            >
              <TouchableOpacity
                onPress={() => {
                  updateQuantity(currentCartItem.id, currentCartItem.quantity - 1, currentCartItem.size);
                }}
                style={{ padding: 4 }}
              >
                <Ionicons name="remove" size={22} color="#fff" />
              </TouchableOpacity>

              <Text style={{ fontSize: 16, fontWeight: "700", color: "#fff" }}>
                {currentCartItem.quantity}
              </Text>

              <TouchableOpacity
                onPress={() => {
                  updateQuantity(currentCartItem.id, currentCartItem.quantity + 1, currentCartItem.size);
                }}
                style={{ padding: 4 }}
              >
                <Ionicons name="add" size={22} color="#fff" />
              </TouchableOpacity>
            </View>
          ) : (
            /* Standard Add To Cart Mode */
            <TouchableOpacity
              onPress={async () => {
                if (product.sizes && product.sizes.length > 0 && !selectedSize) {
                  Toast.show({
                    type: "info",
                    text1: "Select Size",
                    text2: "Please select a size first before adding to cart.",
                  });
                  return;
                }
                await addToCart(product, selectedSize || "");
              }}
              style={{
                height: 52,
                backgroundColor: "#111827",
                borderRadius: 26,
                justifyContent: "center",
                alignItems: "center",
                flexDirection: "row",
              }}
            >
              <Ionicons name="bag-handle-outline" size={18} color="#fff" />
              <Text style={{ color: "#fff", fontSize: 15, fontWeight: "600", marginLeft: 8 }}>
                Add to Cart
              </Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Right Side Minimalist Cart Icon with Badge */}
        <TouchableOpacity
          onPress={() => router.push("/cart")}
          style={{
            justifyContent: "center",
            alignItems: "center",
            position: "relative",
            padding: 6,
          }}
        >
          <Ionicons name="cart-outline" size={26} color="#111827" />
          
          {/* Item Count Floating Badge */}
          {itemCount > 0 && (
            <View
              style={{
                position: "absolute",
                top: 0,
                right: -2,
                backgroundColor: "#111827",
                borderRadius: 9,
                width: 17,
                height: 17,
                justifyContent: "center",
                alignItems: "center",
                borderWidth: 1.5,
                borderColor: "#FFFFFF"
              }}
            >
              <Text style={{ color: "#fff", fontSize: 8, fontWeight: "700" }}>
                {itemCount}
              </Text>
            </View>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}


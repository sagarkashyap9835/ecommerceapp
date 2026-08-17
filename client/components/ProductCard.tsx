import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  Dimensions,
} from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { LinearGradient } from "expo-linear-gradient";
import { Link } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { COLORS } from "../constants";
import { ProductCardProps } from "../constants/types";
import { useWishlist } from "../context/WishlistContext";
import AnimatedButton from "./AnimatedButton";
import Toast from "react-native-toast-message";

const { width } = Dimensions.get("window");

export default function ProductCard({ product, index = 0, disableAnimation = false }: ProductCardProps) {
  const { toggleWishlist, isInWishlist } = useWishlist();
  const isLiked = isInWishlist(product._id);

  return (
    <Animated.View
      entering={disableAnimation ? undefined : FadeInDown.delay(index * 100).springify()}
      style={{
        width: (width - 44) / 2, // Adjusted for 2 columns
        marginBottom: 20,
      }}
    >
      <Link
        href={{
          pathname: "/product/[id]",
          params: { id: product._id },
        }}
        asChild
      >
        <TouchableOpacity activeOpacity={0.88}>
          {/* Product Image Container */}
          <View
            style={{
              backgroundColor: "#F1F5F9", // Soft light gray like the screenshot
              borderTopLeftRadius: 16,
              borderTopRightRadius: 16,
              overflow: "hidden",
              position: "relative",
              height: 220,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Image
              source={{
                uri:
                  product.images && product.images.length > 0
                    ? product.images[0]
                    : "https://placehold.co/180x180/png?text=Product",
              }}
              style={{
                width: "100%",
                height: "100%",
              }}
              resizeMode="cover"
            />

            {/* Out of stock overlay */}
            {product.stock !== undefined && product.stock <= 0 && (
              <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center', alignItems: 'center' }}>
                <View style={{ backgroundColor: '#DC2626', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 }}>
                  <Text style={{ color: '#FFFFFF', fontSize: 11, fontWeight: '700' }}>Out of Stock</Text>
                </View>
              </View>
            )}

            {/* Favourite (Wishlist) Button */}
            <AnimatedButton
              style={{
                position: "absolute",
                top: 10,
                right: 10,
                width: 32,
                height: 32,
                borderRadius: 16,
                backgroundColor: "#FFFFFF",
                alignItems: "center",
                justifyContent: "center",
              }}
              onPress={(e: any) => {
                e.stopPropagation();
                toggleWishlist(product);
                Toast.show({
                  type: 'success',
                  text1: isLiked ? 'Removed from Wishlist' : 'Added to Wishlist',
                  text2: product.name,
                  position: 'bottom',
                  visibilityTime: 2000,
                  bottomOffset: 80,
                });
              }}
            >
              <Ionicons
                name={isLiked ? "heart" : "heart-outline"}
                size={18}
                color={isLiked ? "#FF3399" : "#475569"}
              />
            </AnimatedButton>

            {/* BUY 1 GET 1 / BOGO BADGE (Optional) */}
            {product.isBogo ? (
              <View style={{ backgroundColor: "#0284C7" }} className="absolute top-3 left-3 px-2.5 py-1 rounded-md shadow-sm">
                <Text className="text-white text-[10px] font-extrabold" style={{ fontFamily: "Outfit_800" }}>
                  BUY 1 FREE
                </Text>
              </View>
            ) : null}

            {/* SALE BADGE */}
            {product.sale?.isOnSale ? (
              <View style={{ backgroundColor: product.sale?.discountType === "FIRST_ORDER" ? "#2563EB" : "#F43F5E", position: 'absolute', bottom: 10, left: 10, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 }}>
                <Text style={{ color: "#FFF", fontSize: 9, fontWeight: "800", fontFamily: "Outfit_800" }}>
                  {product.sale?.discountType === "FIRST_ORDER" && "🎉 "}{product.sale.saleName}
                </Text>
              </View>
            ) : null}
          </View>

          {/* Details */}
          <LinearGradient
            colors={["#FFF0F5", "#FCE7F3"]}
            style={{
              paddingVertical: 10,
              paddingHorizontal: 12,
              borderBottomLeftRadius: 16,
              borderBottomRightRadius: 16,
              shadowColor: "#000",
              shadowOpacity: 0.05,
              shadowRadius: 4,
              elevation: 2,
            }}
          >
            {/* Title - Blue color */}
            <Text
              numberOfLines={1}
              style={{
                fontSize: 12,
                fontWeight: "700",
                color: "#0284C7",
                fontFamily: "Outfit_700",
                marginBottom: 4,
              }}
            >
              {product.name}
            </Text>

            {/* Price and Add Button Row */}
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <View style={{ flexDirection: "column" }}>
                {product.sale?.isOnSale && (
                  <Text style={{ fontSize: 10, color: "#9CA3AF", textDecorationLine: "line-through", marginBottom: 1 }}>
                    ₹{product.price}
                  </Text>
                )}
                <Text
                  style={{
                    fontSize: 14,
                    fontWeight: "800",
                    color: product.sale?.isOnSale ? "#F43F5E" : "#111827",
                    fontFamily: "Outfit_800",
                  }}
                >
                  ₹{product.sale?.isOnSale ? product.sale.salePrice : product.price}
                </Text>
                {product.sale?.isOnSale && (
                  <Text style={{ fontSize: 9, color: "#10B981", fontWeight: "700" }}>
                    Save ₹{product.sale.discountAmount}
                  </Text>
                )}
              </View>

              {/* Ratings and Reviews */}
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <Ionicons name="star" size={12} color="#FBBF24" />
                <Text style={{ fontSize: 12, fontWeight: "600", color: "#6B7280", marginLeft: 4 }}>
                  {product.ratings?.count ? product.ratings.average.toFixed(1) : "0.0"}
                </Text>
                <Text style={{ fontSize: 10, color: "#9CA3AF", marginLeft: 4 }}>
                  ({product.ratings?.count ?? 0})
                </Text>
              </View>
            </View>
          </LinearGradient>
        </TouchableOpacity>
      </Link>
    </Animated.View>
  );
}
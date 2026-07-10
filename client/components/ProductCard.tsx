import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  Dimensions,
} from "react-native";
import { Link } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { COLORS } from "../constants";
import { ProductCardProps } from "../constants/types";

const { width } = Dimensions.get("window");

export default function ProductCard({ product }: ProductCardProps) {
  const isLiked = true;

  return (
    <View
      style={{
        width: (width - 56) / 2,
        marginBottom: 16,
      }}
    >
 <Link href={`/product/${product._id}`} asChild>
    <TouchableOpacity
      activeOpacity={0.9}
      className="bg-white rounded-2xl overflow-hidden bg-white"
      style={{
        elevation: 3,
        shadowColor: "#000",
        shadowOpacity: 0.08,
        shadowRadius: 5,
        shadowOffset: {
          width: 0,
          height: 2,
        },
      }}
    >
          {/* Product Image */}
          <View className="relative">
            <Image
              source={{ uri: product.images[0] }}
              style={{
                width: "100%",
                height: 180,
              }}
              resizeMode="cover"
            />

            {/* Favourite */}
            <TouchableOpacity className="absolute top-3 right-3 w-9 h-9 rounded-full bg-white items-center justify-center">
              <Ionicons
                name={isLiked ? "heart" : "heart-outline"}
                size={20}
                color={isLiked ? COLORS.accent : COLORS.primary}
              />
            </TouchableOpacity>

            {/* Featured */}
            {product.isFeatured && (
              <View className="absolute top-3 left-3 bg-red-500 px-2 py-1 rounded-full">
                <Text className="text-white text-[10px] font-semibold">
                  Featured
                </Text>
              </View>
            )}
          </View>

          {/* Details */}
          <View className="p-3">
            <Text
              numberOfLines={1}
              className="text-base font-bold text-gray-900"
            >
              {product.name}
            </Text>

            <Text
              numberOfLines={2}
              className="text-xs text-gray-500 mt-1"
            >
              {product.description}
            </Text>

            <View className="flex-row justify-between items-center mt-3">
              <Text className="text-lg font-bold text-red-500">
                ₹{product.price}
              </Text>

              <View className="flex-row items-center">
                <Ionicons
                  name="star"
                  size={14}
                  color="#FBBF24"
                />
                <Text className="ml-1 text-xs font-semibold">
                  {product.rating ?? "4.8"}
                </Text>
              </View>
            </View>
          </View>
        </TouchableOpacity>
      </Link>
    </View>
  );
}
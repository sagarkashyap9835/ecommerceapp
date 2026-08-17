import React from 'react'
import { View, Text, TouchableOpacity, Image } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { COLORS } from '../constants'
import { getColorName } from '../utils/colors'

// 1. इंटरफ़ेस को अपडेट किया ताकि context की सही 'id' और 'size' मैच हो सके
interface CartItemComponentProps {
  item: {
    id: string; // Context की यूनिक ID (productId-size)
    productId: string;
    price: number;
    product: {
      _id: string;
      name: string;
      price: number;
      images: string[];
      stock?: number;
      sale?: any;
    };
    quantity: number;
    size: string; // size को string रखा ताकि context में सही से पास हो
    color?: string;
  };
  onRemove: (id: string) => void;
  onUpdateQuantity: (id: string, quantity: number, size: string, color?: string) => void;
}

export default function CartItem({ item, onRemove, onUpdateQuantity }: CartItemComponentProps) {
  // पहली इमेज का URL safely निकालना
  const imageUrl = item?.product?.images && item.product.images[0]
  const availableStock = item?.product?.stock;

  return (
    <View className="flex-row items-center bg-white p-3 rounded-2xl mb-3 shadow-sm border border-gray-100">

      {/* Product Image */}
      <Image
        source={{ uri: imageUrl || 'https://placehold.co/80x80/png?text=Product' }}
        className="w-20 h-20 rounded-xl bg-gray-50"
        resizeMode="cover"
      />

      {/* Product Details */}
      <View className="flex-1 ml-3 justify-between h-20">

        {/* ऊपर का हिस्सा: नाम, साइज़, स्टॉक और डिलीट बटन */}
        <View className="flex-row justify-between items-start">
          <View className="flex-1 pr-2">
            <Text numberOfLines={1} className="text-sm font-semibold text-gray-800">
              {item?.product?.name}
            </Text>
            <View className="flex-row items-center flex-wrap gap-1 mt-0.5">
              {item?.size ? (
                <Text className="text-xs text-gray-400">Size: {item.size}</Text>
              ) : null}
              {item?.color ? (
                <Text className="text-xs text-gray-400">Color: {getColorName(item.color)}</Text>
              ) : null}
              {availableStock !== undefined && (
                <Text className={`text-xs ${availableStock <= 5 ? "text-amber-600 font-semibold" : "text-gray-400"}`}>
                  {item?.size ? "• " : ""}{availableStock <= 5 ? `Only ${availableStock} left!` : `Stock: ${availableStock}`}
                </Text>
              )}
            </View>
          </View>

          {/* Remove Button */}
          <TouchableOpacity
            onPress={() => onRemove(item.id)}
            activeOpacity={0.7}
          >
            <Ionicons name="trash-outline" size={18} color="#ef4444" />
          </TouchableOpacity>
        </View>

        {/* नीचे का हिस्सा: प्राइस और क्वांटिटी कंट्रोल्स */}
        <View className="flex-row justify-between items-center">
          <View>
            {item.product.price > item.price && (
              <Text className="text-xs text-gray-400 line-through">
                ₹{(item.product.price * item.quantity).toFixed(2)}
              </Text>
            )}
            <Text className="text-base font-bold text-gray-900">
              ₹{(item.price * item.quantity).toFixed(2)}
            </Text>
            {/* Show badge if FIRST ORDER */}
            {item.product?.sale?.discountType === 'FIRST_ORDER' && (
              <Text className="text-[10px] text-blue-600 font-bold mt-0.5">🎉 FIRST ORDER OFFER</Text>
            )}
            {item.product?.sale?.discountType === 'FESTIVAL_SALE' && (
              <Text className="text-[10px] text-rose-600 font-bold mt-0.5">SALE 🛍️</Text>
            )}
          </View>

          {/* Quantity Selector */}
          <View className="flex-row items-center bg-gray-50 border border-gray-200 rounded-lg px-2 py-1">

            {/* घटाने का बटन (-) */}
            <TouchableOpacity
              onPress={() => item.quantity > 1 && onUpdateQuantity(item.id, item.quantity - 1, item.size, item.color)}
              disabled={item.quantity <= 1}
              className="p-1"
            >
              <Ionicons
                name="remove"
                size={16}
                color={item.quantity <= 1 ? "#cbd5e1" : "#000"}
              />
            </TouchableOpacity>

            {/* वर्तमान क्वांटिटी */}
            <Text className="mx-3 font-semibold text-sm">{item.quantity}</Text>

            {/* बढ़ाने का बटन (+): Available Stock limit check */}
            <TouchableOpacity
              onPress={() => onUpdateQuantity(item.id, item.quantity + 1, item.size, item.color)}
              disabled={availableStock !== undefined && item.quantity >= availableStock}
              className="p-1"
            >
              <Ionicons
                name="add"
                size={16}
                color={(availableStock !== undefined && item.quantity >= availableStock) ? "#cbd5e1" : "#000"}
              />
            </TouchableOpacity>
          </View>
        </View>

      </View>
    </View>
  )
}
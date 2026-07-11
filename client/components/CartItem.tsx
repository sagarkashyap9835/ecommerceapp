import React from 'react'
import { View, Text, TouchableOpacity, Image } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { COLORS } from '../constants'

// 1. यहाँ हमने कार्ट आइटम के लिए सही TypeScript इंटरफ़ेस डिफाइन कर दिया है
interface CartItemComponentProps {
  item: {
    product: {
      _id: string;
      name: string;
      price: number;
      images: string[];
    };
    quantity: number;
    size?: string;
  };
  onRemove: (id: string) => void;
  onUpdateQuantity: (id: string, quantity: number) => void;
}

export default function CartItem({ item, onRemove, onUpdateQuantity }: CartItemComponentProps) {
  // पहली इमेज का URL निकालना safely
  const imageUrl = item?.product?.images && item.product.images[0]

  return (
    <View className="flex-row items-center bg-white p-3 rounded-2xl mb-3 shadow-sm border border-gray-100">
      
      {/* Product Image */}
      <Image 
        source={{ uri: imageUrl || 'https://via.placeholder.com/80' }} 
        className="w-20 h-20 rounded-xl bg-gray-50"
        resizeMode="cover"
      />

      {/* Product Details */}
      <View className="flex-1 ml-3 justify-between h-20">
        
        {/* ऊपर का हिस्सा: नाम, साइज़ और डिलीट बटन */}
        <View className="flex-row justify-between items-start">
          <View className="flex-1 pr-2">
            <Text numberOfLines={1} className="text-sm font-semibold text-gray-800">
              {item?.product?.name}
            </Text>
            {item?.size && (
              <Text className="text-xs text-gray-400 mt-0.5">Size: {item.size}</Text>
            )}
          </View>
          
          {/* Remove Button */}
          <TouchableOpacity 
            onPress={() => onRemove(item.product._id)} 
            activeOpacity={0.7}
          >
            <Ionicons name="trash-outline" size={18} color="#ef4444" />
          </TouchableOpacity>
        </View>

        {/* नीचे का हिस्सा: प्राइस और क्वांटिटी कंट्रोल्स */}
        <View className="flex-row justify-between items-center">
          <Text className="text-base font-bold text-gray-900">
            ₹{item?.product?.price}
          </Text>

          {/* Quantity Selector */}
          <View className="flex-row items-center bg-gray-50 border border-gray-200 rounded-lg px-2 py-1">
            {/* घटाने का बटन (-) */}
            <TouchableOpacity 
              onPress={() => item.quantity > 1 && onUpdateQuantity(item.product._id, item.quantity - 1)}
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

            {/* बढ़ाने का बटन (+) */}
            <TouchableOpacity 
              onPress={() => onUpdateQuantity(item.product._id, item.quantity + 1)}
              className="p-1"
            >
              <Ionicons name="add" size={16} color="#000" />
            </TouchableOpacity>
          </View>
        </View>

      </View>
    </View>
  )
}
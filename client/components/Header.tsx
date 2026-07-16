import { View, Text, TouchableOpacity, Image } from 'react-native'
import React from 'react'
import { HeaderProps } from '../constants/types'
import { Ionicons } from '@expo/vector-icons'
import { COLORS } from '@/assets/constants'
import { useRouter } from 'expo-router'
import { useCart } from '../context/CartContext' // 1. useCart इम्पोर्ट किया

export default function Header({ title, showBack, showSearch, showCart, showMenu, showLogo }: HeaderProps) {
  const router = useRouter()
  const { itemCount } = useCart() // 2. असली itemCount यहाँ से निकाला

  return (
    <View className='flex-row items-center justify-between px-4 py-3 bg-white'>
      {/* left side */}
      <View className='flex-row items-center flex-1'>
        {showBack && (
          <TouchableOpacity onPress={() => router.back()} className='mr-3'>
            <Ionicons name='arrow-back' size={24} color={COLORS.primary} />
          </TouchableOpacity>
        )}

        {showMenu && (
          <TouchableOpacity className='mr-3'>
            <Ionicons name='menu-outline' size={28} color={COLORS.primary} />
          </TouchableOpacity>
        )}

        {showLogo ? (
          <View className='flex-1'>
            <Image source={require("@/assets/logo.png")} style={{ width: "100%", height: 24 }} resizeMode='contain' />
          </View>
        ) : title && (
          <Text className='text-xl font-bold text_primary text-center flex-1 mr-8' >{title}</Text>
        )}

        {(!title && !showSearch) && <View className='flex-1' />}
      </View>

      {/* right side */}
      <View className='flex-row items-center gap-4'>
        {showSearch && (
          <TouchableOpacity className='mr-3'>
            <Ionicons name='search-outline' size={24} color={COLORS.primary} />
          </TouchableOpacity>
        )}

        {showCart && (
          <TouchableOpacity
            onPress={() => router.push('/(tabs)/cart')}
            className="relative">
            <Ionicons
              name="bag-outline"
              size={24}
              color={COLORS.primary}
            />

            {itemCount > 0 && (
              <View
                className="absolute bg-red-500 rounded-full items-center justify-center"
                style={{
                  top: -6,
                  right: -8,
                  width: 18,
                  height: 18,
                }}
              >
                <Text
                  style={{
                    color: "#fff",
                    fontSize: 10,
                    fontWeight: "bold",
                  }}
                >
                  {itemCount}
                </Text>
              </View>
            )}
          </TouchableOpacity>
        )}
      </View>
    </View>
  )
}
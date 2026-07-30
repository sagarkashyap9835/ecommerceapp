import { View } from 'react-native'
import React from 'react'
import { Tabs } from 'expo-router'
import { Ionicons, Feather } from '@expo/vector-icons'
import { COLORS } from '@/assets/constants'

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: "#9CA3AF",
        tabBarShowLabel: false,
        tabBarStyle: {
          backgroundColor: "#ffffff",
          borderTopWidth: 1,
          borderTopColor: "#F3F4F6",
          height: 64,
          paddingTop: 8,
          paddingBottom: 8,
          elevation: 5,
          shadowColor: "#000",
          shadowOpacity: 0.05,
          shadowRadius: 10,
          shadowOffset: { width: 0, height: -2 },
        }
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          tabBarIcon: ({ color, focused }) => (
            <View style={{ alignItems: 'center', justifyContent: 'center', flex: 1 }}>
              <Ionicons name={focused ? 'home' : 'home-outline'} size={24} color={color} />
            </View>
          )
        }}
      />

      <Tabs.Screen
        name="cart"
        options={{
          tabBarIcon: ({ color, focused }) => (
            <View style={{ alignItems: 'center', justifyContent: 'center', flex: 1 }}>
              <Feather name={focused ? 'shopping-cart' : 'shopping-cart'} size={24} color={color} />
            </View>
          )
        }}
      />

      <Tabs.Screen
        name="favourite"
        options={{
          tabBarIcon: ({ color, focused }) => (
            <View style={{ alignItems: 'center', justifyContent: 'center', flex: 1 }}>
              <Ionicons name={focused ? 'heart' : 'heart-outline'} size={24} color={color} />
            </View>
          )
        }}
      />

      <Tabs.Screen
        name="profile"
        options={{
          tabBarIcon: ({ color, focused }) => (
            <View style={{ alignItems: 'center', justifyContent: 'center', flex: 1 }}>
              <Ionicons name={focused ? 'person' : 'person-outline'} size={24} color={color} />
            </View>
          )
        }}
      />

      {/* Hide other routes from the bottom tab bar */}
      <Tabs.Screen
        name="admin"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="orders/index"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="addresses/index"
        options={{
          href: null,
        }}
      />
    </Tabs>
  )
}
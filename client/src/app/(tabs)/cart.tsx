import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native'
import React from 'react'
import { useCart } from '../../../context/CartContext'
import { useRouter } from 'expo-router'
import { SafeAreaView } from 'react-native-safe-area-context'
import Header from '../../../components/Header'
import CartItem from '../../../components/CartItem'
import { Ionicons } from '@expo/vector-icons'
import { getEstimatedDelivery } from '../../../utils/delivery'

export default function Cart() {
  const { cartItems, cartTotal, removeFromCart, updateQuantity } = useCart()
  const router = useRouter()

  // 1. शिपिंग चार्ज को ₹20 फिक्स कर दिया
  const SHIPPING_CHARGE = 20;

  // 2. फाइनल टोटल = कार्ट का कुल दाम + शिपिंग चार्ज
  const finalTotal = (cartTotal || 0) + SHIPPING_CHARGE;

  const deliveryEstimate = getEstimatedDelivery(3, 5);

  return (
    <SafeAreaView style={styles.container}>
      <Header title='My Cart' showBack/>
      
      {cartItems && cartItems.length > 0 ? (
        <View style={styles.contentContainer}>
          <ScrollView contentContainerStyle={styles.scrollContent}>
            {cartItems.map((item, index) => {
              // Context की सही ID पास करने के लिए item.id या फॉलबैक का इस्तेमाल
              const itemKey = item?.id || item?.product?._id || index.toString();
              
              return (
                <CartItem 
                  key={itemKey}
                  item={item} 
                  onRemove={removeFromCart} 
                  onUpdateQuantity={updateQuantity} 
                />
              )
            })}
          </ScrollView>

          {/* बॉटम टोटल और चेकआउट सेक्शन */}
          <View style={styles.footer}>
            
            {/* 💡 Estimated Delivery Date Banner */}
            <View style={{
              backgroundColor: '#ECFDF5',
              borderRadius: 10,
              padding: 10,
              marginBottom: 14,
              flexDirection: 'row',
              alignItems: 'center',
              borderWidth: 1,
              borderColor: '#A7F3D0',
            }}>
              <Ionicons name="bus-outline" size={20} color="#059669" />
              <View style={{ marginLeft: 10, flex: 1 }}>
                <Text style={{ fontSize: 10, fontWeight: '800', color: '#047857', letterSpacing: 0.5 }}>ESTIMATED DELIVERY</Text>
                <Text style={{ fontSize: 13, fontWeight: '700', color: '#065F46', marginTop: 1 }}>
                  Expected by {deliveryEstimate.formattedStartDate}
                </Text>
              </View>
            </View>

            {/* 3. सबटोटल (Items Total) */}
            <View style={styles.priceRow}>
              <Text style={styles.priceLabel}>Subtotal:</Text>
              <Text style={styles.priceValue}>₹{(cartTotal || 0).toFixed(2)}</Text>
            </View>

            {/* 4. शिपिंग चार्ज लाइन */}
            <View style={styles.priceRow}>
              <Text style={styles.priceLabel}>Shipping Charge:</Text>
              <Text style={styles.priceValue}>₹{SHIPPING_CHARGE.toFixed(2)}</Text>
            </View>

            {/* डिवाइडर लाइन */}
            <View style={styles.divider} />

            {/* 5. फाइनल ग्रैंड टोटल */}
            <View style={styles.totalRow}>
              <Text style={styles.totalText}>Total Amount:</Text>
              <Text style={styles.totalPrice}>₹{finalTotal.toFixed(2)}</Text>
            </View>

            <TouchableOpacity 
              activeOpacity={0.8}
              onPress={() => router.push('/checkout')}
              style={styles.checkoutButton}
            >
              <Text style={styles.checkoutButtonText}>Proceed to Checkout</Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        /* खाली कार्ट की स्थिति (Empty Cart State) */
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>Your cart is empty</Text>
          <TouchableOpacity 
            style={styles.shopButton} 
            onPress={() => router.push('/')}
          >
            <Text style={styles.shopButtonText}>Start shopping</Text>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  contentContainer: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 20,
  },
  footer: {
    backgroundColor: '#ffffff',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  priceLabel: {
    fontSize: 14,
    color: '#6b7280',
  },
  priceValue: {
    fontSize: 15,
    color: '#374151',
    fontWeight: '500',
  },
  divider: {
    height: 1,
    backgroundColor: '#f3f4f6',
    marginVertical: 10,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  totalText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  totalPrice: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
  },
  checkoutButton: {
    backgroundColor: '#000000',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  checkoutButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  emptyText: {
    fontSize: 18,
    color: '#6b7280',
    marginBottom: 16,
  },
  shopButton: {
    backgroundColor: '#000000',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  shopButtonText: {
    color: '#ffffff',
    fontWeight: '600',
  },
})
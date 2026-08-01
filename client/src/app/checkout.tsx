import { View, Text, ActivityIndicator, ScrollView, TouchableOpacity, StyleSheet } from 'react-native'
import React, { useEffect, useState } from 'react'
import { useCart } from '../../context/CartContext'
import { useRouter } from 'expo-router' 
import { Address } from '../../constants/types'
import { SafeAreaView } from 'react-native-safe-area-context'
import Header from '../../components/Header'
import { COLORS } from '@/assets/constants'
import { Ionicons } from '@expo/vector-icons'
import Toast from 'react-native-toast-message'
import { useAuth } from '@clerk/expo'
import api from '../../constants/api'

export default function Checkout() {
  const { getToken } = useAuth()
  const { cartTotal, clearCart } = useCart()
  const router = useRouter()
  
  const [loading, setLoading] = useState(false)
  const [pageLoading, setPageLoading] = useState(true)
  const [selectedAddress, setSelectedAddress] = useState<Address | null>(null)
  const [paymentMethod, setPaymentMethod] = useState<"cash" | "stripe">('cash')
  
  const shipping = 20;
  const tax = 0;
  const total = cartTotal + shipping + tax;

  const fetchAddress = async () => {
    try {
      setPageLoading(true);
      const token = await getToken();
      const { data } = await api.get('/address', {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (data.success && data.data && data.data.length > 0) {
        const def = data.data.find((a: any) => a.isDefault) || data.data[0];
        setSelectedAddress(def as Address);
      }
    } catch (error) {
      console.error("Error fetching address:", error);
    } finally {
      setPageLoading(false);
    }
  };

  const handlePlaceOrder = async () => {
    if (!selectedAddress) {
      return Toast.show({
        type: 'error',
        text1: 'Address Required',
        text2: 'Please add or select a shipping address.',
        position: 'top'
      });
    }

    if (paymentMethod === 'stripe') {
      return Toast.show({
        type: 'info',
        text1: 'Stripe Payment',
        text2: 'Stripe Gateway integration coming soon!',
        position: 'top'
      });
    }

    setLoading(true);
    try {
      const token = await getToken();
      const { data } = await api.post(
        '/orders',
        {
          shippingAddress: {
            street: selectedAddress.street,
            city: selectedAddress.city,
            state: selectedAddress.state,
            zipCode: selectedAddress.zipCode,
            country: selectedAddress.country,
          },
          paymentMethod: 'cash',
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      if (data.success) {
        Toast.show({
          type: 'success',
          text1: 'Order Placed! 🎉',
          text2: 'Your order has been placed successfully via COD.',
          position: 'top'
        });
        await clearCart();
        router.replace('/(tabs)/orders' as any);
      }
    } catch (error: any) {
      console.error("Error placing order:", error);
      Toast.show({
        type: 'error',
        text1: 'Order Failed',
        text2: error.response?.data?.message || 'Failed to place order',
        position: 'top'
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAddress();
  }, []);

  if (pageLoading) {
    return (
      <SafeAreaView style={[styles.container, styles.centerComponent]}>
        <ActivityIndicator size="large" color={COLORS.primary || '#000'} />
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Header title="Checkout" showBack />
      
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* 1. शिपिंग एड्रेस सेक्शन */}
        <Text style={styles.sectionTitle}>Shipping Address</Text>
        {selectedAddress ? (
          <View style={styles.card}>
            <View style={styles.addressHeader}>
              <View style={styles.row}>
                {/* लोकेशन आइकन हटाकर Address Type (Home/Work) दिखाया है */}
                <Text style={styles.addressType}>{selectedAddress.type}</Text>
                {selectedAddress.isDefault && (
                  <View style={styles.defaultBadge}>
                    <Text style={styles.defaultBadgeText}>Default</Text>
                  </View>
                )}
              </View>
              
              {/* राइट साइड में Change बटन जोड़ा है */}
              <TouchableOpacity 
                activeOpacity={0.6} 
                onPress={() => router.push('/addresses' as any)}
              >
                <Text style={styles.changeButtonText}>Change</Text>
              </TouchableOpacity>
            </View>
            
            <Text style={styles.addressText}>{selectedAddress.street}</Text>
            <Text style={styles.addressText}>
              {selectedAddress.city}, {selectedAddress.state} - {selectedAddress.zipCode}
            </Text>
            <Text style={styles.addressPhone}>{selectedAddress.country}</Text>
          </View>
        ) : (
          <TouchableOpacity style={[styles.card, styles.addAddressCard]} onPress={() => router.push('/addresses' as any)}>
            <Ionicons name="add-circle-outline" size={24} color="#6b7280" />
            <Text style={styles.addAddressText}>Add Shipping Address</Text>
          </TouchableOpacity>
        )}

        {/* 2. पेमेंट मेथड सेक्शन */}
        <Text style={styles.sectionTitle}>Payment Method</Text>
        
        <TouchableOpacity 
          style={[styles.card, styles.selectableCard, paymentMethod === 'cash' && styles.selectedCard]}
          onPress={() => setPaymentMethod('cash')}
        >
          <View style={styles.row}>
            <Ionicons 
              name={paymentMethod === 'cash' ? "radio-button-on" : "radio-button-off"} 
              size={22} 
              color={paymentMethod === 'cash' ? '#000' : '#9ca3af'} 
            />
            <View style={styles.paymentDetails}>
              <Text style={styles.paymentTitle}>Cash on Delivery (COD)</Text>
              <Text style={styles.paymentSubtitle}>Pay with cash when your package arrives.</Text>
            </View>
          </View>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.card, styles.selectableCard, paymentMethod === 'stripe' && styles.selectedCard]}
          onPress={() => setPaymentMethod('stripe')}
        >
          <View style={styles.row}>
            <Ionicons 
              name={paymentMethod === 'stripe' ? "radio-button-on" : "radio-button-off"} 
              size={22} 
              color={paymentMethod === 'stripe' ? '#000' : '#9ca3af'} 
            />
            <View style={styles.paymentDetails}>
              <Text style={styles.paymentTitle}>Credit / Debit Card (Stripe)</Text>
              <Text style={styles.paymentSubtitle}>Secure payment via card gateway.</Text>
            </View>
          </View>
        </TouchableOpacity>

        {/* 3. बिल/ऑर्डर समरी सेक्शन */}
        <Text style={styles.sectionTitle}>Order Summary</Text>
        <View style={styles.card}>
          <View style={styles.priceRow}>
            <Text style={styles.priceLabel}>Subtotal</Text>
            <Text style={styles.priceValue}>₹{cartTotal.toFixed(2)}</Text>
          </View>
          <View style={styles.priceRow}>
            <Text style={styles.priceLabel}>Shipping</Text>
            <Text style={styles.priceValue}>₹{shipping.toFixed(2)}</Text>
          </View>
          <View style={styles.priceRow}>
            <Text style={styles.priceLabel}>Tax</Text>
            <Text style={styles.priceValue}>₹{tax.toFixed(2)}</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Total Amount</Text>
            <Text style={styles.totalPrice}>₹{total.toFixed(2)}</Text>
          </View>
        </View>

      </ScrollView>

      {/* फिक्स्ड बॉटम बटन */}
      <View style={styles.footer}>
        <TouchableOpacity 
          activeOpacity={0.8}
          disabled={loading}
          style={[styles.placeOrderButton, loading && { backgroundColor: '#4b5563' }]}
          onPress={handlePlaceOrder}
        >
          {loading ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Text style={styles.placeOrderButtonText}>
              {paymentMethod === 'cash' ? 'Place Order (COD)' : 'Pay Now'}
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  centerComponent: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 100,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
    marginTop: 20,
    marginBottom: 10,
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    marginBottom: 4,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  /* Address Styles */
  addressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  addressType: {
    fontSize: 15,
    fontWeight: '700',
    color: '#111827',
    textTransform: 'capitalize', // Home, Work को साफ़ दिखाने के लिए
  },
  changeButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.primary || '#000', // आपके ऐप की प्राइमरी थीम कलर या ब्लैक
  },
  defaultBadge: {
    backgroundColor: '#eff6ff',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#bfdbfe',
    marginLeft: 8,
  },
  defaultBadgeText: {
    fontSize: 11,
    color: '#1d4ed8',
    fontWeight: '600',
  },
  addressText: {
    fontSize: 14,
    color: '#4b5563',
    lineHeight: 20,
  },
  addressPhone: {
    fontSize: 14,
    color: '#4b5563',
    marginTop: 6,
    fontWeight: '500',
  },
  addAddressCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderStyle: 'dashed',
    paddingVertical: 24,
  },
  addAddressText: {
    fontSize: 15,
    color: '#6b7280',
    fontWeight: '500',
    marginLeft: 6,
  },
  /* Payment Styles */
  selectableCard: {
    borderWidth: 1.5,
    borderColor: '#e5e7eb',
    marginBottom: 10,
  },
  selectedCard: {
    borderColor: '#111827',
    backgroundColor: '#fcfcfc',
  },
  paymentDetails: {
    marginLeft: 12,
    flex: 1,
  },
  paymentTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111827',
  },
  paymentSubtitle: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 2,
  },
  /* Pricing Styles */
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  priceLabel: {
    fontSize: 14,
    color: '#6b7280',
  },
  priceValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#111827',
  },
  divider: {
    height: 1,
    backgroundColor: '#f3f4f6',
    marginVertical: 12,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
  },
  totalPrice: {
    fontSize: 18,
    fontWeight: '800',
    color: '#111827',
  },
  /* Bottom Fixed Footer */
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#ffffff',
    paddingHorizontal: 16,
    paddingVertical: 14,
    paddingBottom: 28,
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
  },
  placeOrderButton: {
    backgroundColor: '#000000',
    height: 52,
    borderRadius: 26,
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeOrderButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
})
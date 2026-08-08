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

  const SHIPPING_CHARGE = 0;
  const finalTotal = (cartTotal || 0) + SHIPPING_CHARGE;
  const deliveryEstimate = getEstimatedDelivery(3, 5);

  return (
    <SafeAreaView style={styles.container}>
      <Header title='My Bag' showBack/>
      
      {cartItems && cartItems.length > 0 ? (
        <View style={styles.contentContainer}>
          <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
            {cartItems.map((item, index) => {
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

          <View style={styles.footer}>
            <View style={styles.deliveryBanner}>
              <View style={styles.deliveryIconCircle}>
                <Ionicons name="bus" size={18} color="#059669" />
              </View>
              <View style={{ marginLeft: 12, flex: 1 }}>
                <Text style={styles.deliveryLabel}>ESTIMATED DELIVERY</Text>
                <Text style={styles.deliveryValue}>
                  Expected by {deliveryEstimate.formattedStartDate}
                </Text>
              </View>
            </View>

            <View style={styles.priceRow}>
              <Text style={styles.priceLabel}>Subtotal</Text>
              <Text style={styles.priceValue}>₹{(cartTotal || 0).toFixed(2)}</Text>
            </View>

            <View style={styles.priceRow}>
              <Text style={styles.priceLabel}>Shipping</Text>
              <Text style={[styles.priceValue, { color: "#059669" }]}>FREE 🎉</Text>
            </View>

            <View style={styles.divider} />

            <View style={styles.totalRow}>
              <Text style={styles.totalText}>Total</Text>
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
        <View style={styles.emptyContainer}>
          <View style={styles.emptyIconContainer}>
            <Ionicons name="cart-outline" size={64} color="#FF3399" />
          </View>
          <Text style={styles.emptyTitle}>Your Bag is Empty</Text>
          <Text style={styles.emptySubtitle}>
            Looks like you haven't added anything to your bag yet. Let's find something special!
          </Text>
          <TouchableOpacity 
            style={styles.shopButton} 
            activeOpacity={0.8}
            onPress={() => router.push('/')}
          >
            <Text style={styles.shopButtonText}>Explore Products</Text>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  contentContainer: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 24,
  },
  footer: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 32,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -10 },
    shadowOpacity: 0.03,
    shadowRadius: 15,
    elevation: 10,
  },
  deliveryBanner: {
    backgroundColor: '#ECFDF5',
    borderRadius: 16,
    padding: 14,
    marginBottom: 20,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },
  deliveryIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#A7F3D0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  deliveryLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: '#047857',
    letterSpacing: 0.5,
    fontFamily: 'Outfit_800',
  },
  deliveryValue: {
    fontSize: 14,
    fontWeight: '700',
    color: '#065F46',
    marginTop: 2,
    fontFamily: 'Outfit_700',
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  priceLabel: {
    fontSize: 15,
    color: '#64748B',
    fontFamily: 'Outfit_500',
  },
  priceValue: {
    fontSize: 16,
    color: '#0F172A',
    fontWeight: '700',
    fontFamily: 'Outfit_700',
  },
  divider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginVertical: 14,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  totalText: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
    fontFamily: 'Outfit_800',
    textTransform: 'uppercase',
  },
  totalPrice: {
    fontSize: 24,
    fontWeight: '800',
    color: '#FF3399',
    fontFamily: 'Outfit_800',
  },
  checkoutButton: {
    backgroundColor: '#FF3399',
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: '#FF3399',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 5,
  },
  checkoutButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    fontFamily: 'Outfit_700',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  emptyIconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#FDF2F8',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 8,
    fontFamily: 'Outfit_800',
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#64748B',
    textAlign: 'center',
    marginBottom: 32,
    fontFamily: 'Outfit',
    lineHeight: 22,
  },
  shopButton: {
    backgroundColor: '#FF3399',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 16,
    shadowColor: '#FF3399',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 5,
  },
  shopButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 16,
    fontFamily: 'Outfit_700',
  },
});
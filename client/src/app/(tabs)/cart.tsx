import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native'
import React from 'react'
import { useCart } from '../../../context/CartContext'
import { useRouter } from 'expo-router'
import { SafeAreaView } from 'react-native-safe-area-context'
import Header from '../../../components/Header'
import CartItem from '../../../components/CartItem' // सुनिश्चित करें कि पाथ सही है

export default function Cart() {
  const { cartItems, cartTotal, removeFromCart, updateQuantity } = useCart()
  const router = useRouter()

  return (
    <SafeAreaView style={styles.container}>
      <Header title='My Cart' showBack/>
      
      {cartItems && cartItems.length > 0 ? (
        <View style={styles.contentContainer}>
          <ScrollView contentContainerStyle={styles.scrollContent}>
            {cartItems.map((item, index) => {
              // सेफ यूनिक की (Key) जेनरेशन
              const itemKey = item?.product?._id || item?.product?.id || index.toString();
              
              return (
                <CartItem 
                  key={itemKey}
                  item={item} // 1. item ऑब्जेक्ट पास किया
                  onRemove={removeFromCart} // 2. onRemove में Context का Function पास किया
                  onUpdateQuantity={updateQuantity} // 3. onUpdateQuantity में Context का Function पास किया
                />
              )
            })}
          </ScrollView>

          {/* बॉटम टोटल और चेकआउट सेक्शन */}
          <View style={styles.footer}>
            <View style={styles.totalRow}>
              <Text style={styles.totalText}>Total Amount:</Text>
              <Text style={styles.totalPrice}>₹{(cartTotal || 0).toFixed(2)}</Text>
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
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  totalText: {
    fontSize: 16,
    color: '#4b5563',
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
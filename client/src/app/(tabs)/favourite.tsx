import { View, Text, FlatList, StyleSheet, TouchableOpacity } from 'react-native'
import React from 'react'
import { useWishlist } from '../../../context/WishlistContext'
import { useRouter } from 'expo-router'
import { SafeAreaView } from 'react-native-safe-area-context'
import Header from '../../../components/Header'
import ProductCard from '../../../components/ProductCard' // सुनिश्चित करें कि पाथ सही है
import { Ionicons } from '@expo/vector-icons'

export default function Favourite() {
  const { wishlist } = useWishlist()
  const router = useRouter()

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      {/* हेडर */}
      <Header title={`Wishlist (${wishlist.length})`} showMenu showCart />

      {wishlist && wishlist.length > 0 ? (
        /* ग्रिड लिस्ट (2-Column Grid Layout) */
        <FlatList
          data={wishlist}
          keyExtractor={(item, index) => item._id || item._id?.toString() || index.toString()}
          numColumns={2}
          columnWrapperStyle={styles.row}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            // आपका बनाया हुआ ProductCard यहाँ रेंडर होगा
            <ProductCard product={item} />
          )}
        />
      ) : (
        /* खाली विशलिस्ट की स्थिति (Empty Wishlist State) */
        <View style={styles.emptyContainer}>
          <View style={styles.iconCircle}>
            <Ionicons name="heart-outline" size={50} color="#9ca3af" />
          </View>
          <Text style={styles.emptyText}>Your wishlist is empty</Text>
          <Text style={styles.emptySubtext}>Explore products and tap the heart icon to save your favorites here.</Text>
          
          <TouchableOpacity 
            activeOpacity={0.8}
            style={styles.shopButton} 
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
    backgroundColor: '#f9fafb', // क्लीन और मॉडर्न बैकग्राउंड
  },
  listContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 30,
  },
  row: {
    justifyContent: 'space-between', // कार्ड्स के बीच सही स्पेसिंग के लिए
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  iconCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#f3f4f6',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  emptyText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 28,
    lineHeight: 20,
  },
  shopButton: {
    backgroundColor: '#000000',
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  shopButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
})
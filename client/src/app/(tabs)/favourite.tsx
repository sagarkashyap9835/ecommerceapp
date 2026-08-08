import { View, Text, FlatList, StyleSheet, TouchableOpacity } from 'react-native'
import React from 'react'
import { useWishlist } from '../../../context/WishlistContext'
import { useRouter } from 'expo-router'
import { SafeAreaView } from 'react-native-safe-area-context'
import Header from '../../../components/Header'
import ProductCard from '../../../components/ProductCard'
import { Ionicons } from '@expo/vector-icons'

export default function Favourite() {
  const { wishlist } = useWishlist()
  const router = useRouter()

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <Header title={`Wishlist (${wishlist.length})`} showMenu showCart />

      {wishlist && wishlist.length > 0 ? (
        <FlatList
          data={wishlist}
          keyExtractor={(item, index) => item._id || item._id?.toString() || index.toString()}
          numColumns={2}
          columnWrapperStyle={styles.row}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <ProductCard product={item} />
          )}
        />
      ) : (
        <View style={styles.emptyContainer}>
          <View style={styles.emptyIconContainer}>
            <Ionicons name="heart" size={64} color="#FF3399" />
          </View>
          <Text style={styles.emptyTitle}>Your Wishlist is Empty</Text>
          <Text style={styles.emptySubtitle}>
            Save your favorite items here so you can easily find them later!
          </Text>
          
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
    backgroundColor: '#FFFFFF',
  },
  listContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 30,
  },
  row: {
    justifyContent: 'space-between',
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
    fontFamily: 'Outfit_500',
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
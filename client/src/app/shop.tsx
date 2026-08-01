import { View, TextInput, FlatList, StyleSheet, ActivityIndicator, Text } from 'react-native'
import React, { useEffect, useState } from 'react'
import { Product } from '@/assets/constants/types'

import { SafeAreaView } from 'react-native-safe-area-context';
import Header from '../../components/Header';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '@/assets/constants';
import api from '../../constants/api';

// आपका बनाया हुआ ProductCard कंपोनेंट
import ProductCard from '../../components/ProductCard'; 

export default function Shop() {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);

    // लोडिंग के दौरान ProductCard को दिखाने के लिए 6 नकली ऑब्जेक्ट्स की एरे
    const skeletonProducts = Array.from({ length: 6 }).map((_, index) => ({
        _id: `skeleton-${index}`,
        name: 'Loading Product...',
        description: 'Please wait a moment...',
        price: 0,
        images: ['https://via.placeholder.com/180'], // फ़ॉलबैक इमेज़ यूआरएल
        isFeatured: false,
        ratings: { average: 4.8 }
    } as unknown as Product));

    const fetchProducts = async (pageNumber = 1) => {
        if (pageNumber === 1) {
            setLoading(true)
        } else {
            setLoadingMore(true)
        }
        try {
            const queryparams={page:pageNumber,limit:10};
            const {data}=await api.get('/products', {params:queryparams})
            if(pageNumber===1){
                setProducts(data.data)
            } else{
                setProducts(prev=>[...prev, ...data.data])
            }
            setHasMore(data.pagination.page < data.pagination.pages)
            setPage(pageNumber)
        } catch (error) {
            console.error("pagination error", error) 
        } finally {
            setLoading(false)
            setLoadingMore(false)
        }
    }

    const loadMore = () => {
        if (!loadingMore && !loading && hasMore) {
            fetchProducts(page + 1)
        }
    }

    useEffect(() => {
        fetchProducts(1)
    }, [])

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <Header title='Shop' showBack showCart />
            
            {/* 1. ऑप्शन्स आइकॉन के साथ बेहतरीन सर्च बार */}
            <View style={styles.searchContainer}>
                <View style={styles.searchWrapper}>
                    <Ionicons name='search' size={20} color={COLORS.secondary} style={styles.searchIcon} />
                    <TextInput 
                        style={styles.searchInput}
                        placeholder='Search Products' 
                        returnKeyType='search'
                        placeholderTextColor="#888"
                    />
                    <Ionicons name='options-outline' size={22} color={COLORS.secondary} style={styles.optionsIcon} />
                </View>
            </View>

            {/* 2. मुख्य प्रोडक्ट ग्रिड लिस्ट */}
            <FlatList
                // अगर पहली बार डेटा लोड हो रहा है तो स्केलेटन डेटा दिखाओ, वरना असली प्रोडक्ट्स
                data={loading && page === 1 ? skeletonProducts : products}
                keyExtractor={(item, index) => item._id || item._id?.toString() || index.toString()}
                numColumns={2}
                columnWrapperStyle={styles.row}
                renderItem={({ item }) => (
                    // आपका ProductCard रेंडर हो रहा है
                    <ProductCard product={item} />
                )}
                contentContainerStyle={styles.listContent}
                onEndReached={!loading ? loadMore : null}
                onEndReachedThreshold={0.2}
                
                // नीचे स्क्रॉल करने पर लोडिंग स्पिनर
                ListFooterComponent={
                    loadingMore ? (
                        <View style={styles.footerLoader}>
                            <ActivityIndicator size="small" color={COLORS.primary || '#000'} />
                        </View>
                    ) : null
                }
                
                // डेटा न मिलने पर दिखाने वाला मेसेज
                ListEmptyComponent={
                    !loading ? (
                        <View style={styles.emptyContainer}>
                            <Ionicons name="basket-outline" size={50} color="#9ca3af" />
                            <Text style={styles.emptyText}>No products found</Text>
                        </View>
                    ) : null
                }
            />
        </SafeAreaView>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f9fafb', 
    },
    searchContainer: {
        paddingHorizontal: 16,
        paddingVertical: 12,
    },
    searchWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#ffffff', 
        borderRadius: 12,
        paddingHorizontal: 12,
        paddingVertical: 10,
        borderWidth: 1,
        borderColor: '#e5e7eb', 
        shadowColor: '#000',
        shadowOpacity: 0.04,
        shadowRadius: 3,
        shadowOffset: { width: 0, height: 2 },
        elevation: 2,
    },
    searchIcon: {
        marginRight: 8,
    },
    searchInput: {
        flex: 1,
        fontSize: 15,
        color: '#000000',
        paddingVertical: 0, 
        marginRight: 8, 
    },
    optionsIcon: {
        marginLeft: 4, 
    },
    listContent: {
        paddingHorizontal: 16,
        paddingBottom: 30,
    },
    row: {
        justifyContent: 'space-between', 
    },
    footerLoader: {
        paddingVertical: 16,
        alignItems: 'center',
    },
    emptyContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 40,
    },
    emptyText: {
        fontSize: 16,
        color: '#6b7280',
        marginTop: 8,
    }
});
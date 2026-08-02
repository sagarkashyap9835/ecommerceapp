import { View, TextInput, FlatList, StyleSheet, ActivityIndicator, Text, TouchableOpacity, ScrollView, Modal, Pressable } from 'react-native';
import React, { useEffect, useState, useCallback } from 'react';
import { Product } from '@/assets/constants/types';
import { SafeAreaView } from 'react-native-safe-area-context';
import Header from '../../components/Header';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, CATEGORIES } from '@/assets/constants';
import api from '../../constants/api';
import ProductCard from '../../components/ProductCard';
import { useLocalSearchParams } from 'expo-router';

const CATEGORY_LIST = [{ id: 'all', name: 'All', icon: 'grid-outline' }, ...CATEGORIES];

const SORT_OPTIONS = [
    { label: 'Newest Arrivals', value: 'newest' },
    { label: 'Price: Low to High', value: 'price_asc' },
    { label: 'Price: High to Low', value: 'price_desc' },
];

export default function Shop() {
    const params = useLocalSearchParams<{ category?: string; search?: string; sortBy?: string; isBogo?: string }>();

    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);

    // Filter States
    const [selectedCategory, setSelectedCategory] = useState<string>(params.category || 'All');
    const [searchQuery, setSearchQuery] = useState<string>(params.search || '');
    const [sortBy, setSortBy] = useState<string>(params.sortBy || 'newest');
    const [isBogoFilter, setIsBogoFilter] = useState<boolean>(params.isBogo === 'true');
    const [minPrice, setMinPrice] = useState<string>('');
    const [maxPrice, setMaxPrice] = useState<string>('');

    // Temporary Filter State inside Modal
    const [tempSortBy, setTempSortBy] = useState<string>(params.sortBy || 'newest');
    const [tempMinPrice, setTempMinPrice] = useState<string>('');
    const [tempMaxPrice, setTempMaxPrice] = useState<string>('');
    const [filterModalVisible, setFilterModalVisible] = useState<boolean>(false);

    // Skeleton Products Array for Loading state
    const skeletonProducts = Array.from({ length: 6 }).map((_, index) => ({
        _id: `skeleton-${index}`,
        name: 'Loading Product...',
        description: 'Please wait a moment...',
        price: 0,
        images: ['https://placehold.co/180x180/png?text=Product'],
        isFeatured: false,
        ratings: { average: 4.8 }
    } as unknown as Product));

    const fetchProducts = async (pageNumber = 1, isNewFilter = false) => {
        if (pageNumber === 1) {
            setLoading(true);
        } else {
            setLoadingMore(true);
        }
        try {
            const queryparams: any = {
                page: pageNumber,
                limit: 10,
            };

            if (selectedCategory && selectedCategory !== 'All') {
                queryparams.category = selectedCategory;
            }

            if (searchQuery.trim()) {
                queryparams.search = searchQuery.trim();
            }

            if (sortBy) {
                queryparams.sortBy = sortBy;
            }

            if (isBogoFilter) {
                queryparams.isBogo = 'true';
            }

            if (minPrice) {
                queryparams.minPrice = minPrice;
            }

            if (maxPrice) {
                queryparams.maxPrice = maxPrice;
            }

            const { data } = await api.get('/products', { params: queryparams });

            if (pageNumber === 1 || isNewFilter) {
                setProducts(data.data);
            } else {
                setProducts(prev => [...prev, ...data.data]);
            }

            setHasMore(data.pagination.page < data.pagination.pages);
            setPage(pageNumber);
        } catch (error) {
            console.error("Fetch products error:", error);
        } finally {
            setLoading(false);
            setLoadingMore(false);
        }
    };

    const loadMore = () => {
        if (!loadingMore && !loading && hasMore) {
            fetchProducts(page + 1);
        }
    };

    // Refetch whenever filters change
    useEffect(() => {
        const timer = setTimeout(() => {
            fetchProducts(1, true);
        }, 300);

        return () => clearTimeout(timer);
    }, [selectedCategory, searchQuery, sortBy, isBogoFilter, minPrice, maxPrice]);

    // Set initial params if navigated from Home screen or Banners
    useEffect(() => {
        if (params.category !== undefined) {
            setSelectedCategory(params.category || 'All');
        }
        if (params.search !== undefined) {
            setSearchQuery(params.search || '');
        }
        if (params.sortBy !== undefined) {
            setSortBy(params.sortBy || 'newest');
        }
        if (params.isBogo !== undefined) {
            setIsBogoFilter(params.isBogo === 'true');
        }
    }, [params.category, params.search, params.sortBy, params.isBogo]);

    const openFilterModal = () => {
        setTempSortBy(sortBy);
        setTempMinPrice(minPrice);
        setTempMaxPrice(maxPrice);
        setFilterModalVisible(true);
    };

    const applyModalFilters = () => {
        setSortBy(tempSortBy);
        setMinPrice(tempMinPrice);
        setMaxPrice(tempMaxPrice);
        setFilterModalVisible(false);
    };

    const resetFilters = () => {
        setSelectedCategory('All');
        setSearchQuery('');
        setSortBy('newest');
        setIsBogoFilter(false);
        setMinPrice('');
        setMaxPrice('');
        setTempSortBy('newest');
        setTempMinPrice('');
        setTempMaxPrice('');
        setFilterModalVisible(false);
    };

    // Real-time instant letter matching filter for 0ms typing response
    const liveFilteredProducts = React.useMemo(() => {
        if (!searchQuery.trim()) return products;
        const q = searchQuery.toLowerCase().trim();
        return products.filter(p =>
            p.name.toLowerCase().includes(q) ||
            (p.description && p.description.toLowerCase().includes(q)) ||
            (p.category && p.category.toLowerCase().includes(q))
        );
    }, [products, searchQuery]);

    const isFilterActive = sortBy !== 'newest' || isBogoFilter || minPrice !== '' || maxPrice !== '' || selectedCategory !== 'All' || searchQuery.trim() !== '';

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <Header
                showBack
                showCart
                showSearch
                searchValue={searchQuery}
                onSearchChange={setSearchQuery}
                onFilterPress={openFilterModal}
                isFilterActive={isFilterActive}
            />

            {/* 1. Category Horizontal Scroll Pills */}
            <View style={styles.categoryContainer}>
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.categoryScroll}
                >
                    {CATEGORY_LIST.map((cat) => {
                        const isSelected = selectedCategory.toLowerCase() === cat.name.toLowerCase();
                        return (
                            <TouchableOpacity
                                key={cat.id}
                                activeOpacity={0.8}
                                onPress={() => setSelectedCategory(cat.name)}
                                style={[
                                    styles.categoryPill,
                                    isSelected && styles.categoryPillActive
                                ]}
                            >
                                <Ionicons
                                    name={cat.icon as any}
                                    size={16}
                                    color={isSelected ? '#ffffff' : '#4b5563'}
                                    style={{ marginRight: 6 }}
                                />
                                <Text style={[
                                    styles.categoryPillText,
                                    isSelected && styles.categoryPillTextActive
                                ]}>
                                    {cat.name}
                                </Text>
                            </TouchableOpacity>
                        );
                    })}
                </ScrollView>
            </View>

            {/* Active Filters Tag Bar */}
            {isFilterActive && (
                <View style={styles.activeFiltersBar}>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.activeFiltersScroll}>
                        <Text style={styles.activeFiltersLabel}>Filters:</Text>
                        {searchQuery.trim() !== '' && (
                            <View style={styles.filterChip}>
                                <Text style={styles.filterChipText}>Search: "{searchQuery}"</Text>
                                <TouchableOpacity onPress={() => setSearchQuery('')}>
                                    <Ionicons name="close" size={14} color="#374151" style={{ marginLeft: 4 }} />
                                </TouchableOpacity>
                            </View>
                        )}
                        {selectedCategory !== 'All' && (
                            <View style={styles.filterChip}>
                                <Text style={styles.filterChipText}>Cat: {selectedCategory}</Text>
                                <TouchableOpacity onPress={() => setSelectedCategory('All')}>
                                    <Ionicons name="close" size={14} color="#374151" style={{ marginLeft: 4 }} />
                                </TouchableOpacity>
                            </View>
                        )}
                        {isBogoFilter && (
                            <View style={styles.filterChip}>
                                <Text style={styles.filterChipText}>🎁 Buy 1 Get 1 Offers</Text>
                                <TouchableOpacity onPress={() => setIsBogoFilter(false)}>
                                    <Ionicons name="close" size={14} color="#374151" style={{ marginLeft: 4 }} />
                                </TouchableOpacity>
                            </View>
                        )}
                        {sortBy !== 'newest' && (
                            <View style={styles.filterChip}>
                                <Text style={styles.filterChipText}>
                                    Sort: {sortBy === 'price_asc' ? 'Low to High' : 'High to Low'}
                                </Text>
                                <TouchableOpacity onPress={() => setSortBy('newest')}>
                                    <Ionicons name="close" size={14} color="#374151" style={{ marginLeft: 4 }} />
                                </TouchableOpacity>
                            </View>
                        )}
                        {(minPrice !== '' || maxPrice !== '') && (
                            <View style={styles.filterChip}>
                                <Text style={styles.filterChipText}>
                                    Price: ₹{minPrice || '0'} - ₹{maxPrice || '∞'}
                                </Text>
                                <TouchableOpacity onPress={() => { setMinPrice(''); setMaxPrice(''); }}>
                                    <Ionicons name="close" size={14} color="#374151" style={{ marginLeft: 4 }} />
                                </TouchableOpacity>
                            </View>
                        )}
                        <TouchableOpacity onPress={resetFilters} style={styles.clearAllBtn}>
                            <Text style={styles.clearAllBtnText}>Clear All</Text>
                        </TouchableOpacity>
                    </ScrollView>
                </View>
            )}

            {/* 3. Product Grid */}
            <FlatList
                data={loading && page === 1 ? skeletonProducts : liveFilteredProducts}
                keyExtractor={(item, index) => item._id || index.toString()}
                numColumns={2}
                columnWrapperStyle={styles.row}
                renderItem={({ item }) => (
                    <ProductCard product={item} />
                )}
                contentContainerStyle={styles.listContent}
                onEndReached={!loading ? loadMore : null}
                onEndReachedThreshold={0.2}
                ListFooterComponent={
                    loadingMore ? (
                        <View style={styles.footerLoader}>
                            <ActivityIndicator size="small" color={COLORS.primary || '#000'} />
                        </View>
                    ) : null
                }
                ListEmptyComponent={
                    !loading ? (
                        <View style={styles.emptyContainer}>
                            <Ionicons name="basket-outline" size={50} color="#9ca3af" />
                            <Text style={styles.emptyText}>No products found matching your filters</Text>
                            <TouchableOpacity onPress={resetFilters} style={styles.resetSearchBtn}>
                                <Text style={styles.resetSearchBtnText}>Reset All Filters</Text>
                            </TouchableOpacity>
                        </View>
                    ) : null
                }
            />

            {/* 4. FILTER & SORT MODAL */}
            <Modal visible={filterModalVisible} animationType="slide" transparent>
                <Pressable style={styles.modalOverlay} onPress={() => setFilterModalVisible(false)}>
                    <Pressable style={styles.modalContent} onPress={(e) => e.stopPropagation()}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Filter & Sort</Text>
                            <TouchableOpacity onPress={() => setFilterModalVisible(false)}>
                                <Ionicons name="close" size={24} color="#6b7280" />
                            </TouchableOpacity>
                        </View>

                        <ScrollView style={{ maxHeight: 400 }} showsVerticalScrollIndicator={false}>
                            {/* Sort By Section */}
                            <Text style={styles.sectionTitle}>Sort By</Text>
                            {SORT_OPTIONS.map((opt) => {
                                const isSelected = tempSortBy === opt.value;
                                return (
                                    <TouchableOpacity
                                        key={opt.value}
                                        style={[
                                            styles.sortOptionItem,
                                            isSelected && styles.sortOptionItemActive
                                        ]}
                                        onPress={() => setTempSortBy(opt.value)}
                                    >
                                        <Text style={[
                                            styles.sortOptionText,
                                            isSelected && styles.sortOptionTextActive
                                        ]}>
                                            {opt.label}
                                        </Text>
                                        {isSelected && <Ionicons name="checkmark" size={18} color="#111827" />}
                                    </TouchableOpacity>
                                );
                            })}

                            {/* Price Range Section */}
                            <Text style={[styles.sectionTitle, { marginTop: 20 }]}>Price Range ($)</Text>
                            <View style={styles.priceRow}>
                                <View style={styles.priceInputBox}>
                                    <Text style={styles.priceLabel}>Min Price</Text>
                                    <TextInput
                                        style={styles.priceInput}
                                        placeholder="0"
                                        keyboardType="numeric"
                                        value={tempMinPrice}
                                        onChangeText={setTempMinPrice}
                                        placeholderTextColor="#9ca3af"
                                    />
                                </View>
                                <Text style={styles.priceDash}>-</Text>
                                <View style={styles.priceInputBox}>
                                    <Text style={styles.priceLabel}>Max Price</Text>
                                    <TextInput
                                        style={styles.priceInput}
                                        placeholder="Max"
                                        keyboardType="numeric"
                                        value={tempMaxPrice}
                                        onChangeText={setTempMaxPrice}
                                        placeholderTextColor="#9ca3af"
                                    />
                                </View>
                            </View>
                        </ScrollView>

                        {/* Modal Action Buttons */}
                        <View style={styles.modalActions}>
                            <TouchableOpacity style={styles.resetModalBtn} onPress={resetFilters}>
                                <Text style={styles.resetModalBtnText}>Reset All</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.applyModalBtn} onPress={applyModalFilters}>
                                <Text style={styles.applyModalBtnText}>Apply Filters</Text>
                            </TouchableOpacity>
                        </View>
                    </Pressable>
                </Pressable>
            </Modal>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f9fafb',
    },
    searchContainer: {
        paddingHorizontal: 16,
        paddingTop: 10,
        paddingBottom: 6,
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
        color: '#111827',
        paddingVertical: 0,
    },
    optionsBtn: {
        padding: 4,
        position: 'relative',
    },
    activeDot: {
        position: 'absolute',
        top: 2,
        right: 2,
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: '#ef4444',
    },
    categoryContainer: {
        marginBottom: 8,
    },
    categoryScroll: {
        paddingHorizontal: 16,
        paddingVertical: 6,
    },
    categoryPill: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#ffffff',
        paddingHorizontal: 14,
        paddingVertical: 8,
        borderRadius: 9999,
        borderWidth: 1,
        borderColor: '#e5e7eb',
        marginRight: 8,
    },
    categoryPillActive: {
        backgroundColor: '#111827',
        borderColor: '#111827',
    },
    categoryPillText: {
        fontSize: 13,
        fontWeight: '500',
        color: '#4b5563',
    },
    categoryPillTextActive: {
        color: '#ffffff',
        fontWeight: '600',
    },
    activeFiltersBar: {
        paddingHorizontal: 16,
        marginBottom: 8,
    },
    activeFiltersScroll: {
        alignItems: 'center',
    },
    activeFiltersLabel: {
        fontSize: 12,
        fontWeight: '600',
        color: '#6b7280',
        marginRight: 6,
    },
    filterChip: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#e5e7eb',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
        marginRight: 6,
    },
    filterChipText: {
        fontSize: 12,
        color: '#374151',
        fontWeight: '500',
    },
    clearAllBtn: {
        marginLeft: 4,
    },
    clearAllBtnText: {
        fontSize: 12,
        color: '#ef4444',
        fontWeight: '600',
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
        marginTop: 60,
    },
    emptyText: {
        fontSize: 15,
        color: '#6b7280',
        marginTop: 8,
        textAlign: 'center',
    },
    resetSearchBtn: {
        marginTop: 14,
        backgroundColor: '#111827',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 8,
    },
    resetSearchBtnText: {
        color: '#ffffff',
        fontSize: 13,
        fontWeight: '600',
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: '#ffffff',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        padding: 20,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
        paddingBottom: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#f3f4f6',
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#111827',
    },
    sectionTitle: {
        fontSize: 14,
        fontWeight: '600',
        color: '#374151',
        marginBottom: 10,
    },
    sortOptionItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 12,
        paddingHorizontal: 12,
        borderRadius: 8,
        marginBottom: 4,
    },
    sortOptionItemActive: {
        backgroundColor: '#f3f4f6',
    },
    sortOptionText: {
        fontSize: 14,
        color: '#4b5563',
    },
    sortOptionTextActive: {
        fontWeight: '700',
        color: '#111827',
    },
    priceRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    priceInputBox: {
        flex: 1,
    },
    priceLabel: {
        fontSize: 12,
        color: '#6b7280',
        marginBottom: 4,
    },
    priceInput: {
        backgroundColor: '#f9fafb',
        borderWidth: 1,
        borderColor: '#d1d5db',
        borderRadius: 8,
        paddingHorizontal: 12,
        paddingVertical: 8,
        fontSize: 14,
        color: '#111827',
    },
    priceDash: {
        fontSize: 16,
        color: '#9ca3af',
        marginTop: 16,
    },
    modalActions: {
        flexDirection: 'row',
        gap: 12,
        marginTop: 20,
        paddingTop: 12,
        borderTopWidth: 1,
        borderTopColor: '#f3f4f6',
    },
    resetModalBtn: {
        flex: 1,
        paddingVertical: 12,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: '#d1d5db',
        alignItems: 'center',
    },
    resetModalBtnText: {
        color: '#374151',
        fontWeight: '600',
        fontSize: 14,
    },
    applyModalBtn: {
        flex: 1,
        backgroundColor: '#111827',
        paddingVertical: 12,
        borderRadius: 10,
        alignItems: 'center',
    },
    applyModalBtnText: {
        color: '#ffffff',
        fontWeight: '600',
        fontSize: 14,
    },
});
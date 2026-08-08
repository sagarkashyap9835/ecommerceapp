import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { FlatList, Text, TouchableOpacity, View, ActivityIndicator, ScrollView, Image, StyleSheet, Dimensions } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import Header from "../../../components/Header";
import { COLORS } from "@/assets/constants";
import type { Order } from "@/assets/constants/types";
import { formatDate } from "@/assets/assets";
import { useAuth } from "@/context/AuthContext";
import api from "../../../constants/api";
import { getDeliveryDateForOrder } from "../../../utils/delivery";

const { width } = Dimensions.get('window');

export default function Orders() {
    const { getToken } = useAuth();
    const router = useRouter();
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchOrders = async () => {
        try {
            setLoading(true);
            const token = await getToken();
            const { data } = await api.get("/orders", {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (data.success) {
                setOrders(data.data);
            }
        } catch (error) {
            console.error("Failed to fetch orders:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOrders();
    }, []);

    const getStatusInfo = (status: string) => {
        switch (status.toLowerCase()) {
            case 'delivered': return { color: '#10B981', bg: '#D1FAE5', icon: 'checkmark-circle' };
            case 'shipped': return { color: '#3B82F6', bg: '#DBEAFE', icon: 'boat' };
            case 'processing': return { color: '#F59E0B', bg: '#FEF3C7', icon: 'time' };
            case 'cancelled': return { color: '#EF4444', bg: '#FEE2E2', icon: 'close-circle' };
            default: return { color: '#6B7280', bg: '#F3F4F6', icon: 'cube' };
        }
    };

    const getPaymentInfo = (status: string) => {
        switch (status.toLowerCase()) {
            case 'paid': return { color: '#10B981', bg: '#D1FAE5' };
            case 'refunded': return { color: '#8B5CF6', bg: '#EDE9FE' };
            case 'failed': return { color: '#EF4444', bg: '#FEE2E2' };
            default: return { color: '#F59E0B', bg: '#FEF3C7' };
        }
    };

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <Header title="My Orders" showBack />

            {loading ? (
                <View style={styles.centerContainer}>
                    <ActivityIndicator size="large" color={COLORS.primary || "#FF3399"} />
                </View>
            ) : orders.length === 0 ? (
                <View style={styles.centerContainer}>
                    <View style={styles.emptyIconContainer}>
                        <Ionicons name="bag-handle-outline" size={64} color="#FF3399" />
                    </View>
                    <Text style={styles.emptyTitle}>No Orders Yet</Text>
                    <Text style={styles.emptySubtitle}>
                        Your order history is empty. Start exploring our collections!
                    </Text>
                    <TouchableOpacity
                        onPress={() => router.push("/shop")}
                        style={styles.shopButton}
                        activeOpacity={0.8}
                    >
                        <Text style={styles.shopButtonText}>Start Shopping</Text>
                    </TouchableOpacity>
                </View>
            ) : (
                <FlatList
                    data={orders}
                    keyExtractor={(item) => item._id}
                    contentContainerStyle={styles.listContainer}
                    showsVerticalScrollIndicator={false}
                    renderItem={({ item }) => {
                        const statusInfo = getStatusInfo(item.orderStatus);
                        const payInfo = getPaymentInfo(item.paymentStatus);
                        
                        return (
                            <TouchableOpacity
                                style={styles.orderCard}
                                activeOpacity={0.9}
                                onPress={() => {
                                    const targetId = item._id || (item as any).id;
                                    if (targetId) {
                                        router.push(`/orders/${targetId}`);
                                    }
                                }}
                            >
                                {/* Header Section */}
                                <View style={styles.cardHeader}>
                                    <View style={styles.orderIdContainer}>
                                        <View style={styles.iconBox}>
                                            <Ionicons name="receipt" size={16} color="#FF3399" />
                                        </View>
                                        <View>
                                            <Text style={styles.orderIdLabel}>Order Number</Text>
                                            <Text style={styles.orderIdText}>#{item.orderNumber}</Text>
                                        </View>
                                    </View>
                                    <Text style={styles.dateText}>{formatDate(item.createdAt)}</Text>
                                </View>

                                {/* Badges Section */}
                                <View style={styles.badgesContainer}>
                                    <View style={[styles.badge, { backgroundColor: statusInfo.bg }]}>
                                        <Ionicons name={statusInfo.icon as any} size={12} color={statusInfo.color} style={{ marginRight: 4 }} />
                                        <Text style={[styles.badgeText, { color: statusInfo.color }]}>
                                            {item.orderStatus}
                                        </Text>
                                    </View>
                                    
                                    <View style={[styles.badge, { backgroundColor: payInfo.bg }]}>
                                        <Ionicons name={item.paymentStatus === 'refunded' ? "cash" : "wallet"} size={12} color={payInfo.color} style={{ marginRight: 4 }} />
                                        <Text style={[styles.badgeText, { color: payInfo.color }]}>
                                            {item.paymentStatus === 'refunded' ? 'Refunded' : item.paymentStatus}
                                        </Text>
                                    </View>

                                    {item.replacementRequest && item.replacementRequest.status !== 'none' ? (
                                        <View style={[styles.badge, { backgroundColor: '#E0F2FE' }]}>
                                            <Ionicons name="refresh" size={12} color="#0284C7" style={{ marginRight: 4 }} />
                                            <Text style={[styles.badgeText, { color: '#0284C7' }]}>
                                                Replacement ({item.replacementRequest.status})
                                            </Text>
                                        </View>
                                    ) : null}
                                </View>

                                {/* Delivery Info Box */}
                                <View style={styles.deliveryBox}>
                                    <View style={styles.deliveryIconCircle}>
                                        <Ionicons name="bus" size={16} color="#059669" />
                                    </View>
                                    <View style={styles.deliveryTextContainer}>
                                        <Text style={styles.deliveryLabel}>
                                            {item.orderStatus === 'delivered' ? 'Delivered on' : 'Expected Delivery'}
                                        </Text>
                                        <Text style={styles.deliveryDateText}>
                                            {getDeliveryDateForOrder(item as any)}
                                        </Text>
                                    </View>
                                </View>

                                {/* Product Images Row */}
                                <View style={styles.productsSection}>
                                    <Text style={styles.sectionLabel}>Items</Text>
                                    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.imagesScroll}>
                                        {item.items.map((prod: any, idx) => {
                                            const image = prod.product?.images?.[0];
                                            return (
                                                <View key={idx} style={styles.imageContainer}>
                                                    {image ? (
                                                        <Image
                                                            source={{ uri: image }}
                                                            style={styles.productImage}
                                                            resizeMode="cover"
                                                        />
                                                    ) : (
                                                        <View style={styles.productImagePlaceholder}>
                                                            <Ionicons name="image-outline" size={20} color="#FF3399" />
                                                        </View>
                                                    )}
                                                </View>
                                            );
                                        })}
                                    </ScrollView>
                                </View>

                                <View style={styles.divider} />

                                {/* Footer */}
                                <View style={styles.footerRow}>
                                    <View>
                                        <Text style={styles.paymentMethodLabel}>Payment Method</Text>
                                        <Text style={styles.paymentMethodText}>{item.paymentMethod}</Text>
                                    </View>
                                    <View style={styles.totalContainer}>
                                        <Text style={styles.totalItemsText}>{item.items.length} {item.items.length === 1 ? 'Item' : 'Items'}</Text>
                                        <Text style={styles.totalAmountText}>₹{item.totalAmount.toFixed(2)}</Text>
                                    </View>
                                </View>
                            </TouchableOpacity>
                        );
                    }}
                />
            )}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFFFFF',
    },
    centerContainer: {
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
    listContainer: {
        padding: 16,
        paddingBottom: 40,
    },
    orderCard: {
        backgroundColor: '#FFF5F8',
        borderRadius: 24,
        padding: 20,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: '#FBCFE8',
        shadowColor: '#FF3399',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.08,
        shadowRadius: 20,
        elevation: 4,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    orderIdContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    iconBox: {
        width: 36,
        height: 36,
        borderRadius: 12,
        backgroundColor: '#FCE7F3',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    orderIdLabel: {
        fontSize: 11,
        color: '#64748B',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
        fontWeight: '600',
        fontFamily: 'Outfit_600',
        marginBottom: 2,
    },
    orderIdText: {
        fontSize: 15,
        fontWeight: '800',
        color: '#0F172A',
        fontFamily: 'Outfit_800',
    },
    dateText: {
        fontSize: 12,
        color: '#94A3B8',
        fontWeight: '500',
        fontFamily: 'Outfit_500',
    },
    badgesContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
        marginBottom: 16,
    },
    badge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 8,
    },
    badgeText: {
        fontSize: 11,
        fontWeight: '700',
        textTransform: 'capitalize',
        fontFamily: 'Outfit_700',
    },
    deliveryBox: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#ECFDF5',
        padding: 12,
        borderRadius: 12,
        marginBottom: 20,
        borderWidth: 1,
        borderColor: '#D1FAE5',
    },
    deliveryIconCircle: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: '#A7F3D0',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    deliveryTextContainer: {
        flex: 1,
    },
    deliveryLabel: {
        fontSize: 11,
        color: '#065F46',
        fontWeight: '700',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
        fontFamily: 'Outfit_700',
        marginBottom: 2,
    },
    deliveryDateText: {
        fontSize: 14,
        fontWeight: '800',
        color: '#064E3B',
        fontFamily: 'Outfit_800',
    },
    productsSection: {
        marginBottom: 16,
    },
    sectionLabel: {
        fontSize: 13,
        fontWeight: '700',
        color: '#334155',
        marginBottom: 10,
        fontFamily: 'Outfit_700',
    },
    imagesScroll: {
        flexDirection: 'row',
    },
    imageContainer: {
        marginRight: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
    },
    productImage: {
        width: 56,
        height: 56,
        borderRadius: 12,
        backgroundColor: '#FFFFFF',
        borderWidth: 1,
        borderColor: '#FBCFE8',
    },
    productImagePlaceholder: {
        width: 56,
        height: 56,
        borderRadius: 12,
        backgroundColor: '#FFF0F5',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#FBCFE8',
    },
    divider: {
        height: 1,
        backgroundColor: '#FBCFE8',
        marginBottom: 16,
    },
    footerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-end',
    },
    paymentMethodLabel: {
        fontSize: 11,
        color: '#64748B',
        fontWeight: '600',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
        fontFamily: 'Outfit_600',
        marginBottom: 4,
    },
    paymentMethodText: {
        fontSize: 14,
        fontWeight: '700',
        color: '#0F172A',
        textTransform: 'capitalize',
        fontFamily: 'Outfit_700',
    },
    totalContainer: {
        alignItems: 'flex-end',
    },
    totalItemsText: {
        fontSize: 12,
        color: '#64748B',
        fontWeight: '500',
        fontFamily: 'Outfit_500',
        marginBottom: 2,
    },
    totalAmountText: {
        fontSize: 18,
        fontWeight: '800',
        color: '#FF3399',
        fontFamily: 'Outfit_800',
    },
});

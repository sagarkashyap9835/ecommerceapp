import React, { useEffect, useState } from "react";
import { ScrollView, Text, TouchableOpacity, View, ActivityIndicator, RefreshControl, Modal, Pressable, FlatList, StyleSheet, Alert } from "react-native";
import { COLORS, getStatusColor } from "@/assets/constants";
import { Ionicons } from "@expo/vector-icons";
// import { dummyOrders, dummyUser } from "@/assets/assets";
import { useAuth } from "@/context/AuthContext";
import api from "../../../../constants/api";
export default function AdminOrders() {
    const {getToken}=useAuth()
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [orders, setOrders] = useState([]);

    // Status Modal State
    const [statusModalVisible, setStatusModalVisible] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState<any>(null);
    const [updating, setUpdating] = useState(false);

    const STATUSES = ["placed", "processing", "shipped", "delivered", "cancelled"];

    const fetchOrders = async () => {
try {
       const token=await getToken()
       const {data}=await api.get("/orders/admin/all", {headers:{
        Authorization:`Bearer ${token}`
       }})
       if(data.success){
        setOrders(data.data)
       }
    
} catch (error) {
    console.error("failed to fetch orders", error)
    Alert.alert("Error","Failed to load orders")
    
}  finally{
    setLoading(false)
    setRefreshing(false)
}

};

    useEffect(() => {
        fetchOrders();
    }, []);

    const onRefresh = () => {
        setRefreshing(true);
        fetchOrders();
    };

    const openStatusModal = (order: any) => {
        setSelectedOrder(order);
        setStatusModalVisible(true);
    };

    const updateStatus = async (newStatus: string) => {
        if (!selectedOrder) return;
        try {
            setUpdating(true);
            const token = await getToken();
            const { data } = await api.put(`/orders/admin/${selectedOrder._id}`, {
                orderStatus: newStatus
            }, { headers: { Authorization: `Bearer ${token}` } });

            if (data.success) {
                Alert.alert("Success", "Order status updated");
                setStatusModalVisible(false);
                fetchOrders();
            }
        } catch (error) {
            console.error("Failed to update status", error);
            Alert.alert("Error", "Failed to update status");
        } finally {
            setUpdating(false);
        }
    };

    if (loading && !refreshing) {
        return (
            <View style={styles.centerComponent}>
                <ActivityIndicator size="large" color={COLORS.primary || '#000'} />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
            >
                {orders.length === 0 ? (
                    <View style={styles.emptyComponent}>
                        <Text style={styles.secondaryText}>No orders found</Text>
                    </View>
                ) : (
                    orders.map((order: any) => {
                        // getStatusColor से सेफ ऑब्जेक्ट्स निकालना
                        const statusStyles = (getStatusColor(order.orderStatus) as any) || {};
                        const badgeBgColor = statusStyles.backgroundColor || '#f3f4f6';
                        const badgeTextColor = statusStyles.color || '#111827';

                        return (
                            <View key={order._id} style={styles.orderCard}>
                                <View style={styles.orderHeaderRow}>
                                    <Text style={styles.orderIdText}>Order ID : #{order._id}</Text>
                                    <Text style={styles.secondaryTextSmall}>{new Date(order.createdAt).toLocaleDateString()}</Text>
                                </View>

                                <View style={styles.infoBox}>
                                    <Text style={styles.infoBoxLabel}>CUSTOMER</Text>
                                    <Text style={styles.primaryTextMedium}>{order.user?.name || 'Unknown User'}</Text>
                                    <Text style={styles.secondaryTextSmall}>{order.user?.email || 'No email'}</Text>
                                </View>

                                <View style={styles.infoBox}>
                                    <Text style={styles.infoBoxLabel}>SHIPPING ADDRESS</Text>
                                    {order.shippingAddress?.villageHouseCode ? (
                                        <View style={{ backgroundColor: "#ECFDF5", paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6, marginBottom: 6, alignSelf: "flex-start", borderWidth: 1, borderColor: "#A7F3D0" }}>
                                            <Text style={{ fontSize: 12, fontWeight: "800", color: "#065F46" }}>
                                                🏡 Village / Gram House Code: #{order.shippingAddress.villageHouseCode}
                                            </Text>
                                        </View>
                                    ) : null}
                                    <Text style={styles.primaryTextSmall}>
                                        {order.shippingAddress?.villageHouseCode && !order.shippingAddress?.street?.toLowerCase().includes("house #") ? `House #${order.shippingAddress.villageHouseCode}, ` : ""}
                                        {order.shippingAddress?.street}, {order.shippingAddress?.city}
                                    </Text>
                                    <Text style={styles.primaryTextSmall}>
                                        {order.shippingAddress?.state}, {order.shippingAddress?.zipCode}, {order.shippingAddress?.country}
                                    </Text>
                                </View>

                                <View style={styles.itemsSection}>
                                    <Text style={styles.infoBoxLabelVariant}>ITEMS</Text>
                                    {order.items.map((item: any) => (
                                        <View key={item._id} style={styles.itemRow}>
                                            <Text style={styles.itemInfoText} numberOfLines={1}>
                                                {item.quantity}x {item.product?.name || item.name}
                                                {item.size && (
                                                    <Text style={styles.itemSizeText}>
                                                        {" "}({item.size})
                                                    </Text>
                                                )}
                                            </Text>
                                            <Text style={styles.itemPriceText}>
                                                ${item.price.toFixed(2)}
                                            </Text>
                                        </View>
                                    ))}
                                </View>

                                <View style={styles.orderFooterRow}>
                                    <Text style={styles.totalAmountText}>${order.totalAmount.toFixed(2)}</Text>

                                    <TouchableOpacity
                                        activeOpacity={0.7}
                                        onPress={() => openStatusModal(order)}
                                        style={[styles.statusBadgeButton, { backgroundColor: badgeBgColor }]}
                                    >
                                        <Text style={[styles.statusBadgeText, { color: badgeTextColor }]}>{order.orderStatus}</Text>
                                        <Ionicons name="pencil" size={12} color={badgeTextColor} style={styles.pencilIcon} />
                                    </TouchableOpacity>
                                </View>
                            </View>
                        );
                    })
                )}
            </ScrollView>

            {/* STATUS MODAL */}
            <Modal visible={statusModalVisible} animationType="fade" transparent>
                <Pressable style={styles.modalOverlay} onPress={() => setStatusModalVisible(false)}>
                    <Pressable style={styles.modalContent} onPress={(e) => e.stopPropagation()}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Update Order Status</Text>
                            <TouchableOpacity onPress={() => setStatusModalVisible(false)} activeOpacity={0.7}>
                                <Ionicons name="close" size={24} color={COLORS.secondary || '#6b7280'} />
                            </TouchableOpacity>
                        </View>

                        {updating ? (
                            <View style={styles.modalLoadingBox}>
                                <ActivityIndicator size="large" color={COLORS.primary || '#000'} />
                                <Text style={styles.modalLoadingText}>Updating status...</Text>
                            </View>
                        ) : (
                            <FlatList
                                data={STATUSES}
                                keyExtractor={(item) => item}
                                renderItem={({ item }) => {
                                    const isSelected = selectedOrder?.orderStatus === item;
                                    return (
                                        <TouchableOpacity
                                            activeOpacity={0.8}
                                            style={[
                                                styles.modalStatusItem,
                                                isSelected ? styles.modalStatusItemActive : styles.modalStatusItemInactive
                                            ]}
                                            onPress={() => updateStatus(item)}
                                        >
                                            <Text style={[
                                                styles.modalStatusText,
                                                isSelected ? styles.modalStatusTextActive : styles.modalStatusTextInactive
                                            ]}>
                                                {item}
                                            </Text>
                                            {isSelected && (
                                                <Ionicons name="checkmark-circle" size={20} color={COLORS.primary || '#000'} />
                                            )}
                                        </TouchableOpacity>
                                    );
                                }}
                            />
                        )}
                    </Pressable>
                </Pressable>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f9fafb', // surface backround
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        padding: 16,
    },
    centerComponent: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f9fafb',
    },
    emptyComponent: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 80,
    },
    secondaryText: {
        color: '#6b7280',
        fontSize: 15,
    },
    orderCard: {
        backgroundColor: '#ffffff',
        padding: 16,
        borderRadius: 12,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: '#f3f4f6',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.03,
        shadowRadius: 2,
        elevation: 2,
    },
    orderHeaderRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 8,
    },
    orderIdText: {
        fontWeight: '500',
        fontSize: 14,
        color: '#9ca3af', // gray-400
    },
    secondaryTextSmall: {
        color: '#6b7280',
        fontSize: 12,
    },
    infoBox: {
        marginBottom: 12,
        backgroundColor: '#f9fafb', // gray-50
        padding: 12,
        borderRadius: 8,
    },
    infoBoxLabel: {
        fontSize: 12,
        color: '#6b7280',
        fontWeight: '700',
        marginBottom: 4,
    },
    infoBoxLabelVariant: {
        fontSize: 12,
        color: '#6b7280',
        fontWeight: '700',
        marginBottom: 8,
    },
    primaryTextMedium: {
        color: '#111827',
        fontWeight: '500',
        fontSize: 14,
    },
    primaryTextSmall: {
        color: '#111827',
        fontSize: 12,
        lineHeight: 16,
    },
    itemsSection: {
        marginBottom: 12,
    },
    itemRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 4,
    },
    itemInfoText: {
        color: '#6b7280',
        fontSize: 12,
        flex: 1,
        marginRight: 8,
    },
    itemSizeText: {
        color: '#9ca3af',
    },
    itemPriceText: {
        color: '#6b7280',
        fontSize: 12,
        fontWeight: '700',
    },
    orderFooterRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 8,
        paddingTop: 12,
        borderTopWidth: 1,
        borderTopColor: '#f3f4f6',
    },
    totalAmountText: {
        color: '#111827',
        fontWeight: '700',
        fontSize: 18,
    },
    statusBadgeButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 9999,
    },
    statusBadgeText: {
        fontSize: 12,
        fontWeight: '700',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
        marginRight: 8,
    },
    pencilIcon: {
        opacity: 0.6,
    },
    // Modal Styles
    modalOverlay: {
        flex: 1,
        justifyContent: 'flex-end',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalContent: {
        backgroundColor: '#ffffff',
        borderTopLeftRadius: 16,
        borderTopRightRadius: 16,
        padding: 16,
        maxHeight: '60%',
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
        paddingBottom: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#f3f4f6',
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#111827',
    },
    modalLoadingBox: {
        paddingVertical: 32,
        alignItems: 'center',
    },
    modalLoadingText: {
        textAlign: 'center',
        color: '#6b7280',
        marginTop: 8,
    },
    modalStatusItem: {
        padding: 16,
        borderRadius: 12,
        marginBottom: 8,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    modalStatusItemActive: {
        backgroundColor: 'rgba(0, 0, 0, 0.05)', // bg-primary/10 (मानते हुए ब्लैक थीम है)
    },
    modalStatusItemInactive: {
        backgroundColor: '#f9fafb',
    },
    modalStatusText: {
        fontSize: 14,
        textTransform: 'capitalize',
    },
    modalStatusTextActive: {
        color: '#000000',
        fontWeight: '700',
    },
    modalStatusTextInactive: {
        color: '#6b7280',
        fontWeight: '500',
    },
});
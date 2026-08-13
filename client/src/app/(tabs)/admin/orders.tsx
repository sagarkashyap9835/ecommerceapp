import React, { useEffect, useState } from "react";
import { ScrollView, Text, TouchableOpacity, View, ActivityIndicator, RefreshControl, Modal, Pressable, FlatList, StyleSheet, Alert } from "react-native";
import { COLORS, getStatusColor } from "@/assets/constants";
import { Ionicons } from "@expo/vector-icons";
// import { dummyOrders, dummyUser } from "@/assets/assets";
import { useAuth } from "@/context/AuthContext";
import api from "../../../../constants/api";
import { getColorName } from "../../../../utils/colors";
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

    const handleReplacementStatus = async (orderId: string, status: string) => {
        try {
            const token = await getToken();
            const { data } = await api.put(`/orders/admin/${orderId}/replacement`, {
                status
            }, { headers: { Authorization: `Bearer ${token}` } });

            if (data.success) {
                Alert.alert("Success", `Replacement request ${status}`);
                fetchOrders();
            }
        } catch (error: any) {
            console.error("Failed to update replacement status", error);
            Alert.alert("Error", error.response?.data?.message || "Failed to update replacement status");
        }
    };

    if (loading && !refreshing) {
        return (
            <View style={styles.centerComponent}>
                <ActivityIndicator size="large" color="#FF3399" />
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
                                                        {" "}(Size: {item.size})
                                                    </Text>
                                                )}
                                                {item.color && (
                                                    <Text style={styles.itemSizeText}>
                                                        {" "}(Color: {getColorName(item.color)})
                                                    </Text>
                                                )}
                                            </Text>
                                            <Text style={styles.itemPriceText}>
                                                ${item.price.toFixed(2)}
                                            </Text>
                                        </View>
                                    ))}
                                </View>

                                {order.replacementRequest && order.replacementRequest.status !== "none" && (
                                    <View style={{marginTop: 12, backgroundColor: '#F0F9FF', borderRadius: 12, padding: 12, borderWidth: 1, borderColor: '#BAE6FD'}}>
                                        <View style={{flexDirection: 'row', alignItems: 'center', marginBottom: 8}}>
                                            <Ionicons name="refresh-circle" size={20} color="#0284C7" style={{marginRight: 6}} />
                                            <Text style={{fontSize: 14, fontWeight: '700', color: '#0369A1'}}>2-Day Replacement Requested</Text>
                                        </View>
                                        <Text style={{fontSize: 13, color: '#0F172A', marginBottom: 4}}>
                                            <Text style={{fontWeight: '700'}}>Reason: </Text>{order.replacementRequest.reason}
                                        </Text>
                                        <Text style={{fontSize: 12, color: '#64748B', marginBottom: 12}}>
                                            Status: <Text style={{fontWeight: '700', color: order.replacementRequest.status === 'pending' ? '#D97706' : order.replacementRequest.status === 'approved' ? '#16A34A' : '#DC2626', textTransform: 'capitalize'}}>{order.replacementRequest.status}</Text>
                                        </Text>

                                        {order.replacementRequest.status === "pending" && (
                                            <View style={{flexDirection: 'row', gap: 10}}>
                                                <TouchableOpacity 
                                                    style={{flex: 1, backgroundColor: '#10B981', paddingVertical: 10, borderRadius: 8, alignItems: 'center'}}
                                                    onPress={() => handleReplacementStatus(order._id, 'approved')}
                                                >
                                                    <Text style={{color: '#FFF', fontWeight: '700', fontSize: 13}}>Approve</Text>
                                                </TouchableOpacity>
                                                <TouchableOpacity 
                                                    style={{flex: 1, backgroundColor: '#EF4444', paddingVertical: 10, borderRadius: 8, alignItems: 'center'}}
                                                    onPress={() => handleReplacementStatus(order._id, 'rejected')}
                                                >
                                                    <Text style={{color: '#FFF', fontWeight: '700', fontSize: 13}}>Reject</Text>
                                                </TouchableOpacity>
                                            </View>
                                        )}
                                    </View>
                                )}

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
                                <ActivityIndicator size="large" color="#FF3399" />
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
                                                <Ionicons name="checkmark-circle" size={24} color="#FF3399" />
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
        backgroundColor: '#FFFFFF', 
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        padding: 20,
        paddingBottom: 40,
    },
    centerComponent: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
    },
    emptyComponent: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 80,
    },
    secondaryText: {
        color: '#94A3B8',
        fontSize: 15,
        fontFamily: 'Outfit_500',
    },
    orderCard: {
        backgroundColor: '#ffffff',
        padding: 20,
        borderRadius: 20,
        marginBottom: 20,
        borderWidth: 1,
        borderColor: '#F1F5F9',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 3,
    },
    orderHeaderRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    orderIdText: {
        fontWeight: '700',
        fontSize: 14,
        color: '#64748B', 
        fontFamily: 'Outfit_700',
    },
    secondaryTextSmall: {
        color: '#94A3B8',
        fontSize: 12,
        fontFamily: 'Outfit_500',
    },
    infoBox: {
        marginBottom: 16,
        backgroundColor: '#F8FAFC', 
        padding: 16,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#F1F5F9',
    },
    infoBoxLabel: {
        fontSize: 11,
        color: '#64748B',
        fontWeight: '800',
        marginBottom: 6,
        fontFamily: 'Outfit_800',
        letterSpacing: 0.5,
    },
    infoBoxLabelVariant: {
        fontSize: 11,
        color: '#64748B',
        fontWeight: '800',
        marginBottom: 10,
        fontFamily: 'Outfit_800',
        letterSpacing: 0.5,
    },
    primaryTextMedium: {
        color: '#0F172A',
        fontWeight: '700',
        fontSize: 15,
        fontFamily: 'Outfit_700',
        marginBottom: 2,
    },
    primaryTextSmall: {
        color: '#475569',
        fontSize: 13,
        lineHeight: 18,
        fontFamily: 'Outfit_500',
    },
    itemsSection: {
        marginBottom: 16,
        paddingHorizontal: 4,
    },
    itemRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 8,
    },
    itemInfoText: {
        color: '#475569',
        fontSize: 13,
        flex: 1,
        marginRight: 12,
        fontFamily: 'Outfit_500',
    },
    itemSizeText: {
        color: '#94A3B8',
    },
    itemPriceText: {
        color: '#0F172A',
        fontSize: 13,
        fontWeight: '800',
        fontFamily: 'Outfit_800',
    },
    orderFooterRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 8,
        paddingTop: 16,
        borderTopWidth: 1,
        borderTopColor: '#F1F5F9',
    },
    totalAmountText: {
        color: '#0F172A',
        fontWeight: '800',
        fontSize: 20,
        fontFamily: 'Outfit_800',
    },
    statusBadgeButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 9999,
    },
    statusBadgeText: {
        fontSize: 12,
        fontWeight: '800',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
        marginRight: 8,
        fontFamily: 'Outfit_800',
    },
    pencilIcon: {
        opacity: 0.8,
    },
    // Modal Styles
    modalOverlay: {
        flex: 1,
        justifyContent: 'flex-end',
        backgroundColor: 'rgba(0, 0, 0, 0.4)',
    },
    modalContent: {
        backgroundColor: '#ffffff',
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        padding: 24,
        maxHeight: '65%',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.1,
        shadowRadius: 20,
        elevation: 10,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
        paddingBottom: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#F1F5F9',
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: '800',
        color: '#0F172A',
        fontFamily: 'Outfit_800',
    },
    modalLoadingBox: {
        paddingVertical: 40,
        alignItems: 'center',
    },
    modalLoadingText: {
        textAlign: 'center',
        color: '#64748B',
        marginTop: 12,
        fontFamily: 'Outfit_500',
    },
    modalStatusItem: {
        padding: 16,
        paddingHorizontal: 20,
        borderRadius: 16,
        marginBottom: 12,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    modalStatusItemActive: {
        backgroundColor: '#FDF2F8', 
    },
    modalStatusItemInactive: {
        backgroundColor: '#F8FAFC',
        borderWidth: 1,
        borderColor: '#F1F5F9',
    },
    modalStatusText: {
        fontSize: 15,
        textTransform: 'capitalize',
        fontFamily: 'Outfit_600',
    },
    modalStatusTextActive: {
        color: '#FF3399',
        fontWeight: '800',
        fontFamily: 'Outfit_800',
    },
    modalStatusTextInactive: {
        color: '#64748B',
        fontWeight: '500',
    },
});
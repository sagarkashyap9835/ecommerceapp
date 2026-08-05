import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { FlatList, Text, TouchableOpacity, View, ActivityIndicator, ScrollView, Image } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import Header from "../../../components/Header";
import { COLORS, getStatusColor } from "@/assets/constants";
import type { Order } from "@/assets/constants/types";
import { formatDate } from "@/assets/assets";
import { useAuth } from "@/context/AuthContext";
import api from "../../../constants/api";
import { getDeliveryDateForOrder } from "../../../utils/delivery";

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

    return (
        <SafeAreaView className="flex-1 bg-surface" edges={['top']}>
            <Header title="My Orders" showBack />

            {loading ? (
                <View className="flex-1 justify-center items-center">
                    <ActivityIndicator size="large" color={COLORS.primary || "#111827"} />
                </View>
            ) : orders.length === 0 ? (
                <View className="flex-1 justify-center items-center p-6">
                    <Ionicons name="receipt-outline" size={60} color="#9CA3AF" style={{ marginBottom: 12 }} />
                    <Text className="text-gray-900 font-bold text-lg mb-1">No Orders Yet</Text>
                    <Text className="text-gray-500 text-sm text-center mb-6">
                        When you place an order, it will appear here so you can track its status.
                    </Text>
                    <TouchableOpacity
                        onPress={() => router.push("/shop")}
                        style={{ backgroundColor: "#111827", paddingHorizontal: 20, paddingVertical: 12, borderRadius: 10 }}
                    >
                        <Text style={{ color: "#FFFFFF", fontWeight: "600", fontSize: 14 }}>Start Shopping</Text>
                    </TouchableOpacity>
                </View>
            ) : (
                <FlatList
                    data={orders}
                    keyExtractor={(item) => item._id}
                    contentContainerStyle={{ padding: 16 }}
                    renderItem={({ item }) => (
                        <TouchableOpacity
                            className="bg-white p-4 rounded-xl mb-4 border border-gray-100 shadow-sm"
                            onPress={() => {
                                const targetId = item._id || (item as any).id;
                                if (targetId) {
                                    router.push(`/orders/${targetId}`);
                                }
                            }}
                        >
                            <View className="flex-row justify-between mb-2">
                                <Text className="text-primary font-bold">Order #{item.orderNumber}</Text>
                                <Text className="text-secondary text-sm">{formatDate(item.createdAt)}</Text>
                            </View>

                            {/* Status Badges */}
                            <View className="flex-row gap-2 mb-3 flex-wrap">
                                <View className={`px-2 py-1 rounded-full ${getStatusColor(item.orderStatus)}`}>
                                    <Text className={`text-xs font-bold capitalize`}>
                                        {item.orderStatus}
                                    </Text>
                                </View>

                                <View className={`px-2 py-1 rounded-full ${item.paymentStatus === 'paid' ? 'bg-green-100' : item.paymentStatus === 'refunded' ? 'bg-emerald-100' : 'bg-gray-100'}`}>
                                    <Text className={`text-xs font-bold capitalize ${item.paymentStatus === 'paid' ? 'text-green-700' : item.paymentStatus === 'refunded' ? 'text-emerald-800' : 'text-gray-700'}`}>
                                        {item.paymentStatus === 'refunded' ? '💰 Refunded' : item.paymentStatus}
                                    </Text>
                                </View>

                                {item.replacementRequest && item.replacementRequest.status !== 'none' ? (
                                    <View className="px-2 py-1 rounded-full bg-sky-100 border border-sky-200">
                                        <Text className="text-xs font-bold text-sky-800 capitalize">
                                            🔄 Replacement ({item.replacementRequest.status})
                                        </Text>
                                    </View>
                                ) : null}
                            </View>

                            <View className="flex-row justify-between items-center mb-2">
                                <Text className="text-secondary text-xs">Payment Method: <Text className="text-primary font-medium capitalize">{item.paymentMethod}</Text></Text>
                            </View>

                            {/* Estimated Delivery Tag */}
                            <View className="flex-row items-center mb-3 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200">
                                <Ionicons name="bus-outline" size={14} color="#059669" />
                                <Text className="text-emerald-800 text-xs font-bold ml-1.5">
                                    {item.orderStatus === 'delivered' ? 'Delivered on: ' : 'Expected Delivery: '}
                                    {getDeliveryDateForOrder(item as any)}
                                </Text>
                            </View>

                            {/* Product Images */}
                            <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-3">
                                {item.items.map((prod: any, idx) => {
                                    const image = prod.product?.images?.[0];
                                    return (
                                        <View key={idx} className="mr-3 border border-gray-100 rounded-md p-1 bg-gray-50">
                                            {image ? (
                                                <Image
                                                    source={{ uri: image }}
                                                    className="w-12 h-12 rounded-md"
                                                    resizeMode="cover"
                                                />
                                            ) : (
                                                <View className="w-12 h-12 bg-gray-200 rounded-md justify-center items-center">
                                                    <Ionicons name="image-outline" size={20} color={COLORS.secondary} />
                                                </View>
                                            )}
                                        </View>
                                    );
                                })}
                            </ScrollView>

                            <View className="flex-row justify-between items-center mt-2 pt-3 border-t border-gray-100">
                                <Text className="text-secondary">Items: {item.items.length}</Text>
                                <Text className="text-primary font-bold text-lg">₹{item.totalAmount.toFixed(2)}</Text>
                            </View>
                        </TouchableOpacity>
                    )}
                />
            )}
        </SafeAreaView>
    );
}

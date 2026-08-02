import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { Image, ScrollView, Text, View, ActivityIndicator, StyleSheet, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Header from "../../../components/Header";
import { COLORS } from "@/assets/constants";
import type { Order, Product } from "@/assets/constants/types";
import { useAuth } from "@clerk/expo";
import api from "../../../constants/api";
import { getDeliveryDateForOrder } from "../../../utils/delivery";

export default function OrderDetails() {
  const { getToken } = useAuth();
  const { id } = useLocalSearchParams();
  const router = useRouter();

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchOrderDetails = async () => {
    if (!id || id === "undefined" || id === "null") {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const token = await getToken();
      const { data } = await api.get(`/orders/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (data.success) {
        setOrder(data.data);
      }
    } catch (error) {
      console.error("Failed to fetch order details:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrderDetails();
  }, [id]);

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color={COLORS.primary || "#111827"} />
      </SafeAreaView>
    );
  }

  if (!order || !id || id === "undefined" || id === "null") {
    return (
      <SafeAreaView style={styles.container} edges={["top"]}>
        <Header title="Order Details" showBack />
        <View style={styles.centered}>
          <Ionicons name="receipt-outline" size={60} color="#9CA3AF" style={{ marginBottom: 12 }} />
          <Text style={{ fontSize: 18, fontWeight: "700", color: "#111827", marginBottom: 6 }}>
            Order Not Found
          </Text>
          <Text style={{ fontSize: 13, color: "#6B7280", textAlign: "center", maxWidth: 280, marginBottom: 20, lineHeight: 18 }}>
            We could not find the requested order. Please check your order history.
          </Text>
          <TouchableOpacity
            style={{ backgroundColor: "#111827", paddingHorizontal: 20, paddingVertical: 12, borderRadius: 10 }}
            onPress={() => router.replace("/orders" as any)}
          >
            <Text style={{ color: "#FFFFFF", fontWeight: "600", fontSize: 14 }}>
              Go to My Orders
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const ORDER_STEPS = [
    { title: "Order Placed", date: formatDate(order.createdAt), completed: true },
    { title: "Processing", date: "", completed: ['processing', 'shipped', 'delivered'].includes(order.orderStatus) },
    { title: "Shipped", date: "", completed: ['shipped', 'delivered'].includes(order.orderStatus) },
    { title: "Delivered", date: "", completed: order.orderStatus === 'delivered' },
  ];

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Header title={`Order #${order.orderNumber}`} showBack />

      <ScrollView style={styles.scrollViewContent}>
        {/* Order Status */}
        <View style={styles.card}>
          {/* Estimated Delivery Banner */}
          <View style={{
            backgroundColor: "#ECFDF5",
            borderRadius: 12,
            padding: 14,
            marginBottom: 16,
            flexDirection: "row",
            alignItems: "center",
            borderWidth: 1,
            borderColor: "#A7F3D0",
          }}>
            <Ionicons name="bus-outline" size={24} color="#059669" />
            <View style={{ marginLeft: 12, flex: 1 }}>
              <Text style={{ fontSize: 11, fontWeight: "800", color: "#047857", letterSpacing: 0.5 }}>
                {order.orderStatus === "delivered" ? "DELIVERED ON" : "ESTIMATED DELIVERY DAY"}
              </Text>
              <Text style={{ fontSize: 16, fontWeight: "800", color: "#065F46", marginTop: 2 }}>
                {getDeliveryDateForOrder(order as any)}
              </Text>
            </View>
          </View>

          <Text style={styles.cardTitle}>Order Tracking Progress</Text>

          {ORDER_STEPS.map((step, index) => (
            <View 
              key={index} 
              style={[
                styles.stepRow, 
                index === ORDER_STEPS.length - 1 && styles.noMarginBottom
              ]}
            >
              <View style={styles.stepIndicatorContainer}>
                <View 
                  style={[
                    styles.stepDot, 
                    { backgroundColor: step.completed ? COLORS.primary : '#D1D5DB' }
                  ]} 
                />
                {index !== ORDER_STEPS.length - 1 && (
                  <View 
                    style={[
                      styles.stepLine, 
                      { backgroundColor: step.completed ? COLORS.primary : '#D1D5DB' }
                    ]} 
                  />
                )}
              </View>
              <View style={styles.stepTextContainer}>
                <Text 
                  style={[
                    styles.stepTitle, 
                    { color: step.completed ? COLORS.primary : '#9CA3AF' }
                  ]}
                >
                  {step.title}
                </Text>
                {step.date ? <Text style={styles.stepDate}>{step.date}</Text> : null}
              </View>
            </View>
          ))}
        </View>

        {/* Items */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Products</Text>
          {order.items.map((item: any, index: number) => {
            const productData = item.product as Product;
            const image = productData?.images?.[0];

            const isLast = index === order.items.length - 1;

            return (
              <View 
                key={index} 
                style={[
                  styles.productRow, 
                  !isLast && styles.productRowBorder
                ]}
              >
                {image && (
                  <Image 
                    source={{ uri: image }} 
                    style={styles.productImage} 
                    resizeMode="contain" 
                  />
                )}
                <View style={styles.productDetails}>
                  <Text style={styles.productName} numberOfLines={1}>
                    {item.name}
                  </Text>
                  <Text style={styles.productMeta}>Size: {item.size}</Text>
                  <View style={styles.productPriceRow}>
                    <Text style={styles.productPrice}>₹{item.price}</Text>
                    <Text style={styles.productMeta}>Qty: {item.quantity}</Text>
                  </View>
                </View>
              </View>
            );
          })}
        </View>

        {/* Shipping Details */}
        <View style={styles.card}>
          <Text style={styles.cardTitleSmall}>Shipping Details</Text>
          {order.shippingAddress?.villageHouseCode ? (
            <View style={{ backgroundColor: "#ECFDF5", paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8, marginBottom: 8, alignSelf: "flex-start", borderWidth: 1, borderColor: "#A7F3D0" }}>
              <Text style={{ fontSize: 13, fontWeight: "800", color: "#065F46" }}>
                🏡 Village / Gram House Code: #{order.shippingAddress.villageHouseCode}
              </Text>
            </View>
          ) : null}
          <View style={styles.shippingRow}>
            <Ionicons name="location-outline" size={20} color={COLORS.secondary} />
            <Text style={styles.shippingText}>
              {order.shippingAddress?.street}, {order.shippingAddress?.city}, {order.shippingAddress?.zipCode}, {order.shippingAddress?.country}
            </Text>
          </View>
        </View>

        {/* Payment Summary */}
        <View style={[styles.card, styles.lastCard]}>
          <Text style={styles.cardTitle}>Payment Summary</Text>
          
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Payment Method</Text>
            <Text style={styles.summaryValueCapitalized}>{order.paymentMethod}</Text>
          </View>
          
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Payment Status</Text>
            <Text 
              style={[
                styles.summaryValueCapitalized, 
                {
                  color: order.paymentStatus === 'paid' 
                    ? '#16A34A' 
                    : order.paymentStatus === 'failed' 
                    ? '#DC2626' 
                    : '#F97316'
                }
              ]}
            >
              {order.paymentStatus}
            </Text>
          </View>
          
          <View style={styles.divider} />
          
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Subtotal</Text>
            <Text style={styles.summaryValue}>₹{order.subtotal.toFixed(2)}</Text>
          </View>
          
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Shipping</Text>
            <Text style={styles.summaryValue}>₹{order.shippingCost.toFixed(2)}</Text>
          </View>
          
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Tax</Text>
            <Text style={styles.summaryValue}>₹{order.tax.toFixed(2)}</Text>
          </View>
          
          <View style={styles.divider} />
          
          <View style={styles.summaryRow}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.totalValue}>₹{order.totalAmount.toFixed(2)}</Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
    flex: 1,
  },
  scrollViewContent: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  card: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  lastCard: {
    marginBottom: 32,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.primary,
    marginBottom: 16,
  },
  cardTitleSmall: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.primary,
    marginBottom: 8,
  },
  stepRow: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  noMarginBottom: {
    marginBottom: 0,
  },
  stepIndicatorContainer: {
    alignItems: 'center',
    marginRight: 16,
  },
  stepDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  stepLine: {
    width: 2,
    height: '100%',
    position: 'absolute',
    top: 12,
  },
  stepTextContainer: {
    paddingBottom: 16,
  },
  stepTitle: {
    fontWeight: '700',
  },
  stepDate: {
    color: COLORS.secondary,
    fontSize: 12,
  },
  productRow: {
    flexDirection: 'row',
  },
  productRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
    paddingBottom: 16,
    marginBottom: 16,
  },
  productImage: {
    width: 64,
    height: 64,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
  },
  productDetails: {
    flex: 1,
    marginLeft: 12,
    justifyContent: 'center',
  },
  productName: {
    color: COLORS.primary,
    fontWeight: '500',
  },
  productMeta: {
    color: COLORS.secondary,
    fontSize: 12,
  },
  productPriceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  productPrice: {
    color: COLORS.primary,
    fontWeight: '700',
  },
  shippingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  shippingText: {
    color: COLORS.secondary,
    marginLeft: 8,
    flex: 1,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  summaryLabel: {
    color: COLORS.secondary,
  },
  summaryValue: {
    color: COLORS.primary,
    fontWeight: '500',
  },
  summaryValueCapitalized: {
    color: COLORS.primary,
    fontWeight: '500',
    textTransform: 'capitalize',
  },
  divider: {
    height: 1,
    backgroundColor: '#F3F4F6',
    marginVertical: 8,
  },
  totalLabel: {
    color: COLORS.primary,
    fontWeight: '700',
    fontSize: 18,
  },
  totalValue: {
    color: COLORS.primary,
    fontWeight: '700',
    fontSize: 18,
  },
});

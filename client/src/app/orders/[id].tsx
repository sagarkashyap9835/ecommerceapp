import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { Image, ScrollView, Text, View, ActivityIndicator, StyleSheet, TouchableOpacity, Modal, Pressable, TextInput } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Header from "../../../components/Header";
import { COLORS } from "@/assets/constants";
import type { Order, Product } from "@/assets/constants/types";
import { useAuth } from "@/context/AuthContext";
import api from "../../../constants/api";
import { getDeliveryDateForOrder } from "../../../utils/delivery";
import Toast from "react-native-toast-message";
import { getColorName } from "../../../utils/colors";
import * as ImagePicker from "expo-image-picker";

export default function OrderDetails() {
  const { getToken } = useAuth();
  const { id } = useLocalSearchParams();
  const router = useRouter();

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  // Modal & action states
  const [cancelModalVisible, setCancelModalVisible] = useState(false);
  const [cancelReason, setCancelReason] = useState("Changed my mind");
  const [cancelling, setCancelling] = useState(false);

  const [replacementModalVisible, setReplacementModalVisible] = useState(false);
  const [replacementReason, setReplacementReason] = useState("Size / Fit Issue");
  const [submittingReplacement, setSubmittingReplacement] = useState(false);

  // Review Modal States
  const [reviewModalVisible, setReviewModalVisible] = useState(false);
  const [reviewProductId, setReviewProductId] = useState<string | null>(null);
  const [rating, setRating] = useState<number>(5);
  const [reviewComment, setReviewComment] = useState<string>("");
  const [reviewImage, setReviewImage] = useState<string>("");
  const [submittingReview, setSubmittingReview] = useState<boolean>(false);

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

  const handleCancelOrder = async () => {
    try {
      setCancelling(true);
      const token = await getToken();
      const { data } = await api.put(
        `/orders/${id}/cancel`,
        { reason: cancelReason },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (data.success) {
        setOrder(data.data);
        setCancelModalVisible(false);
        Toast.show({
          type: "success",
          text1: "Order Cancelled",
          text2: data.message || "Your order has been cancelled.",
          position: "top",
        });
      }
    } catch (error: any) {
      Toast.show({
        type: "error",
        text1: "Cancellation Failed",
        text2: error.response?.data?.message || "Failed to cancel order",
        position: "top",
      });
    } finally {
      setCancelling(false);
    }
  };

  const handleRequestReplacement = async () => {
    try {
      setSubmittingReplacement(true);
      const token = await getToken();
      const { data } = await api.post(
        `/orders/${id}/replacement`,
        { reason: replacementReason },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (data.success) {
        setOrder(data.data);
        setReplacementModalVisible(false);
        Toast.show({
          type: "success",
          text1: "Replacement Requested 🔄",
          text2: data.message || "Your 2-day replacement request has been submitted.",
          position: "top",
        });
      }
    } catch (error: any) {
      Toast.show({
        type: "error",
        text1: "Replacement Error",
        text2: error.response?.data?.message || "Failed to submit replacement request",
        position: "top",
      });
    } finally {
      setSubmittingReplacement(false);
    }
  };

  const pickReviewImage = async () => {
    try {
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permissionResult.granted) {
        Toast.show({
          type: "error",
          text1: "Permission Denied",
          text2: "Permission to access photo library is required to upload product photo.",
        });
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        quality: 0.7,
        base64: true,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        if (asset.base64) {
          setReviewImage(`data:image/jpeg;base64,${asset.base64}`);
        } else {
          setReviewImage(asset.uri);
        }
      }
    } catch (error) {
      console.error("Image pick error:", error);
    }
  };

  const handleSubmitReview = async () => {
    if (!reviewProductId) return;
    if (!reviewComment.trim()) {
      Toast.show({
        type: "error",
        text1: "Empty Review",
        text2: "Please enter your review message."
      });
      return;
    }

    try {
      setSubmittingReview(true);
      const token = await getToken();
      const { data } = await api.post(
        `/products/${reviewProductId}/reviews`,
        { rating, comment: reviewComment, image: reviewImage },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (data.success) {
        Toast.show({
          type: "success",
          text1: "Review Submitted 🎉",
          text2: data.message || "Thank you for your rating & photo!"
        });
        setReviewModalVisible(false);
        setReviewComment("");
        setReviewImage("");
        setRating(5);
        setReviewProductId(null);
      }
    } catch (error: any) {
      Toast.show({
        type: "error",
        text1: "Submission Failed",
        text2: error.response?.data?.message || "Could not submit review"
      });
    } finally {
      setSubmittingReview(false);
    }
  };

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

  const isCancelled = order.orderStatus === "cancelled";
  const canCancel = order.orderStatus === "placed" || order.orderStatus === "processing";
  const isDelivered = order.orderStatus === "delivered";

  // Check 2-Day replacement window (48h)
  const deliveryTime = order.deliveredAt ? new Date(order.deliveredAt).getTime() : new Date(order.createdAt).getTime();
  const isReplacementEligible = isDelivered && (Date.now() - deliveryTime <= 2 * 24 * 60 * 60 * 1000);

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
        {/* REFUND BANNER (IF REFUNDED OR CANCELLED WITH PREPAID) */}
        {(order.paymentStatus === "refunded" || (isCancelled && order.refundAmount)) ? (
          <View style={styles.refundBannerCard}>
            <Ionicons name="card-outline" size={24} color="#059669" style={{ marginRight: 10 }} />
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 13, fontWeight: "800", color: "#065F46" }}>
                💰 REFUND PROCESSED: ₹{(order.refundAmount || order.totalAmount).toFixed(2)}
              </Text>
              <Text style={{ fontSize: 11, color: "#047857", marginTop: 2 }}>
                Refund credited via {order.paymentMethod.toUpperCase()}{order.refundId ? ` (ID: ${order.refundId})` : ""}
              </Text>
            </View>
          </View>
        ) : null}

        {/* REPLACEMENT REQUEST STATUS CARD */}
        {order.replacementRequest && order.replacementRequest.status !== "none" ? (
          <View style={styles.replacementStatusCard}>
            <Ionicons name="refresh-circle-outline" size={26} color="#0284C7" style={{ marginRight: 10 }} />
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 13, fontWeight: "800", color: "#0369A1" }}>
                🔄 2-DAY REPLACEMENT REQUEST: {order.replacementRequest.status.toUpperCase()}
              </Text>
              <Text style={{ fontSize: 11, color: "#0284C7", marginTop: 2 }}>
                Reason: {order.replacementRequest.reason}
              </Text>
            </View>
          </View>
        ) : null}

        {/* Order Status */}
        <View style={styles.card}>
          {isCancelled ? (
            <View style={{ backgroundColor: "#FEF2F2", borderRadius: 12, padding: 14, marginBottom: 16, borderWidth: 1, borderColor: "#FCA5A5" }}>
              <Text style={{ fontSize: 14, fontWeight: "800", color: "#DC2626" }}>
                🚫 ORDER CANCELLED
              </Text>
              <Text style={{ fontSize: 12, color: "#B91C1C", marginTop: 2 }}>
                Reason: {order.cancellationReason || "Cancelled by customer"}
              </Text>
            </View>
          ) : (
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
          )}

          {!isCancelled && (
            <>
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
                        { backgroundColor: step.completed ? COLORS.primary : '#FCE7F3' }
                      ]} 
                    >
                      {step.completed && <Ionicons name="checkmark" size={12} color="#FFFFFF" />}
                    </View>
                    {index !== ORDER_STEPS.length - 1 && (
                      <View 
                        style={[
                          styles.stepLine, 
                          { backgroundColor: step.completed ? COLORS.primary : '#FCE7F3' }
                        ]} 
                      />
                    )}
                  </View>
                  <View style={styles.stepTextContainer}>
                    <Text 
                      style={[
                        styles.stepTitle, 
                        { color: step.completed ? COLORS.primary : '#94A3B8' }
                      ]}
                    >
                      {step.title}
                    </Text>
                    {step.date ? <Text style={styles.stepDate}>{step.date}</Text> : null}
                  </View>
                </View>
              ))}
            </>
          )}
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
                  {item.size ? <Text style={styles.productMeta}>Size: {item.size}</Text> : null}
                  {item.color ? <Text style={styles.productMeta}>Color: {getColorName(item.color)}</Text> : null}
                  <View style={styles.productPriceRow}>
                    <Text style={styles.productPrice}>₹{item.price}</Text>
                    <Text style={styles.productMeta}>Qty: {item.quantity}</Text>
                  </View>
                  {isDelivered && (
                    <TouchableOpacity
                      onPress={() => {
                        setReviewProductId(productData._id);
                        setReviewModalVisible(true);
                      }}
                      style={{ marginTop: 10, paddingVertical: 6, paddingHorizontal: 12, backgroundColor: '#DBEAFE', borderRadius: 8, alignSelf: 'flex-start', flexDirection: 'row', alignItems: 'center' }}
                    >
                      <Ionicons name="star" size={14} color="#1E3A8A" style={{ marginRight: 4 }} />
                      <Text style={{ fontSize: 12, fontWeight: '600', color: '#1E3A8A' }}>Write a Review</Text>
                    </TouchableOpacity>
                  )}
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
        <View style={styles.card}>
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
                  color: order.paymentStatus === 'paid' || order.paymentStatus === 'refunded'
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
            <Text style={styles.summaryValue}>FREE 🎉</Text>
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

        {/* ACTION BUTTONS: CANCEL & 2-DAY REPLACEMENT */}
        <View style={{ marginBottom: 40, gap: 12 }}>
          {canCancel && (
            <TouchableOpacity
              onPress={() => setCancelModalVisible(true)}
              style={styles.cancelBtn}
              activeOpacity={0.8}
            >
              <Ionicons name="close-circle-outline" size={20} color="#FFFFFF" style={{ marginRight: 6 }} />
              <Text style={styles.cancelBtnText}>Cancel Order</Text>
            </TouchableOpacity>
          )}

          {isReplacementEligible && (!order.replacementRequest || order.replacementRequest.status === "none") && (
            <TouchableOpacity
              onPress={() => setReplacementModalVisible(true)}
              style={styles.replacementBtn}
              activeOpacity={0.8}
            >
              <Ionicons name="refresh-outline" size={20} color="#FFFFFF" style={{ marginRight: 6 }} />
              <Text style={styles.replacementBtnText}>Request 2-Day Replacement 🔄</Text>
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>

      {/* CANCEL ORDER REASON MODAL */}
      <Modal visible={cancelModalVisible} transparent animationType="slide">
        <Pressable style={styles.modalOverlay} onPress={() => setCancelModalVisible(false)}>
          <Pressable style={styles.modalContentCard} onPress={(e) => e.stopPropagation()}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Cancel Order #{order.orderNumber}</Text>
              <TouchableOpacity onPress={() => setCancelModalVisible(false)}>
                <Ionicons name="close" size={22} color="#6B7280" />
              </TouchableOpacity>
            </View>

            <Text style={{ fontSize: 13, color: "#4B5563", marginBottom: 12 }}>
              Please select a reason for cancelling your order:
            </Text>

            {["Changed my mind", "Ordered by mistake", "Found better price elsewhere", "Delivery taking too long", "Incorrect shipping address"].map((r, i) => (
              <TouchableOpacity
                key={i}
                onPress={() => setCancelReason(r)}
                style={[styles.reasonOption, cancelReason === r && styles.selectedReasonOption]}
              >
                <Ionicons
                  name={cancelReason === r ? "radio-button-on" : "radio-button-off"}
                  size={18}
                  color={cancelReason === r ? "#DC2626" : "#9CA3AF"}
                  style={{ marginRight: 8 }}
                />
                <Text style={{ fontSize: 13, color: cancelReason === r ? "#DC2626" : "#374151", fontWeight: cancelReason === r ? "700" : "400" }}>
                  {r}
                </Text>
              </TouchableOpacity>
            ))}

            <TouchableOpacity
              onPress={handleCancelOrder}
              disabled={cancelling}
              style={[styles.confirmCancelBtn, cancelling && { backgroundColor: "#9CA3AF" }]}
            >
              {cancelling ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Text style={{ color: "#FFFFFF", fontWeight: "700", fontSize: 14 }}>
                  Confirm Cancellation
                </Text>
              )}
            </TouchableOpacity>
          </Pressable>
        </Pressable>
      </Modal>

      {/* 2-DAY REPLACEMENT REQUEST MODAL */}
      <Modal visible={replacementModalVisible} transparent animationType="slide">
        <Pressable style={styles.modalOverlay} onPress={() => setReplacementModalVisible(false)}>
          <Pressable style={styles.modalContentCard} onPress={(e) => e.stopPropagation()}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Request 2-Day Replacement 🔄</Text>
              <TouchableOpacity onPress={() => setReplacementModalVisible(false)}>
                <Ionicons name="close" size={22} color="#6B7280" />
              </TouchableOpacity>
            </View>

            <Text style={{ fontSize: 13, color: "#4B5563", marginBottom: 12 }}>
              Eligible for 2-Day Easy Replacement. Select the reason for replacement:
            </Text>

            {["Size / Fit Issue", "Defective / Damaged Item", "Wrong Product Received", "Product Quality Not as Expected"].map((r, i) => (
              <TouchableOpacity
                key={i}
                onPress={() => setReplacementReason(r)}
                style={[styles.reasonOption, replacementReason === r && styles.selectedReasonOption]}
              >
                <Ionicons
                  name={replacementReason === r ? "radio-button-on" : "radio-button-off"}
                  size={18}
                  color={replacementReason === r ? "#0284C7" : "#9CA3AF"}
                  style={{ marginRight: 8 }}
                />
                <Text style={{ fontSize: 13, color: replacementReason === r ? "#0369A1" : "#374151", fontWeight: replacementReason === r ? "700" : "400" }}>
                  {r}
                </Text>
              </TouchableOpacity>
            ))}

            <TouchableOpacity
              onPress={handleRequestReplacement}
              disabled={submittingReplacement}
              style={[styles.confirmReplacementBtn, submittingReplacement && { backgroundColor: "#9CA3AF" }]}
            >
              {submittingReplacement ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Text style={{ color: "#FFFFFF", fontWeight: "700", fontSize: 14 }}>
                  Submit Replacement Request
                </Text>
              )}
            </TouchableOpacity>
          </Pressable>
        </Pressable>
      </Modal>

      {/* REVIEW MODAL */}
      <Modal visible={reviewModalVisible} transparent animationType="slide">
        <Pressable style={styles.modalOverlay} onPress={() => setReviewModalVisible(false)}>
          <Pressable style={styles.modalContentCard} onPress={(e) => e.stopPropagation()}>
            <View style={styles.modalHeader}>
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <View style={{ width: 32, height: 32, borderRadius: 16, backgroundColor: "#DBEAFE", justifyContent: "center", alignItems: "center", marginRight: 10 }}>
                  <Ionicons name="chatbubble-outline" size={18} color="#1E3A8A" />
                </View>
                <Text style={styles.modalTitle}>Write a Review</Text>
              </View>
              <TouchableOpacity onPress={() => setReviewModalVisible(false)}>
                <Ionicons name="close" size={22} color="#6B7280" />
              </TouchableOpacity>
            </View>

            <Text style={{ fontSize: 13, color: "#4B5563", marginBottom: 12 }}>
              Share your real experience with this product
            </Text>

            {/* Interactive Star Rating Selector */}
            <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 16 }}>
              {[1, 2, 3, 4, 5].map((star) => (
                <TouchableOpacity key={star} onPress={() => setRating(star)} activeOpacity={0.7} style={{ padding: 4 }}>
                  <Ionicons
                    name={star <= rating ? "star" : "star-outline"}
                    size={32}
                    color={star <= rating ? "#FBBF24" : "#D1D5DB"}
                  />
                </TouchableOpacity>
              ))}
              <View style={{ backgroundColor: "#DBEAFE", paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12, marginLeft: 12 }}>
                <Text style={{ fontFamily: 'Roboto', fontSize: 12, fontWeight: '700', color: '#1E3A8A' }}>{rating} / 5 Stars</Text>
              </View>
            </View>

            {/* Review Message Input */}
            <View style={{ backgroundColor: "#FFFFFF", borderWidth: 1, borderColor: "#BDE0FE", flexDirection: "row", alignItems: "flex-start", padding: 10, borderRadius: 10, marginBottom: 16 }}>
              <Ionicons name="pencil" size={16} color="#94A3B8" style={{ marginTop: 4, marginRight: 8 }} />
              <TextInput
                style={{ flex: 1, fontSize: 14, color: '#111827', textAlignVertical: 'top', minHeight: 60 }}
                placeholder="Write your review here (e.g. quality, fit, comfort)..."
                placeholderTextColor="#9CA3AF"
                multiline
                numberOfLines={3}
                value={reviewComment}
                onChangeText={setReviewComment}
              />
            </View>

            {/* Photo Upload Section */}
            <View style={{ marginBottom: 20 }}>
              {reviewImage ? (
                <View style={{ flexDirection: "row", alignItems: "center" }}>
                  <View style={{ position: "relative" }}>
                    <Image source={{ uri: reviewImage }} style={{ width: 64, height: 64, borderRadius: 8 }} resizeMode="cover" />
                    <TouchableOpacity
                      onPress={() => setReviewImage("")}
                      style={{ position: "absolute", top: -8, right: -8, backgroundColor: "#EF4444", width: 22, height: 22, borderRadius: 11, justifyContent: "center", alignItems: "center", borderWidth: 2, borderColor: "#FFFFFF" }}
                      activeOpacity={0.8}
                    >
                      <Ionicons name="close" size={14} color="#FFFFFF" />
                    </TouchableOpacity>
                  </View>
                  <Text style={{ fontSize: 13, color: "#0284C7", marginLeft: 12, fontWeight: "600" }}>
                    Product Photo Attached ✓
                  </Text>
                </View>
              ) : (
                <TouchableOpacity
                  onPress={pickReviewImage}
                  activeOpacity={0.75}
                  style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", backgroundColor: "#F0F9FF", borderWidth: 1, borderStyle: "dashed", borderColor: "#7DD3FC", borderRadius: 10, paddingVertical: 12 }}
                >
                  <Ionicons name="camera-outline" size={20} color="#0284C7" style={{ marginRight: 8 }} />
                  <Text style={{ fontSize: 14, fontWeight: "600", color: "#0284C7" }}>Add Product Photo (Optional)</Text>
                </TouchableOpacity>
              )}
            </View>

            <TouchableOpacity
              onPress={handleSubmitReview}
              disabled={submittingReview}
              style={{ backgroundColor: "#2563EB", borderRadius: 12, paddingVertical: 14, flexDirection: "row", justifyContent: "center", alignItems: "center" }}
            >
              {submittingReview ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <>
                  <Ionicons name="paper-plane" size={18} color="#FFFFFF" style={{ marginRight: 8 }} />
                  <Text style={{ color: "#FFFFFF", fontWeight: "700", fontSize: 15 }}>Submit Review</Text>
                </>
              )}
            </TouchableOpacity>
          </Pressable>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
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
    backgroundColor: '#FFF5F8',
    padding: 20,
    borderRadius: 24,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#FBCFE8',
    shadowColor: '#FF3399',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.08,
    shadowRadius: 20,
    elevation: 4,
  },
  lastCard: {
    marginBottom: 32,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 16,
    fontFamily: 'Outfit_800',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  cardTitleSmall: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 12,
    fontFamily: 'Outfit_800',
  },
  stepRow: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  noMarginBottom: {
    marginBottom: 0,
  },
  stepIndicatorContainer: {
    alignItems: 'center',
    marginRight: 16,
  },
  stepDot: {
    width: 22,
    height: 22,
    borderRadius: 11,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 2,
  },
  stepLine: {
    width: 2,
    height: '150%',
    position: 'absolute',
    top: 20,
    zIndex: 1,
  },
  stepTextContainer: {
    flex: 1,
    justifyContent: 'center',
    paddingBottom: 16,
  },
  stepTitle: {
    fontSize: 15,
    fontWeight: '700',
    fontFamily: 'Outfit_700',
    marginBottom: 2,
  },
  stepDate: {
    color: '#64748B',
    fontSize: 12,
    fontFamily: 'Outfit_500',
    fontWeight: '500',
  },
  productRow: {
    flexDirection: 'row',
  },
  productRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: '#FBCFE8',
    paddingBottom: 16,
    marginBottom: 16,
  },
  productImage: {
    width: 72,
    height: 72,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#FBCFE8',
  },
  productDetails: {
    flex: 1,
    marginLeft: 16,
    justifyContent: 'center',
  },
  productName: {
    color: '#0F172A',
    fontWeight: '700',
    fontSize: 15,
    fontFamily: 'Outfit_700',
    marginBottom: 4,
  },
  productMeta: {
    color: '#64748B',
    fontSize: 12,
    fontFamily: 'Outfit_500',
    fontWeight: '500',
  },
  productPriceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  productPrice: {
    color: '#FF3399',
    fontWeight: '800',
    fontSize: 16,
    fontFamily: 'Outfit_800',
  },
  shippingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    backgroundColor: '#FDF2F8',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#FBCFE8',
  },
  shippingText: {
    color: '#334155',
    marginLeft: 12,
    flex: 1,
    fontSize: 13,
    fontFamily: 'Outfit_500',
    lineHeight: 20,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
    alignItems: 'center',
  },
  summaryLabel: {
    color: '#64748B',
    fontSize: 13,
    fontFamily: 'Outfit_500',
    fontWeight: '500',
  },
  summaryValue: {
    color: '#0F172A',
    fontWeight: '700',
    fontSize: 14,
    fontFamily: 'Outfit_700',
  },
  summaryValueCapitalized: {
    color: '#0F172A',
    fontWeight: '700',
    fontSize: 14,
    textTransform: 'capitalize',
    fontFamily: 'Outfit_700',
  },
  divider: {
    height: 1,
    backgroundColor: '#FBCFE8',
    marginVertical: 12,
  },
  totalLabel: {
    color: '#0F172A',
    fontWeight: '800',
    fontSize: 16,
    fontFamily: 'Outfit_800',
    textTransform: 'uppercase',
  },
  totalValue: {
    color: '#FF3399',
    fontWeight: '800',
    fontSize: 22,
    fontFamily: 'Outfit_800',
  },
  refundBannerCard: {
    backgroundColor: "#ECFDF5",
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#A7F3D0",
  },
  replacementStatusCard: {
    backgroundColor: "#F0F9FF",
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#BAE6FD",
  },
  cancelBtn: {
    backgroundColor: "#EF4444",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    borderRadius: 16,
    shadowColor: "#EF4444",
    shadowOpacity: 0.25,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 4,
  },
  cancelBtnText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "700",
    fontFamily: 'Outfit_700',
  },
  replacementBtn: {
    backgroundColor: "#0284C7",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    borderRadius: 16,
    shadowColor: "#0284C7",
    shadowOpacity: 0.25,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 4,
  },
  replacementBtnText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "700",
    fontFamily: 'Outfit_700',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(15, 23, 42, 0.6)",
    justifyContent: "flex-end",
  },
  modalContentCard: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    padding: 24,
    maxHeight: "85%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#0F172A",
    fontFamily: 'Outfit_800',
  },
  reasonOption: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    marginBottom: 10,
    backgroundColor: "#F8FAFC",
  },
  selectedReasonOption: {
    borderColor: "#EF4444",
    backgroundColor: "#FEF2F2",
  },
  confirmCancelBtn: {
    backgroundColor: "#EF4444",
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: "center",
    marginTop: 16,
    shadowColor: "#EF4444",
    shadowOpacity: 0.2,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
  },
  confirmReplacementBtn: {
    backgroundColor: "#0284C7",
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: "center",
    marginTop: 16,
    shadowColor: "#0284C7",
    shadowOpacity: 0.2,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
  },
});

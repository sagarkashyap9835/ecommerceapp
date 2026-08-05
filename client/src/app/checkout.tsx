import {
  View,
  Text,
  ActivityIndicator,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Modal,
  TextInput,
  Pressable,
} from "react-native";
import React, { useEffect, useState } from "react";
import { useCart } from "../../context/CartContext";
import { useRouter } from "expo-router";
import { Address } from "../../constants/types";
import { SafeAreaView } from "react-native-safe-area-context";
import Header from "../../components/Header";
import { COLORS } from "@/assets/constants";
import { Ionicons } from "@expo/vector-icons";
import Toast from "react-native-toast-message";
import { useAuth } from "@/context/AuthContext";
import api from "../../constants/api";
import { getEstimatedDelivery } from "../../utils/delivery";
import paymentService from "../../services/paymentService";
import RazorpayOfficialModal from "../../components/RazorpayOfficialModal";

export default function Checkout() {
  const { getToken } = useAuth();
  const { cartTotal, clearCart } = useCart();
  const router = useRouter();

  const deliveryEstimate = getEstimatedDelivery(3, 5);

  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const [selectedAddress, setSelectedAddress] = useState<Address | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<"cash" | "razorpay">("cash");

  // Razorpay Test Form States
  const [razorpayModalVisible, setRazorpayModalVisible] = useState(false);
  const [razorpayOption, setRazorpayOption] = useState<"upi" | "card" | "netbanking">("upi");
  const [upiId, setUpiId] = useState("success@razorpay");
  const [razorpayOrderId, setRazorpayOrderId] = useState<string>("");
  const [razorpayKeyId, setRazorpayKeyId] = useState<string>("");
  const [processingRazorpay, setProcessingRazorpay] = useState(false);

  const shipping = 0;
  const tax = 0;
  const total = cartTotal + shipping + tax;

  const fetchAddress = async () => {
    try {
      setPageLoading(true);
      const token = await getToken();
      const { data } = await api.get("/address", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (data.success && data.data && data.data.length > 0) {
        const def = data.data.find((a: any) => a.isDefault) || data.data[0];
        setSelectedAddress(def as Address);
      }
    } catch (error) {
      console.error("Error fetching address:", error);
    } finally {
      setPageLoading(false);
    }
  };

  const handlePlaceOrder = async () => {
    if (!selectedAddress) {
      return Toast.show({
        type: "error",
        text1: "Address Required",
        text2: "Please add or select a shipping address.",
        position: "top",
      });
    }

    if (paymentMethod === "razorpay") {
      try {
        setLoading(true);
        const token = (await getToken()) || undefined;
        // Step 1: Create Razorpay Order via Payment Service
        const res = await paymentService.createRazorpayOrder(total, token);
        if (res.success && res.order_id) {
          setRazorpayOrderId(res.order_id);
          setRazorpayKeyId(res.key_id);
          setRazorpayModalVisible(true);
        }
      } catch (err: any) {
        Toast.show({
          type: "error",
          text1: "Razorpay Error",
          text2: err.message || "Failed to initialize Razorpay order",
          position: "top",
        });
      } finally {
        setLoading(false);
      }
      return;
    }

    // Process Cash on Delivery (COD)
    setLoading(true);
    try {
      const token = await getToken();
      const { data } = await api.post(
        "/orders",
        {
          shippingAddress: {
            villageHouseCode: selectedAddress.villageHouseCode || "",
            street: selectedAddress.street,
            city: selectedAddress.city,
            state: selectedAddress.state,
            zipCode: selectedAddress.zipCode,
            country: selectedAddress.country,
          },
          paymentMethod: "cash",
          estimatedDeliveryDate: deliveryEstimate.startDate,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (data.success) {
        Toast.show({
          type: "success",
          text1: "Order Placed! 🎉",
          text2: "Your order has been placed successfully via COD.",
          position: "top",
        });
        await clearCart();
        router.replace("/orders" as any);
      }
    } catch (error: any) {
      console.error("Error placing order:", error);
      Toast.show({
        type: "error",
        text1: "Order Failed",
        text2: error.response?.data?.message || "Failed to place order",
        position: "top",
      });
    } finally {
      setLoading(false);
    }
  };

  // Process Official Razorpay Payment Success
  const handleOfficialRazorpaySuccess = async (paymentData: {
    razorpay_order_id: string;
    razorpay_payment_id: string;
    razorpay_signature: string;
  }) => {
    setLoading(true);
    try {
      const token = (await getToken()) || undefined;

      // 1. Create order in MongoDB (paymentStatus "pending")
      const { data } = await api.post(
        "/orders",
        {
          shippingAddress: {
            villageHouseCode: selectedAddress?.villageHouseCode || "",
            street: selectedAddress?.street,
            city: selectedAddress?.city,
            state: selectedAddress?.state,
            zipCode: selectedAddress?.zipCode,
            country: selectedAddress?.country,
          },
          paymentMethod: "razorpay",
          paymentStatus: "pending",
          paymentIntentId: paymentData.razorpay_payment_id,
          razorpayOrderId: paymentData.razorpay_order_id,
          estimatedDeliveryDate: deliveryEstimate.startDate,
        },
        {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        }
      );

      if (data.success && data.data?._id) {
        // 2. Verify signature on backend (/api/payment/verify)
        const verification = await paymentService.verifyPaymentSignature(
          {
            razorpay_order_id: paymentData.razorpay_order_id,
            razorpay_payment_id: paymentData.razorpay_payment_id,
            razorpay_signature: paymentData.razorpay_signature,
            mongoOrderId: data.data._id,
          },
          token
        );

        if (verification.success) {
          setRazorpayModalVisible(false);
          Toast.show({
            type: "success",
            text1: "Payment Verified! 🎉",
            text2: `Payment of ₹${total.toFixed(2)} completed successfully via Razorpay.`,
            position: "top",
          });
          await clearCart();
          router.replace("/orders" as any);
        } else {
          Toast.show({
            type: "error",
            text1: "Payment Verification Failed",
            text2: verification.message || "Razorpay signature verification failed.",
            position: "top",
          });
        }
      }
    } catch (error: any) {
      console.error("Error processing Razorpay success:", error);
      Toast.show({
        type: "error",
        text1: "Payment Error",
        text2: error.message || "Failed to process Razorpay payment.",
        position: "top",
      });
    } finally {
      setLoading(false);
    }
  };

  // Process Official Razorpay Payment Failure
  const handleOfficialRazorpayFailure = (error: { code: string; description: string }) => {
    setRazorpayModalVisible(false);
    Toast.show({
      type: "error",
      text1: "Payment Failed ❌",
      text2: error.description || "The payment was cancelled or failed on Razorpay Gateway.",
      position: "top",
    });
  };

  useEffect(() => {
    fetchAddress();
  }, []);

  if (pageLoading) {
    return (
      <SafeAreaView style={[styles.container, styles.centered]} edges={["top"]}>
        <ActivityIndicator size="large" color={COLORS.primary || "#111827"} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <Header title="Checkout" showBack />

      <ScrollView contentContainerStyle={styles.content}>
        {/* 1. SHIPPING ADDRESS SECTION */}
        <View style={styles.headerRow}>
          <Text style={styles.sectionTitle}>Shipping Address</Text>
          {selectedAddress && (
            <TouchableOpacity onPress={() => router.push("/addresses" as any)}>
              <Text style={styles.changeBtnText}>Change</Text>
            </TouchableOpacity>
          )}
        </View>

        {selectedAddress ? (
          <View style={styles.card}>
            <View style={styles.row}>
              <View style={styles.badgeType}>
                <Text style={styles.badgeTypeText}>{selectedAddress.type}</Text>
              </View>
              {selectedAddress.isDefault && (
                <Text style={styles.defaultLabel}>Default</Text>
              )}
            </View>

            {selectedAddress.villageHouseCode ? (
              <View style={{ backgroundColor: "#ECFDF5", paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6, marginVertical: 6, alignSelf: "flex-start", borderWidth: 1, borderColor: "#A7F3D0" }}>
                <Text style={{ fontSize: 12, fontWeight: "700", color: "#065F46" }}>
                  🏡 Village / Gram Code: #{selectedAddress.villageHouseCode}
                </Text>
              </View>
            ) : null}

            <Text style={styles.addressText}>{selectedAddress.street}</Text>
            <Text style={styles.addressText}>
              {selectedAddress.city}, {selectedAddress.state} - {selectedAddress.zipCode}
            </Text>
            <Text style={styles.addressPhone}>{selectedAddress.country}</Text>
          </View>
        ) : (
          <TouchableOpacity
            style={[styles.card, styles.addAddressCard]}
            onPress={() => router.push("/addresses" as any)}
          >
            <Ionicons name="add-circle-outline" size={24} color="#6b7280" />
            <Text style={styles.addAddressText}>Add Shipping Address</Text>
          </TouchableOpacity>
        )}

        {/* 2. PAYMENT METHOD SECTION */}
        <Text style={styles.sectionTitle}>Payment Method</Text>

        <TouchableOpacity
          style={[
            styles.card,
            styles.selectableCard,
            paymentMethod === "cash" && styles.selectedCard,
          ]}
          onPress={() => setPaymentMethod("cash")}
        >
          <View style={styles.row}>
            <Ionicons
              name={paymentMethod === "cash" ? "radio-button-on" : "radio-button-off"}
              size={22}
              color={paymentMethod === "cash" ? "#111827" : "#9CA3AF"}
            />
            <View style={styles.paymentDetails}>
              <Text style={styles.paymentTitle}>Cash on Delivery (COD)</Text>
              <Text style={styles.paymentSubtitle}>
                Pay with cash when your package arrives.
              </Text>
            </View>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.card,
            styles.selectableCard,
            paymentMethod === "razorpay" && styles.selectedCard,
          ]}
          onPress={() => setPaymentMethod("razorpay")}
        >
          <View style={styles.row}>
            <Ionicons
              name={paymentMethod === "razorpay" ? "radio-button-on" : "radio-button-off"}
              size={22}
              color={paymentMethod === "razorpay" ? "#0C2340" : "#9CA3AF"}
            />
            <View style={styles.paymentDetails}>
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <Text style={styles.paymentTitle}>Razorpay (UPI / Cards / NetBanking)</Text>
                <View style={styles.testBadge}>
                  <Text style={styles.testBadgeText}>Test Mode</Text>
                </View>
              </View>
              <Text style={styles.paymentSubtitle}>
                Instant Indian payments with Razorpay Gateway.
              </Text>
            </View>
          </View>
        </TouchableOpacity>

        {/* 3. ORDER SUMMARY SECTION */}
        <Text style={styles.sectionTitle}>Order Summary</Text>
        <View style={styles.card}>
          {/* Estimated Delivery Banner */}
          <View style={{
            backgroundColor: "#ECFDF5",
            borderRadius: 10,
            padding: 10,
            marginBottom: 14,
            flexDirection: "row",
            alignItems: "center",
            borderWidth: 1,
            borderColor: "#A7F3D0",
          }}>
            <Ionicons name="bus-outline" size={20} color="#059669" />
            <View style={{ marginLeft: 10, flex: 1 }}>
              <Text style={{ fontSize: 10, fontWeight: "800", color: "#047857", letterSpacing: 0.5 }}>
                EXPECTED DELIVERY DAY
              </Text>
              <Text style={{ fontSize: 13, fontWeight: "700", color: "#065F46", marginTop: 1 }}>
                {deliveryEstimate.formattedStartDate}
              </Text>
            </View>
          </View>

          <View style={styles.priceRow}>
            <Text style={styles.priceLabel}>Subtotal</Text>
            <Text style={styles.priceValue}>₹{cartTotal.toFixed(2)}</Text>
          </View>
          <View style={styles.priceRow}>
            <Text style={styles.priceLabel}>Shipping</Text>
            <Text style={[styles.priceValue, { color: "#059669", fontWeight: "700" }]}>FREE 🎉</Text>
          </View>
          <View style={styles.priceRow}>
            <Text style={styles.priceLabel}>Tax</Text>
            <Text style={styles.priceValue}>₹{tax.toFixed(2)}</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Total Amount</Text>
            <Text style={styles.totalPrice}>₹{total.toFixed(2)}</Text>
          </View>
        </View>
      </ScrollView>

      {/* FOOTER BUTTON */}
      <View style={styles.footer}>
        <TouchableOpacity
          activeOpacity={0.8}
          disabled={loading}
          style={[styles.placeOrderButton, loading && { backgroundColor: "#4B5563" }]}
          onPress={handlePlaceOrder}
        >
          {loading ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Text style={styles.placeOrderButtonText}>
              {paymentMethod === "cash" ? "Place Order (COD)" : `Pay ₹${total.toFixed(2)} with Razorpay`}
            </Text>
          )}
        </TouchableOpacity>
      </View>

      {/* OFFICIAL RAZORPAY GATEWAY MODAL */}
      <RazorpayOfficialModal
        visible={razorpayModalVisible}
        onClose={() => setRazorpayModalVisible(false)}
        orderId={razorpayOrderId}
        keyId={razorpayKeyId || process.env.EXPO_PUBLIC_RAZORPAY_KEY_ID || "rzp_test_TLWuXzr2B5D1hJ"}
        amount={total}
        onSuccess={handleOfficialRazorpaySuccess}
        onFailure={handleOfficialRazorpayFailure}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9FAFB",
  },
  centered: {
    justifyContent: "center",
    alignItems: "center",
  },
  content: {
    padding: 16,
    paddingBottom: 100,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 10,
    marginTop: 12,
  },
  changeBtnText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#2563EB",
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    marginBottom: 12,
  },
  addAddressCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 20,
    borderStyle: "dashed",
  },
  addAddressText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#4B5563",
    marginLeft: 8,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
  },
  badgeType: {
    backgroundColor: "#F3F4F6",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    marginRight: 8,
  },
  badgeTypeText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#374151",
  },
  defaultLabel: {
    fontSize: 11,
    color: "#059669",
    fontWeight: "600",
  },
  addressText: {
    fontSize: 13,
    color: "#374151",
    marginTop: 4,
  },
  addressPhone: {
    fontSize: 12,
    color: "#6B7280",
    marginTop: 4,
  },
  selectableCard: {
    paddingVertical: 14,
  },
  selectedCard: {
    borderColor: "#111827",
    backgroundColor: "#FAFAFA",
    borderWidth: 1.5,
  },
  paymentDetails: {
    marginLeft: 12,
    flex: 1,
  },
  paymentTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#111827",
  },
  paymentSubtitle: {
    fontSize: 12,
    color: "#6B7280",
    marginTop: 2,
  },
  testBadge: {
    backgroundColor: "#DBEAFE",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginLeft: 8,
  },
  testBadgeText: {
    color: "#1E40AF",
    fontSize: 10,
    fontWeight: "700",
  },
  priceRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  priceLabel: {
    fontSize: 13,
    color: "#6B7280",
  },
  priceValue: {
    fontSize: 13,
    fontWeight: "600",
    color: "#111827",
  },
  divider: {
    height: 1,
    backgroundColor: "#F3F4F6",
    marginVertical: 8,
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 4,
  },
  totalLabel: {
    fontSize: 15,
    fontWeight: "700",
    color: "#111827",
  },
  totalPrice: {
    fontSize: 18,
    fontWeight: "800",
    color: "#EF4444",
  },
  footer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "#FFFFFF",
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: "#F3F4F6",
  },
  placeOrderButton: {
    backgroundColor: "#111827",
    borderRadius: 26,
    height: 52,
    justifyContent: "center",
    alignItems: "center",
  },
  placeOrderButtonText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "700",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
  },
  modalContentCard: {
    width: "100%",
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 20,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 14,
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: "#111827",
  },
  testModeInfoBanner: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#EFF6FF",
    borderWidth: 1,
    borderColor: "#BFDBFE",
    borderRadius: 10,
    padding: 12,
    marginBottom: 16,
  },
  amountDisplayBox: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#F9FAFB",
    padding: 12,
    borderRadius: 10,
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: "700",
    color: "#374151",
    marginBottom: 4,
  },
  stripeInput: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: "#111827",
  },
  stripePayBtn: {
    backgroundColor: "#111827",
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 8,
  },
  stripePayBtnText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "700",
  },
});
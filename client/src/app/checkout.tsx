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
  const { getToken, refetchFirstOrderOffer } = useAuth();
  const { cartTotal, clearCart, cartItems } = useCart();
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
        await refetchFirstOrderOffer();
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
          await refetchFirstOrderOffer();
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
          <View style={styles.sectionTitleWrapper}>
            <View style={styles.iconCirclePink}>
              <Ionicons name="location-outline" size={16} color="#FF3399" />
            </View>
            <Text style={styles.sectionTitle}>Shipping Address</Text>
          </View>
          {selectedAddress && (
            <TouchableOpacity onPress={() => router.push("/addresses" as any)} style={styles.changeBtn}>
              <Ionicons name="pencil" size={12} color="#8B5CF6" />
              <Text style={styles.changeBtnText}>Change</Text>
            </TouchableOpacity>
          )}
        </View>

        {selectedAddress ? (
          <View style={styles.cardPink}>
            <View style={styles.rowTopAlign}>
              <View style={styles.iconBoxPink}>
                <Ionicons name="home-outline" size={20} color="#FF3399" />
              </View>
              <View style={{ flex: 1, marginLeft: 12 }}>
                <View style={[styles.row, { marginBottom: 6 }]}>
                  <View style={styles.badgeTypePink}>
                    <Text style={styles.badgeTypeTextPink}>{selectedAddress.type}</Text>
                  </View>
                  {selectedAddress.isDefault && (
                    <View style={styles.badgeTypeBlue}>
                      <Text style={styles.badgeTypeTextBlue}>Default</Text>
                    </View>
                  )}
                </View>

                {selectedAddress.villageHouseCode ? (
                  <Text style={styles.addressTitle}>House #{selectedAddress.villageHouseCode}, {selectedAddress.street}</Text>
                ) : (
                  <Text style={styles.addressTitle}>{selectedAddress.street}</Text>
                )}

                <Text style={styles.addressText}>
                  {selectedAddress.city}, {selectedAddress.state} - {selectedAddress.zipCode}
                </Text>
                <Text style={styles.addressPhone}>{selectedAddress.country}</Text>
              </View>
            </View>
          </View>
        ) : (
          <TouchableOpacity
            style={[styles.cardPink, styles.addAddressCard]}
            onPress={() => router.push("/addresses" as any)}
          >
            <Ionicons name="add-circle-outline" size={24} color="#FF3399" />
            <Text style={styles.addAddressText}>Add Shipping Address</Text>
          </TouchableOpacity>
        )}

        {/* 2. PAYMENT METHOD SECTION */}
        <View style={styles.headerRow}>
          <View style={styles.sectionTitleWrapper}>
            <View style={styles.iconCirclePink}>
              <Ionicons name="card-outline" size={16} color="#FF3399" />
            </View>
            <Text style={styles.sectionTitle}>Payment Method</Text>
          </View>
        </View>

        <TouchableOpacity
          style={[
            styles.cardPink,
            styles.selectableCard,
            paymentMethod === "cash" ? styles.selectedCardPink : styles.unselectedCardPink,
          ]}
          onPress={() => setPaymentMethod("cash")}
        >
          <View style={styles.row}>
            <View style={styles.radioOuterPink}>
              {paymentMethod === "cash" && <View style={styles.radioInnerPink} />}
            </View>
            <Ionicons name="cash-outline" size={20} color="#FF3399" style={{ marginLeft: 12 }} />
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
            styles.cardBlue,
            styles.selectableCard,
            paymentMethod === "razorpay" ? styles.selectedCardBlue : styles.unselectedCardBlue,
          ]}
          onPress={() => setPaymentMethod("razorpay")}
        >
          <View style={styles.row}>
            <View style={styles.radioOuterBlue}>
              {paymentMethod === "razorpay" && <View style={styles.radioInnerBlue} />}
            </View>
            <Ionicons name="card-outline" size={20} color="#2563EB" style={{ marginLeft: 12 }} />
            <View style={styles.paymentDetails}>
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <Text style={[styles.paymentTitle, { color: "#1E3A8A" }]}>Razorpay (UPI / Cards / NetBanking)</Text>
              </View>
              <Text style={styles.paymentSubtitle}>
                Instant Indian payments with Razorpay Gateway.
              </Text>
            </View>
            <View style={styles.testBadge}>
              <Text style={styles.testBadgeText}>Test Mode</Text>
            </View>
          </View>
        </TouchableOpacity>

        {/* 3. ORDER SUMMARY SECTION */}
        <View style={styles.headerRow}>
          <View style={styles.sectionTitleWrapper}>
            <View style={styles.iconCirclePink}>
              <Ionicons name="receipt-outline" size={16} color="#FF3399" />
            </View>
            <Text style={styles.sectionTitle}>Order Summary</Text>
          </View>
        </View>

        <View style={styles.cardPinkSummary}>
          {/* Estimated Delivery Banner */}
          <View style={{
            backgroundColor: "#F0F9FF",
            borderRadius: 12,
            padding: 12,
            marginBottom: 16,
            flexDirection: "row",
            alignItems: "center",
          }}>
            <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: "#E0F2FE", justifyContent: "center", alignItems: "center" }}>
              <Ionicons name="bus-outline" size={20} color="#0284C7" />
            </View>
            <View style={{ marginLeft: 12, flex: 1 }}>
              <Text style={{ fontSize: 10, fontWeight: "800", color: "#0284C7", letterSpacing: 0.5, fontFamily: "Outfit_800" }}>
                EXPECTED DELIVERY DAY
              </Text>
              <Text style={{ fontSize: 14, fontWeight: "800", color: "#0F172A", marginTop: 2, fontFamily: "Outfit_800", fontStyle: "italic" }}>
                {deliveryEstimate.formattedStartDate}
              </Text>
            </View>
          </View>

          <View style={styles.priceRow}>
            <Text style={styles.priceLabel}>Items Subtotal</Text>
            <Text style={styles.priceValue}>₹{cartItems.reduce((sum: number, item: any) => sum + (item.product?.sale?.isOnSale && item.product?.sale?.originalPrice ? item.product.sale.originalPrice : item.price) * item.quantity, 0).toFixed(2)}</Text>
          </View>

          {(() => {
            const originalTotal = cartItems.reduce((sum: number, item: any) => sum + (item.product?.sale?.isOnSale && item.product?.sale?.originalPrice ? item.product.sale.originalPrice : item.price) * item.quantity, 0);
            const totalDiscount = originalTotal - cartTotal;
            if (totalDiscount > 0) {
              return (
                <View style={styles.priceRow}>
                  <Text style={styles.priceLabel}>Discount</Text>
                  <Text style={[styles.priceValue, { color: "#16A34A" }]}>-₹{totalDiscount.toFixed(2)}</Text>
                </View>
              );
            }
            return null;
          })()}

          <View style={styles.priceRow}>
            <Text style={styles.priceLabel}>Shipping</Text>
            <View style={{ backgroundColor: "#FCE7F3", paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6, flexDirection: "row", alignItems: "center" }}>
              <Ionicons name="gift-outline" size={12} color="#DB2777" style={{ marginRight: 4 }} />
              <Text style={[styles.priceValue, { color: "#DB2777", fontWeight: "800", fontSize: 11 }]}>FREE</Text>
            </View>
          </View>
          <View style={styles.priceRow}>
            <Text style={styles.priceLabel}>Tax</Text>
            <Text style={styles.priceValue}>₹{tax.toFixed(2)}</Text>
          </View>

          <View style={styles.totalRowWrapper}>
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
          onPress={handlePlaceOrder}
          style={[styles.placeOrderButton, loading && { backgroundColor: "#9CA3AF" }]}
        >
          {loading ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <Ionicons name="bag-handle-outline" size={18} color="#FFFFFF" style={{ marginRight: 8 }} />
              <Text style={styles.placeOrderButtonText}>
                {paymentMethod === "cash" ? "Place Order (COD)" : `Pay ₹${total.toFixed(2)}`}
              </Text>
            </View>
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
    backgroundColor: "#FFFFFF", // White background
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
    marginTop: 12,
  },
  sectionTitleWrapper: {
    flexDirection: "row",
    alignItems: "center",
  },
  iconCirclePink: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#FCE7F3",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 8,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: "800",
    color: "#0F172A",
    fontFamily: "Outfit_800",
    fontStyle: "italic",
  },
  changeBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F3E8FF", // Light purple/pink
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#D8B4FE",
  },
  changeBtnText: {
    fontSize: 12,
    fontWeight: "800",
    color: "#8B5CF6",
    fontFamily: "Outfit_700",
    marginLeft: 4,
  },
  cardPink: {
    backgroundColor: "#FFF5F8",
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: "#FF66B2",
    marginBottom: 16,
  },
  cardPinkSummary: {
    backgroundColor: "#FFF5F8",
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: "#FF66B2",
    marginBottom: 16,
  },
  cardBlue: {
    backgroundColor: "#EFF6FF",
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: "#93C5FD",
    marginBottom: 16,
  },
  addAddressCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 20,
    borderStyle: "dashed",
    borderColor: "#FF3399",
    backgroundColor: "#FDF2F8",
  },
  addAddressText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#FF3399",
    marginLeft: 8,
    fontFamily: "Outfit_700",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
  },
  rowTopAlign: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  iconBoxPink: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: "#FCE7F3",
    justifyContent: "center",
    alignItems: "center",
  },
  badgeTypePink: {
    backgroundColor: "#FBCFE8",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    marginRight: 8,
  },
  badgeTypeTextPink: {
    fontSize: 10,
    fontWeight: "800",
    color: "#BE185D",
    fontFamily: "Outfit_800",
  },
  badgeTypeBlue: {
    backgroundColor: "#DBEAFE",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    marginRight: 8,
  },
  badgeTypeTextBlue: {
    fontSize: 10,
    fontWeight: "800",
    color: "#1E40AF",
    fontFamily: "Outfit_800",
  },
  addressTitle: {
    fontSize: 13,
    fontWeight: "800",
    color: "#0F172A",
    fontFamily: "Outfit_700",
    marginBottom: 2,
  },
  addressText: {
    fontSize: 12,
    color: "#475569",
    fontFamily: "Outfit",
  },
  addressPhone: {
    fontSize: 11,
    color: "#94A3B8",
    marginTop: 2,
    fontFamily: "Outfit",
  },
  selectableCard: {
    paddingVertical: 14,
  },
  selectedCardPink: {
    borderWidth: 2,
    borderColor: "#FF3399",
    backgroundColor: "#FFF0F5",
  },
  unselectedCardPink: {
    borderWidth: 1,
    borderColor: "#FBCFE8",
    backgroundColor: "#FDF2F8",
  },
  selectedCardBlue: {
    borderWidth: 2,
    borderColor: "#3B82F6",
    backgroundColor: "#EFF6FF",
  },
  unselectedCardBlue: {
    borderWidth: 1,
    borderColor: "#BFDBFE",
    backgroundColor: "#F0F9FF",
  },
  radioOuterPink: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: "#FF3399",
    justifyContent: "center",
    alignItems: "center",
  },
  radioInnerPink: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#FF3399",
  },
  radioOuterBlue: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: "#3B82F6",
    justifyContent: "center",
    alignItems: "center",
  },
  radioInnerBlue: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#3B82F6",
  },
  paymentDetails: {
    marginLeft: 12,
    flex: 1,
  },
  paymentTitle: {
    fontSize: 14,
    fontWeight: "800",
    color: "#0F172A",
    fontFamily: "Outfit_800",
  },
  paymentSubtitle: {
    fontSize: 11,
    color: "#64748B",
    marginTop: 2,
    fontFamily: "Outfit",
  },
  testBadge: {
    backgroundColor: "#FCE7F3",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    marginLeft: 8,
  },
  testBadgeText: {
    color: "#DB2777",
    fontSize: 10,
    fontWeight: "800",
    fontFamily: "Outfit_800",
  },
  priceRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  priceLabel: {
    fontSize: 13,
    color: "#64748B",
    fontFamily: "Outfit_500",
  },
  priceValue: {
    fontSize: 14,
    fontWeight: "800",
    color: "#0F172A",
    fontFamily: "Outfit_700",
  },
  totalRowWrapper: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 8,
    backgroundColor: "#FCE7F3",
    padding: 14,
    borderRadius: 12,
  },
  totalLabel: {
    fontSize: 15,
    fontWeight: "800",
    color: "#0F172A",
    fontFamily: "Outfit_800",
  },
  totalPrice: {
    fontSize: 18,
    fontWeight: "800",
    color: "#E11D48",
    fontFamily: "Outfit_800",
  },
  footer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "#FFFFFF",
    padding: 16,
    paddingBottom: 24,
    borderTopWidth: 1,
    borderTopColor: "#F3F4F6",
  },
  placeOrderButton: {
    backgroundColor: "#FF3399", // Solid pink
    borderRadius: 30,
    height: 56,
    width: "80%", // Smaller width
    alignSelf: "center", // Center it
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#EC4899",
    shadowOpacity: 0.4,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 8,
  },
  placeOrderButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "800",
    fontFamily: "Outfit_800",
  },
  // Modal styles (keeping original)
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
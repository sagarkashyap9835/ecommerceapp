import React from "react";
import {
  View,
  Text,
  StyleSheet,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { getEstimatedDelivery } from "../utils/delivery";

interface DeliveryEstimateCardProps {
  price?: number;
}

export default function DeliveryEstimateCard({
  price = 0,
}: DeliveryEstimateCardProps) {
  const estimate = getEstimatedDelivery(3, 3);
  const isFreeDelivery = true;

  return (
    <View style={styles.container}>
      {/* Header Title */}
      <View style={styles.headerRow}>
        <View style={styles.iconCircle}>
          <Ionicons name="bus-outline" size={20} color="#111827" />
        </View>
        <View style={{ flex: 1, marginLeft: 10 }}>
          <Text style={styles.title}>Guaranteed 3-Day Delivery 🚀</Text>
          <Text style={styles.subtitle}>Direct 3-day delivery to your village doorstep</Text>
        </View>
      </View>

      {/* Guaranteed 3-Day Delivery Banner */}
      <View style={styles.resultCard}>
        <View style={styles.dateBanner}>
          <Ionicons name="time-outline" size={22} color="#059669" />
          <View style={{ marginLeft: 10, flex: 1 }}>
            <Text style={styles.dateLabel}>EXPECTED DELIVERY DAY</Text>
            <Text style={styles.dateHighlight}>{estimate.formattedStartDate}</Text>
          </View>
          <View style={styles.speedBadge}>
            <Text style={styles.speedBadgeText}>⚡ 3 Days</Text>
          </View>
        </View>

        {/* Delivery Guarantee Subtext */}
        <View style={styles.rangeRow}>
          <Text style={styles.rangeText}>
            ✓ Guaranteed delivery within <Text style={styles.rangeBold}>3 Days</Text> from order date
          </Text>
        </View>

        {/* Free Shipping Badge */}
        <View style={styles.shippingNoticeRow}>
          <Ionicons
            name={isFreeDelivery ? "checkmark-circle" : "information-circle-outline"}
            size={16}
            color={isFreeDelivery ? "#059669" : "#D97706"}
          />
          <Text style={[styles.shippingNoticeText, { color: isFreeDelivery ? "#065F46" : "#B45309" }]}>
            {isFreeDelivery
              ? "FREE Shipping applied on this order 🎉"
              : `Add ₹${(499 - price).toFixed(0)} more for FREE Delivery`}
          </Text>
        </View>
      </View>

      {/* Trust & Guarantee Highlights */}
      <View style={styles.guaranteeRow}>
        <View style={styles.guaranteeItem}>
          <Ionicons name="cash-outline" size={16} color="#4B5563" />
          <Text style={styles.guaranteeText}>Cash on Delivery</Text>
        </View>

        <View style={styles.guaranteeItem}>
          <Ionicons name="sync-outline" size={16} color="#0284C7" />
          <Text style={[styles.guaranteeText, { color: "#0284C7", fontWeight: "700" }]}>2-Day Easy Replacement</Text>
        </View>

        <View style={styles.guaranteeItem}>
          <Ionicons name="shield-checkmark-outline" size={16} color="#4B5563" />
          <Text style={styles.guaranteeText}>100% Original</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#F9FAFB",
    borderRadius: 16,
    padding: 16,
    marginVertical: 16,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 14,
  },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#E0E7FF",
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    fontSize: 15,
    fontWeight: "700",
    color: "#111827",
  },
  subtitle: {
    fontSize: 12,
    color: "#6B7280",
    marginTop: 1,
  },
  resultCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: "#F3F4F6",
  },
  dateBanner: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ECFDF5",
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: "#A7F3D0",
  },
  dateLabel: {
    fontSize: 10,
    fontWeight: "800",
    color: "#047857",
    letterSpacing: 0.5,
  },
  dateHighlight: {
    fontSize: 15,
    fontWeight: "800",
    color: "#065F46",
    marginTop: 2,
  },
  speedBadge: {
    backgroundColor: "#10B981",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  speedBadgeText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "800",
  },
  rangeRow: {
    marginTop: 10,
    paddingHorizontal: 4,
  },
  rangeText: {
    fontSize: 12,
    color: "#059669",
    fontWeight: "600",
  },
  rangeBold: {
    fontWeight: "800",
    color: "#065F46",
  },
  shippingNoticeRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 10,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: "#F3F4F6",
  },
  shippingNoticeText: {
    fontSize: 12,
    fontWeight: "600",
    marginLeft: 6,
  },
  guaranteeRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 14,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
  },
  guaranteeItem: {
    flexDirection: "row",
    alignItems: "center",
  },
  guaranteeText: {
    fontSize: 11,
    color: "#4B5563",
    fontWeight: "600",
    marginLeft: 4,
  },
});

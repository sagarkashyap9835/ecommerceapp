import React from "react";
import {
  View,
  Text,
  StyleSheet,
  Animated,
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

  const slideAnim = React.useRef(new Animated.Value(-20)).current;
  const fadeAnim = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      })
    ]).start();
  }, []);

  return (
    <View style={styles.container}>
      {/* Header Title */}
      <View style={styles.headerRow}>
        <View style={styles.iconCircle}>
          <Ionicons name="car-outline" size={20} color="#DB2777" />
        </View>
        <View style={{ flex: 1, marginLeft: 12 }}>
          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
            <Text style={styles.title}>Guaranteed 3-Day Delivery</Text>
            <Animated.View style={[styles.trustedBadge, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
              <Ionicons name="shield-checkmark" size={12} color="#FFFFFF" />
              <Text style={styles.trustedText}>Trusted</Text>
            </Animated.View>
          </View>
          <Text style={styles.subtitle}>Direct 3-day delivery to your village doorstep</Text>
        </View>
      </View>

      {/* Guaranteed 3-Day Delivery Banner */}
      <View style={styles.dateBanner}>
        <Ionicons name="calendar-outline" size={24} color="#6B7280" />
        <View style={{ marginLeft: 12, flex: 1 }}>
          <Text style={styles.dateLabel}>EXPECTED DELIVERY DAY</Text>
          <Text style={styles.dateHighlight}>{estimate.formattedStartDate}</Text>
        </View>
        <View style={styles.speedBadge}>
          <Text style={styles.speedBadgeText}>⚡ 3 Days</Text>
        </View>
      </View>

      {/* Checklist Items */}
      <View style={styles.checklistContainer}>
        {/* Item 1 */}
        <View style={styles.checklistItem}>
          <View style={[styles.checkIconCircle, { backgroundColor: "#DB2777" }]}>
            <Ionicons name="checkmark" size={14} color="#FFF" />
          </View>
          <Text style={styles.checklistText}>
            Guaranteed delivery within <Text style={{ fontWeight: "600" }}>3 Days</Text> from order date
          </Text>
        </View>

        {/* Item 2 */}
        <View style={styles.checklistItem}>
          <View style={[styles.checkIconCircle, { backgroundColor: "#F43F5E" }]}>
            <Ionicons name="bus-outline" size={12} color="#FFF" />
          </View>
          <Text style={styles.checklistText}>
            <Text style={{ fontWeight: "600" }}>Free Shipping</Text> applied on this order 🎉
          </Text>
        </View>
      </View>

      {/* Bottom Guarantee Row */}
      <View style={styles.guaranteeRow}>
        <View style={styles.guaranteeItem}>
          <View style={[styles.smallIconCircle, { backgroundColor: "#FCE7F3" }]}>
            <Ionicons name="gift-outline" size={14} color="#DB2777" />
          </View>
          <Text style={styles.guaranteeText}>Cash on Delivery</Text>
        </View>

        <View style={styles.guaranteeItem}>
          <Ionicons name="sync-outline" size={16} color="#DB2777" />
          <Text style={[styles.guaranteeText, { color: "#DB2777", fontWeight: "600" }]}>2-Day Easy Replacement</Text>
        </View>

        <View style={styles.guaranteeItem}>
          <Ionicons name="shield-checkmark-outline" size={16} color="#DB2777" />
          <Text style={[styles.guaranteeText, { color: "#DB2777" }]}>100% Original</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#F0F9FF",
    borderRadius: 16,
    padding: 16,
    marginVertical: 16,
    borderWidth: 1,
    borderColor: "#BAE6FD",
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#FCE7F3",
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    fontFamily: "Roboto",
    fontSize: 16,
    fontWeight: "600",
    color: "#0F172A",
  },
  trustedBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#DB2777",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  trustedText: {
    fontFamily: "Roboto",
    color: "#FFFFFF",
    fontSize: 10,
    fontWeight: "500",
    marginLeft: 4,
  },
  subtitle: {
    fontFamily: "Roboto",
    fontSize: 12,
    color: "#64748B",
    marginTop: 2,
  },
  dateBanner: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F3F4F6",
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  dateLabel: {
    fontFamily: "Roboto",
    fontSize: 10,
    fontWeight: "600",
    color: "#6B7280",
    letterSpacing: 0.5,
  },
  dateHighlight: {
    fontFamily: "Roboto",
    fontSize: 16,
    fontWeight: "600",
    color: "#374151",
    marginTop: 2,
  },
  speedBadge: {
    backgroundColor: "#E0F2FE",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  speedBadgeText: {
    fontFamily: "Roboto",
    color: "#0284C7",
    fontSize: 12,
    fontWeight: "600",
  },
  checklistContainer: {
    marginTop: 16,
    paddingHorizontal: 4,
  },
  checklistItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  checkIconCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  checklistText: {
    fontFamily: "Roboto",
    fontSize: 13,
    color: "#0F172A",
    fontWeight: "500",
  },
  guaranteeRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 8,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: "#E2E8F0",
  },
  guaranteeItem: {
    flexDirection: "row",
    alignItems: "center",
  },
  smallIconCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 6,
  },
  guaranteeText: {
    fontFamily: "Roboto",
    fontSize: 11,
    color: "#0F172A",
    fontWeight: "500",
    marginLeft: 4,
  },
});

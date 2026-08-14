import React from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import Header from "../../components/Header";
import PolicySection from "../components/PolicySection";

export default function ShippingPolicyScreen() {
  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <Header title="Shipping Policy" showBack />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.hero}>
          <Text style={styles.heroTitle}>Shipping Info</Text>
          <Text style={styles.heroText}>
            Delivery timelines and fees may vary based on product type, location, and service
            availability. Please review the current app information before placing an order.
          </Text>
        </View>

        <PolicySection
          title="Delivery Areas"
          content="Delivery is offered only in locations where GramoKart operates and where the selected shipping partner can deliver the order. Some areas may be excluded based on logistics coverage or local restrictions."
        />

        <PolicySection
          title="Order Processing"
          content="Once an order is placed and payment is confirmed (if applicable), GramoKart begins processing the order for packing and dispatch. The actual shipping status may update after the order leaves the warehouse or fulfillment center."
        />

        <PolicySection
          title="Estimated Delivery"
          content="Estimated delivery times are provided as general guidance and may change due to weather, logistics conditions, peak demand, local restrictions, or carrier delays. Exact timelines should be treated as placeholders until your operational delivery schedule is finalized."
        />

        <PolicySection
          title="Shipping Charges"
          content="Shipping charges, if applicable, will be displayed during checkout or in the order summary before you confirm the purchase. Any shipping charge may vary based on order value, delivery location, and current fulfillment rules."
        />

        <PolicySection
          title="COD Delivery"
          content="Cash-on-delivery orders require the customer to pay the final amount at the time of delivery. If the order is not accepted or the address is incomplete, the order may be rescheduled or returned to sender according to the delivery partner's process."
        />

        <PolicySection
          title="Online Payment Orders"
          content="Orders paid online are processed after successful authorization. Once shipment begins, tracking updates may be shared through the app or via order communication channels where available."
        />

        <PolicySection
          title="Delivery Attempts"
          content="Delivery partners may make one or more attempts to deliver the package. If the recipient is unavailable, the package may be held for pickup, re-attempted, or returned based on the delivery partner's rules and the app's order policy."
        />

        <PolicySection
          title="Incorrect / Incomplete Address"
          content="Customers must provide a correct and complete delivery address. In cases of wrong, incomplete, or unreachable addresses, additional re-attempt or redelivery costs may apply. GramoKart may also cancel or reschedule the order if the address cannot be verified."
        />

        <PolicySection
          title="Delayed Delivery"
          content="Delivery can be delayed by external factors such as weather, strikes, supply issues, shipping partner issues, or location-specific restrictions. GramoKart will communicate any significant disruption through the app or support channels where possible."
        />

        <PolicySection
          title="Failed Delivery"
          content="Failed delivery may happen due to no one being available, an invalid address, refusal of delivery, or other conditions specified by the delivery partner. In such cases, the order may be returned and may require re-payment or re-delivery arrangements."
        />

        <PolicySection
          title="Damaged Package"
          content="If the package appears damaged at delivery, please note the condition before accepting it and contact support immediately. If the damage is discovered after delivery, contact us promptly with order details and supporting information."
        />

        <PolicySection
          title="Contact Support"
          content="If you have questions about shipment status, shipping costs, address updates, or delivery issues, contact support through the Contact Us page in the app. Please keep your order ID ready for faster assistance."
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9FAFB",
  },
  content: {
    padding: 16,
    paddingBottom: 40,
  },
  hero: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#F3F4F6",
    padding: 18,
    marginBottom: 16,
  },
  heroTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: "#111827",
    marginBottom: 8,
  },
  heroText: {
    fontSize: 13,
    lineHeight: 20,
    color: "#4B5563",
  },
});

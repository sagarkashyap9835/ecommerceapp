import React from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import Header from "../../components/Header";
import PolicySection from "../components/PolicySection";

export default function RefundPolicyScreen() {
  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <Header title="Refund Policy" showBack />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.hero}>
          <Text style={styles.heroTitle}>Cancellation & Refund Policy</Text>
          <Text style={styles.heroText}>
            GramoKart may cancel, return, refund, or replace orders in accordance with this policy,
            product eligibility, and the payment method used.
          </Text>
        </View>

        <PolicySection
          title="Order Cancellation"
          content="A customer may request cancellation of an order before the item is shipped or before the order reaches a final fulfillment stage. Availability of cancellation depends on the current order status and the delivery process."
        />

        <PolicySection
          title="Cancellation before shipment"
          content="If the order has not yet shipped, you may be eligible for cancellation and refund according to the app's current order status rules. In some cases, the app may already have initiated packing or dispatch processes."
        />

        <PolicySection
          title="Cancellation after shipment"
          content="If the order has already been shipped or is in delivery, cancellation may not be possible, and the customer may need to wait for delivery and then initiate a return if the product is eligible."
        />

        <PolicySection
          title="Return eligibility"
          content="Returns are considered only for products that are eligible under the return conditions shown in the app, and only when the product remains in acceptable condition and the issue is valid."
        />

        <PolicySection
          title="Non-returnable products"
          content="Certain products may be marked non-returnable or excluded from return under specific conditions. This may include customized items, items damaged after delivery, or products not in resalable condition."
        />

        <PolicySection
          title="Damaged / wrong products"
          content="If the product is received damaged or is different from what was ordered, the customer must report it as soon as possible. Support may request photographs or confirmation details before approving a return or refund."
        />

        <PolicySection
          title="Return process"
          content="To request a return or refund, contact GramoKart support through the Contact Us page or the support channel available in the app. Please keep the order number, product details, and issue summary ready."
        />

        <PolicySection
          title="Prepaid refunds"
          content="For prepaid orders, eligible refunds will be processed back to the original payment method after the return or cancellation is approved. Refund processing may depend on the payment partner and banking timeline."
        />

        <PolicySection
          title="COD refunds"
          content="For cash-on-delivery orders, a refund may be issued through the original payment method or according to the current operational process after the relevant return or cancellation is approved."
        />

        <PolicySection
          title="Payment failure"
          content="If the payment fails, the order may not be created or the transaction may be cancelled automatically. In case of a failed payment where the amount is debited but the order is not created, customers should contact support for transaction review."
        />

        <PolicySection
          title="Amount debited but order not created"
          content="If a payment is debited but no confirmed order is generated, GramoKart will review the transaction and, if required, initiate a refund or confirmation workflow. Please contact support with the payment reference or UTR details if available."
        />

        <PolicySection
          title="Duplicate payment"
          content="If a duplicate charge is observed for the same transaction, customers should contact support immediately with the payment details so the payment can be checked and corrected as needed."
        />

        <PolicySection
          title="Refund processing"
          content="Refund timing depends on the payment method, payment processor, and applicable banking rules. GramoKart does not guarantee a fixed refund duration. The app should be treated as a general policy source and support should be contacted for updates."
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

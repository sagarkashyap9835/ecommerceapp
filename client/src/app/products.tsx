import React from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import Header from "../../components/Header";
import PolicySection from "../components/PolicySection";

export default function ProductsAndPricingScreen() {
  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <Header title="Products & Pricing" showBack />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.hero}>
          <Text style={styles.heroTitle}>Product information</Text>
          <Text style={styles.heroText}>
            Products are displayed in the app as part of the GramoKart shopping experience. Product
            details, pricing, and offers may vary according to availability and ongoing promotions.
          </Text>
        </View>

        <PolicySection
          title="Product Display"
          content="Products shown in the app are curated for the mobile shopping experience. Listings may include names, images, categories, product details, sizes, and available inventory status where applicable."
        />

        <PolicySection
          title="Pricing Information"
          content="Product prices are shown on product listings and in the cart or checkout flow. The price displayed at the time of purchase is the price used for the transaction unless the order is modified or a promotion changes the final total before confirmation."
        />

        <PolicySection
          title="Price Changes"
          content="Prices may change at any time due to promotions, supplier updates, operational changes, or product availability. GramoKart may update prices shown in the app without prior notice."
        />

        <PolicySection
          title="Discounts and Offers"
          content="Discounts, promotional pricing, bundle deals, and special offers are shown before checkout when applicable. Final pricing after discounts will be communicated during the order review process."
        />

        <PolicySection
          title="Final payable amount"
          content="Before confirming the order and completing payment, the app displays the final payable amount including product price, taxes, shipping charges, if applicable, and any discounts or promotional adjustments. Please review the final amount before confirming the purchase."
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

import React from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import Header from "../../components/Header";
import PolicySection from "../components/PolicySection";

export default function TermsAndConditionsScreen() {
  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <Header title="Terms & Conditions" showBack />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.hero}>
          <Text style={styles.heroTitle}>GramoKart Terms & Conditions</Text>
          <Text style={styles.heroText}>
            These Terms & Conditions govern your use of the GramoKart mobile application and the
            products and services offered through it.
          </Text>
        </View>

        <PolicySection
          title="Introduction"
          content="By using the app, you agree to these terms and all applicable laws and regulations. If you do not agree with any part of these terms, you should not use the app or place orders."
        />

        <PolicySection
          title="User Account"
          content="You are responsible for maintaining the confidentiality of your account details and for all activity that occurs under your account. You must provide accurate information and keep your mobile number, email, and profile details updated when required."
        />

        <PolicySection
          title="Eligibility"
          content="The app is intended for persons who can legally enter into binding contracts in the jurisdiction where they reside. You may not use the app if you are restricted from using such services under applicable law."
        />

        <PolicySection
          title="Products"
          content="Products shown in the app are subject to availability, description, and pricing updates. GramoKart may modify product information, remove products, or discontinue offerings at any time without prior notice."
        />

        <PolicySection
          title="Product Pricing"
          content="Prices are displayed in the app when the product is listed and during checkout. Product prices may change without notice, and discounts, offers, or promotional pricing may be applicable only under the conditions shown in the app. Final payable amounts are shown before order confirmation or payment authorization."
        />

        <PolicySection
          title="Orders"
          content="By placing an order, you agree to purchase the selected products at the price and terms displayed at the time of ordering. Orders are subject to stock verification, payment confirmation, and successful delivery validation."
        />

        <PolicySection
          title="Order Confirmation"
          content="An order is considered confirmed only after you receive an order confirmation and the payment has been successfully processed, where applicable. GramoKart reserves the right to reject or cancel any order if a product is unavailable, pricing is incorrect, or the order appears suspicious."
        />

        <PolicySection
          title="Cash on Delivery"
          content="If cash on delivery is offered, you agree to pay the order value to the delivery agent at the time of delivery. If the order cannot be delivered due to incomplete address, non-availability, or refusal, additional delivery attempts or return handling may apply."
        />

        <PolicySection
          title="Online Payments"
          content="Online payments may be processed through supported payment providers. Your payment authorization confirms your agreement to the transaction amount and product order details. Any payment failure, decline, or security issue may prevent order confirmation."
        />

        <PolicySection
          title="Razorpay Payments"
          content="If Razorpay is used for payment processing, the transaction is subject to the payment provider's terms and security procedures. GramoKart is not responsible for payment issues caused by banking, network, provider failure, or transaction security checks beyond its control."
        />

        <PolicySection
          title="Cancellation"
          content="Orders may be cancelled before dispatch, subject to cancellation rules displayed in the app. Cancellation after dispatch may be subject to return or refusal conditions, depending on the order status and product category."
        />

        <PolicySection
          title="Returns"
          content="Returns are allowed only for items that are eligible under the return and refund policy and are in acceptable condition. Some products may be excluded from returns, including items that are damaged after delivery, custom-made items, or products specifically marked as non-returnable."
        />

        <PolicySection
          title="Refunds"
          content="Refunds for eligible orders are processed according to the app's cancellation and refund policy and may depend on payment method, order status, and the reason for the return. Refund timelines may vary based on bank processing and payment partner rules."
        />

        <PolicySection
          title="Shipping & Delivery"
          content="Delivery is subject to the shipping policy available in the app. GramoKart may use third-party delivery services to complete shipments. Delivery times and charges are subject to change and may depend on the product, area, and service availability."
        />

        <PolicySection
          title="Incorrect Address"
          content="The customer is responsible for ensuring the shipping address is complete and accurate. If an order is delayed, returned, or rejected due to an incorrect or incomplete address, additional charges or re-delivery attempts may apply."
        />

        <PolicySection
          title="Damaged / Wrong Products"
          content="If you receive a damaged, incorrect, or defective product, please contact support immediately with order details and relevant images, if requested. GramoKart may arrange replacement, return pickup, or refund based on the applicable policy and order status."
        />

        <PolicySection
          title="User Responsibilities"
          content="You agree to use the app lawfully and not to misuse, tamper with, interfere with the operation of, or attempt unauthorized access to any part of the platform. You are responsible for the accuracy of your order information and the timely communication of changes or issues."
        />

        <PolicySection
          title="Prohibited Activities"
          content={[
            "Using the app for unlawful, fraudulent, abusive, or harmful purposes.",
            "Disrupting service quality, security, or stability.",
            "Attempting unauthorized access, scraping, or misuse of customer or order information.",
            "Using fake, misleading, or duplicate account information."
          ]}
        />

        <PolicySection
          title="Intellectual Property"
          content="All content, branding, product information, app interface, logos, and materials in the app are the intellectual property of GramoKart or its licensors. You may not reproduce, distribute, or commercially use app content without prior written permission."
        />

        <PolicySection
          title="Limitation of Liability"
          content="GramoKart is not liable for indirect, incidental, or consequential damages arising from the use of the app or products, except where required by applicable law. Our responsibility is limited to the amount paid for the relevant order or service where applicable."
        />

        <PolicySection
          title="Changes to Terms"
          content="GramoKart may revise these Terms & Conditions from time to time. Continued use of the app after changes are published constitutes acceptance of the updated terms."
        />

        <PolicySection
          title="Termination"
          content="We may suspend or terminate access to the app if a user violates these terms, engages in fraudulent activity, or otherwise harms the app, other users, or business operations."
        />

        <PolicySection
          title="Contact Us"
          content="If you have any questions or concerns regarding these terms, please contact us through the support section available in the app."
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

import React from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import Header from "../../components/Header";
import PolicySection from "../components/PolicySection";

export default function PrivacyPolicyScreen() {
  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <Header title="Privacy Policy" showBack />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.hero}>
          <Text style={styles.heroTitle}>GramoKart Privacy Policy</Text>
          <Text style={styles.heroText}>
            This Privacy Policy explains how GramoKart handles account information, order details,
            payment data, device information, and usage data when you use the mobile app.
          </Text>
        </View>

        <PolicySection
          title="Introduction"
          content="GramoKart is an e-commerce mobile application that allows users to browse products, add items to cart, place orders, and make payments through supported methods. This policy explains what information we collect, how we use it, with whom we share it, and how we protect it."
        />

        <PolicySection
          title="Information We Collect"
          content="We collect information that is necessary to provide the app experience, process orders, support account access, and maintain security. The app may collect information from your Firebase authentication account, order records, app preferences, product browsing data, payment metadata, and device information required for app functionality."
        />

        <PolicySection
          title="Account Information"
          content="When you create or sign in to the app, we may collect your email address, display name, profile data, and authentication metadata required to maintain your account. This information is used to help you sign in, manage your profile, receive order updates, and maintain secure access to your account."
        />

        <PolicySection
          title="Personal Information"
          content="We may collect personal information such as your name, email address, phone number if provided by the app or backend, and other details necessary for customer support or order communication. We only collect information that is necessary for the product or service being provided."
        />

        <PolicySection
          title="Shipping Address"
          content="If you place an order, we may collect shipping information such as delivery address, city, state, postal code, and country. This data is used to prepare and deliver your order. We do not use your shipping information for unrelated marketing or profiling purposes."
        />

        <PolicySection
          title="Order Information"
          content="We collect information related to your orders, including cart activity, products selected, quantities, order history, delivery status, and order confirmations. This helps us process and track your order, provide customer support, and resolve disputes or payment issues."
        />

        <PolicySection
          title="Payment Information"
          content="When you pay online, the app may collect payment-related information through the supported payment provider. In general, we do not store sensitive card details in the app itself. Payment processing may be handled by Razorpay or another approved provider. This data is processed according to the provider's policies and the payment requirements of the app."
        />

        <PolicySection
          title="Device / Usage Information"
          content="The app may collect device details such as operating system, app version, device model, session information, crash logs, app interaction events, and app settings. This helps us improve app performance, diagnose bugs, maintain security, and provide a stable shopping experience."
        />

        <PolicySection
          title="Location Information"
          content="We may use approximate location or address information where required for delivery, shipping, or support. If precise location is not required for app functionality, we do not store or process it unnecessarily."
        />

        <PolicySection
          title="How We Use Information"
          content={[
            "To provide account access, order management, and customer support.",
            "To process and deliver orders and handle shipping and payment updates.",
            "To improve app quality, product discovery, and user experience.",
            "To maintain account security, detect fraud, and protect the app from misuse.",
            "To communicate essential updates, including order status, payment status, and account notifications."
          ]}
        />

        <PolicySection
          title="How We Share Information"
          content="We may share information with trusted service providers necessary to operate the app, such as Firebase for authentication, MongoDB or other backend storage services for application data, and Razorpay for payment processing. We do not sell personal data. Information may also be shared when required by law, to enforce terms, or to prevent fraud or abuse."
        />

        <PolicySection
          title="Firebase Authentication"
          content="The app uses Firebase Authentication to enable sign-in, secure user sessions, and app account access. Firebase may process authentication-related data such as email, user ID, and login metadata required to keep your account secure."
        />

        <PolicySection
          title="MongoDB / Data Storage"
          content="User, address, cart, wishlist, and order data may be stored in a backend database such as MongoDB. This data is used to provide product features, maintain transactions, and support order management. If you request account deletion, the app may need a separate backend cleanup process to remove or anonymize the relevant data in accordance with legal and operational requirements."
        />

        <PolicySection
          title="Razorpay / Payment Processing"
          content="For online payments, Razorpay may receive payment-related data required to complete the transaction. GramoKart does not store full payment card details within the app. Payment processing is subject to the provider's data handling and security rules."
        />

        <PolicySection
          title="Data Security"
          content="We use reasonable technical and organizational measures to protect personal and transactional information. However, no system can guarantee complete security. We ask users to protect their login credentials and report suspected unauthorized access immediately."
        />

        <PolicySection
          title="Data Retention"
          content="We retain personal and transactional data only as long as it is needed to provide the app services, meet legal obligations, resolve disputes, and support internal operations. Some order and payment records may need to be kept longer where required by law or for financial compliance."
        />

        <PolicySection
          title="Account Deletion"
          content="If you delete your account, the app may remove your access to the account and associated app profile. Depending on your backend implementation, some records may still be retained for legal, compliance, or operational reasons. A separate server-side deletion workflow may be required to remove app data stored in MongoDB or other services."
        />

        <PolicySection
          title="Children's Privacy"
          content="GramoKart is not intended for children under the age limit required by applicable law, and we do not knowingly collect personal data from children without appropriate consent or lawful basis. If we become aware of such data, we will take steps to remove it where required."
        />

        <PolicySection
          title="User Rights"
          content="You may access, correct, or update your account information through the app or by contacting support. You may also request information about the personal data we hold, subject to applicable law and requirements for safe and lawful processing."
        />

        <PolicySection
          title="Changes to Privacy Policy"
          content="We may update this Privacy Policy from time to time to reflect product changes, legal requirements, or operational improvements. The latest policy will be reflected in the app and may be updated with a revised effective date."
        />

        <PolicySection
          title="Contact Us"
          content="If you have questions about this Privacy Policy or how your information is handled, please use the Contact Us page in the app or contact our support team through the contact details provided in the app."
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

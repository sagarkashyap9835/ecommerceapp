import React from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { ScrollView, StyleSheet, Text, View, Linking, TouchableOpacity } from "react-native";
import Header from "../../components/Header";
import { Ionicons } from "@expo/vector-icons";

const SUPPORT_EMAIL = "sagarkashyap9155@gmail.com";
const SUPPORT_PHONE = "7282089286";
const BUSINESS_ADDRESS = "Sitamarhi,Bihar";
const SUPPORT_HOURS = "2 hours";

export default function ContactScreen() {
  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <Header title="Contact Us" showBack />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.hero}>
          <Text style={styles.heroTitle}>We’re here to help</Text>
          <Text style={styles.heroText}>
            Need support with an order, refund, shipping issue, or account question? Reach out to us
            using the details below.
          </Text>
        </View>

        <View style={styles.cardGroup}>
          <TouchableOpacity
            style={styles.row}
            activeOpacity={0.8}
            onPress={() => Linking.openURL(`mailto:${SUPPORT_EMAIL}`)}
          >
            <View style={[styles.iconBox, { backgroundColor: "#EEF2FF" }]}>
              <Ionicons name="mail-outline" size={20} color="#4F46E5" />
            </View>
            <View style={styles.textBlock}>
              <Text style={styles.label}>Email Support</Text>
              <Text style={styles.value}>{SUPPORT_EMAIL}</Text>
            </View>
            <Ionicons name="open-outline" size={18} color="#9CA3AF" />
          </TouchableOpacity>

          <View style={styles.divider} />

          <TouchableOpacity
            style={styles.row}
            activeOpacity={0.8}
            onPress={() => Linking.openURL(`tel:${SUPPORT_PHONE}`)}
          >
            <View style={[styles.iconBox, { backgroundColor: "#ECFDF5" }]}>
              <Ionicons name="call-outline" size={20} color="#059669" />
            </View>
            <View style={styles.textBlock}>
              <Text style={styles.label}>Phone</Text>
              <Text style={styles.value}>{SUPPORT_PHONE}</Text>
            </View>
            <Ionicons name="open-outline" size={18} color="#9CA3AF" />
          </TouchableOpacity>

          <View style={styles.divider} />

          <View style={styles.row}>
            <View style={[styles.iconBox, { backgroundColor: "#FEF3C7" }]}>
              <Ionicons name="location-outline" size={20} color="#D97706" />
            </View>
            <View style={styles.textBlock}>
              <Text style={styles.label}>Business Address</Text>
              <Text style={styles.value}>{BUSINESS_ADDRESS}</Text>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.row}>
            <View style={[styles.iconBox, { backgroundColor: "#F3F4F6" }]}>
              <Ionicons name="time-outline" size={20} color="#374151" />
            </View>
            <View style={styles.textBlock}>
              <Text style={styles.label}>Support Hours</Text>
              <Text style={styles.value}>{SUPPORT_HOURS}</Text>
            </View>
          </View>
        </View>

        <View style={styles.noticeCard}>
          <Text style={styles.noticeTitle}>Before contacting support</Text>
          <Text style={styles.noticeText}>
            Please keep your order ID, product name, and screenshots ready if you are reporting a
            delivery issue, damaged item, payment dispute, or account problem.
          </Text>
        </View>
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
  cardGroup: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#F3F4F6",
    overflow: "hidden",
    marginBottom: 16,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
  },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  textBlock: {
    flex: 1,
  },
  label: {
    fontSize: 12,
    fontWeight: "700",
    color: "#6B7280",
    textTransform: "uppercase",
    letterSpacing: 0.4,
    marginBottom: 4,
  },
  value: {
    fontSize: 14,
    color: "#111827",
    fontWeight: "600",
    lineHeight: 20,
  },
  divider: {
    height: 1,
    backgroundColor: "#F3F4F6",
    marginLeft: 14,
    marginRight: 14,
  },
  noticeCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#F3F4F6",
    padding: 16,
  },
  noticeTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 8,
  },
  noticeText: {
    fontSize: 13,
    lineHeight: 20,
    color: "#4B5563",
  },
});

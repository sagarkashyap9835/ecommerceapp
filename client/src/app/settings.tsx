import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  Switch,
  TouchableOpacity,
  StyleSheet,
  Image,
  Alert,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Header from "../../components/Header";
import { Ionicons } from "@expo/vector-icons";
import { useUser, useAuth } from "@clerk/expo";
import { useRouter } from "expo-router";
import Toast from "react-native-toast-message";

export default function Settings() {
  const router = useRouter();
  const { user } = useUser();
  const { signOut } = useAuth();

  // Settings Toggles
  const [orderNotifications, setOrderNotifications] = useState(true);
  const [promoNotifications, setPromoNotifications] = useState(false);
  const [emailUpdates, setEmailUpdates] = useState(true);
  const [darkMode, setDarkMode] = useState(false);

  const handleLogout = async () => {
    const executeLogout = async () => {
      try {
        await signOut();
        Toast.show({
          type: "info",
          text1: "Signed Out",
          text2: "You have been logged out.",
        });
        router.replace("/");
      } catch (err: any) {
        Toast.show({
          type: "error",
          text1: "Error",
          text2: err?.message || "Could not sign out",
        });
      }
    };

    if (Platform.OS === "web") {
      const confirmed = window.confirm("Are you sure you want to log out?");
      if (confirmed) executeLogout();
    } else {
      Alert.alert("Log Out", "Are you sure you want to log out of your account?", [
        { text: "Cancel", style: "cancel" },
        { text: "Log Out", style: "destructive", onPress: executeLogout },
      ]);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <Header title="Settings" showBack />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* User Account Card */}
        {user && (
          <View style={styles.userCard}>
            <Image source={{ uri: user.imageUrl }} style={styles.avatar} />
            <View style={styles.userInfo}>
              <Text style={styles.userName}>{user.fullName || user.username || "User"}</Text>
              <Text style={styles.userEmail}>{user.primaryEmailAddress?.emailAddress}</Text>
              <View style={styles.roleBadge}>
                <Ionicons name="shield-checkmark" size={12} color="#059669" />
                <Text style={styles.roleText}>
                  {((user.publicMetadata?.role as string) || "Customer").toUpperCase()}
                </Text>
              </View>
            </View>
          </View>
        )}

        {/* NOTIFICATIONS SECTION */}
        <Text style={styles.sectionHeader}>Notifications</Text>
        <View style={styles.cardGroup}>
          <View style={styles.settingRow}>
            <View style={styles.settingLeft}>
              <View style={[styles.iconBg, { backgroundColor: "#EEF2FF" }]}>
                <Ionicons name="notifications-outline" size={20} color="#4F46E5" />
              </View>
              <View>
                <Text style={styles.settingTitle}>Order Updates</Text>
                <Text style={styles.settingSubtitle}>Receive tracking and delivery alerts</Text>
              </View>
            </View>
            <Switch
              value={orderNotifications}
              onValueChange={setOrderNotifications}
              trackColor={{ false: "#D1D5DB", true: "#111827" }}
              thumbColor="#FFFFFF"
            />
          </View>

          <View style={styles.divider} />

          <View style={styles.settingRow}>
            <View style={styles.settingLeft}>
              <View style={[styles.iconBg, { backgroundColor: "#FEF3C7" }]}>
                <Ionicons name="pricetag-outline" size={20} color="#D97706" />
              </View>
              <View>
                <Text style={styles.settingTitle}>Promotional Offers</Text>
                <Text style={styles.settingSubtitle}>Sales, discounts and special deals</Text>
              </View>
            </View>
            <Switch
              value={promoNotifications}
              onValueChange={setPromoNotifications}
              trackColor={{ false: "#D1D5DB", true: "#111827" }}
              thumbColor="#FFFFFF"
            />
          </View>

          <View style={styles.divider} />

          <View style={styles.settingRow}>
            <View style={styles.settingLeft}>
              <View style={[styles.iconBg, { backgroundColor: "#ECFDF5" }]}>
                <Ionicons name="mail-outline" size={20} color="#059669" />
              </View>
              <View>
                <Text style={styles.settingTitle}>Email Newsletter</Text>
                <Text style={styles.settingSubtitle}>Product recommendations & digests</Text>
              </View>
            </View>
            <Switch
              value={emailUpdates}
              onValueChange={setEmailUpdates}
              trackColor={{ false: "#D1D5DB", true: "#111827" }}
              thumbColor="#FFFFFF"
            />
          </View>
        </View>

        {/* APP PREFERENCES */}
        <Text style={styles.sectionHeader}>App Preferences</Text>
        <View style={styles.cardGroup}>
          <TouchableOpacity style={styles.settingRow} activeOpacity={0.7}>
            <View style={styles.settingLeft}>
              <View style={[styles.iconBg, { backgroundColor: "#F3F4F6" }]}>
                <Ionicons name="cash-outline" size={20} color="#374151" />
              </View>
              <View>
                <Text style={styles.settingTitle}>Currency</Text>
                <Text style={styles.settingSubtitle}>INR (₹)</Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={18} color="#9CA3AF" />
          </TouchableOpacity>

          <View style={styles.divider} />

          <TouchableOpacity style={styles.settingRow} activeOpacity={0.7}>
            <View style={styles.settingLeft}>
              <View style={[styles.iconBg, { backgroundColor: "#F3F4F6" }]}>
                <Ionicons name="language-outline" size={20} color="#374151" />
              </View>
              <View>
                <Text style={styles.settingTitle}>Language</Text>
                <Text style={styles.settingSubtitle}>English</Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={18} color="#9CA3AF" />
          </TouchableOpacity>
        </View>

        {/* ABOUT & LEGAL */}
        <Text style={styles.sectionHeader}>About & Legal</Text>
        <View style={styles.cardGroup}>
          <TouchableOpacity
            style={styles.settingRow}
            activeOpacity={0.7}
            onPress={() => Toast.show({ type: "info", text1: "Privacy Policy", text2: "Your data is encrypted and secure." })}
          >
            <View style={styles.settingLeft}>
              <View style={[styles.iconBg, { backgroundColor: "#F3F4F6" }]}>
                <Ionicons name="lock-closed-outline" size={20} color="#374151" />
              </View>
              <Text style={styles.settingTitle}>Privacy Policy</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color="#9CA3AF" />
          </TouchableOpacity>

          <View style={styles.divider} />

          <TouchableOpacity
            style={styles.settingRow}
            activeOpacity={0.7}
            onPress={() => Toast.show({ type: "info", text1: "Terms of Service", text2: "Forever E-Commerce Platform v1.0.0" })}
          >
            <View style={styles.settingLeft}>
              <View style={[styles.iconBg, { backgroundColor: "#F3F4F6" }]}>
                <Ionicons name="document-text-outline" size={20} color="#374151" />
              </View>
              <Text style={styles.settingTitle}>Terms of Service</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color="#9CA3AF" />
          </TouchableOpacity>

          <View style={styles.divider} />

          <View style={styles.settingRow}>
            <View style={styles.settingLeft}>
              <View style={[styles.iconBg, { backgroundColor: "#F3F4F6" }]}>
                <Ionicons name="information-circle-outline" size={20} color="#374151" />
              </View>
              <View>
                <Text style={styles.settingTitle}>App Version</Text>
                <Text style={styles.settingSubtitle}>v1.0.0 (Production Build)</Text>
              </View>
            </View>
          </View>
        </View>

        {/* LOGOUT BUTTON */}
        {user && (
          <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout} activeOpacity={0.8}>
            <Ionicons name="log-out-outline" size={20} color="#EF4444" style={{ marginRight: 8 }} />
            <Text style={styles.logoutBtnText}>Log Out of Account</Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9FAFB",
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  userCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#F3F4F6",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 3,
    elevation: 1,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#F3F4F6",
    marginRight: 14,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: "700",
    color: "#111827",
  },
  userEmail: {
    fontSize: 13,
    color: "#6B7280",
    marginTop: 2,
  },
  roleBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ECFDF5",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 9999,
    alignSelf: "flex-start",
    marginTop: 6,
  },
  roleText: {
    fontSize: 10,
    fontWeight: "700",
    color: "#047857",
    marginLeft: 4,
  },
  sectionHeader: {
    fontSize: 13,
    fontWeight: "700",
    color: "#6B7280",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 8,
    marginLeft: 4,
  },
  cardGroup: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#F3F4F6",
    marginBottom: 20,
    overflow: "hidden",
  },
  settingRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 14,
  },
  settingLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  iconBg: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  settingTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#111827",
  },
  settingSubtitle: {
    fontSize: 12,
    color: "#6B7280",
    marginTop: 1,
  },
  divider: {
    height: 1,
    backgroundColor: "#F3F4F6",
  },
  logoutBtn: {
    backgroundColor: "#FEF2F2",
    borderRadius: 14,
    paddingVertical: 14,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 10,
    borderWidth: 1,
    borderColor: "#FCA5A5",
  },
  logoutBtnText: {
    color: "#EF4444",
    fontWeight: "700",
    fontSize: 15,
  },
});

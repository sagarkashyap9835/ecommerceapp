import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Image,
  Alert,
  Platform,
  Modal,
  TextInput,
  ActivityIndicator
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Header from "../../components/Header";
import { Ionicons } from "@expo/vector-icons";
import { useUser, useAuth } from "@/context/AuthContext";
import { useRouter } from "expo-router";
import Toast from "react-native-toast-message";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function Settings() {
  const router = useRouter();
  const { user } = useUser();
  const { signOut } = useAuth();

  // App Preferences
  const [currency, setCurrency] = useState("INR (₹)");
  const [language, setLanguage] = useState("English");
  
  // Modals & Forms
  const [editProfileVisible, setEditProfileVisible] = useState(false);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [updatingProfile, setUpdatingProfile] = useState(false);
  const [deletingAccount, setDeletingAccount] = useState(false);

  useEffect(() => {
    loadSettings();
    if (user) {
      setFirstName(user.firstName || "");
      setLastName(user.lastName || "");
    }
  }, [user]);

  const loadSettings = async () => {
    try {
      const curr = await AsyncStorage.getItem("appCurrency");
      const lang = await AsyncStorage.getItem("appLanguage");

      if (curr) setCurrency(curr);
      if (lang) setLanguage(lang);
    } catch (e) {
      console.error("Failed to load settings", e);
    }
  };

  const saveSetting = async (key: string, value: string) => {
    try {
      await AsyncStorage.setItem(key, value);
    } catch (e) {
      console.error("Failed to save setting", e);
    }
  };

  const handleUpdateProfile = async () => {
    if (!user) return;
    setUpdatingProfile(true);
    try {
      const firebaseUser = (await import("../config/firebase")).auth.currentUser;
      if (!firebaseUser) {
        throw new Error("No authenticated user found.");
      }

      await (await import("firebase/auth")).updateProfile(firebaseUser, {
        displayName: `${firstName || ""} ${lastName || ""}`.trim() || "User",
      });

      Toast.show({ type: "success", text1: "Profile Updated", text2: "Your name has been updated successfully." });
      setEditProfileVisible(false);
    } catch (err: any) {
      Toast.show({ type: "error", text1: "Update Failed", text2: err.message || "Could not update profile." });
    } finally {
      setUpdatingProfile(false);
    }
  };

  const handleDeleteAccount = () => {
    if (!user) return;
    const executeDelete = async () => {
      setDeletingAccount(true);
      try {
        const firebaseUser = (await import("../config/firebase")).auth.currentUser;
        if (firebaseUser) {
          await (await import("firebase/auth")).deleteUser(firebaseUser);
        }
        Toast.show({ type: "success", text1: "Account Deleted", text2: "Your account has been permanently deleted." });
        router.replace("/");
      } catch (err: any) {
        Toast.show({ type: "error", text1: "Error", text2: err.message || "Could not delete account." });
      } finally {
        setDeletingAccount(false);
      }
    };

    Alert.alert("Delete Account", "WARNING: This will permanently delete your account and all associated data. Are you sure?", [
      { text: "Cancel", style: "cancel" },
      { text: "Delete Permanently", style: "destructive", onPress: executeDelete },
    ]);
  };

  const changeCurrency = () => {
    Alert.alert("Select Currency", "Choose your preferred currency", [
      { text: "INR (₹)", onPress: () => { setCurrency("INR (₹)"); saveSetting("appCurrency", "INR (₹)"); } },
      { text: "USD ($)", onPress: () => { setCurrency("USD ($)"); saveSetting("appCurrency", "USD ($)"); } },
      { text: "EUR (€)", onPress: () => { setCurrency("EUR (€)"); saveSetting("appCurrency", "EUR (€)"); } },
      { text: "Cancel", style: "cancel" }
    ]);
  };

  const changeLanguage = () => {
    Alert.alert("Select Language", "Choose your preferred language", [
      { text: "English", onPress: () => { setLanguage("English"); saveSetting("appLanguage", "English"); } },
      { text: "Hindi", onPress: () => { setLanguage("Hindi"); saveSetting("appLanguage", "Hindi"); } },
      { text: "Cancel", style: "cancel" }
    ]);
  };

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

    Alert.alert("Log Out", "Are you sure you want to log out of your account?", [
      { text: "Cancel", style: "cancel" },
      { text: "Log Out", style: "destructive", onPress: executeLogout },
    ]);
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
              <View style={{ flexDirection: "row", alignItems: "center", marginTop: 6 }}>
                <View style={[styles.roleBadge, { marginTop: 0 }]}>
                  <Ionicons name="shield-checkmark" size={12} color="#059669" />
                  <Text style={styles.roleText}>
                    {((user.publicMetadata?.role as string) || "Customer").toUpperCase()}
                  </Text>
                </View>
                <TouchableOpacity onPress={() => setEditProfileVisible(true)} style={{ marginLeft: 12, backgroundColor: "#F3F4F6", paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 }}>
                  <Text style={{ fontSize: 11, fontWeight: "600", color: "#4B5563" }}>Edit Profile</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}

        {/* APP PREFERENCES */}
        <Text style={styles.sectionHeader}>App Preferences</Text>
        <View style={styles.cardGroup}>
          <TouchableOpacity style={styles.settingRow} activeOpacity={0.7} onPress={changeCurrency}>
            <View style={styles.settingLeft}>
              <View style={[styles.iconBg, { backgroundColor: "#F3F4F6" }]}>
                <Ionicons name="cash-outline" size={20} color="#374151" />
              </View>
              <View>
                <Text style={styles.settingTitle}>Currency</Text>
                <Text style={styles.settingSubtitle}>{currency}</Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={18} color="#9CA3AF" />
          </TouchableOpacity>

          <View style={styles.divider} />

          <TouchableOpacity style={styles.settingRow} activeOpacity={0.7} onPress={changeLanguage}>
            <View style={styles.settingLeft}>
              <View style={[styles.iconBg, { backgroundColor: "#F3F4F6" }]}>
                <Ionicons name="language-outline" size={20} color="#374151" />
              </View>
              <View>
                <Text style={styles.settingTitle}>Language</Text>
                <Text style={styles.settingSubtitle}>{language}</Text>
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
            onPress={() => router.push("/privacy-policy")}
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
            onPress={() => router.push("/terms")}
          >
            <View style={styles.settingLeft}>
              <View style={[styles.iconBg, { backgroundColor: "#F3F4F6" }]}>
                <Ionicons name="document-text-outline" size={20} color="#374151" />
              </View>
              <Text style={styles.settingTitle}>Terms & Conditions</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color="#9CA3AF" />
          </TouchableOpacity>

          <View style={styles.divider} />

          <TouchableOpacity
            style={styles.settingRow}
            activeOpacity={0.7}
            onPress={() => router.push("/shipping-policy")}
          >
            <View style={styles.settingLeft}>
              <View style={[styles.iconBg, { backgroundColor: "#F3F4F6" }]}>
                <Ionicons name="cube-outline" size={20} color="#374151" />
              </View>
              <Text style={styles.settingTitle}>Shipping Policy</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color="#9CA3AF" />
          </TouchableOpacity>

          <View style={styles.divider} />

          <TouchableOpacity
            style={styles.settingRow}
            activeOpacity={0.7}
            onPress={() => router.push("/refund-policy")}
          >
            <View style={styles.settingLeft}>
              <View style={[styles.iconBg, { backgroundColor: "#F3F4F6" }]}>
                <Ionicons name="cash-outline" size={20} color="#374151" />
              </View>
              <Text style={styles.settingTitle}>Cancellation & Refund Policy</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color="#9CA3AF" />
          </TouchableOpacity>

          <View style={styles.divider} />

          <TouchableOpacity
            style={styles.settingRow}
            activeOpacity={0.7}
            onPress={() => router.push("/contact")}
          >
            <View style={styles.settingLeft}>
              <View style={[styles.iconBg, { backgroundColor: "#F3F4F6" }]}>
                <Ionicons name="help-circle-outline" size={20} color="#374151" />
              </View>
              <Text style={styles.settingTitle}>Contact Us</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color="#9CA3AF" />
          </TouchableOpacity>

          <View style={styles.divider} />

          <TouchableOpacity
            style={styles.settingRow}
            activeOpacity={0.7}
            onPress={() => router.push("/products")}
          >
            <View style={styles.settingLeft}>
              <View style={[styles.iconBg, { backgroundColor: "#F3F4F6" }]}>
                <Ionicons name="pricetag-outline" size={20} color="#374151" />
              </View>
              <Text style={styles.settingTitle}>Products & Pricing</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color="#9CA3AF" />
          </TouchableOpacity>

          <View style={styles.divider} />

          <TouchableOpacity
            style={styles.settingRow}
            activeOpacity={0.7}
            onPress={() => router.push("/delete-account")}
          >
            <View style={styles.settingLeft}>
              <View style={[styles.iconBg, { backgroundColor: "#F3F4F6" }]}>
                <Ionicons name="trash-outline" size={20} color="#374151" />
              </View>
              <Text style={styles.settingTitle}>Delete Account</Text>
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

        {/* ACCOUNT MANAGEMENT (DANGER ZONE) */}
        {user && (
          <>
            <Text style={[styles.sectionHeader, { color: "#EF4444", marginTop: 10 }]}>Danger Zone</Text>
            <View style={[styles.cardGroup, { borderColor: "#FECACA" }]}>
              <TouchableOpacity
                style={styles.settingRow}
                activeOpacity={0.7}
                onPress={handleDeleteAccount}
                disabled={deletingAccount}
              >
                <View style={styles.settingLeft}>
                  <View style={[styles.iconBg, { backgroundColor: "#FEF2F2" }]}>
                    <Ionicons name="warning-outline" size={20} color="#EF4444" />
                  </View>
                  <View>
                    <Text style={[styles.settingTitle, { color: "#EF4444" }]}>Delete Account</Text>
                    <Text style={styles.settingSubtitle}>Permanently remove your data</Text>
                  </View>
                </View>
                {deletingAccount ? (
                  <ActivityIndicator size="small" color="#EF4444" />
                ) : (
                  <Ionicons name="chevron-forward" size={18} color="#FCA5A5" />
                )}
              </TouchableOpacity>
            </View>
          </>
        )}

        {/* LOGOUT BUTTON */}
        {user && (
          <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout} activeOpacity={0.8}>
            <Ionicons name="log-out-outline" size={20} color="#EF4444" style={{ marginRight: 8 }} />
            <Text style={styles.logoutBtnText}>Log Out of Account</Text>
          </TouchableOpacity>
        )}
      </ScrollView>

      {/* Edit Profile Modal */}
      <Modal visible={editProfileVisible} animationType="slide" transparent={true} onRequestClose={() => setEditProfileVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <Text style={{ fontSize: 18, fontWeight: "700", color: "#111827" }}>Edit Profile</Text>
              <TouchableOpacity onPress={() => setEditProfileVisible(false)}>
                <Ionicons name="close" size={24} color="#6B7280" />
              </TouchableOpacity>
            </View>

            <View style={{ marginBottom: 16 }}>
              <Text style={{ fontSize: 13, fontWeight: "600", color: "#374151", marginBottom: 6 }}>First Name</Text>
              <TextInput
                style={styles.inputField}
                value={firstName}
                onChangeText={setFirstName}
                placeholder="Enter your first name"
                placeholderTextColor="#9CA3AF"
              />
            </View>

            <View style={{ marginBottom: 24 }}>
              <Text style={{ fontSize: 13, fontWeight: "600", color: "#374151", marginBottom: 6 }}>Last Name</Text>
              <TextInput
                style={styles.inputField}
                value={lastName}
                onChangeText={setLastName}
                placeholder="Enter your last name"
                placeholderTextColor="#9CA3AF"
              />
            </View>

            <TouchableOpacity 
              style={[styles.saveBtn, updatingProfile && { opacity: 0.7 }]} 
              onPress={handleUpdateProfile}
              disabled={updatingProfile}
            >
              {updatingProfile ? (
                <ActivityIndicator color="#FFFFFF" size="small" />
              ) : (
                <Text style={styles.saveBtnText}>Save Changes</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: Platform.OS === "ios" ? 40 : 24,
  },
  inputField: {
    backgroundColor: "#F9FAFB",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 15,
    color: "#111827",
  },
  saveBtn: {
    backgroundColor: "#111827",
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
  },
  saveBtnText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
});

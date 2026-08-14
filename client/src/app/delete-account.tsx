import React, { useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { ScrollView, StyleSheet, Text, View, Alert, TouchableOpacity, ActivityIndicator } from "react-native";
import Header from "../../components/Header";
import { useUser, useAuth } from "@/context/AuthContext";
import { useRouter } from "expo-router";
import Toast from "react-native-toast-message";
import { deleteUser } from "firebase/auth";
import { auth } from "../config/firebase";

export default function DeleteAccountScreen() {
  const router = useRouter();
  const { user } = useUser();
  const { signOut } = useAuth();
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (!user) {
      Toast.show({ type: "error", text1: "No account found", text2: "Please sign in to continue." });
      return;
    }

    Alert.alert(
      "Delete account permanently?",
      "This action is permanent. Your account access will be removed and your personal data may be deleted according to the app's deletion policy. Some order and payment records may need to be retained where legally required.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete My Account",
          style: "destructive",
          onPress: async () => {
            setIsDeleting(true);
            try {
              const firebaseUser = auth.currentUser;
              if (!firebaseUser) {
                throw new Error("No authenticated user found.");
              }

              await deleteUser(firebaseUser);
              await signOut();
              Toast.show({
                type: "success",
                text1: "Account deleted",
                text2: "Your account has been scheduled for removal according to the app policy.",
              });
              router.replace("/");
            } catch (error: any) {
              Toast.show({
                type: "error",
                text1: "Delete failed",
                text2: error?.message || "Could not delete your account at this time.",
              });
            } finally {
              setIsDeleting(false);
            }
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <Header title="Delete Account" showBack />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.noticeCard}>
          <Text style={styles.title}>Permanent account deletion</Text>
          <Text style={styles.text}>
            Account deletion is permanent and removes access to your account in the app. Your profile,
            saved preferences, and supported account data may be deleted according to the app's
            deletion workflow.
          </Text>
          <Text style={styles.text}>
            Some order, payment, and transaction records may need to be retained where legally required,
            for financial reporting, or to prevent abuse. This means not all stored customer data may be
            removed immediately from every system.
          </Text>
          <Text style={styles.text}>
            This app currently uses Firebase Authentication and may store app-related records in a backend
            database. If your backend has no deletion endpoint yet, the account may be removed from
            authentication only while additional server-side cleanup is still required.
          </Text>
        </View>

        <View style={styles.warningBox}>
          <Text style={styles.warningTitle}>Important</Text>
          <Text style={styles.warningText}>
            Please confirm before proceeding. This action cannot be undone.
          </Text>
        </View>

        <TouchableOpacity
          style={[styles.deleteBtn, isDeleting && { opacity: 0.7 }]}
          onPress={handleDelete}
          disabled={isDeleting}
          activeOpacity={0.8}
        >
          {isDeleting ? (
            <ActivityIndicator color="#FFFFFF" size="small" />
          ) : (
            <Text style={styles.deleteBtnText}>Delete My Account</Text>
          )}
        </TouchableOpacity>
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
  noticeCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#FECACA",
    padding: 18,
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: "800",
    color: "#111827",
    marginBottom: 12,
  },
  text: {
    fontSize: 13,
    lineHeight: 20,
    color: "#4B5563",
    marginBottom: 10,
  },
  warningBox: {
    backgroundColor: "#FEF2F2",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#FECACA",
    padding: 16,
    marginBottom: 16,
  },
  warningTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#B91C1C",
    marginBottom: 6,
  },
  warningText: {
    fontSize: 13,
    lineHeight: 20,
    color: "#7F1D1D",
  },
  deleteBtn: {
    backgroundColor: "#DC2626",
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  deleteBtnText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
  },
});

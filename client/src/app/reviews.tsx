import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  StyleSheet,
  Alert,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Header from "../../components/Header";
import { Ionicons } from "@expo/vector-icons";
import { COLORS } from "@/assets/constants";
import { useRouter } from "expo-router";
import { useAuth } from "@/context/AuthContext";
import Toast from "react-native-toast-message";
import api from "../../constants/api";

interface UserReviewItem {
  _id: string;
  productId: string;
  productName: string;
  productImage: string;
  productPrice: number;
  rating: number;
  comment: string;
  image?: string;
  createdAt: string;
}

export default function MyReviews() {
  const router = useRouter();
  const { getToken, isSignedIn } = useAuth();

  const [reviews, setReviews] = useState<UserReviewItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchMyReviews = async () => {
    if (!isSignedIn) {
      setLoading(false);
      return;
    }
    try {
      const token = await getToken();
      const { data } = await api.get("/products/user/my-reviews", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (data.success) {
        setReviews(data.data || []);
      }
    } catch (error: any) {
      console.error("Failed to fetch user reviews:", error);
      Toast.show({
        type: "error",
        text1: "Error",
        text2: error.response?.data?.message || "Failed to load your reviews",
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchMyReviews();
  }, [isSignedIn]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchMyReviews();
  };

  const handleDeleteReview = async (productId: string, productName: string) => {
    const executeDelete = async () => {
      try {
        setDeletingId(productId);
        const token = await getToken();
        const { data } = await api.delete(`/products/${productId}/user-review`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (data.success) {
          Toast.show({
            type: "success",
            text1: "Review Deleted",
            text2: `Your review for ${productName} has been deleted.`,
          });
          fetchMyReviews();
        }
      } catch (error: any) {
        Toast.show({
          type: "error",
          text1: "Delete Failed",
          text2: error.response?.data?.message || "Could not delete review",
        });
      } finally {
        setDeletingId(null);
      }
    };

    if (Platform.OS === "web") {
      const confirmed = window.confirm(`Delete your review for ${productName}?`);
      if (confirmed) executeDelete();
    } else {
      Alert.alert(
        "Delete Review",
        `Are you sure you want to delete your review for "${productName}"?`,
        [
          { text: "Cancel", style: "cancel" },
          { text: "Delete", style: "destructive", onPress: executeDelete },
        ]
      );
    }
  };

  if (loading && !refreshing) {
    return (
      <SafeAreaView style={styles.container} edges={["top"]}>
        <Header title="My Reviews" showBack />
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#111827" />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <Header title="My Reviews" showBack />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        <View style={styles.headerInfoBox}>
          <Text style={styles.headerTitle}>Your Verified Reviews ({reviews.length})</Text>
          <Text style={styles.headerSubtitle}>
            Reviews submitted after ordering products appear here.
          </Text>
        </View>

        {reviews.length === 0 ? (
          <View style={styles.emptyContainer}>
            <View style={styles.emptyIconCircle}>
              <Ionicons name="star-outline" size={48} color="#9CA3AF" />
            </View>
            <Text style={styles.emptyTitle}>No Reviews Yet</Text>
            <Text style={styles.emptySubtitle}>
              When you purchase items and share your experience, your reviews will show up here.
            </Text>
            <TouchableOpacity
              style={styles.shopNowBtn}
              onPress={() => router.replace("/shop")}
            >
              <Text style={styles.shopNowBtnText}>Browse Products</Text>
            </TouchableOpacity>
          </View>
        ) : (
          reviews.map((item) => (
            <TouchableOpacity
              key={item._id || item.productId}
              activeOpacity={0.9}
              style={styles.reviewCard}
              onPress={() => router.push(`/product/${item.productId}`)}
            >
              {/* Product Info Header */}
              <View style={styles.productRow}>
                <Image
                  source={{ uri: item.productImage }}
                  style={styles.productImage}
                  resizeMode="cover"
                />
                <View style={styles.productDetails}>
                  <Text numberOfLines={1} style={styles.productName}>
                    {item.productName}
                  </Text>
                  <Text style={styles.productPrice}>₹{item.productPrice?.toFixed(2)}</Text>
                  
                  <View style={styles.starsRow}>
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Ionicons
                        key={star}
                        name={star <= item.rating ? "star" : "star-outline"}
                        size={14}
                        color={star <= item.rating ? "#FBBF24" : "#D1D5DB"}
                      />
                    ))}
                    <Text style={styles.ratingNumText}>{item.rating}.0 / 5</Text>
                  </View>
                </View>

                {/* Delete Review Button */}
                <TouchableOpacity
                  style={styles.deleteReviewBtn}
                  onPress={(e) => {
                    e.stopPropagation();
                    handleDeleteReview(item.productId, item.productName);
                  }}
                  disabled={deletingId === item.productId}
                >
                  {deletingId === item.productId ? (
                    <ActivityIndicator size="small" color="#EF4444" />
                  ) : (
                    <Ionicons name="trash-outline" size={18} color="#EF4444" />
                  )}
                </TouchableOpacity>
              </View>

              {/* Review Comment Box */}
              <View style={styles.commentBox}>
                <Text style={styles.commentText}>"{item.comment}"</Text>
              </View>

              {/* Attached Review Photo */}
              {item.image ? (
                <View style={{ marginTop: 8 }}>
                  <Image
                    source={{ uri: item.image }}
                    style={{ width: 80, height: 80, borderRadius: 8, borderWidth: 1, borderColor: "#E5E7EB" }}
                    resizeMode="cover"
                  />
                </View>
              ) : null}

              {/* Footer Date */}
              {item.createdAt && (
                <View style={styles.cardFooter}>
                  <Ionicons name="calendar-outline" size={12} color="#9CA3AF" />
                  <Text style={styles.dateText}>
                    Reviewed on {new Date(item.createdAt).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "short",
                      year: "numeric"
                    })}
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          ))
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
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  headerInfoBox: {
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111827",
  },
  headerSubtitle: {
    fontSize: 13,
    color: "#6B7280",
    marginTop: 2,
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
  },
  emptyIconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#F3F4F6",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 6,
  },
  emptySubtitle: {
    fontSize: 13,
    color: "#6B7280",
    textAlign: "center",
    maxWidth: 280,
    lineHeight: 18,
    marginBottom: 20,
  },
  shopNowBtn: {
    backgroundColor: "#111827",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 9999,
  },
  shopNowBtnText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "600",
  },
  reviewCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: "#F3F4F6",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 3,
    elevation: 1,
  },
  productRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  productImage: {
    width: 60,
    height: 60,
    borderRadius: 10,
    backgroundColor: "#F3F4F6",
    marginRight: 12,
  },
  productDetails: {
    flex: 1,
  },
  productName: {
    fontSize: 15,
    fontWeight: "700",
    color: "#111827",
  },
  productPrice: {
    fontSize: 13,
    fontWeight: "600",
    color: "#4B5563",
    marginTop: 2,
  },
  starsRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
  },
  ratingNumText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#374151",
    marginLeft: 6,
  },
  deleteReviewBtn: {
    padding: 8,
    backgroundColor: "#FEF2F2",
    borderRadius: 9999,
    marginLeft: 8,
  },
  commentBox: {
    backgroundColor: "#F9FAFB",
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  commentText: {
    fontSize: 13,
    color: "#374151",
    lineHeight: 19,
    fontStyle: "italic",
  },
  cardFooter: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 10,
  },
  dateText: {
    fontSize: 11,
    color: "#9CA3AF",
    marginLeft: 4,
  },
});

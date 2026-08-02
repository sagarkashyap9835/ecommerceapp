import {
  View,
  Text,
  ActivityIndicator,
  ScrollView,
  Dimensions,
  Image,
  TouchableOpacity,
  TextInput,
  StyleSheet,
} from "react-native";
import React, { useEffect, useState } from "react";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Product, Review } from "@/assets/constants/types";
import { useCart } from "../../../context/CartContext";
import { useWishlist } from "../../../context/WishlistContext";

import { SafeAreaView } from "react-native-safe-area-context";
import { COLORS } from "@/assets/constants";
import { Ionicons } from "@expo/vector-icons";
import Toast from "react-native-toast-message";
import api from "../../../constants/api";
import { useAuth } from "@clerk/expo";

const { width } = Dimensions.get("window");

export default function ProductDetails() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { getToken, isSignedIn } = useAuth();

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);

  const { addToCart, cartItems, itemCount, updateQuantity } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();

  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  // Review System States
  const [canReview, setCanReview] = useState<boolean>(false);
  const [rating, setRating] = useState<number>(5);
  const [reviewComment, setReviewComment] = useState<string>("");
  const [submittingReview, setSubmittingReview] = useState<boolean>(false);

  const fetchProduct = async () => {
    try {
      const { data } = await api.get(`/products/${id}`);
      setProduct(data.data);
    } catch (error: any) {
      Toast.show({
        type: "error",
        text1: "Failed to fetch product",
        text2: error.response?.data?.message || "Something went wrong"
      });
    } finally {
      setLoading(false);
    }
  };

  const checkEligibility = async () => {
    if (!isSignedIn) return;
    try {
      const token = await getToken();
      const { data } = await api.get(`/products/${id}/can-review`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCanReview(!!data.canReview);
      if (data.userReview) {
        setRating(data.userReview.rating || 5);
        setReviewComment(data.userReview.comment || "");
      }
    } catch (err) {
      console.error("Check eligibility error:", err);
    }
  };

  useEffect(() => {
    fetchProduct();
    checkEligibility();
  }, [id, isSignedIn]);

  const handleSubmitReview = async () => {
    if (!isSignedIn) {
      Toast.show({
        type: "info",
        text1: "Sign In Required",
        text2: "Please sign in to submit a review."
      });
      return;
    }

    if (!reviewComment.trim()) {
      Toast.show({
        type: "error",
        text1: "Empty Review",
        text2: "Please enter your review message."
      });
      return;
    }

    try {
      setSubmittingReview(true);
      const token = await getToken();
      const { data } = await api.post(
        `/products/${id}/reviews`,
        { rating, comment: reviewComment },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (data.success) {
        Toast.show({
          type: "success",
          text1: "Review Submitted 🎉",
          text2: data.message || "Thank you for your rating!"
        });
        setProduct(data.data);
      }
    } catch (error: any) {
      Toast.show({
        type: "error",
        text1: "Submission Failed",
        text2: error.response?.data?.message || "Could not submit review"
      });
    } finally {
      setSubmittingReview(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView className="flex-1 justify-center items-center">
        <ActivityIndicator size="large" color={COLORS.primary} />
      </SafeAreaView>
    );
  }

  if (!product) {
    return (
      <SafeAreaView className="flex-1 justify-center items-center">
        <Text>Product not found</Text>
      </SafeAreaView>
    );
  }

  const isLiked = isInWishlist(product._id);
  const currentCartItem = cartItems.find(
    (item) => item.productId === product._id && item.size === selectedSize
  );

  const reviewsList = product.reviews || [];
  const averageRatingStr = product.ratings?.count ? product.ratings.average.toFixed(1) : "0.0";
  const reviewCount = product.ratings?.count ?? 0;

  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView contentContainerStyle={{ paddingBottom: 140 }} showsVerticalScrollIndicator={false}>
        {/* Image Carousel */}
        <View className="relative">
          <ScrollView
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            scrollEventThrottle={16}
            onMomentumScrollEnd={(event) => {
              const index = Math.round(
                event.nativeEvent.contentOffset.x / width
              );
              setActiveImageIndex(index);
            }}
          >
            {product.images?.map((img, index) => (
              <Image
                key={index}
                source={{ uri: img }}
                style={{
                  width,
                  height: 420,
                }}
                resizeMode="cover"
              />
            ))}
          </ScrollView>

          {/* Header Actions */}
          <View
            style={{
              position: "absolute",
              top: 20,
              left: 20,
              right: 20,
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <TouchableOpacity
              onPress={() => {
                if (router.canGoBack()) {
                  router.back();
                } else {
                  router.replace("/");
                }
              }}
              style={{
                width: 38,
                height: 38,
                borderRadius: 19,
                backgroundColor: "#FFFFFF",
                justifyContent: "center",
                alignItems: "center",
                elevation: 2,
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.1,
                shadowRadius: 2,
              }}
            >
              <Ionicons name="arrow-back" size={22} color="#111827" />
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => toggleWishlist(product)}
              style={{
                width: 38,
                height: 38,
                borderRadius: 19,
                backgroundColor: "#FFFFFF",
                justifyContent: "center",
                alignItems: "center",
                elevation: 2,
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.1,
                shadowRadius: 2,
              }}
            >
              <Ionicons
                name={isLiked ? "heart" : "heart-outline"}
                size={22}
                color={isLiked ? "#EF4444" : "#111827"}
              />
            </TouchableOpacity>
          </View>

          {/* Pagination Dots */}
          <View
            style={{
              position: "absolute",
              bottom: 15,
              width: "100%",
              flexDirection: "row",
              justifyContent: "center",
            }}
          >
            {product.images?.map((_, index) => (
              <View
                key={index}
                style={{
                  width: activeImageIndex === index ? 14 : 7,
                  height: 7,
                  borderRadius: 4,
                  marginHorizontal: 3,
                  backgroundColor:
                    activeImageIndex === index
                      ? "#111827"
                      : "rgba(17,24,39,0.2)",
                }}
              />
            ))}
          </View>
        </View>

        {/* Product Info */}
        <View style={{ backgroundColor: "#fff", paddingHorizontal: 20, paddingVertical: 24 }}>
          {/* Header Row: Title & Rating */}
          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" }}>
            <Text style={{ fontSize: 22, fontWeight: "700", color: "#111827", flex: 1, marginRight: 16 }}>
              {product.name}
            </Text>
            
            {/* Rating side-by-side with count */}
            <View style={{ flexDirection: "row", alignItems: "center", marginTop: 4, backgroundColor: "#FDF8F6", paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12 }}>
              <Ionicons name="star" size={16} color="#FBBF24" />
              <Text style={{ marginLeft: 4, fontSize: 14, fontWeight: "700", color: "#111827" }}>
                {averageRatingStr}
              </Text>
              <Text style={{ fontSize: 13, color: "#6B7280", marginLeft: 3 }}>
                ({reviewCount})
              </Text>
            </View>
          </View>

          {/* Price & Stock Badge Row */}
          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: 8 }}>
            <Text style={{ fontSize: 22, fontWeight: "700", color: "#111827" }}>
              ₹{product.price.toFixed(2)}
            </Text>
            
            {/* Stock Availability Badge */}
            <View style={{
              flexDirection: "row",
              alignItems: "center",
              backgroundColor: product.stock > 0 ? (product.stock <= 5 ? "#FEF3C7" : "#ECFDF5") : "#FEF2F2",
              paddingHorizontal: 10,
              paddingVertical: 4,
              borderRadius: 12,
              borderWidth: 1,
              borderColor: product.stock > 0 ? (product.stock <= 5 ? "#FDE68A" : "#A7F3D0") : "#FCA5A5",
            }}>
              <Ionicons
                name={product.stock > 0 ? "cube-outline" : "close-circle-outline"}
                size={14}
                color={product.stock > 0 ? (product.stock <= 5 ? "#D97706" : "#059669") : "#DC2626"}
              />
              <Text style={{
                marginLeft: 4,
                fontSize: 12,
                fontWeight: "700",
                color: product.stock > 0 ? (product.stock <= 5 ? "#B45309" : "#047857") : "#B91C1C",
              }}>
                {product.stock > 0 ? (product.stock <= 5 ? `Only ${product.stock} left in stock!` : `In Stock: ${product.stock}`) : "Out of Stock"}
              </Text>
            </View>
          </View>

          {/* BUY 1 GET 1 OFFER BANNER */}
          {product.isBogo && (
            <View style={{
              marginTop: 14,
              backgroundColor: "#ECFDF5",
              borderRadius: 12,
              paddingHorizontal: 14,
              paddingVertical: 10,
              flexDirection: "row",
              alignItems: "center",
              borderWidth: 1,
              borderColor: "#A7F3D0",
            }}>
              <Text style={{ fontSize: 18, marginRight: 10 }}>🎁</Text>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 13, fontWeight: "800", color: "#065F46" }}>
                  BUY 1 GET 1 FREE OFFER
                </Text>
                <Text style={{ fontSize: 11, color: "#047857", marginTop: 1 }}>
                  Special Offer: Purchase 1 unit & get 1 free with your order!
                </Text>
              </View>
            </View>
          )}

          {/* Sizes Section */}
          {product.sizes && product.sizes.length > 0 && (
            <View style={{ marginTop: 24 }}>
              <Text style={{ fontSize: 15, fontWeight: "700", color: "#111827", marginBottom: 14 }}>
                Size
              </Text>
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                {product.sizes.map((size) => {
                  const isSelected = selectedSize === size;
                  return (
                    <TouchableOpacity
                      key={size}
                      onPress={() => setSelectedSize(size)}
                      style={{
                        width: 42,
                        height: 42,
                        borderRadius: 21,
                        backgroundColor: isSelected ? "#111827" : "transparent",
                        justifyContent: "center",
                        alignItems: "center",
                        marginRight: 14,
                        borderWidth: isSelected ? 0 : 1,
                        borderColor: "#E5E7EB",
                      }}
                    >
                      <Text
                        style={{
                          fontSize: 14,
                          fontWeight: isSelected ? "700" : "500",
                          color: isSelected ? "#FFFFFF" : "#4B5563",
                        }}
                      >
                        {size}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          )}

          {/* Description */}
          <View style={{ marginTop: 24 }}>
            <Text style={{ fontSize: 15, fontWeight: "700", color: "#111827", marginBottom: 8 }}>
              Description
            </Text>
            <Text style={{ fontSize: 14, color: "#4B5563", lineHeight: 22 }}>
              {product.description}
            </Text>
          </View>

          {/* CUSTOMER REVIEWS & RATINGS SECTION */}
          <View style={{ marginTop: 32, paddingTop: 24, borderTopWidth: 1, borderTopColor: "#F3F4F6" }}>
            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <Text style={{ fontSize: 18, fontWeight: "700", color: "#111827" }}>
                Customer Reviews
              </Text>
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <Ionicons name="star" size={16} color="#FBBF24" />
                <Text style={{ fontSize: 15, fontWeight: "700", color: "#111827", marginLeft: 4 }}>
                  {averageRatingStr}
                </Text>
                <Text style={{ fontSize: 13, color: "#6B7280", marginLeft: 4 }}>
                  ({reviewCount} reviews)
                </Text>
              </View>
            </View>

            {/* WRITE A REVIEW FORM (ONLY FOR VERIFIED PURCHASERS) */}
            {canReview ? (
              <View style={styles.reviewFormCard}>
                <Text style={styles.reviewFormTitle}>Write a Review</Text>
                <Text style={styles.reviewFormSubtitle}>Share your real experience with this product</Text>
                
                {/* Interactive Star Rating Selector */}
                <View style={styles.starSelectorRow}>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <TouchableOpacity key={star} onPress={() => setRating(star)} activeOpacity={0.7} style={{ padding: 4 }}>
                      <Ionicons
                        name={star <= rating ? "star" : "star-outline"}
                        size={28}
                        color={star <= rating ? "#FBBF24" : "#D1D5DB"}
                      />
                    </TouchableOpacity>
                  ))}
                  <Text style={styles.ratingTextLabel}>{rating} / 5 Stars</Text>
                </View>

                {/* Review Message Input */}
                <TextInput
                  style={styles.reviewInput}
                  placeholder="Write your review here (e.g. quality, fit, comfort)..."
                  placeholderTextColor="#9CA3AF"
                  multiline
                  numberOfLines={3}
                  value={reviewComment}
                  onChangeText={setReviewComment}
                />

                <TouchableOpacity
                  style={styles.submitReviewBtn}
                  onPress={handleSubmitReview}
                  disabled={submittingReview}
                >
                  {submittingReview ? (
                    <ActivityIndicator size="small" color="#FFFFFF" />
                  ) : (
                    <Text style={styles.submitReviewBtnText}>Submit Verified Review</Text>
                  )}
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.verifiedNoticeCard}>
                <Ionicons name="shield-checkmark-outline" size={24} color="#059669" style={{ marginBottom: 6 }} />
                <Text style={styles.verifiedNoticeTitle}>Verified Buyer Reviews Only</Text>
                <Text style={styles.verifiedNoticeText}>
                  To ensure 100% authentic ratings and prevent fake reviews, only customers who have ordered this product can write a review.
                </Text>
              </View>
            )}

            {/* REVIEWS LIST */}
            <View style={{ marginTop: 20 }}>
              {reviewsList.length === 0 ? (
                <View style={styles.emptyReviewsBox}>
                  <Ionicons name="chatbox-ellipses-outline" size={36} color="#9CA3AF" />
                  <Text style={styles.emptyReviewsText}>No customer reviews yet.</Text>
                </View>
              ) : (
                reviewsList.map((rev: Review, index: number) => (
                  <View key={rev._id || index} style={styles.reviewItemCard}>
                    <View style={styles.reviewHeaderRow}>
                      <View style={{ flexDirection: "row", alignItems: "center" }}>
                        <View style={styles.avatarCircle}>
                          <Text style={styles.avatarText}>
                            {rev.userName ? rev.userName.charAt(0).toUpperCase() : "U"}
                          </Text>
                        </View>
                        <View style={{ marginLeft: 10 }}>
                          <Text style={styles.reviewerName}>{rev.userName || "Verified Buyer"}</Text>
                          {rev.isVerifiedPurchase && (
                            <View style={styles.verifiedBadge}>
                              <Ionicons name="checkmark-circle" size={12} color="#059669" />
                              <Text style={styles.verifiedBadgeText}>Verified Purchase</Text>
                            </View>
                          )}
                        </View>
                      </View>

                      {/* Stars for this review */}
                      <View style={{ flexDirection: "row" }}>
                        {[1, 2, 3, 4, 5].map((s) => (
                          <Ionicons
                            key={s}
                            name={s <= rev.rating ? "star" : "star-outline"}
                            size={14}
                            color={s <= rev.rating ? "#FBBF24" : "#D1D5DB"}
                          />
                        ))}
                      </View>
                    </View>

                    {/* Review Comment Message */}
                    <Text style={styles.reviewCommentText}>{rev.comment}</Text>
                    {rev.createdAt && (
                      <Text style={styles.reviewDateText}>
                        {new Date(rev.createdAt).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                          year: "numeric"
                        })}
                      </Text>
                    )}
                  </View>
                ))
              )}
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Fixed Bottom Action Bar */}
      <View
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          backgroundColor: "#fff",
          paddingHorizontal: 20,
          paddingVertical: 14,
          paddingBottom: 28,
          flexDirection: "row",
          alignItems: "center",
          borderTopWidth: 1,
          borderTopColor: "#F3F4F6",
        }}
      >
        <View style={{ flex: 1, marginRight: 20 }}>
          {currentCartItem ? (
            <View
              style={{
                height: 52,
                backgroundColor: "#111827",
                borderRadius: 26,
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
                paddingHorizontal: 20,
              }}
            >
              <TouchableOpacity
                onPress={() => {
                  updateQuantity(currentCartItem.id, currentCartItem.quantity - 1, currentCartItem.size);
                }}
                style={{ padding: 4 }}
              >
                <Ionicons name="remove" size={22} color="#fff" />
              </TouchableOpacity>

              <Text style={{ fontSize: 16, fontWeight: "700", color: "#fff" }}>
                {currentCartItem.quantity}
              </Text>

              <TouchableOpacity
                onPress={() => {
                  updateQuantity(currentCartItem.id, currentCartItem.quantity + 1, currentCartItem.size);
                }}
                style={{ padding: 4 }}
              >
                <Ionicons name="add" size={22} color="#fff" />
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity
              onPress={async () => {
                if (product.sizes && product.sizes.length > 0 && !selectedSize) {
                  Toast.show({
                    type: "info",
                    text1: "Select Size",
                    text2: "Please select a size first before adding to cart.",
                  });
                  return;
                }
                await addToCart(product, selectedSize || "");
              }}
              style={{
                height: 52,
                backgroundColor: "#111827",
                borderRadius: 26,
                justifyContent: "center",
                alignItems: "center",
                flexDirection: "row",
              }}
            >
              <Ionicons name="bag-handle-outline" size={18} color="#fff" />
              <Text style={{ color: "#fff", fontSize: 15, fontWeight: "600", marginLeft: 8 }}>
                Add to Cart
              </Text>
            </TouchableOpacity>
          )}
        </View>

        <TouchableOpacity
          onPress={() => router.push("/cart")}
          style={{
            justifyContent: "center",
            alignItems: "center",
            position: "relative",
            padding: 6,
          }}
        >
          <Ionicons name="cart-outline" size={26} color="#111827" />
          
          {itemCount > 0 && (
            <View
              style={{
                position: "absolute",
                top: 0,
                right: -2,
                backgroundColor: "#111827",
                borderRadius: 9,
                width: 17,
                height: 17,
                justifyContent: "center",
                alignItems: "center",
                borderWidth: 1.5,
                borderColor: "#FFFFFF"
              }}
            >
              <Text style={{ color: "#fff", fontSize: 8, fontWeight: "700" }}>
                {itemCount}
              </Text>
            </View>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  reviewFormCard: {
    backgroundColor: "#F9FAFB",
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    marginBottom: 20,
  },
  reviewFormTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#111827",
  },
  reviewFormSubtitle: {
    fontSize: 12,
    color: "#6B7280",
    marginTop: 2,
    marginBottom: 12,
  },
  starSelectorRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  ratingTextLabel: {
    marginLeft: 12,
    fontSize: 14,
    fontWeight: "700",
    color: "#374151",
  },
  reviewInput: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 10,
    padding: 12,
    fontSize: 14,
    color: "#111827",
    textAlignVertical: "top",
    marginBottom: 12,
  },
  submitReviewBtn: {
    backgroundColor: "#111827",
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: "center",
  },
  submitReviewBtnText: {
    color: "#FFFFFF",
    fontWeight: "600",
    fontSize: 14,
  },
  verifiedNoticeCard: {
    backgroundColor: "#ECFDF5",
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: "#A7F3D0",
    marginBottom: 16,
    alignItems: "center",
  },
  verifiedNoticeTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#065F46",
    marginBottom: 4,
  },
  verifiedNoticeText: {
    fontSize: 12,
    color: "#047857",
    textAlign: "center",
    lineHeight: 18,
  },
  emptyReviewsBox: {
    paddingVertical: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyReviewsText: {
    fontSize: 14,
    color: "#6B7280",
    marginTop: 8,
  },
  reviewItemCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: "#F3F4F6",
    marginBottom: 12,
  },
  reviewHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  avatarCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#111827",
    justifyContent: "center",
    alignItems: "center",
  },
  avatarText: {
    color: "#FFFFFF",
    fontWeight: "700",
    fontSize: 14,
  },
  reviewerName: {
    fontSize: 14,
    fontWeight: "700",
    color: "#111827",
  },
  verifiedBadge: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 2,
  },
  verifiedBadgeText: {
    fontSize: 10,
    color: "#059669",
    fontWeight: "600",
    marginLeft: 3,
  },
  reviewCommentText: {
    fontSize: 14,
    color: "#374151",
    lineHeight: 20,
    marginTop: 4,
  },
  reviewDateText: {
    fontSize: 11,
    color: "#9CA3AF",
    marginTop: 6,
  },
});

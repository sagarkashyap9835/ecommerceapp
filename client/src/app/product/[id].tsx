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
  Modal,
  Pressable,
} from "react-native";
import React, { useEffect, useState } from "react";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Product, Review } from "@/assets/constants/types";
import { useCart } from "../../../context/CartContext";
import { useWishlist } from "../../../context/WishlistContext";
import * as ImagePicker from "expo-image-picker";

import { SafeAreaView } from "react-native-safe-area-context";
import { COLORS } from "@/assets/constants";
import { Ionicons } from "@expo/vector-icons";
import Toast from "react-native-toast-message";
import api from "../../../constants/api";
import { useAuth } from "@/context/AuthContext";
import DeliveryEstimateCard from "../../../components/DeliveryEstimateCard";

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
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  // Review System States
  const [canReview, setCanReview] = useState<boolean>(false);
  const [rating, setRating] = useState<number>(5);
  const [reviewComment, setReviewComment] = useState<string>("");
  const [reviewImage, setReviewImage] = useState<string>("");
  const [previewModalImage, setPreviewModalImage] = useState<string | null>(null);
  const [submittingReview, setSubmittingReview] = useState<boolean>(false);

  const pickReviewImage = async () => {
    try {
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permissionResult.granted) {
        Toast.show({
          type: "error",
          text1: "Permission Denied",
          text2: "Permission to access photo library is required to upload product photo.",
        });
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        quality: 0.7,
        base64: true,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        if (asset.base64) {
          setReviewImage(`data:image/jpeg;base64,${asset.base64}`);
        } else {
          setReviewImage(asset.uri);
        }
      }
    } catch (error) {
      console.error("Image pick error:", error);
    }
  };

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
        { rating, comment: reviewComment, image: reviewImage },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (data.success) {
        Toast.show({
          type: "success",
          text1: "Review Submitted 🎉",
          text2: data.message || "Thank you for your rating & photo!"
        });
        setProduct(data.data);
        setReviewComment("");
        setReviewImage("");
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
        <Text style={{ fontFamily: 'Outfit' }}>Product not found</Text>
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
      {/* TOP BAR */}
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingTop: 10, paddingBottom: 15 }}>
        <TouchableOpacity
          onPress={() => router.canGoBack() ? router.back() : router.replace("/")}
          style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: '#F3F4F6', justifyContent: 'center', alignItems: 'center' }}
        >
          <Ionicons name="arrow-back" size={20} color="#9CA3AF" />
        </TouchableOpacity>
        <Text style={{ fontFamily: 'Outfit',  fontSize: 16, fontWeight: '700', color: '#111827' }}>Product Details</Text>
        <TouchableOpacity
          onPress={() => toggleWishlist(product)}
          style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: '#F3F4F6', justifyContent: 'center', alignItems: 'center' }}
        >
          <Ionicons name={isLiked ? "heart" : "heart-outline"} size={20} color={isLiked ? "#4A8B81" : "#9CA3AF"} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: 60 }} showsVerticalScrollIndicator={false}>
        {/* IMAGE CAROUSEL (Card style) */}
        <View style={{ marginTop: 10, paddingLeft: 20 }}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingRight: 20 }}
          >
            {product.images?.map((img, index) => (
              <Image
                key={index}
                source={{ uri: img }}
                style={{
                  width: width * 0.75,
                  height: 380,
                  borderRadius: 16,
                  marginRight: 16,
                }}
                resizeMode="cover"
              />
            ))}
          </ScrollView>
        </View>

        <View style={{ paddingHorizontal: 20, marginTop: 24 }}>
          {/* TITLE AND QUANTITY */}
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <Text style={{ fontFamily: 'Outfit',  fontSize: 20, fontWeight: '700', color: COLORS.primary, flex: 1, paddingRight: 10 }}>
              {product.name}
            </Text>
            
            {/* Quantity Selector */}
            <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: '#F9FAFB', borderRadius: 20, paddingHorizontal: 10, paddingVertical: 6, borderWidth: 1, borderColor: '#F3F4F6' }}>
              <TouchableOpacity onPress={() => currentCartItem && updateQuantity(currentCartItem.id, Math.max(1, currentCartItem.quantity - 1), currentCartItem.size)}>
                <Ionicons name="remove" size={14} color="#6B7280" />
              </TouchableOpacity>
              <Text style={{ fontFamily: 'Outfit',  fontSize: 14, fontWeight: '600', marginHorizontal: 10, color: '#111827' }}>
                {currentCartItem ? currentCartItem.quantity : 1}
              </Text>
              <TouchableOpacity onPress={() => {
                if (currentCartItem) {
                  updateQuantity(currentCartItem.id, currentCartItem.quantity + 1, currentCartItem.size);
                }
              }}>
                <Ionicons name="add" size={14} color="#6B7280" />
              </TouchableOpacity>
            </View>
          </View>

          {/* PRICE */}
          <Text style={{ fontFamily: 'Outfit',  fontSize: 24, fontWeight: '700', color: '#111827', marginTop: 12 }}>
            Rs {product.price.toFixed(2)}
          </Text>

          {/* CHOOSE SIZE */}
          <View style={{ marginTop: 24 }}>
            <Text style={{ fontFamily: 'Outfit',  fontSize: 14, fontWeight: '700', color: '#111827', marginBottom: 12 }}>Choose Size</Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
              {product.sizes && product.sizes.length > 0 ? product.sizes.map((size) => {
                const isSelected = selectedSize === size;
                return (
                  <TouchableOpacity
                    key={size}
                    onPress={() => setSelectedSize(size)}
                    style={{
                      width: 44, height: 44, borderRadius: 22,
                      backgroundColor: isSelected ? COLORS.primary : '#F3F4F6',
                      justifyContent: 'center', alignItems: 'center', marginRight: 12, marginBottom: 10
                    }}
                  >
                    <Text style={{ fontFamily: 'Outfit',  fontSize: 13, fontWeight: '600', color: isSelected ? '#FFFFFF' : '#4B5563' }}>
                      {size}
                    </Text>
                  </TouchableOpacity>
                )
              }) : (
                ['S', 'M', 'L', 'XL', 'XXL'].map((size) => (
                  <TouchableOpacity
                    key={size}
                    onPress={() => setSelectedSize(size)}
                    style={{
                      width: 44, height: 44, borderRadius: 22,
                      backgroundColor: selectedSize === size ? COLORS.primary : '#F3F4F6',
                      justifyContent: 'center', alignItems: 'center', marginRight: 12, marginBottom: 10
                    }}
                  >
                    <Text style={{ fontFamily: 'Outfit',  fontSize: 13, fontWeight: '600', color: selectedSize === size ? '#FFFFFF' : '#4B5563' }}>
                      {size}
                    </Text>
                  </TouchableOpacity>
                ))
              )}
            </View>
          </View>
          {/* CHOOSE COLOR */}
          {product.colors && product.colors.length > 0 ? (
            <View style={{ marginTop: 16 }}>
              <Text style={{ fontFamily: 'Outfit',  fontSize: 14, fontWeight: '700', color: '#111827', marginBottom: 12 }}>Choose Color</Text>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
                {product.colors.map((colorOption, idx) => {
                  const isSelected = selectedColor === colorOption;
                  return (
                    <TouchableOpacity
                      key={idx}
                      onPress={() => setSelectedColor(colorOption)}
                      style={{
                        width: 30,
                        height: 30,
                        borderRadius: 15,
                        backgroundColor: colorOption,
                        marginRight: 12,
                        marginBottom: 10,
                        borderWidth: isSelected ? 3 : 1,
                        borderColor: isSelected ? COLORS.primary : '#D1D5DB'
                      }}
                    />
                  )
                })}
              </View>
            </View>
          ) : null}



          {/* ACTION BUTTONS */}
          <View style={{ flexDirection: 'row', marginTop: 30, gap: 12 }}>
            <TouchableOpacity 
              onPress={async () => {
                 if (product.stock <= 0) {
                   Toast.show({ type: "error", text1: "Out of Stock ⚠️", text2: "This product is currently out of stock." });
                   return;
                 }
                 if (product.colors && product.colors.length > 0 && !selectedColor) {
                   Toast.show({ type: "info", text1: "Select Color", text2: "Please select a color first." });
                   return;
                 }
                 if (product.sizes && product.sizes.length > 0 && !selectedSize) {
                   Toast.show({ type: "info", text1: "Select Size", text2: "Please select a size first before adding to cart." });
                   return;
                 }
                 await addToCart(product, selectedSize || "", selectedColor || "");
                 router.push('/checkout');
              }}
              style={{ flex: 1, backgroundColor: COLORS.primary, borderRadius: 24, paddingVertical: 16, justifyContent: 'center', alignItems: 'center', flexDirection: 'row' }}
            >
              <Text style={{ fontFamily: 'Outfit',  color: '#fff', fontSize: 14, fontWeight: '600' }}>Buy Now →</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              onPress={async () => {
                 if (product.stock <= 0) {
                   Toast.show({ type: "error", text1: "Out of Stock ⚠️", text2: "This product is currently out of stock." });
                   return;
                 }
                 if (product.colors && product.colors.length > 0 && !selectedColor) {
                   Toast.show({ type: "info", text1: "Select Color", text2: "Please select a color first." });
                   return;
                 }
                 if (product.sizes && product.sizes.length > 0 && !selectedSize) {
                   Toast.show({ type: "info", text1: "Select Size", text2: "Please select a size first before adding to cart." });
                   return;
                 }
                 await addToCart(product, selectedSize || "", selectedColor || "");
              }}
              style={{ flex: 1, backgroundColor: '#fff', borderRadius: 24, paddingVertical: 16, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: COLORS.primary, flexDirection: 'row' }}
            >
              <Text style={{ fontFamily: 'Outfit',  color: COLORS.primary, fontSize: 14, fontWeight: '600', marginRight: 6 }}>Add to Bag</Text>
              <Ionicons name="bag-outline" size={16} color={COLORS.primary} />
            </TouchableOpacity>
          </View>

          {/* DESCRIPTION */}
          <View style={{ marginTop: 30, marginBottom: 20 }}>
            <Text style={{ fontFamily: 'Outfit',  fontSize: 14, fontWeight: '700', color: '#111827', marginBottom: 8 }}>Description</Text>
            <Text style={{ fontFamily: 'Outfit',  fontSize: 13, color: '#6B7280', lineHeight: 20 }}>
              {product.description}
            </Text>
          </View>

          {/* BUY 1 GET 1 OFFER BANNER */}
          {product.isBogo && (
            <View style={{
              marginTop: 10,
              backgroundColor: "#FFFBEB",
              borderRadius: 12,
              paddingHorizontal: 16,
              paddingVertical: 14,
              flexDirection: "row",
              alignItems: "center",
              borderWidth: 1,
              borderColor: "#FEF3C7",
              marginBottom: 10,
            }}>
              <Text style={{ fontFamily: 'Roboto', fontSize: 24, marginRight: 12 }}>🎁</Text>
              <View style={{ flex: 1 }}>
                <Text style={{ fontFamily: 'Roboto', fontSize: 14, fontWeight: "600", color: "#111827" }}>
                  BUY 1 GET 1 FREE OFFER
                </Text>
                <Text style={{ fontFamily: 'Roboto', fontSize: 11, color: "#4B5563", marginTop: 2 }}>
                  Special Offer: Purchase 1 unit & get 1 free with your order!
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#F59E0B" />
            </View>
          )}

          {/* Delivery Options & Estimates Card */}
          <DeliveryEstimateCard price={product.price} />
          {/* CUSTOMER REVIEWS & RATINGS SECTION */}
          <View style={{ marginTop: 32, paddingTop: 24, borderTopWidth: 1, borderTopColor: "#F3F4F6" }}>
            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <Ionicons name="star" size={20} color="#FBBF24" />
                <Text style={{ fontFamily: 'Roboto', fontSize: 18, fontWeight: "600", color: "#111827", marginLeft: 8 }}>
                  Customer Reviews
                </Text>
              </View>
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <Ionicons name="star" size={16} color="#FBBF24" />
                <Text style={{ fontFamily: 'Roboto', fontSize: 15, fontWeight: "600", color: "#111827", marginLeft: 4 }}>
                  {averageRatingStr}
                </Text>
                <Text style={{ fontFamily: 'Roboto', fontSize: 13, color: "#6B7280", marginLeft: 4 }}>
                  ({reviewCount} reviews)
                </Text>
              </View>
            </View>

            {/* WRITE A REVIEW FORM (ONLY FOR VERIFIED PURCHASERS) */}
            {canReview ? (
              <View style={styles.reviewFormCard}>
                <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 6 }}>
                  <View style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: "#DBEAFE", justifyContent: "center", alignItems: "center", marginRight: 10 }}>
                    <Ionicons name="chatbubble-outline" size={20} color="#1E3A8A" />
                  </View>
                  <View>
                    <Text style={styles.reviewFormTitle}>Write a Review</Text>
                    <Text style={styles.reviewFormSubtitle}>Share your real experience with this product</Text>
                  </View>
                </View>
                
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
                  <View style={{ backgroundColor: "#DBEAFE", paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12, marginLeft: 12 }}>
                    <Text style={{ fontFamily: 'Roboto', fontSize: 12, fontWeight: '700', color: '#1E3A8A' }}>{rating} / 5 Stars</Text>
                  </View>
                </View>

                {/* Review Message Input */}
                <View style={styles.reviewInput}>
                  <Ionicons name="pencil" size={16} color="#94A3B8" style={{ marginTop: 4, marginRight: 8 }} />
                  <TextInput
                    style={{ flex: 1, fontFamily: 'Roboto', fontSize: 13, color: '#111827', textAlignVertical: 'top' }}
                    placeholder="Write your review here (e.g. quality, fit, comfort)..."
                    placeholderTextColor="#9CA3AF"
                    multiline
                    numberOfLines={3}
                    value={reviewComment}
                    onChangeText={setReviewComment}
                  />
                </View>

                {/* Photo Upload Section */}
                <View style={{ marginBottom: 14 }}>
                  {reviewImage ? (
                    <View style={styles.imagePreviewWrapper}>
                      <View style={{ position: "relative" }}>
                        <Image source={{ uri: reviewImage }} style={styles.reviewImageThumbnail} resizeMode="cover" />
                        <TouchableOpacity
                          onPress={() => setReviewImage("")}
                          style={styles.removeImageBtn}
                          activeOpacity={0.8}
                        >
                          <Ionicons name="close" size={12} color="#FFFFFF" />
                        </TouchableOpacity>
                      </View>
                      <Text style={{ fontFamily: 'Roboto',  fontSize: 12, color: "#0284C7", marginLeft: 10, fontWeight: "600" }}>
                        Product Photo Attached ✓
                      </Text>
                    </View>
                  ) : (
                    <TouchableOpacity
                      onPress={pickReviewImage}
                      activeOpacity={0.75}
                      style={styles.uploadPhotoBtn}
                    >
                      <Ionicons name="camera-outline" size={18} color="#4B5563" style={{ marginRight: 6 }} />
                      <Text style={styles.uploadPhotoBtnText}>Add Product Photo (Optional)</Text>
                    </TouchableOpacity>
                  )}
                </View>

                <TouchableOpacity style={styles.submitReviewBtn} onPress={handleSubmitReview} activeOpacity={0.8} disabled={submittingReview}>
                  {submittingReview ? (
                    <ActivityIndicator size="small" color="#FFFFFF" />
                  ) : (
                    <>
                      <Ionicons name="paper-plane" size={16} color="#FFFFFF" style={{ marginRight: 8 }} />
                      <Text style={styles.submitReviewBtnText}>Submit Review</Text>
                    </>
                  )}
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.verifiedNoticeCard}>
                <Ionicons name="shield-checkmark-outline" size={24} color="#0284C7" style={{ marginBottom: 6 }} />
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
                              <Ionicons name="checkmark-circle" size={12} color="#0284C7" />
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

                    {/* Review Customer Photo */}
                    {rev.image ? (
                      <TouchableOpacity
                        onPress={() => setPreviewModalImage(rev.image!)}
                        activeOpacity={0.88}
                        style={styles.reviewImageDisplayCard}
                      >
                        <Image source={{ uri: rev.image }} style={styles.reviewCustomerPhoto} resizeMode="cover" />
                        <View style={styles.photoTagBadge}>
                          <Ionicons name="camera-outline" size={11} color="#FFFFFF" />
                          <Text style={styles.photoTagText}>Customer Photo</Text>
                        </View>
                      </TouchableOpacity>
                    ) : null}

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

      {/* Fullscreen Photo View Modal */}
      <Modal visible={!!previewModalImage} transparent animationType="fade">
        <Pressable style={styles.modalOverlay} onPress={() => setPreviewModalImage(null)}>
          <View style={styles.modalCard}>
            <TouchableOpacity
              onPress={() => setPreviewModalImage(null)}
              style={styles.closeModalBtn}
            >
              <Ionicons name="close" size={22} color="#FFFFFF" />
            </TouchableOpacity>
            {previewModalImage && (
              <Image source={{ uri: previewModalImage }} style={styles.fullScreenImage} resizeMode="contain" />
            )}
          </View>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  reviewFormCard: {
    backgroundColor: "#F4FAFF",
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "#BDE0FE",
    marginBottom: 20,
  },
  reviewFormTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#000000",
    fontFamily: "Roboto",
  },
  reviewFormSubtitle: {
    fontSize: 12,
    color: "#475569",
    fontFamily: "Roboto",
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
    color: "#334155",
    fontFamily: "Roboto",
  },
  reviewInput: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#BDE0FE",
    flexDirection: "row",
    alignItems: "flex-start",
    padding: 10,
    borderRadius: 10,
    fontSize: 14,
    color: "#111827",
    textAlignVertical: "top",
    marginBottom: 12,
  },
  uploadPhotoBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderStyle: "dashed",
    borderColor: "#7DD3FC",
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  uploadPhotoBtnText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#334155", fontFamily: "Roboto",
  },
  imagePreviewWrapper: {
    flexDirection: "row",
    alignItems: "center",
  },
  reviewImageThumbnail: {
    width: 60,
    height: 60,
    borderRadius: 8,
  },
  removeImageBtn: {
    position: "absolute",
    top: -6,
    right: -6,
    backgroundColor: "#EF4444",
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: "#FFFFFF",
  },
  submitReviewBtn: {
    backgroundColor: "#2563EB",
    borderRadius: 10,
    paddingVertical: 12,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  submitReviewBtnText: {
    color: "#FFFFFF",
    fontWeight: "600",
    fontSize: 14,
    fontFamily: "Roboto",
  },
  verifiedNoticeCard: {
    backgroundColor: "#F0F9FF",
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: "#BAE6FD",
    marginBottom: 16,
    alignItems: "center",
  },
  verifiedNoticeTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#0369A1", fontFamily: "Roboto",
    marginBottom: 4,
  },
  verifiedNoticeText: {
    fontSize: 12,
    color: "#0284C7", fontFamily: "Roboto",
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
    color: "#475569", fontFamily: "Roboto",
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
    color: "#0F172A", fontFamily: "Roboto",
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
    color: "#334155", fontFamily: "Roboto",
    lineHeight: 20,
    marginTop: 4,
  },
  reviewImageDisplayCard: {
    marginTop: 10,
    position: "relative",
    alignSelf: "flex-start",
    borderRadius: 10,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#BAE6FD",
  },
  reviewCustomerPhoto: {
    width: 130,
    height: 130,
    borderRadius: 8,
  },
  photoTagBadge: {
    position: "absolute",
    bottom: 6,
    left: 6,
    backgroundColor: "rgba(2, 132, 199, 0.85)",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    flexDirection: "row",
    alignItems: "center",
  },
  photoTagText: {
    color: "#FFFFFF",
    fontSize: 10,
    fontWeight: "600",
    marginLeft: 3,
  },
  reviewDateText: {
    fontSize: 11,
    color: "#9CA3AF",
    marginTop: 6,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.85)",
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
  },
  modalCard: {
    width: "100%",
    maxHeight: "80%",
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
  },
  closeModalBtn: {
    position: "absolute",
    top: -40,
    right: 10,
    backgroundColor: "rgba(255,255,255,0.2)",
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  fullScreenImage: {
    width: "100%",
    height: 400,
    borderRadius: 12,
  },
});

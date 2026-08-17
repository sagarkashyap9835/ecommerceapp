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


import { SafeAreaView } from "react-native-safe-area-context";
import { COLORS } from "@/assets/constants";
import { Ionicons } from "@expo/vector-icons";
import Toast from "react-native-toast-message";
import api from "../../../constants/api";
import { useAuth } from "@/context/AuthContext";
import DeliveryEstimateCard from "../../../components/DeliveryEstimateCard";
import { applyFirstOrderDiscount } from "../../utils/discountLogic";

const { width } = Dimensions.get("window");

export default function ProductDetails() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { getToken, isSignedIn, firstOrderOffer } = useAuth();

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);

  const { addToCart, cartItems, itemCount, updateQuantity } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();

  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  const [previewModalImage, setPreviewModalImage] = useState<string | null>(null);

  const fetchProduct = async () => {
    try {
      const { data } = await api.get(`/products/${id}`);
      let p = data.data;
      if (firstOrderOffer) {
        p = applyFirstOrderDiscount(p, firstOrderOffer);
      }
      setProduct(p);
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

  useEffect(() => {
    fetchProduct();
  }, [id, isSignedIn]);



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

  const ratingDistribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  reviewsList.forEach((review: any) => {
    if (review.rating && review.rating >= 1 && review.rating <= 5) {
      ratingDistribution[review.rating as keyof typeof ratingDistribution]++;
    }
  });
  const totalRatingsForDist = Math.max(reviewCount, 1);

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
        <Text style={{ fontFamily: 'Outfit', fontSize: 16, fontWeight: '700', color: '#111827' }}>Product Details</Text>
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
            <Text style={{ fontFamily: 'Outfit', fontSize: 20, fontWeight: '700', color: COLORS.primary, flex: 1, paddingRight: 10 }}>
              {product.name}
            </Text>

            {/* Quantity Selector */}
            <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: '#F9FAFB', borderRadius: 20, paddingHorizontal: 10, paddingVertical: 6, borderWidth: 1, borderColor: '#F3F4F6' }}>
              <TouchableOpacity onPress={() => currentCartItem && updateQuantity(currentCartItem.id, Math.max(1, currentCartItem.quantity - 1), currentCartItem.size)}>
                <Ionicons name="remove" size={14} color="#6B7280" />
              </TouchableOpacity>
              <Text style={{ fontFamily: 'Outfit', fontSize: 14, fontWeight: '600', marginHorizontal: 10, color: '#111827' }}>
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
          <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 12 }}>
            {product.sale?.isOnSale && product.sale.originalPrice > product.price && (
              <Text style={{ fontFamily: 'Outfit', fontSize: 16, fontWeight: '500', color: '#9CA3AF', textDecorationLine: 'line-through', marginRight: 8 }}>
                Rs {product.sale.originalPrice.toFixed(2)}
              </Text>
            )}
            <Text style={{ fontFamily: 'Outfit', fontSize: 24, fontWeight: '700', color: '#111827' }}>
              Rs {(product.sale?.isOnSale ? product.sale.salePrice : product.price).toFixed(2)}
            </Text>
            {product.sale?.discountType === "FIRST_ORDER" && (
              <View style={{ backgroundColor: '#DBEAFE', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6, marginLeft: 12 }}>
                <Text style={{ color: '#1D4ED8', fontSize: 10, fontWeight: 'bold' }}>🎉 FIRST ORDER</Text>
              </View>
            )}
          </View>

          {/* CHOOSE SIZE */}
          <View style={{ marginTop: 24 }}>
            <Text style={{ fontFamily: 'Outfit', fontSize: 14, fontWeight: '700', color: '#111827', marginBottom: 12 }}>Choose Size</Text>
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
                    <Text style={{ fontFamily: 'Outfit', fontSize: 13, fontWeight: '600', color: isSelected ? '#FFFFFF' : '#4B5563' }}>
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
                    <Text style={{ fontFamily: 'Outfit', fontSize: 13, fontWeight: '600', color: selectedSize === size ? '#FFFFFF' : '#4B5563' }}>
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
              <Text style={{ fontFamily: 'Outfit', fontSize: 14, fontWeight: '700', color: '#111827', marginBottom: 12 }}>Choose Color</Text>
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
              <Text style={{ fontFamily: 'Outfit', color: '#fff', fontSize: 14, fontWeight: '600' }}>Buy Now →</Text>
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
              <Text style={{ fontFamily: 'Outfit', color: COLORS.primary, fontSize: 14, fontWeight: '600', marginRight: 6 }}>Add to Bag</Text>
              <Ionicons name="bag-outline" size={16} color={COLORS.primary} />
            </TouchableOpacity>
          </View>

          {/* DESCRIPTION */}
          <View style={{ marginTop: 30, marginBottom: 20 }}>
            <Text style={{ fontFamily: 'Outfit', fontSize: 14, fontWeight: '700', color: '#111827', marginBottom: 8 }}>Description</Text>
            <Text style={{ fontFamily: 'Outfit', fontSize: 13, color: '#6B7280', lineHeight: 20 }}>
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

            {/* RATING DISTRIBUTION OVERVIEW */}
            <View style={{ flexDirection: "row", marginBottom: 28, marginTop: 8 }}>
              {/* Left Side: Average */}
              <View style={{ flex: 0.45, justifyContent: "center", alignItems: "center", borderRightWidth: 1, borderRightColor: "#E5E7EB", paddingRight: 10 }}>
                <View style={{ flexDirection: "row", marginBottom: 12 }}>
                  {[1, 2, 3, 4, 5].map((star) => {
                    const ratingValue = parseFloat(averageRatingStr);
                    let iconName: any = "star-outline";
                    if (ratingValue >= star) iconName = "star";
                    else if (ratingValue >= star - 0.5) iconName = "star-half";

                    return (
                      <Ionicons key={star} name={iconName} size={28} color="#388E3C" style={{ marginHorizontal: 1 }} />
                    );
                  })}
                </View>
                <Text style={{ fontFamily: 'Roboto', fontSize: 13, color: "#6B7280", textAlign: "center", paddingHorizontal: 4 }}>
                  {reviewCount} ratings and {reviewsList.length} reviews
                </Text>
              </View>

              {/* Right Side: Distribution Bars */}
              <View style={{ flex: 0.55, paddingLeft: 16, justifyContent: "center" }}>
                {[5, 4, 3, 2, 1].map((star) => {
                  const count = ratingDistribution[star as keyof typeof ratingDistribution];
                  const percentage = (count / totalRatingsForDist) * 100;
                  return (
                    <View key={star} style={{ flexDirection: "row", alignItems: "center", marginBottom: 8 }}>
                      <Text style={{ fontFamily: 'Roboto', fontSize: 13, fontWeight: "600", color: "#111827", width: 12 }}>{star}</Text>
                      <Ionicons name="star" size={12} color="#111827" style={{ marginRight: 8, marginLeft: 2 }} />
                      <View style={{ flex: 1, height: 10, backgroundColor: "#E5E7EB", borderRadius: 5, overflow: "hidden", marginRight: 8 }}>
                        <View style={{ width: `${percentage}%`, height: "100%", backgroundColor: "#388E3C", borderRadius: 5 }} />
                      </View>
                      <Text style={{ fontFamily: 'Roboto', fontSize: 12, color: "#6B7280", width: 35, textAlign: "right" }}>{count}</Text>
                    </View>
                  );
                })}
              </View>
            </View>



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

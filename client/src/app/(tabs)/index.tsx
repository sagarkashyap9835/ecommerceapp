import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  Image,
  Dimensions,
  TouchableOpacity,
  ActivityIndicator,
  TextInput,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useCart } from "../../../context/CartContext";
import Animated, { useSharedValue, useAnimatedStyle, withTiming, Easing, withRepeat } from "react-native-reanimated";
import { LinearGradient } from "expo-linear-gradient";
import { SafeAreaView } from "react-native-safe-area-context";
import Header from "../../../components/Header";
import { BANNERS } from "@/assets/assets";
import { CATEGORIES, COLORS } from "@/assets/constants";
import CategoryItem from "../../../components/CategoryItem";
import { router } from "expo-router";
import { Product } from "@/assets/constants/types";
import ProductCard from "../../../components/ProductCard";
import InfinityLoader from "../../../components/InfinityLoader";
import AnimatedButton from "../../../components/AnimatedButton";
import LiveCountdown from "../../../components/LiveCountdown";
import api from "../../../constants/api";
import { useAuth, useUser } from "@/context/AuthContext";
const { width } = Dimensions.get("window");
const bannerCardWidth = width - 32;
const bannerStep = bannerCardWidth + 12;

export default function Home() {
  const { itemCount } = useCart();
  const [searchQuery, setSearchQuery] = useState("");
  const [scrollY, setScrollY] = useState(0);
  const bannerRef = React.useRef<ScrollView>(null);
  const [activeBanner, setActiveBanner] = useState(0);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [bogoSectionLoading, setBogoSectionLoading] = useState(true);
  const [popularSectionLoading, setPopularSectionLoading] = useState(false);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [categories, setCategories] = useState<any[]>([{ id: 'all', name: 'All', icon: 'grid' }, ...CATEGORIES]);
  const [activeSale, setActiveSale] = useState<any>(null);
  const [firstOrderOffer, setFirstOrderOffer] = useState<any>(null);
  const { getToken } = useAuth();
  const { user } = useUser();

  const shopNowTranslateX = useSharedValue(150);

  useEffect(() => {
    // Slide in after 2 seconds
    const slideInTimeout = setTimeout(() => {
      shopNowTranslateX.value = withTiming(0, { duration: 600, easing: Easing.out(Easing.exp) });

      // Slide back out after 5 seconds
      const slideOutTimeout = setTimeout(() => {
        shopNowTranslateX.value = withTiming(150, { duration: 600, easing: Easing.in(Easing.exp) });
      }, 5000);

      return () => clearTimeout(slideOutTimeout);
    }, 2000);

    return () => clearTimeout(slideInTimeout);
  }, []);

  const shopNowStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: shopNowTranslateX.value }],
    };
  });

  const shimmerTranslateX = useSharedValue(-100);

  useEffect(() => {
    shimmerTranslateX.value = withRepeat(
      withTiming(300, { duration: 2500, easing: Easing.linear }),
      -1,
      false
    );
  }, []);

  const shimmerStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: shimmerTranslateX.value }],
    };
  });

  const fetchData = async () => {
    try {
      const [prodRes, catRes, saleRes] = await Promise.all([
        api.get("products?limit=50"),
        api.get("categories").catch(() => null),
        api.get("sale/active").catch(() => null)
      ]);

      if (prodRes.data?.success) {
        setProducts(prodRes.data.data);
      }

      if (catRes?.data?.success && catRes.data.data.length > 0) {
        const dynamicCats = catRes.data.data.map((c: any) => ({
          id: c._id || c.name,
          name: c.name,
          icon: c.icon || "grid-outline",
        }));
        setCategories([{ id: 'all', name: 'All', icon: 'grid' }, ...dynamicCats]);
      }

      if (saleRes?.data?.success && saleRes.data.data) {
        setActiveSale(saleRes.data.data);
      }

      if (user) {
        try {
          const token = await getToken();
          const firstOfferRes = await api.get("first-order/eligibility", { headers: { Authorization: `Bearer ${token}` } });
          const offer = firstOfferRes.data;
          if (offer?.success && offer?.eligible && offer?.isEnabled) {
            setFirstOrderOffer(offer);

            // Now visually recalculate prices for products
            if (prodRes.data?.success) {
              const recalculatedProducts = prodRes.data.data.map((p: any) => {
                let maxDiscount = p.sale?.isOnSale ? p.sale.discountAmount : 0;
                let bestDiscountType = p.sale?.isOnSale ? "FESTIVAL_SALE" : null;
                let applyFirstOrder = false;
                let foDiscount = 0;

                const activeRule = offer.settings?.priceRules?.find((r: any) => p.price >= r.minPrice && p.price <= r.maxPrice);

                if (activeRule && activeRule.discountAmount > maxDiscount) {
                  applyFirstOrder = true;
                  foDiscount = activeRule.discountAmount;
                }

                if (applyFirstOrder) {
                  const sp = p.price - foDiscount;
                  return {
                    ...p,
                    sale: {
                      isOnSale: true,
                      saleName: offer.settings?.title || "Welcome Offer",
                      discountAmount: foDiscount,
                      salePrice: sp < 0 ? 0 : sp,
                      discountType: "FIRST_ORDER"
                    }
                  };
                }

                if (p.sale?.isOnSale) {
                  p.sale.discountType = "FESTIVAL_SALE";
                }

                return p;
              });
              setProducts(recalculatedProducts);
            }
          }
        } catch (e) { }
      }

    } catch (error) {
      console.error("Error fetching data", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (scrollY > 100 && bogoSectionLoading) {
      const timer = setTimeout(() => setBogoSectionLoading(false), 1000);
      return () => clearTimeout(timer);
    }
  }, [scrollY, bogoSectionLoading]);

  useEffect(() => {
    if (scrollY > 500 && popularSectionLoading) {
      const timer = setTimeout(() => setPopularSectionLoading(false), 1000);
      return () => clearTimeout(timer);
    }
  }, [scrollY, popularSectionLoading]);

  // Auto-scroll logic for banners
  useEffect(() => {
    if (BANNERS.length === 0) return;
    const interval = setInterval(() => {
      setActiveBanner((prev) => {
        const nextIndex = (prev + 1) % BANNERS.length;
        bannerRef.current?.scrollTo({
          x: nextIndex * bannerStep,
          animated: true,
        });
        return nextIndex;
      });
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const handleScroll = (event: any) => {
    const contentOffsetX = event.nativeEvent.contentOffset.x;
    const index = Math.round(contentOffsetX / bannerStep);
    if (index >= 0 && index < BANNERS.length && index !== activeBanner) {
      setActiveBanner(index);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#FFFFFF" }}>
      <SafeAreaView edges={["top"]} style={{ backgroundColor: "#FFFFFF" }} />

      <View style={{ flex: 1, backgroundColor: "#FFFFFF" }}>
        {/* Custom Header (White) */}
        <View
          style={{
            backgroundColor: "#FFFFFF",
            paddingHorizontal: 20,
            paddingBottom: 24,
            paddingTop: 10,
            borderBottomWidth: 1,
            borderBottomColor: "#F3F4F6",
            zIndex: 10,
          }}
        >
          {/* Top Row: Logo & Cart */}
          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
            <Image
              source={require("@/assets/logo.png")}
              style={{
                width: 120,
                height: 40,
                marginLeft: -8
              }}
              resizeMode="contain"
            />

            <TouchableOpacity
              onPress={() => router.push("/cart")}
              style={{
                width: 44,
                height: 44,
                borderRadius: 22,
                backgroundColor: "#F3F4F6",
                justifyContent: "center",
                alignItems: "center",
                position: "relative",
              }}
              activeOpacity={0.8}
            >
              <Ionicons name="bag-handle-outline" size={22} color="#111827" />
              {itemCount > 0 && (
                <View style={{
                  position: "absolute",
                  top: -2,
                  right: -2,
                  backgroundColor: "#EF4444",
                  borderRadius: 10,
                  minWidth: 20,
                  height: 20,
                  justifyContent: "center",
                  alignItems: "center",
                  borderWidth: 2,
                  borderColor: "#FFFFFF",
                }}>
                  <Text style={{ color: "#FFFFFF", fontSize: 10, fontWeight: "bold", fontFamily: "Outfit_700" }}>
                    {itemCount > 99 ? "99+" : itemCount}
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          </View>

          {/* Bottom Row: Search & Filter */}
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <View style={{
              flex: 1,
              flexDirection: "row",
              alignItems: "center",
              backgroundColor: "#F3F4F6",
              borderRadius: 25,
              paddingHorizontal: 16,
              height: 50,
              marginRight: 12,
            }}>
              <Ionicons name="search-outline" size={20} color="#6B7280" />
              <TextInput
                placeholder="Search Product"
                placeholderTextColor="#9CA3AF"
                style={{
                  flex: 1,
                  marginLeft: 10,
                  fontSize: 15,
                  color: "#111827",
                  fontFamily: "Outfit",
                  outlineStyle: "none"
                } as any}
                value={searchQuery}
                onChangeText={setSearchQuery}
                onFocus={() => setIsSearchFocused(true)}
                onBlur={() => {
                  setTimeout(() => setIsSearchFocused(false), 200);
                }}
              />
            </View>
            <TouchableOpacity
              onPress={() => router.push("/shop")}
              style={{
                width: 50,
                height: 50,
                borderRadius: 25,
                backgroundColor: "#F3F4F6",
                justifyContent: "center",
                alignItems: "center",
              }} activeOpacity={0.8}>
              <Ionicons name="options-outline" size={22} color="#111827" />
            </TouchableOpacity>

            {/* Search Suggestions Dropdown */}
            {isSearchFocused && (
              <View style={{
                position: "absolute",
                top: 55,
                left: 0,
                right: 60,
                backgroundColor: "#FFFFFF",
                borderRadius: 12,
                shadowColor: "#000",
                shadowOpacity: 0.1,
                shadowRadius: 10,
                elevation: 5,
                zIndex: 100,
                borderWidth: 1,
                borderColor: "#F3F4F6",
              }}>
                {products
                  .filter((p) => searchQuery.trim() === "" ? true : p.name.toLowerCase().includes(searchQuery.toLowerCase()))
                  .slice(0, 5)
                  .map((p, index) => (
                    <TouchableOpacity
                      key={p._id}
                      style={{
                        padding: 14,
                        borderBottomWidth: index === 4 ? 0 : 1,
                        borderBottomColor: "#F3F4F6",
                      }}
                      onPress={() => {
                        setSearchQuery(p.name);
                        setIsSearchFocused(false);
                        router.push({ pathname: "/shop", params: { search: p.name } });
                      }}
                    >
                      <Text style={{ fontFamily: "Outfit", fontSize: 14, color: "#4B5563" }}>
                        {p.name}
                      </Text>
                    </TouchableOpacity>
                  ))}
              </View>
            )}
          </View>
        </View>

        <ScrollView
          className="flex-1"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 16, paddingBottom: 40 }}
          onScroll={(e) => setScrollY(e.nativeEvent.contentOffset.y)}
          scrollEventThrottle={16}
        >
          {/* Banner Slider */}
          <ScrollView
            ref={bannerRef}
            horizontal
            showsHorizontalScrollIndicator={false}
            scrollEventThrottle={16}
            decelerationRate="fast"
            snapToInterval={bannerStep}
            contentContainerStyle={{
              paddingTop: 8,
              paddingBottom: 12,
            }}
            onScroll={handleScroll}
            onMomentumScrollEnd={handleScroll}
          >
            {BANNERS.map((banner: any) => {
              const handleBannerPress = () => {
                const queryParams: any = {};
                if (banner.id === 1) {
                  queryParams.isBogo = "true";
                } else if (banner.id === 2 || banner.id === 3) {
                  queryParams.sortBy = "popular";
                }

                router.push({
                  pathname: "/shop",
                  params: queryParams,
                });
              };

              return (
                <TouchableOpacity
                  key={banner.id}
                  activeOpacity={0.9}
                  onPress={handleBannerPress}
                  style={{
                    width: width - 32,
                    height: 180,
                    marginRight: 12,
                    marginTop: 5,
                    position: "relative",
                    justifyContent: "flex-end",
                  }}
                >
                  <LinearGradient
                    colors={["#FDF2F8", "#FBCFE8"]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={{
                      position: "absolute",
                      bottom: 0, left: 0, right: 0,
                      height: 160,
                      borderRadius: 16,
                    }}
                  />

                  <View style={{ flex: 1, flexDirection: "row", height: "100%" }}>
                    {/* Banner Image (Left Side) */}
                    <View style={{ width: "45%", height: "100%", position: "relative" }}>
                      <Image
                        source={typeof banner.image === 'string' ? { uri: banner.image } : banner.image}
                        style={{
                          width: "140%",
                          height: "112%",
                          position: "absolute",
                          bottom: 0,
                          left: -10,
                        }}
                        resizeMode="contain"
                      />
                    </View>

                    {/* Banner Content (Right Side) */}
                    <View
                      style={{
                        width: "55%",
                        padding: 16,
                        justifyContent: "center",
                      }}
                    >
                      <Text
                        style={{
                          color: "#1F2937",
                          fontSize: 18,
                          fontWeight: "800",
                          marginBottom: 4,
                          fontFamily: "Outfit_800",
                        }}
                        numberOfLines={2}
                      >
                        {banner.title}
                      </Text>

                      <Text
                        style={{
                          color: "#4B5563",
                          fontSize: 12,
                          marginBottom: 16,
                          lineHeight: 16,
                          fontFamily: "Outfit",
                        }}
                        numberOfLines={2}
                      >
                        {banner.subtitle}
                      </Text>

                      <View
                        style={{
                          backgroundColor: "#FF3399",
                          paddingVertical: 8,
                          paddingHorizontal: 16,
                          borderRadius: 20,
                          alignSelf: "flex-start",
                          flexDirection: "row",
                          alignItems: "center",
                          overflow: "hidden",
                        }}
                      >
                        {/* Shimmer Effect */}
                        <Animated.View
                          style={[
                            {
                              position: "absolute",
                              top: 0,
                              bottom: 0,
                              width: 30,
                              backgroundColor: "rgba(255, 255, 255, 0.4)",
                              transform: [{ skewX: "-20deg" }],
                            },
                            shimmerStyle,
                          ]}
                        />
                        <Text
                          style={{
                            color: "#fff",
                            fontSize: 12,
                            fontWeight: "700",
                            marginRight: 4,
                            fontFamily: "Outfit_700",
                          }}
                        >
                          {banner.btnText || "Shop Now"}
                        </Text>
                        <Ionicons name="arrow-forward" size={14} color="#FFFFFF" />
                      </View>
                    </View>
                  </View>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          {/* Slider Indicator */}
          <View
            style={{
              flexDirection: "row",
              justifyContent: "center",
              alignItems: "center",
              marginTop: 4,
              marginBottom: 16,
            }}
          >
            {BANNERS.map((_, index) => (
              <TouchableOpacity
                key={index}
                activeOpacity={0.7}
                onPress={() => {
                  bannerRef.current?.scrollTo({
                    x: index * bannerStep,
                    animated: true,
                  });
                  setActiveBanner(index);
                }}
                style={{
                  width: activeBanner === index ? 24 : 8,
                  height: 8,
                  borderRadius: 4,
                  marginHorizontal: 4,
                  backgroundColor:
                    activeBanner === index
                      ? (COLORS.primary || "#111827")
                      : "#D1D5DB",
                }}
              />
            ))}
          </View>

          {/* Categories Section */}
          <View style={{ marginTop: 4, marginBottom: 24 }}>
            {/* Heading */}
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 12,
              }}
            >
              <Text
                style={{
                  fontSize: 20,
                  fontWeight: "800",
                  color: "#111827",
                  letterSpacing: -0.3,
                }}
              >
                Categories
              </Text>
            </View>

            {/* Categories List */}
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{
                paddingRight: 16,
              }}
            >
              {categories.map((cat: any) => (
                <CategoryItem
                  key={cat.id}
                  item={cat}
                  isSelected={false}
                  onPress={() =>
                    router.push({
                      pathname: "/shop",
                      params: {
                        category: cat.id === "all" ? "" : cat.name,
                      },
                    })
                  }
                />
              ))}
            </ScrollView>
          </View>

          {/* FESTIVAL SALE SECTION */}
          {(() => {
            if (loading || !activeSale) return null;
            const saleProducts = products.filter((p) => p.sale?.isOnSale);
            if (saleProducts.length === 0) return null;

            return (
              <View style={{ marginBottom: 12 }}>
                <LinearGradient
                  colors={["#FFFBEB", "#FEF3C7"]}
                  style={{ padding: 20, borderRadius: 16, marginBottom: 16, borderColor: '#FDE68A', borderWidth: 1 }}
                >
                  <Text style={{ fontSize: 24, fontWeight: "800", color: "#D97706", fontFamily: "Outfit_800", textAlign: 'center' }}>
                    🎉 {activeSale.name}
                  </Text>
                  {activeSale.subtitle && (
                    <Text style={{ fontSize: 14, color: "#92400E", textAlign: 'center', marginTop: 4 }}>
                      {activeSale.subtitle}
                    </Text>
                  )}
                  <LiveCountdown
                    endTime={activeSale.endAt}
                    style={{ backgroundColor: '#FEF08A', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, alignSelf: 'center', marginTop: 10 }}
                    textStyle={{ color: '#B45309', fontWeight: 'bold' }}
                  />
                </LinearGradient>
              </View>
            );
          })()}

          {/* FIRST ORDER OFFER SECTION */}
          {(() => {
            if (loading || !firstOrderOffer?.eligible || !firstOrderOffer?.isEnabled) return null;

            return (
              <View style={{ marginBottom: 12 }}>
                <LinearGradient
                  colors={["#EFF6FF", "#DBEAFE"]}
                  style={{ padding: 20, borderRadius: 16, marginBottom: 16, borderColor: '#BFDBFE', borderWidth: 1 }}
                >
                  <Text style={{ fontSize: 24, fontWeight: "800", color: "#1D4ED8", fontFamily: "Outfit_800", textAlign: 'center' }}>
                    🎉 {firstOrderOffer?.settings?.title || "Welcome Offer"}
                  </Text>
                  <Text style={{ fontSize: 14, color: "#1E3A8A", textAlign: 'center', marginTop: 4 }}>
                    {firstOrderOffer?.settings?.subtitle || "Get a special discount on your first order"}
                  </Text>

                  <TouchableOpacity onPress={() => router.push("/shop")} style={{ backgroundColor: '#1D4ED8', paddingHorizontal: 20, paddingVertical: 10, borderRadius: 20, alignSelf: 'center', marginTop: 14 }}>
                    <Text style={{ color: '#FFFFFF', fontWeight: 'bold' }}>Shop Now</Text>
                  </TouchableOpacity>
                </LinearGradient>
              </View>
            );
          })()}

          {/* Latest Products Section */}
          {(() => {
            if (loading) return null;
            const latestProducts = products.filter((p) => p.isLatest);
            if (latestProducts.length === 0) return null;

            return (
              <View style={{ marginBottom: 28 }}>
                <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
                  <View>
                    <Text style={{ fontSize: 22, fontWeight: "800", color: "#111827", fontFamily: "Outfit_800", letterSpacing: -0.5 }}>
                      Latest Products
                    </Text>
                    <Text style={{ fontSize: 13, color: "#4B5563", fontWeight: "600", fontFamily: "Outfit_600", marginTop: 2 }}>
                      Newest Arrivals
                    </Text>
                  </View>
                  <TouchableOpacity onPress={() => router.push({ pathname: "/collection", params: { type: "latest" } })}>
                    <View style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: '#F3F4F6', justifyContent: 'center', alignItems: 'center' }}>
                      <Ionicons name="arrow-forward" size={20} color="#111827" />
                    </View>
                  </TouchableOpacity>
                </View>
                <View style={{ flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between", minHeight: 480 }}>
                  {latestProducts.slice(0, 10).map((product, index) => (
                    <View key={product._id} style={{ marginTop: index % 2 !== 0 ? 24 : 0 }}>
                      <ProductCard product={product} index={index} disableAnimation={true} />
                    </View>
                  ))}
                </View>
              </View>
            );
          })()}

          {/* Special Offers & Sales (Buy 1 Get 1 Free Section) */}
          {(() => {
            if (loading) return <InfinityLoader />;

            const offerProducts = products.filter((p) => p.isBogo);
            if (offerProducts.length === 0) return null;

            return (
              <View style={{ marginBottom: 28 }}>
                {/* Section Header */}
                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: 14,
                  }}
                >
                  <View style={{ flexDirection: "row", alignItems: "center" }}>
                    <View>
                      <Text style={{ fontSize: 22, fontWeight: "800", color: "#111827", fontFamily: "Outfit_800", letterSpacing: -0.5 }}>
                        Buy 1 Get 1 Free
                      </Text>
                      <Text style={{ fontSize: 13, color: "#4B5563", fontWeight: "600", fontFamily: "Outfit_600", marginTop: 2 }}>
                        Exclusive Offers & Sales
                      </Text>
                    </View>
                  </View>

                  <TouchableOpacity onPress={() => router.push({ pathname: "/collection", params: { type: "bogo" } })}>
                    <View style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: '#F3F4F6', justifyContent: 'center', alignItems: 'center' }}>
                      <Ionicons name="arrow-forward" size={20} color="#111827" />
                    </View>
                  </TouchableOpacity>
                </View>

                {/* Grid List for Offer Products */}
                <View
                  style={{
                    flexDirection: "row",
                    flexWrap: "wrap",
                    justifyContent: "space-between",
                    minHeight: 480,
                  }}
                >
                  {offerProducts.slice(0, 4).map((product, index) => (
                    <View key={product._id} style={{ marginTop: index % 2 !== 0 ? 24 : 0 }}>
                      <ProductCard product={product} index={index} disableAnimation={true} />
                    </View>
                  ))}
                  {scrollY > 100 ? (
                    offerProducts.slice(4, 10).map((product, index) => {
                      const actualIndex = index + 4;
                      return (
                        <View key={product._id} style={{ marginTop: actualIndex % 2 !== 0 ? 24 : 0 }}>
                          <ProductCard product={product} index={actualIndex} />
                        </View>
                      );
                    })
                  ) : null}
                </View>
              </View>
            );
          })()}
          {/* Popular Products */}
          <View className="mb-8">
            {/* Header */}
            <View className="flex-row items-center justify-between mb-4">
              <Text className="text-2xl font-bold text-black">
                Popular Products
              </Text>

              <TouchableOpacity onPress={() => router.push({ pathname: "/collection", params: { type: "popular" } })}>
                <Ionicons name="arrow-forward" size={24} color="#111827" />
              </TouchableOpacity>
            </View>

            {/* Products */}
            {loading ? (
              <InfinityLoader />
            ) : (
              <View
                style={{
                  flexDirection: "row",
                  flexWrap: "wrap",
                  justifyContent: "space-between",
                  minHeight: 480,
                }}
              >
                {scrollY > 500 ? (
                  products.filter((p: any) => p.isFeatured).slice(0, 10).map((product: any, index: number) => (
                    <View
                      key={product._id}
                      style={{
                        marginTop: index % 2 !== 0 ? 24 : 0,
                      }}
                    >
                      <ProductCard product={product} index={index} />
                    </View>
                  ))
                ) : null}
              </View>
            )}
          </View>
          <LinearGradient
            colors={["#0284C7", "#0369A1"]} // GramoKart Blue gradient
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{
              borderRadius: 24,
              padding: 28,
              marginVertical: 20,
              alignItems: "center",
              shadowColor: "#0284C7",
              shadowOpacity: 0.3,
              shadowRadius: 10,
              shadowOffset: { width: 0, height: 4 },
              elevation: 8,
            }}
          >
            <Text
              style={{
                color: "#ffffff",
                fontSize: 26,
                fontWeight: "800",
                textAlign: "center",
                fontFamily: "Outfit_800",
                letterSpacing: -0.5,
              }}
            >
              Join the GramoKart Family
            </Text>

            <Text
              style={{
                color: "#E0F2FE", // Soft light blue
                fontSize: 15,
                textAlign: "center",
                marginTop: 10,
                lineHeight: 22,
                fontFamily: "Outfit_500",
              }}
            >
              Subscribe to our newsletter and get{" "}
              <Text style={{ color: "#FDE047", fontWeight: "800", fontFamily: "Outfit_800" }}>
                10% OFF
              </Text>{" "}
              on your first purchase.
            </Text>

            <AnimatedButton
              style={{
                marginTop: 22,
                backgroundColor: "#ffffff",
                paddingHorizontal: 32,
                paddingVertical: 14,
                borderRadius: 999,
                shadowColor: "#000",
                shadowOpacity: 0.1,
                shadowRadius: 4,
                elevation: 2,
              }}
            >
              <Text
                style={{
                  color: "#0284C7",
                  fontWeight: "800",
                  fontSize: 16,
                  fontFamily: "Outfit_800",
                }}
              >
                Subscribe Now
              </Text>
            </AnimatedButton>
          </LinearGradient>


        </ScrollView>
      </View>
      {/* Floating Shop Now Button */}
      <Animated.View
        style={[
          {
            position: "absolute",
            right: 0,
            top: "50%",
            backgroundColor: "#FF3399",
            paddingVertical: 12,
            paddingHorizontal: 16,
            borderTopLeftRadius: 30,
            borderBottomLeftRadius: 30,
            elevation: 8,
            shadowColor: "#000",
            shadowOpacity: 0.3,
            shadowRadius: 6,
            shadowOffset: { width: -2, height: 2 },
            flexDirection: "row",
            alignItems: "center",
            zIndex: 1000,
          },
          shopNowStyle,
        ]}
      >
        <TouchableOpacity onPress={() => router.push("/shop")} style={{ flexDirection: 'row', alignItems: 'center' }} activeOpacity={0.8}>
          <Ionicons name="cart" size={20} color="white" style={{ marginRight: 6 }} />
          <Text style={{ color: "white", fontWeight: "800", fontFamily: "Outfit_700", fontSize: 14 }}>Shop Now</Text>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
}
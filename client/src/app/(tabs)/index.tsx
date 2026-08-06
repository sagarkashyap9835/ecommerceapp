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
import { LinearGradient } from "expo-linear-gradient";
import { SafeAreaView } from "react-native-safe-area-context";
import Header from "../../../components/Header";
import { BANNERS } from "@/assets/assets";
import { CATEGORIES, COLORS } from "@/assets/constants";
import CategoryItem from "../../../components/CategoryItem";
import { router } from "expo-router";
import { Product } from "@/assets/constants/types";
import ProductCard from "../../../components/ProductCard";
import api from "../../../constants/api";
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
  const [categories, setCategories] = useState<any[]>([{ id: 'all', name: 'All', icon: 'grid' }, ...CATEGORIES]);

  const fetchData = async () => {
    try {
      const [prodRes, catRes] = await Promise.all([
        api.get("products"),
        api.get("categories").catch(() => null),
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
    } catch (error) {
      console.error("Error fetching data", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

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
                  color: "#111827",
                  fontSize: 15,
                  fontFamily: "Outfit",
                  outlineStyle: "none"
                } as any}
                value={searchQuery}
                onChangeText={setSearchQuery}
                onSubmitEditing={() => {
                  if (searchQuery.trim().length > 0) {
                    router.push({ pathname: "/shop", params: { search: searchQuery } });
                  }
                }}
                returnKeyType="search"
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
                  marginTop: 25,
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
                      backgroundColor: COLORS.primary || "#4F8D88",
                      paddingVertical: 8,
                      paddingHorizontal: 16,
                      borderRadius: 20,
                      alignSelf: "flex-start",
                      flexDirection: "row",
                      alignItems: "center"
                    }}
                  >
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

{/* Special Offers & Sales (Buy 1 Get 1 Free Section) */}
{(() => {
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

        <TouchableOpacity onPress={() => router.push({ pathname: "/shop", params: { isBogo: "true" } })}>
          <Ionicons name="arrow-forward" size={24} color="#111827" />
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
        {scrollY > 100 ? offerProducts.slice(0, 4).map((product, index) => (
          <View key={product._id} style={{ marginTop: index % 2 !== 0 ? 24 : 0 }}>
            <ProductCard product={product} index={index} />
          </View>
        )) : null}
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

    <TouchableOpacity onPress={() => router.push("/shop")}>
      <Text className="text-red-500 text-base font-semibold">
        See All
      </Text>
    </TouchableOpacity>
  </View>

  {/* Products */}
  {loading ? (
    <ActivityIndicator size="large" color={COLORS.accent} />
  ) : (
    <View
      style={{
        flexDirection: "row",
        flexWrap: "wrap",
        justifyContent: "space-between",
        minHeight: 960,
      }}
    >
      {scrollY > 600 ? products.slice(0, 8).map((product: any, index: number) => (
        <View
          key={product._id}
          style={{
            marginTop: index % 2 !== 0 ? 24 : 0,
          }}
        >
          <ProductCard product={product} index={index} />
        </View>
      )) : null}
    </View>
  )}
</View>
<View
  style={{
    backgroundColor: "#111827",
    borderRadius: 24,
    padding: 24,
    marginVertical: 20,
    alignItems: "center",
  }}
>
  <Text
    style={{
      color: "#fff",
      fontSize: 28,
      fontWeight: "700",
      textAlign: "center",
    }}
  >
    Join the Revolution
  </Text>

  <Text
    style={{
      color: "#D1D5DB",
      fontSize: 16,
      textAlign: "center",
      marginTop: 12,
      lineHeight: 24,
    }}
  >
    Subscribe to our newsletter and get{" "}
    <Text style={{ color: "#FF4C3B", fontWeight: "700" }}>
      10% OFF
    </Text>{" "}
    on your first purchase.
  </Text>

  <TouchableOpacity
    style={{
      marginTop: 20,
      backgroundColor: "#FF4C3B",
      paddingHorizontal: 30,
      paddingVertical: 14,
      borderRadius: 999,
    }}
  >
    <Text
      style={{
        color: "#fff",
        fontWeight: "700",
        fontSize: 16,
      }}
    >
      Subscribe Now
    </Text>
  </TouchableOpacity>
</View>


        </ScrollView>
      </View>
    </View>
  );
}
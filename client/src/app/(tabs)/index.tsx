import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  Image,
  Dimensions,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
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

export default function Home() {
  const [activeBanner, setActiveBanner] = useState(0);
  const [products,setProducts]=useState<Product[]>([])
  const [loading,setLoading]=useState(true)
const categories=[{id:'all',name:'All', icon:"grid"},...CATEGORIES]
const fetchProducts=async()=>{
try {
  const {data}=await api.get("products")
  setProducts(data.data)
} catch (error) {
  console.error("Error fetching products", error)
}finally{
  setLoading(false)
}
}


useEffect(()=>{
fetchProducts()
},[])

  return (
    <SafeAreaView className="flex-1 bg-white" edges={["top"]}>
      <Header title="Forever" showMenu showCart showLogo />

      <ScrollView
        className="flex-1 px-4"
        showsVerticalScrollIndicator={false}
      >
        {/* Banner Slider */}
        <ScrollView
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          scrollEventThrottle={16}
          contentContainerStyle={{
            paddingTop: 8,
            paddingBottom: 12,
          }}
          onMomentumScrollEnd={(event) => {
            const index = Math.round(
              event.nativeEvent.contentOffset.x / (width - 32)
            );
            setActiveBanner(index);
          }}
        >
          {BANNERS.map((banner) => (
            <View
              key={banner.id}
              style={{
                width: width - 32,
                height: 200,
                borderRadius: 16,
                overflow: "hidden",
                marginRight: 12,
              }}
            >
              {/* Banner Image */}
              <Image
                source={{ uri: banner.image }}
                style={{
                  width: "100%",
                  height: "100%",
                }}
                resizeMode="cover"
              />

              {/* Dark Overlay */}
              <View
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  backgroundColor: "rgba(0,0,0,0.35)",
                  justifyContent: "center",
                  paddingHorizontal: 20,
                }}
              >
                <Text
                  style={{
                    color: "#fff",
                    fontSize: 30,
                    fontWeight: "700",
                  }}
                >
                  {banner.title}
                </Text>

                <Text
                  style={{
                    color: "#fff",
                    fontSize: 16,
                    marginTop: 8,
                    opacity: 0.95,
                  }}
                >
                  {banner.subtitle}
                </Text>

                <TouchableOpacity
                  style={{
                    marginTop: 20,
                    backgroundColor: COLORS.accent,
                    paddingVertical: 12,
                    paddingHorizontal: 24,
                    borderRadius: 10,
                    alignSelf: "flex-start",
                  }}
                  activeOpacity={0.8}
                >
                  <Text
                    style={{
                      color: "#fff",
                      fontSize: 15,
                      fontWeight: "700",
                    }}
                  >
                    Get Now
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </ScrollView>

        {/* Slider Indicator */}
        <View
          style={{
            flexDirection: "row",
            justifyContent: "center",
            alignItems: "center",
            marginTop: 6,
            marginBottom: 24,
          }}
        >
          {BANNERS.map((_, index) => (
            <View
              key={index}
              style={{
                width: activeBanner === index ? 24 : 8,
                height: 8,
                borderRadius: 999,
                marginHorizontal: 4,
                backgroundColor:
                  activeBanner === index
                    ? COLORS.primary
                    : "#D1D5DB",
              }}
            />
          ))}
        </View>

{/* Categories */}
<View style={{ marginTop: 24, marginBottom: 24 }}>
  {/* Heading */}
  <View
    style={{
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 16,
    }}
  >
    <Text
      style={{
        fontSize: 22,
        fontWeight: "700",
        color: COLORS.primary,
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
      }}
    >
      {products.slice(0, 8).map((product: any) => (
        <View
          key={product._id}
          style={{
            width: "48%",
            marginBottom: 16,
          }}
        >
          <ProductCard product={product} />
        </View>
      ))}
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
    </SafeAreaView>
  );
}
import { View, Text, TouchableOpacity, Image, TextInput, StyleSheet } from "react-native";
import React, { useState } from "react";
import { HeaderProps } from "../constants/types";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useCart } from "../context/CartContext";

export default function Header({
  title,
  showBack,
  showSearch = true,
  showCart = true,
  showLogo,
  searchValue,
  onSearchChange,
  onFilterPress,
  isFilterActive,
}: HeaderProps) {
  const router = useRouter();
  const { itemCount } = useCart();
  const [internalQuery, setInternalQuery] = useState("");

  const currentQuery = searchValue !== undefined ? searchValue : internalQuery;

  const handleTextChange = (text: string) => {
    if (onSearchChange) {
      onSearchChange(text);
    } else {
      setInternalQuery(text);
      if (text.length > 0) {
        router.push({
          pathname: "/shop",
          params: { search: text },
        });
      }
    }
  };

  const handleClear = () => {
    if (onSearchChange) {
      onSearchChange("");
    } else {
      setInternalQuery("");
    }
  };

  return (
    <View style={styles.container}>
      {/* 1. LEFT SIDE: Logo or Back Button */}
      <View style={styles.leftSection}>
        {showBack ? (
          <TouchableOpacity
            onPress={() => {
              if (router.canGoBack()) {
                router.back();
              } else {
                router.replace("/");
              }
            }}
            style={styles.backButton}
            activeOpacity={0.7}
          >
            <Ionicons name="arrow-back" size={22} color="#111827" />
          </TouchableOpacity>
        ) : (
          <TouchableOpacity onPress={() => router.replace("/")} activeOpacity={0.8}>
            <Image
              source={require("@/assets/logo.png")}
              style={styles.logoImage}
              resizeMode="contain"
            />
          </TouchableOpacity>
        )}
      </View>

      {/* 2. CENTER SECTION: Search Bar Capsule or Page Title */}
      <View style={styles.centerSection}>
        {showLogo || showSearch ? (
          <View style={styles.searchBar}>
            <Ionicons name="search-outline" size={16} color="#6B7280" style={{ marginRight: 6, flexShrink: 0 }} />
            <TextInput
              placeholder="Search products..."
              placeholderTextColor="#9CA3AF"
              style={[styles.searchInput, { outlineStyle: "none" } as any]}
              value={currentQuery}
              onChangeText={handleTextChange}
              returnKeyType="search"
              autoCapitalize="none"
            />
            {currentQuery.length > 0 && (
              <TouchableOpacity onPress={handleClear} style={styles.clearBtn} activeOpacity={0.7}>
                <Ionicons name="close-circle" size={16} color="#9CA3AF" />
              </TouchableOpacity>
            )}
          </View>
        ) : title ? (
          <Text numberOfLines={1} style={styles.titleText}>
            {title}
          </Text>
        ) : null}
      </View>

      {/* 3. RIGHT SIDE: Filter Button & Cart Icon */}
      <View style={styles.rightSection}>
        {onFilterPress && (
          <TouchableOpacity
            onPress={onFilterPress}
            style={styles.filterButton}
            activeOpacity={0.7}
          >
            <Ionicons
              name="options-outline"
              size={21}
              color={isFilterActive ? "#EF4444" : "#111827"}
            />
            {isFilterActive && <View style={styles.filterDot} />}
          </TouchableOpacity>
        )}

        {showCart && (
          <TouchableOpacity
            onPress={() => router.push("/cart")}
            style={styles.cartButton}
            activeOpacity={0.8}
          >
            <Ionicons name="bag-handle-outline" size={22} color="#111827" />
            {itemCount > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>
                  {itemCount > 99 ? "99+" : itemCount}
                </Text>
              </View>
            )}
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  leftSection: {
    flexDirection: "row",
    alignItems: "center",
    flexShrink: 0,
  },
  backButton: {
    paddingRight: 4,
    paddingVertical: 4,
  },
  logoImage: {
    width: 105,
    height: 38,
  },
  centerSection: {
    flex: 1,
    marginHorizontal: 8,
    minWidth: 0,
    justifyContent: "center",
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F3F4F6",
    borderRadius: 20,
    paddingLeft: 10,
    paddingRight: 8,
    height: 38,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    overflow: "hidden",
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
    color: "#111827",
    padding: 0,
    margin: 0,
    minWidth: 0,
  },
  clearBtn: {
    marginLeft: 4,
    padding: 2,
    justifyContent: "center",
    alignItems: "center",
    flexShrink: 0,
  },
  titleText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#111827",
    textAlign: "center",
  },
  rightSection: {
    flexDirection: "row",
    alignItems: "center",
    flexShrink: 0,
    marginLeft: 2,
  },
  filterButton: {
    position: "relative",
    padding: 4,
    marginRight: 6,
  },
  filterDot: {
    position: "absolute",
    top: 2,
    right: 2,
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#EF4444",
  },
  cartButton: {
    position: "relative",
    padding: 4,
  },
  badge: {
    position: "absolute",
    top: -2,
    right: -4,
    backgroundColor: "#EF4444",
    borderRadius: 9,
    minWidth: 16,
    height: 16,
    paddingHorizontal: 3,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: "#FFFFFF",
  },
  badgeText: {
    color: "#FFFFFF",
    fontSize: 9,
    fontWeight: "800",
  },
});
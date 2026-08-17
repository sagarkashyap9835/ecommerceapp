import React, { useEffect, useState, useMemo } from "react";
import { View, Text, FlatList, TouchableOpacity, Modal, Pressable, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import api from "../../constants/api";
import ProductCard from "../../components/ProductCard";
import InfinityLoader from "../../components/InfinityLoader";
import { Product } from "@/assets/constants/types";
import Header from "../../components/Header";
import { useAuth } from "../context/AuthContext";
import { applyFirstOrderDiscount } from "../utils/discountLogic";

const SORT_OPTIONS = [
  { label: "Newest Arrivals", value: "newest" },
  { label: "Price: Low to High", value: "price_asc" },
  { label: "Price: High to Low", value: "price_desc" },
];

export default function Collection() {
  const { type } = useLocalSearchParams<{ type: string }>();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const { firstOrderOffer } = useAuth();

  // Search & Filter States
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("newest");
  const [filterModalVisible, setFilterModalVisible] = useState(false);
  const [tempSortBy, setTempSortBy] = useState("newest");

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        let params: any = { limit: 50 }; // Fetch up to 50 for this collection
        if (type === "latest") params.isLatest = "true";
        if (type === "bogo") params.isBogo = "true";
        if (type === "popular") params.isFeatured = "true";

        const { data } = await api.get("/products", { params });
        if (data?.success) {
          let newProducts = data.data;
          if (firstOrderOffer) {
            newProducts = newProducts.map((p: any) => applyFirstOrderDiscount(p, firstOrderOffer));
          }
          setProducts(newProducts);
        }
      } catch (error) {
        console.error("Failed to load collection:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, [type]);

  const getTitle = () => {
    if (type === "latest") return "Latest Products";
    if (type === "bogo") return "Buy 1 Get 1 Free";
    if (type === "popular") return "Popular Products";
    return "Collection";
  };

  // Local filtering and sorting
  const filteredProducts = useMemo(() => {
    let list = [...products];

    // Search Filter
    if (searchQuery.trim() !== "") {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          (p.description && p.description.toLowerCase().includes(q))
      );
    }

    // Sort Filter
    if (sortBy === "price_asc") {
      list.sort((a, b) => a.price - b.price);
    } else if (sortBy === "price_desc") {
      list.sort((a, b) => b.price - a.price);
    } else if (sortBy === "newest") {
      // Assuming they are already sorted by newest from backend or fallback to ID
      // Do nothing or sort by date if available
    }

    return list;
  }, [products, searchQuery, sortBy]);

  const applyModalFilters = () => {
    setSortBy(tempSortBy);
    setFilterModalVisible(false);
  };

  const resetFilters = () => {
    setTempSortBy("newest");
    setSortBy("newest");
    setSearchQuery("");
    setFilterModalVisible(false);
  };

  const isFilterActive = sortBy !== "newest" || searchQuery.trim() !== "";

  return (
    <SafeAreaView edges={["top"]} style={{ flex: 1, backgroundColor: "#FFFFFF" }}>
      {/* Reusable Header with Search & Filter */}
      <Header
        showBack
        title={getTitle()}
        showSearch
        searchValue={searchQuery}
        onSearchChange={setSearchQuery}
        onFilterPress={() => {
          setTempSortBy(sortBy);
          setFilterModalVisible(true);
        }}
        isFilterActive={isFilterActive}
      />

      {/* Active Filters Tag Bar */}
      {isFilterActive && (
        <View style={styles.activeFiltersBar}>
          <Text style={styles.activeFiltersLabel}>Filters:</Text>
          {sortBy !== "newest" && (
            <View style={styles.filterChip}>
              <Text style={styles.filterChipText}>
                Sort: {sortBy === "price_asc" ? "Low to High" : "High to Low"}
              </Text>
              <TouchableOpacity onPress={() => setSortBy("newest")}>
                <Ionicons name="close" size={14} color="#374151" style={{ marginLeft: 4 }} />
              </TouchableOpacity>
            </View>
          )}
          <TouchableOpacity onPress={resetFilters} style={styles.clearAllBtn}>
            <Text style={styles.clearAllBtnText}>Clear All</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Products Grid */}
      {loading ? (
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
          <InfinityLoader />
        </View>
      ) : (
        <FlatList
          data={filteredProducts}
          keyExtractor={(item) => item._id}
          numColumns={2}
          contentContainerStyle={{ padding: 16 }}
          columnWrapperStyle={{ justifyContent: "space-between", marginBottom: 16 }}
          showsVerticalScrollIndicator={false}
          renderItem={({ item, index }) => (
            <View style={{ width: "48%" }}>
              <ProductCard product={item} index={index} />
            </View>
          )}
          ListEmptyComponent={
            <View style={{ alignItems: "center", marginTop: 50 }}>
              <Ionicons name="cube-outline" size={48} color="#9CA3AF" />
              <Text style={{ marginTop: 12, color: "#6B7280", fontFamily: "Outfit_500" }}>
                No products match your search/filter.
              </Text>
            </View>
          }
        />
      )}

      {/* Filter Modal */}
      <Modal
        visible={filterModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setFilterModalVisible(false)}
      >
        <Pressable style={styles.modalOverlay} onPress={() => setFilterModalVisible(false)}>
          <Pressable style={styles.modalContent} onPress={(e) => e.stopPropagation()}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Sort Options</Text>
              <TouchableOpacity onPress={() => setFilterModalVisible(false)} style={styles.closeModalBtn}>
                <Ionicons name="close" size={24} color="#111827" />
              </TouchableOpacity>
            </View>

            <View style={styles.modalBody}>
              {SORT_OPTIONS.map((option) => (
                <TouchableOpacity
                  key={option.value}
                  style={[styles.sortOptionBtn, tempSortBy === option.value && styles.sortOptionBtnActive]}
                  onPress={() => setTempSortBy(option.value)}
                >
                  <Text style={[styles.sortOptionText, tempSortBy === option.value && styles.sortOptionTextActive]}>
                    {option.label}
                  </Text>
                  {tempSortBy === option.value && <Ionicons name="checkmark-circle" size={20} color="#FF3399" />}
                </TouchableOpacity>
              ))}
            </View>

            {/* Modal Action Buttons */}
            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.resetModalBtn} onPress={resetFilters}>
                <Text style={styles.resetModalBtnText}>Reset</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.applyModalBtn} onPress={applyModalFilters}>
                <Text style={styles.applyModalBtnText}>Apply</Text>
              </TouchableOpacity>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  activeFiltersBar: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: "row",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
    backgroundColor: "#F9FAFB",
  },
  activeFiltersLabel: {
    fontSize: 13,
    fontWeight: "700",
    color: "#64748B",
    marginRight: 8,
    fontFamily: "Outfit_700",
  },
  filterChip: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#E2E8F0",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
  },
  filterChipText: {
    fontSize: 12,
    color: "#334155",
    fontWeight: "500",
    fontFamily: "Outfit_500",
  },
  clearAllBtn: {
    marginLeft: 4,
  },
  clearAllBtnText: {
    fontSize: 13,
    color: "#EF4444",
    fontWeight: "700",
    fontFamily: "Outfit_700",
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: "80%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 24,
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: "#0F172A",
    fontFamily: "Outfit_800",
  },
  closeModalBtn: {
    padding: 4,
  },
  modalBody: {
    padding: 24,
  },
  sortOptionBtn: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
  },
  sortOptionBtnActive: {
    backgroundColor: "#FDF2F8",
    paddingHorizontal: 12,
    marginHorizontal: -12,
    borderRadius: 12,
    borderBottomWidth: 0,
  },
  sortOptionText: {
    fontSize: 16,
    color: "#475569",
    fontWeight: "500",
    fontFamily: "Outfit_500",
  },
  sortOptionTextActive: {
    color: "#FF3399",
    fontWeight: "700",
    fontFamily: "Outfit_700",
  },
  modalActions: {
    flexDirection: "row",
    padding: 24,
    borderTopWidth: 1,
    borderTopColor: "#F1F5F9",
    backgroundColor: "#FFFFFF",
    paddingBottom: 40,
  },
  resetModalBtn: {
    flex: 1,
    paddingVertical: 16,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F1F5F9",
    borderRadius: 999,
    marginRight: 12,
  },
  resetModalBtnText: {
    color: "#64748B",
    fontSize: 16,
    fontWeight: "700",
    fontFamily: "Outfit_700",
  },
  applyModalBtn: {
    flex: 2,
    paddingVertical: 16,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FF3399",
    borderRadius: 999,
    shadowColor: "#FF3399",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  applyModalBtnText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
    fontFamily: "Outfit_700",
  },
});

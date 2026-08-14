import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Switch,
  Image,
  ActivityIndicator,
  Platform,
  Modal,
  FlatList,
  Pressable,
  StyleSheet,
} from "react-native";
import Toast from "react-native-toast-message";
import { COLORS } from "@/assets/constants";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { useAuth } from "@/context/AuthContext";
import api from "../../../../../../constants/api";
import { Category } from "@/assets/constants/types";

export default function EditProduct() {
  const { getToken } = useAuth();
  const { id } = useLocalSearchParams();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Dynamic Categories list
  const [categoriesList, setCategoriesList] = useState<Category[]>([]);

  // Modals state
  const [categoryModalVisible, setCategoryModalVisible] = useState(false);
  const [subcategoryModalVisible, setSubcategoryModalVisible] = useState(false);

  // Form State
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [stock, setStock] = useState("");

  // Dependent Taxonomy State
  const [selectedCategoryObj, setSelectedCategoryObj] = useState<Category | null>(null);
  const [category, setCategory] = useState("");
  const [subcategory, setSubcategory] = useState("");
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);

  const [isFeatured, setIsFeatured] = useState(false);
  const [isBogo, setIsBogo] = useState(false);
  const [isLatest, setIsLatest] = useState(false);

  // Image State
  const [existingImages, setExistingImages] = useState<string[]>([]);
  const [newImages, setNewImages] = useState<string[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch Categories taxonomy
        const { data: catRes } = await api.get("/categories");
        let fetchedCategories: Category[] = [];
        if (catRes.success) {
          fetchedCategories = catRes.data;
          setCategoriesList(fetchedCategories);
        }

        // Fetch target Product
        const { data: prodRes } = await api.get(`/products/${id}`);
        if (prodRes.success) {
          const product = prodRes.data;
          setName(product.name || "");
          setDescription(product.description || "");
          setPrice(product.price ? product.price.toString() : "");
          setStock(product.stock !== undefined ? product.stock.toString() : "0");
          setIsFeatured(!!product.isFeatured);
          setIsBogo(!!product.isBogo);
          setIsLatest(!!product.isLatest);

          const catName = typeof product.category === "object" ? product.category.name : product.category;
          setCategory(catName || "");
          setSubcategory(product.subcategory || "");

          if (product.sizes) {
            setSelectedSizes(Array.isArray(product.sizes) ? product.sizes : [product.sizes]);
          }

          if (product.images && Array.isArray(product.images)) {
            setExistingImages(product.images);
          } else if (product.images) {
            setExistingImages([product.images]);
          }

          // Match category object
          const matchCat = fetchedCategories.find((c) => c.name === catName);
          if (matchCat) {
            setSelectedCategoryObj(matchCat);
          }
        }
      } catch (error: any) {
        console.error("Failed to fetch product data:", error);
        Toast.show({
          type: "error",
          text1: "Error",
          text2: error.response?.data?.message || "Failed to load product data",
        });
        if (router.canGoBack()) {
          router.back();
        } else {
          router.replace("/admin/products");
        }
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchData();
  }, [id]);

  const handleSelectCategory = (cat: Category) => {
    setSelectedCategoryObj(cat);
    setCategory(cat.name);
    const firstSub = cat.subcategories?.[0] || "";
    setSubcategory(firstSub);
    setSelectedSizes(cat.sizes || []);
    setCategoryModalVisible(false);
  };

  const toggleSize = (sizeOption: string) => {
    if (selectedSizes.includes(sizeOption)) {
      setSelectedSizes(selectedSizes.filter((s) => s !== sizeOption));
    } else {
      setSelectedSizes([...selectedSizes, sizeOption]);
    }
  };

  const pickImages = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsMultipleSelection: true,
      selectionLimit: 5 - (existingImages.length + newImages.length),
      quality: 0.8,
    });

    if (!result.canceled) {
      const uris = result.assets.map((asset) => asset.uri);
      setNewImages([...newImages, ...uris]);
    }
  };

  const removeExistingImage = (index: number) => {
    const updated = [...existingImages];
    updated.splice(index, 1);
    setExistingImages(updated);
  };

  const removeNewImage = (index: number) => {
    const updated = [...newImages];
    updated.splice(index, 1);
    setNewImages(updated);
  };

  const handleSubmit = async () => {
    if (!name.trim() || !price || !category || selectedSizes.length < 1) {
      Toast.show({
        type: "error",
        text1: "Missing Fields",
        text2: "Please fill in all required fields",
      });
      return;
    }

    try {
      setSubmitting(true);
      const token = await getToken();
      const formData = new FormData();

      formData.append("name", name.trim());
      formData.append("description", description);
      formData.append("price", price);
      formData.append("stock", stock);
      formData.append("category", category);
      formData.append("subcategory", subcategory);
      formData.append("isFeatured", String(isFeatured));
      formData.append("isBogo", String(isBogo));
      formData.append("isLatest", String(isLatest));
      formData.append("sizes", JSON.stringify(selectedSizes));

      // Append existing images
      existingImages.forEach((img) => {
        formData.append("existingImages", img);
      });

      // Append new images
      for (const [i, uri] of newImages.entries()) {
        const filename = `new-image-${i}.jpg`;
        if (Platform.OS === "web") {
          const blob = await (await fetch(uri)).blob();
          formData.append("images", new File([blob], filename, { type: "image/jpeg" }));
        } else {
          formData.append("images", { uri, name: filename, type: "image/jpeg" } as any);
        }
      }

      const { data } = await api.put(`/products/${id}`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      if (data?.success) {
        Toast.show({
          type: "success",
          text1: "Success",
          text2: "Product updated successfully",
        });
        router.replace("/admin/products");
      }
    } catch (error: any) {
      console.error("Failed to update product:", error);
      Toast.show({
        type: "error",
        text1: "Failed to Update Product",
        text2: error.response?.data?.message || "Something went wrong",
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color={COLORS.primary || "#000"} />
      </View>
    );
  }

  const subcategoriesList = selectedCategoryObj?.subcategories || [];
  const availableSizes = selectedCategoryObj?.sizes || selectedSizes;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
      <View style={styles.card}>
        {/* PRODUCT NAME */}
        <Text style={styles.inputLabel}>Product Name *</Text>
        <TextInput
          style={styles.input}
          value={name}
          onChangeText={setName}
          placeholder="Product Name"
          placeholderTextColor="#9ca3af"
        />

        {/* PRICE */}
        <Text style={styles.inputLabel}>Price ($) *</Text>
        <TextInput
          style={styles.input}
          keyboardType="decimal-pad"
          value={price}
          onChangeText={setPrice}
          placeholder="0.00"
          placeholderTextColor="#9ca3af"
        />

        {/* STEP 1: CATEGORY */}
        <Text style={styles.inputLabel}>Step 1: Category *</Text>
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => setCategoryModalVisible(true)}
          style={styles.dropdownButton}
        >
          <Text style={styles.dropdownText}>{category || "Select Category"}</Text>
          <Ionicons name="chevron-down" size={20} color={COLORS.secondary || "#6b7280"} />
        </TouchableOpacity>

        {/* CATEGORY SELECT MODAL */}
        <Modal visible={categoryModalVisible} animationType="slide" transparent>
          <Pressable style={styles.modalOverlay} onPress={() => setCategoryModalVisible(false)}>
            <Pressable style={styles.modalContent} onPress={(e) => e.stopPropagation()}>
              <Text style={styles.modalTitle}>Select Category</Text>
              <FlatList
                data={categoriesList}
                keyExtractor={(item) => String(item._id || item.name)}
                renderItem={({ item }) => {
                  const isSelected = category === item.name;
                  return (
                    <TouchableOpacity
                      activeOpacity={0.8}
                      style={[styles.modalItem, isSelected && styles.modalItemActive]}
                      onPress={() => handleSelectCategory(item)}
                    >
                      <View style={styles.modalItemRow}>
                        <View style={{ flexDirection: "row", alignItems: "center" }}>
                          <Ionicons
                            name={(item.icon as any) || "grid-outline"}
                            size={18}
                            color="#374151"
                            style={{ marginRight: 8 }}
                          />
                          <Text
                            style={[
                              styles.modalItemText,
                              isSelected && styles.modalItemTextActive,
                            ]}
                          >
                            {item.name}
                          </Text>
                        </View>
                        {isSelected && (
                          <Ionicons
                            name="checkmark"
                            size={20}
                            color={COLORS.primary || "#000"}
                          />
                        )}
                      </View>
                    </TouchableOpacity>
                  );
                }}
              />
            </Pressable>
          </Pressable>
        </Modal>

        {/* STEP 2: SUBCATEGORY */}
        <Text style={styles.inputLabel}>Step 2: Subcategory</Text>
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => setSubcategoryModalVisible(true)}
          style={styles.dropdownButton}
        >
          <Text style={styles.dropdownText}>
            {subcategory || "Select Subcategory"}
          </Text>
          <Ionicons name="chevron-down" size={20} color={COLORS.secondary || "#6b7280"} />
        </TouchableOpacity>

        {/* SUBCATEGORY SELECT MODAL */}
        <Modal visible={subcategoryModalVisible} animationType="slide" transparent>
          <Pressable style={styles.modalOverlay} onPress={() => setSubcategoryModalVisible(false)}>
            <Pressable style={styles.modalContent} onPress={(e) => e.stopPropagation()}>
              <Text style={styles.modalTitle}>Select Subcategory ({category})</Text>
              <FlatList
                data={subcategoriesList}
                keyExtractor={(item, index) => `${item}-${index}`}
                renderItem={({ item }) => {
                  const isSelected = subcategory === item;
                  return (
                    <TouchableOpacity
                      activeOpacity={0.8}
                      style={[styles.modalItem, isSelected && styles.modalItemActive]}
                      onPress={() => {
                        setSubcategory(item);
                        setSubcategoryModalVisible(false);
                      }}
                    >
                      <View style={styles.modalItemRow}>
                        <Text
                          style={[
                            styles.modalItemText,
                            isSelected && styles.modalItemTextActive,
                          ]}
                        >
                          {item}
                        </Text>
                        {isSelected && (
                          <Ionicons
                            name="checkmark"
                            size={20}
                            color={COLORS.primary || "#000"}
                          />
                        )}
                      </View>
                    </TouchableOpacity>
                  );
                }}
              />
            </Pressable>
          </Pressable>
        </Modal>

        {/* STEP 3: SIZES MULTI-SELECT CHIPS */}
        <Text style={styles.inputLabel}>Step 3: Available Sizes (Multi-Select) *</Text>
        <View style={styles.sizesChipContainer}>
          {availableSizes.length > 0 ? (
            availableSizes.map((szOption) => {
              const isSelected = selectedSizes.includes(szOption);
              return (
                <TouchableOpacity
                  key={szOption}
                  activeOpacity={0.8}
                  onPress={() => toggleSize(szOption)}
                  style={[styles.sizeChip, isSelected && styles.sizeChipSelected]}
                >
                  <Text style={[styles.sizeChipText, isSelected && styles.sizeChipTextSelected]}>
                    {szOption}
                  </Text>
                  {isSelected && (
                    <Ionicons name="checkmark-circle" size={14} color="#ffffff" style={{ marginLeft: 4 }} />
                  )}
                </TouchableOpacity>
              );
            })
          ) : (
            <Text style={styles.emptySizesText}>No size options configured</Text>
          )}
        </View>

        {/* STOCK LEVEL */}
        <Text style={[styles.inputLabel, { marginTop: 14 }]}>Stock Level</Text>
        <TextInput
          style={styles.input}
          keyboardType="number-pad"
          value={stock}
          onChangeText={setStock}
        />

        {/* IMAGES */}
        <Text style={styles.inputLabel}>Product Images (max 5)</Text>
        <View style={{ marginBottom: 16 }}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {existingImages.map((uri, index) => (
              <View key={`existing-${index}`} style={styles.imageBox}>
                <Image source={{ uri }} style={styles.imageThumbnail} />
                <TouchableOpacity
                  onPress={() => removeExistingImage(index)}
                  style={styles.imageRemoveBadge}
                >
                  <Ionicons name="close" size={12} color="white" />
                </TouchableOpacity>
              </View>
            ))}
            {newImages.map((uri, index) => (
              <View key={`new-${index}`} style={styles.imageBox}>
                <Image
                  source={{ uri }}
                  style={[styles.imageThumbnail, { borderWidth: 2, borderColor: "#111827" }]}
                />
                <TouchableOpacity
                  onPress={() => removeNewImage(index)}
                  style={[styles.imageRemoveBadge, { backgroundColor: "#111827" }]}
                >
                  <Ionicons name="close" size={12} color="white" />
                </TouchableOpacity>
              </View>
            ))}
            {existingImages.length + newImages.length < 5 && (
              <TouchableOpacity onPress={pickImages} style={styles.addImageBtn}>
                <Ionicons name="add" size={24} color={COLORS.secondary || "#6b7280"} />
                <Text style={styles.addImageBtnText}>Add</Text>
              </TouchableOpacity>
            )}
          </ScrollView>
        </View>

        {/* DESCRIPTION */}
        <Text style={styles.inputLabel}>Description</Text>
        <TextInput
          style={[styles.input, styles.multilineInput]}
          multiline
          value={description}
          onChangeText={setDescription}
        />

        {/* FEATURED & BOGO */}
        <View style={styles.switchRow}>
          <Text style={styles.switchLabel}>Featured Product</Text>
          <Switch
            value={isFeatured}
            onValueChange={setIsFeatured}
            trackColor={{ false: "#eee", true: COLORS.primary || "#000" }}
          />
        </View>

        <View style={styles.switchRow}>
          <View>
            <Text style={styles.switchLabel}>Buy 1 Get 1 Offer</Text>
            <Text style={styles.switchSubLabel}>Show in special BOGO section</Text>
          </View>
          <Switch
            trackColor={{ false: "#E5E7EB", true: "#34D399" }}
            thumbColor={isBogo ? "#059669" : "#F9FAFB"}
            ios_backgroundColor="#E5E7EB"
            value={isBogo}
            onValueChange={setIsBogo}
          />
        </View>

        {/* isLatest Switch */}
        <View style={styles.switchRow}>
          <View>
            <Text style={styles.switchLabel}>Latest Product</Text>
            <Text style={styles.switchSubLabel}>Show in Latest Arrivals section</Text>
          </View>
          <Switch
            trackColor={{ false: "#E5E7EB", true: "#818CF8" }}
            thumbColor={isLatest ? "#4F46E5" : "#F9FAFB"}
            ios_backgroundColor="#E5E7EB"
            value={isLatest}
            onValueChange={setIsLatest}
          />
        </View>

        {/* SUBMIT BUTTON */}
        <TouchableOpacity
          style={[styles.submitButton, submitting && styles.submitButtonDisabled]}
          onPress={handleSubmit}
          disabled={submitting}
          activeOpacity={0.8}
        >
          {submitting ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text style={styles.submitButtonText}>Update Product</Text>
          )}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f9fafb",
  },
  loaderContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f9fafb",
  },
  scrollContent: {
    padding: 16,
  },
  card: {
    backgroundColor: "#ffffff",
    padding: 16,
    borderRadius: 12,
    marginBottom: 80,
    borderWidth: 1,
    borderColor: "#f3f4f6",
    elevation: 2,
  },
  inputLabel: {
    color: "#6b7280",
    fontSize: 12,
    fontWeight: "700",
    marginBottom: 6,
    textTransform: "uppercase",
  },
  input: {
    backgroundColor: "#f3f4f6",
    padding: 14,
    borderRadius: 8,
    color: "#111827",
    fontSize: 15,
    marginBottom: 16,
  },
  multilineInput: {
    height: 96,
    textAlignVertical: "top",
    marginBottom: 24,
  },
  dropdownButton: {
    backgroundColor: "#f3f4f6",
    padding: 14,
    borderRadius: 8,
    marginBottom: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  dropdownText: {
    color: "#111827",
    fontSize: 15,
    fontWeight: "500",
  },
  sizesChipContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 16,
  },
  sizeChip: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#d1d5db",
    backgroundColor: "#f9fafb",
  },
  sizeChipSelected: {
    backgroundColor: "#111827",
    borderColor: "#111827",
  },
  sizeChipText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#374151",
  },
  sizeChipTextSelected: {
    color: "#ffffff",
  },
  emptySizesText: {
    fontSize: 13,
    color: "#9ca3af",
    fontStyle: "italic",
  },
  imageBox: {
    position: "relative",
    marginRight: 8,
  },
  imageThumbnail: {
    width: 96,
    height: 96,
    borderRadius: 8,
  },
  imageRemoveBadge: {
    position: "absolute",
    top: 4,
    right: 4,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    borderRadius: 10,
    padding: 3,
  },
  addImageBtn: {
    width: 96,
    height: 96,
    borderRadius: 8,
    backgroundColor: "#f3f4f6",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderStyle: "dashed",
    borderColor: "#d1d5db",
  },
  addImageBtnText: {
    fontSize: 12,
    color: "#6b7280",
    marginTop: 4,
  },
  switchRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  switchLabel: {
    color: "#111827",
    fontWeight: "700",
    fontSize: 15,
  },
  switchSubLabel: {
    color: "#6b7280",
    fontSize: 12,
    marginTop: 4,
  },
  submitButton: {
    backgroundColor: "#000000",
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  submitButtonDisabled: {
    opacity: 0.7,
  },
  submitButtonText: {
    color: "#ffffff",
    fontWeight: "700",
    fontSize: 17,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    backgroundColor: "#ffffff",
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    padding: 16,
    maxHeight: "50%",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 16,
    color: "#111827",
  },
  modalItem: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
  },
  modalItemActive: {
    backgroundColor: "rgba(0, 0, 0, 0.03)",
  },
  modalItemRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  modalItemText: {
    fontSize: 15,
    color: "#111827",
  },
  modalItemTextActive: {
    fontWeight: "700",
    color: "#000000",
  },
});

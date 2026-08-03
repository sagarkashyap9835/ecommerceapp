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
  Modal,
  FlatList,
  Pressable,
  StyleSheet,
  Platform,
} from "react-native";
import Toast from "react-native-toast-message";
import { COLORS } from "@/assets/constants";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import { useAuth } from "@clerk/expo";
import api from "../../../../../constants/api";
import { Category } from "@/assets/constants/types";

export default function AddProduct() {
  const router = useRouter();
  const { getToken } = useAuth();
  const [submitting, setSubmitting] = useState(false);
  const [loadingCategories, setLoadingCategories] = useState(true);

  // Dynamic Categories from API
  const [categoriesList, setCategoriesList] = useState<Category[]>([]);

  // Modals state
  const [categoryModalVisible, setCategoryModalVisible] = useState(false);
  const [subcategoryModalVisible, setSubcategoryModalVisible] = useState(false);

  // Form state
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [stock, setStock] = useState("");

  // Dependent Taxonomy State
  const [selectedCategoryObj, setSelectedCategoryObj] = useState<Category | null>(null);
  const [category, setCategory] = useState("");
  const [subcategory, setSubcategory] = useState("");
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [images, setImages] = useState<string[]>([]);
  const [isFeatured, setIsFeatured] = useState(false);
  const [isBogo, setIsBogo] = useState(false);

  // Load Categories on mount
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const { data } = await api.get("/categories");
        if (data.success && data.data.length > 0) {
          setCategoriesList(data.data);
          // Default to first category
          const firstCat = data.data[0];
          setSelectedCategoryObj(firstCat);
          setCategory(firstCat.name);
          setSubcategory(firstCat.subcategories?.[0] || "");
          setSelectedSizes(firstCat.sizes || []);
        }
      } catch (error) {
        console.error("Failed to load taxonomy categories:", error);
      } finally {
        setLoadingCategories(false);
      }
    };
    loadCategories();
  }, []);

  // When Category changes: update available subcategories and sizes
  const handleSelectCategory = (cat: Category) => {
    setSelectedCategoryObj(cat);
    setCategory(cat.name);
    // Reset subcategory to first subcategory of new category or empty
    const firstSub = cat.subcategories?.[0] || "";
    setSubcategory(firstSub);
    // Load default sizes for new category
    setSelectedSizes(cat.sizes || []);
    setCategoryModalVisible(false);
  };

  // Toggle size selection
  const toggleSize = (sizeOption: string) => {
    if (selectedSizes.includes(sizeOption)) {
      setSelectedSizes(selectedSizes.filter((s) => s !== sizeOption));
    } else {
      setSelectedSizes([...selectedSizes, sizeOption]);
    }
  };

  // PICK MULTIPLE IMAGES (MAX 5)
  const pickImages = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsMultipleSelection: true,
      selectionLimit: 5,
      quality: 0.8,
    });

    if (!result.canceled) {
      const uris = result.assets.map((asset) => asset.uri);
      setImages(uris.slice(0, 5));
    }
  };

  // Add Product
  const handleSubmit = async () => {
    if (!name.trim() || !price || !category || selectedSizes.length < 1) {
      Toast.show({
        type: "error",
        text1: "Missing Fields",
        text2: "Please provide Name, Price, Category, and at least 1 Size",
      });
      return;
    }

    setSubmitting(true);
    const token = await getToken();
    const formData = new FormData();

    const fields = {
      name: name.trim(),
      description,
      price,
      stock: stock || "0",
      category,
      subcategory,
      isFeatured: String(isFeatured),
      isBogo: String(isBogo),
      sizes: JSON.stringify(selectedSizes),
    };

    Object.entries(fields).forEach(([key, value]) => {
      formData.append(key, value);
    });

    for (const [i, uri] of images.entries()) {
      const filename = `image-${i}.jpg`;
      if (Platform.OS === "web") {
        try {
          const response = await fetch(uri);
          const blob = await response.blob();
          formData.append(
            "images",
            new File([blob], filename, { type: blob.type || "image/jpeg" })
          );
        } catch (e) {
          console.error("Error fetching web image blob:", e);
        }
      } else {
        formData.append("images", {
          uri,
          name: filename,
          type: "image/jpeg",
        } as any);
      }
    }

    try {
      const { data } = await api.post("/products", formData, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!data?.success) throw new Error("Upload failed");

      Toast.show({
        type: "success",
        text1: "Success",
        text2: "Product created successfully",
      });
      router.replace("/admin/products");
    } catch (error: any) {
      console.error(error);
      Toast.show({
        type: "error",
        text1: "Failed to Create Product",
        text2: error.response?.data?.message || "Something went wrong",
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (loadingCategories) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color={COLORS.primary || "#000"} />
      </View>
    );
  }

  const subcategoriesList = selectedCategoryObj?.subcategories || [];
  const availableSizes = selectedCategoryObj?.sizes || [];

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
      <View style={styles.card}>
        {/* PRODUCT NAME */}
        <Text style={styles.inputLabel}>Product Name *</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g. Slim Fit Denim Shirt"
          placeholderTextColor="#9ca3af"
          value={name}
          onChangeText={setName}
        />

        {/* PRICE */}
        <Text style={styles.inputLabel}>Price ($) *</Text>
        <TextInput
          style={styles.input}
          placeholder="0.00"
          placeholderTextColor="#9ca3af"
          keyboardType="decimal-pad"
          value={price}
          onChangeText={setPrice}
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
            <Text style={styles.emptySizesText}>No size options configured for this category</Text>
          )}
        </View>

        {/* STOCK LEVEL */}
        <Text style={[styles.inputLabel, { marginTop: 14 }]}>Stock Level</Text>
        <TextInput
          style={styles.input}
          placeholder="0"
          placeholderTextColor="#9ca3af"
          keyboardType="number-pad"
          value={stock}
          onChangeText={setStock}
        />

        {/* IMAGE PICKER */}
        <Text style={styles.inputLabel}>Product Images (max 5)</Text>
        <TouchableOpacity onPress={pickImages} activeOpacity={0.8} style={styles.imagePickerContainer}>
          {images.length > 0 ? (
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {images.map((uri, i) => (
                <Image key={i} source={{ uri }} style={styles.pickedImage} />
              ))}
            </ScrollView>
          ) : (
            <View style={styles.uploadPlaceholder}>
              <Ionicons
                name="cloud-upload-outline"
                size={32}
                color={COLORS.secondary || "#6b7280"}
              />
              <Text style={styles.uploadPlaceholderText}>Tap to upload images</Text>
            </View>
          )}
        </TouchableOpacity>

        {/* DESCRIPTION */}
        <Text style={styles.inputLabel}>Description</Text>
        <TextInput
          style={[styles.input, styles.multilineInput]}
          placeholder="Enter product details..."
          placeholderTextColor="#9ca3af"
          multiline
          value={description}
          onChangeText={setDescription}
        />

        {/* FEATURED & BOGO SWITCHES */}
        <View style={styles.switchRow}>
          <Text style={styles.switchLabel}>Featured Product</Text>
          <Switch
            value={isFeatured}
            onValueChange={setIsFeatured}
            trackColor={{ false: "#eee", true: COLORS.primary || "#000" }}
          />
        </View>

        <View style={styles.switchRow}>
          <Text style={styles.switchLabel}>🎁 Buy 1 Get 1 Free Offer</Text>
          <Switch
            value={isBogo}
            onValueChange={setIsBogo}
            trackColor={{ false: "#eee", true: "#059669" }}
          />
        </View>

        {/* SUBMIT BUTTON */}
        <TouchableOpacity
          onPress={handleSubmit}
          disabled={submitting}
          activeOpacity={0.8}
          style={[styles.submitButton, submitting && styles.submitButtonDisabled]}
        >
          {submitting ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text style={styles.submitButtonText}>Create Product</Text>
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
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 2,
    elevation: 2,
    borderWidth: 1,
    borderColor: "#f3f4f6",
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
  imagePickerContainer: {
    marginBottom: 16,
    width: "100%",
  },
  uploadPlaceholder: {
    width: "100%",
    height: 110,
    borderRadius: 8,
    backgroundColor: "#f3f4f6",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderStyle: "dashed",
    borderColor: "#d1d5db",
  },
  uploadPlaceholderText: {
    color: "#6b7280",
    fontSize: 12,
    marginTop: 6,
  },
  pickedImage: {
    width: 110,
    height: 110,
    borderRadius: 8,
    marginRight: 8,
  },
  switchRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
  },
  switchLabel: {
    color: "#111827",
    fontWeight: "700",
    fontSize: 15,
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
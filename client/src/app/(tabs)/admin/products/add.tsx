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
import { useAuth } from "@/context/AuthContext";
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
  const [colorsInput, setColorsInput] = useState("");

  // Dependent Taxonomy State
  const [selectedCategoryObj, setSelectedCategoryObj] = useState<Category | null>(null);
  const [category, setCategory] = useState("");
  const [subcategory, setSubcategory] = useState("");
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [images, setImages] = useState<string[]>([]);
  const [isFeatured, setIsFeatured] = useState(false);
  const [isBogo, setIsBogo] = useState(false);
  const [isLatest, setIsLatest] = useState(false);

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

    const parsedColors = colorsInput
      .split(',')
      .map(c => c.trim())
      .filter(c => c.length > 0);

    const fields = {
      name: name.trim(),
      description,
      price,
      stock: stock || "0",
      category,
      subcategory,
      isFeatured: String(isFeatured),
      isBogo: String(isBogo),
      isLatest: String(isLatest),
      sizes: JSON.stringify(selectedSizes),
      colors: JSON.stringify(parsedColors),
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
        headers: { 
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data"
        },
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
        <ActivityIndicator size="large" color="#FF3399" />
      </View>
    );
  }

  const subcategoriesList = selectedCategoryObj?.subcategories || [];
  const availableSizes = selectedCategoryObj?.sizes || [];

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
      <View style={styles.card}>
        {/* PRODUCT NAME */}
        <Text style={styles.inputLabel}>Product Name *</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g. Slim Fit Denim Shirt"
          placeholderTextColor="#94A3B8"
          value={name}
          onChangeText={setName}
        />

        {/* PRICE */}
        <Text style={styles.inputLabel}>Price ($) *</Text>
        <TextInput
          style={styles.input}
          placeholder="0.00"
          placeholderTextColor="#94A3B8"
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
          <Ionicons name="chevron-down" size={20} color="#64748B" />
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
                            color={isSelected ? "#FF3399" : "#475569"}
                            style={{ marginRight: 12 }}
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
                            name="checkmark-circle"
                            size={22}
                            color="#FF3399"
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
          <Ionicons name="chevron-down" size={20} color="#64748B" />
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
                            name="checkmark-circle"
                            size={22}
                            color="#FF3399"
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
          placeholderTextColor="#94A3B8"
          keyboardType="number-pad"
          value={stock}
          onChangeText={setStock}
        />

        {/* STEP 4: COLORS */}
        <Text style={[styles.inputLabel, { marginTop: 14 }]}>Step 4: Colors (Comma Separated)</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g. #FF0000, #00FF00, Blue"
          placeholderTextColor="#94A3B8"
          value={colorsInput}
          onChangeText={setColorsInput}
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
                size={36}
                color="#94A3B8"
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
          placeholderTextColor="#94A3B8"
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
            trackColor={{ false: "#E2E8F0", true: "#FF3399" }}
            thumbColor="#ffffff"
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
    backgroundColor: "#FFFFFF",
  },
  loaderContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  card: {
    backgroundColor: "#ffffff",
    padding: 24,
    borderRadius: 24,
    marginBottom: 40,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.05,
    shadowRadius: 15,
    elevation: 3,
    borderWidth: 1,
    borderColor: "#F1F5F9",
  },
  inputLabel: {
    color: "#64748B",
    fontSize: 12,
    fontWeight: "700",
    marginBottom: 8,
    fontFamily: 'Outfit_700',
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  input: {
    backgroundColor: "#F8FAFC",
    padding: 16,
    borderRadius: 12,
    color: "#0F172A",
    fontSize: 15,
    fontFamily: 'Outfit_500',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  multilineInput: {
    height: 120,
    textAlignVertical: "top",
    marginBottom: 28,
  },
  dropdownButton: {
    backgroundColor: "#F8FAFC",
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  dropdownText: {
    color: "#0F172A",
    fontSize: 15,
    fontFamily: 'Outfit_500',
  },
  sizesChipContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginBottom: 20,
  },
  sizeChip: {
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    backgroundColor: "#FFFFFF",
  },
  sizeChipSelected: {
    backgroundColor: "#FF3399",
    borderColor: "#FF3399",
  },
  sizeChipText: {
    fontSize: 14,
    color: "#475569",
    fontFamily: 'Outfit_600',
  },
  sizeChipTextSelected: {
    color: "#ffffff",
  },
  emptySizesText: {
    fontSize: 13,
    color: "#94A3B8",
    fontFamily: 'Outfit_400',
    fontStyle: "italic",
  },
  imagePickerContainer: {
    marginBottom: 20,
    width: "100%",
  },
  uploadPlaceholder: {
    width: "100%",
    height: 120,
    borderRadius: 16,
    backgroundColor: "#F8FAFC",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderStyle: "dashed",
    borderColor: "#CBD5E1",
  },
  uploadPlaceholderText: {
    color: "#64748B",
    fontSize: 13,
    marginTop: 8,
    fontFamily: 'Outfit_500',
  },
  pickedImage: {
    width: 120,
    height: 120,
    borderRadius: 12,
    marginRight: 12,
  },
  switchRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 28,
  },
  switchLabel: {
    color: "#0F172A",
    fontSize: 16,
    fontFamily: 'Outfit_700',
  },
  switchSubLabel: {
    color: "#64748B",
    fontSize: 12,
    marginTop: 6,
    fontFamily: 'Outfit_500',
  },
  submitButton: {
    backgroundColor: "#FF3399",
    paddingVertical: 18,
    borderRadius: 16,
    alignItems: "center",
    shadowColor: "#FF3399",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 5,
    marginTop: 10,
  },
  submitButtonDisabled: {
    opacity: 0.7,
  },
  submitButtonText: {
    color: "#ffffff",
    fontSize: 16,
    fontFamily: 'Outfit_700',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0, 0, 0, 0.4)",
  },
  modalContent: {
    backgroundColor: "#ffffff",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    maxHeight: "60%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 10,
  },
  modalTitle: {
    fontSize: 20,
    textAlign: "center",
    marginBottom: 20,
    color: "#0F172A",
    fontFamily: 'Outfit_800',
  },
  modalItem: {
    paddingVertical: 16,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
    borderRadius: 12,
  },
  modalItemActive: {
    backgroundColor: "#FDF2F8",
    borderBottomColor: "transparent",
  },
  modalItemRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  modalItemText: {
    fontSize: 16,
    color: "#475569",
    fontFamily: 'Outfit_500',
  },
  modalItemTextActive: {
    color: "#FF3399",
    fontFamily: 'Outfit_700',
  },
});
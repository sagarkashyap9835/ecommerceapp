import React, { useEffect, useState } from "react";
import {
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  ActivityIndicator,
  Modal,
  FlatList,
  Pressable,
  StyleSheet,
  Alert,
  Platform,
} from "react-native";
import Toast from "react-native-toast-message";
import { COLORS } from "@/assets/constants";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "@/context/AuthContext";
import api from "../../../../constants/api";
import { Category } from "@/assets/constants/types";

export default function CategoryManagement() {
  const { getToken } = useAuth();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Modal State
  const [modalVisible, setModalVisible] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  // Form State
  const [name, setName] = useState("");
  const [icon, setIcon] = useState("grid-outline");
  const [subcategoriesInput, setSubcategoriesInput] = useState("");
  const [sizesInput, setSizesInput] = useState("");

  const fetchCategories = async () => {
    try {
      const { data } = await api.get("/categories");
      if (data.success) {
        setCategories(data.data);
      }
    } catch (error: any) {
      console.error("Error fetching categories:", error);
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Failed to load categories",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const openAddModal = () => {
    setEditingCategory(null);
    setName("");
    setIcon("grid-outline");
    setSubcategoriesInput("");
    setSizesInput("");
    setModalVisible(true);
  };

  const openEditModal = (cat: Category) => {
    setEditingCategory(cat);
    setName(cat.name);
    setIcon(cat.icon || "grid-outline");
    setSubcategoriesInput(cat.subcategories ? cat.subcategories.join(", ") : "");
    setSizesInput(cat.sizes ? cat.sizes.join(", ") : "");
    setModalVisible(true);
  };

  const handleSave = async () => {
    if (!name.trim()) {
      Toast.show({
        type: "error",
        text1: "Required Field",
        text2: "Category name cannot be empty",
      });
      return;
    }

    setSubmitting(true);
    try {
      const token = await getToken();
      const payload = {
        name: name.trim(),
        icon: icon.trim() || "grid-outline",
        subcategories: subcategoriesInput
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),
        sizes: sizesInput
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),
      };

      if (editingCategory && editingCategory._id) {
        const { data } = await api.put(
          `/categories/${editingCategory._id}`,
          payload,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        if (data.success) {
          Toast.show({
            type: "success",
            text1: "Updated",
            text2: "Category updated successfully",
          });
        }
      } else {
        const { data } = await api.post("/categories", payload, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (data.success) {
          Toast.show({
            type: "success",
            text1: "Created",
            text2: "Category created successfully",
          });
        }
      }

      setModalVisible(false);
      fetchCategories();
    } catch (error: any) {
      console.error("Save category error:", error);
      Toast.show({
        type: "error",
        text1: "Save Failed",
        text2: error.response?.data?.message || "Something went wrong",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (cat: Category) => {
    if (!cat._id) return;
    try {
      const token = await getToken();
      const { data } = await api.delete(`/categories/${cat._id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (data.success) {
        Toast.show({
          type: "success",
          text1: "Category Deleted 🗑️",
          text2: `"${cat.name}" has been deleted`,
        });
        fetchCategories();
      }
    } catch (error: any) {
      console.error("Delete category error:", error);
      Toast.show({
        type: "error",
        text1: "Delete Failed ❌",
        text2: error.response?.data?.message || "Could not delete category",
      });
    }
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={COLORS.primary || "#000"} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header Button */}
      <View style={styles.topBar}>
        <Text style={styles.headerTitle}>Category Taxonomy ({categories.length})</Text>
        <TouchableOpacity style={styles.addBtn} onPress={openAddModal} activeOpacity={0.8}>
          <Ionicons name="add" size={20} color="#ffffff" />
          <Text style={styles.addBtnText}>Add Category</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {categories.map((cat) => (
          <View key={cat._id || cat.name} style={styles.card}>
            <View style={styles.cardHeader}>
              <View style={styles.cardHeaderLeft}>
                <View style={styles.iconCircle}>
                  <Ionicons name={(cat.icon as any) || "grid-outline"} size={20} color="#111827" />
                </View>
                <Text style={styles.categoryTitle}>{cat.name}</Text>
              </View>
              <View style={styles.cardHeaderRight}>
                <TouchableOpacity
                  onPress={() => openEditModal(cat)}
                  style={styles.actionIconBtn}
                >
                  <Ionicons name="pencil" size={18} color="#2563eb" />
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => handleDelete(cat)}
                  style={styles.actionIconBtn}
                >
                  <Ionicons name="trash-outline" size={18} color="#ef4444" />
                </TouchableOpacity>
              </View>
            </View>

            {/* Subcategories Chip List */}
            <Text style={styles.sectionSubLabel}>Subcategories ({cat.subcategories?.length || 0}):</Text>
            <View style={styles.chipContainer}>
              {cat.subcategories && cat.subcategories.length > 0 ? (
                cat.subcategories.map((sub, i) => (
                  <View key={i} style={styles.subChip}>
                    <Text style={styles.subChipText}>{sub}</Text>
                  </View>
                ))
              ) : (
                <Text style={styles.emptyText}>No subcategories defined</Text>
              )}
            </View>

            {/* Sizes Chip List */}
            <Text style={[styles.sectionSubLabel, { marginTop: 10 }]}>Sizes Group ({cat.sizes?.length || 0}):</Text>
            <View style={styles.chipContainer}>
              {cat.sizes && cat.sizes.length > 0 ? (
                cat.sizes.map((sz, i) => (
                  <View key={i} style={styles.sizeChip}>
                    <Text style={styles.sizeChipText}>{sz}</Text>
                  </View>
                ))
              ) : (
                <Text style={styles.emptyText}>No size options defined</Text>
              )}
            </View>
          </View>
        ))}
      </ScrollView>

      {/* Add / Edit Category Modal */}
      <Modal visible={modalVisible} animationType="slide" transparent>
        <Pressable style={styles.modalOverlay} onPress={() => setModalVisible(false)}>
          <Pressable style={styles.modalContent} onPress={(e) => e.stopPropagation()}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {editingCategory ? "Edit Category" : "Add New Category"}
              </Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={24} color="#6b7280" />
              </TouchableOpacity>
            </View>

            <ScrollView style={{ maxHeight: 420 }} showsVerticalScrollIndicator={false}>
              <Text style={styles.inputLabel}>Category Name *</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g. Blazer"
                placeholderTextColor="#9ca3af"
                value={name}
                onChangeText={setName}
              />

              <Text style={styles.inputLabel}>Ionicons Icon Name</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g. coat-outline"
                placeholderTextColor="#9ca3af"
                value={icon}
                onChangeText={setIcon}
              />

              <Text style={styles.inputLabel}>Subcategories (comma separated)</Text>
              <TextInput
                style={[styles.input, styles.multilineInput]}
                placeholder="e.g. Slim Blazer, Casual Blazer, Double Breasted Blazer"
                placeholderTextColor="#9ca3af"
                multiline
                value={subcategoriesInput}
                onChangeText={setSubcategoriesInput}
              />

              <Text style={styles.inputLabel}>Size Options (comma separated)</Text>
              <TextInput
                style={[styles.input, styles.multilineInput]}
                placeholder="e.g. S, M, L, XL, XXL"
                placeholderTextColor="#9ca3af"
                multiline
                value={sizesInput}
                onChangeText={setSizesInput}
              />
            </ScrollView>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.cancelBtn}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.saveBtn, submitting && { opacity: 0.7 }]}
                onPress={handleSave}
                disabled={submitting}
              >
                {submitting ? (
                  <ActivityIndicator color="white" />
                ) : (
                  <Text style={styles.saveBtnText}>Save Category</Text>
                )}
              </TouchableOpacity>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f9fafb",
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f9fafb",
  },
  topBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: "#ffffff",
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#111827",
  },
  addBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#111827",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  addBtnText: {
    color: "#ffffff",
    fontWeight: "600",
    fontSize: 13,
    marginLeft: 4,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  card: {
    backgroundColor: "#ffffff",
    padding: 16,
    borderRadius: 14,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: "#f3f4f6",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 3,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  cardHeaderLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#f3f4f6",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },
  categoryTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: "#111827",
  },
  cardHeaderRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  actionIconBtn: {
    padding: 6,
    borderRadius: 6,
    backgroundColor: "#f9fafb",
  },
  sectionSubLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: "#6b7280",
    marginBottom: 6,
    textTransform: "uppercase",
  },
  chipContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
  },
  subChip: {
    backgroundColor: "#eff6ff",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#bfdbfe",
  },
  subChipText: {
    color: "#1d4ed8",
    fontSize: 12,
    fontWeight: "500",
  },
  sizeChip: {
    backgroundColor: "#f3f4f6",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  sizeChipText: {
    color: "#374151",
    fontSize: 12,
    fontWeight: "600",
  },
  emptyText: {
    fontSize: 12,
    color: "#9ca3af",
    fontStyle: "italic",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#ffffff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111827",
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: "700",
    color: "#6b7280",
    marginBottom: 6,
    textTransform: "uppercase",
  },
  input: {
    backgroundColor: "#f3f4f6",
    padding: 12,
    borderRadius: 8,
    fontSize: 14,
    color: "#111827",
    marginBottom: 14,
  },
  multilineInput: {
    height: 70,
    textAlignVertical: "top",
  },
  modalActions: {
    flexDirection: "row",
    gap: 12,
    marginTop: 16,
  },
  cancelBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#d1d5db",
    alignItems: "center",
  },
  cancelBtnText: {
    color: "#374151",
    fontWeight: "600",
  },
  saveBtn: {
    flex: 1,
    backgroundColor: "#111827",
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
  },
  saveBtnText: {
    color: "#ffffff",
    fontWeight: "600",
  },
});

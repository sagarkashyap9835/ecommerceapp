import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { ScrollView, Text, TouchableOpacity, View, ActivityIndicator, RefreshControl, Image, StyleSheet, Modal, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { COLORS } from "@/assets/constants";
import { useAuth } from "@/context/AuthContext";
import Toast from 'react-native-toast-message';
import api from "../../../../../constants/api";

export default function AdminProducts() {
    const { getToken } = useAuth();
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [products, setProducts] = useState<any[]>([]);

    // Delete Modal State
    const [deleteModalVisible, setDeleteModalVisible] = useState(false);
    const [productToDelete, setProductToDelete] = useState<{ id: string; name: string } | null>(null);
    const [deleting, setDeleting] = useState(false);

    const fetchProducts = async () => {
        try {
            const { data } = await api.get("/products", { params: { limit: 999 } });
            if (data.success) {
                setProducts(data.data);
            }
        } catch (error: any) {
            console.error("failed to fetch products");
            Toast.show({
                type: "error",
                text1: "Failed to fetch products",
                text2: error.response?.data?.message || "Something went wrong"
            });
        }
        finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchProducts();
    }, []);

    const onRefresh = () => {
        setRefreshing(true);
        fetchProducts();
    };

    const confirmDeleteProduct = (id: string, name: string) => {
        setProductToDelete({ id, name });
        setDeleteModalVisible(true);
    };

    const handlePerformDelete = async () => {
        if (!productToDelete) return;
        const deletedName = productToDelete.name;
        try {
            setDeleting(true);
            const token = await getToken();
            const { data } = await api.delete(`/products/${productToDelete.id}`,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            if (data.success) {
                setDeleteModalVisible(false);
                setProductToDelete(null);
                fetchProducts();

                setTimeout(() => {
                    Toast.show({
                        type: "success",
                        text1: "Product Deleted 🗑️",
                        text2: `${deletedName} has been deleted successfully!`,
                        position: "top",
                        visibilityTime: 3500,
                        topOffset: 50,
                    });
                }, 150);
            }
        }
        catch (error: any) {
            Toast.show({
                type: "error",
                text1: "Failed to delete product",
                text2: error.response?.data?.message || "Something went wrong"
            });
        } finally {
            setDeleting(false);
        }
    };

    if (loading && !refreshing) {
        return (
            <View style={styles.centerComponent}>
                <ActivityIndicator size="large" color="#FF3399" />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            {/* Top Stats Bar */}
            <View style={styles.topBar}>
                <Text style={styles.topBarTitle}>Total Products ({products.length})</Text>
                <TouchableOpacity
                    activeOpacity={0.8}
                    onPress={() => router.push("/admin/products/add")}
                    style={styles.addButton}
                >
                    <Ionicons name="add" size={20} color="white" />
                    <Text style={styles.addButtonText}>Add Product</Text>
                </TouchableOpacity>
            </View>

            {/* Products List */}
            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
            >
                {products.length === 0 ? (
                    <View style={styles.emptyComponent}>
                        <Text style={styles.secondaryText}>No products found</Text>
                    </View>
                ) : (
                    products.map((product: any) => (
                        <View key={product._id} style={styles.productCard}>
                            <Image
                                source={{ uri: product.images && product.images.length > 0 ? product.images[0] : 'https://placehold.co/150x150/png?text=Product' }}
                                style={styles.productImage}
                                resizeMode="cover"
                            />

                            <View style={styles.productDetails}>
                                <Text style={styles.productName} numberOfLines={1}>{product.name}</Text>
                                <Text style={styles.productMetaText} numberOfLines={1}>Category: {product.category || 'Others'}</Text>
                                <Text style={styles.productMetaText} numberOfLines={1}>Stock: {product.stock}</Text>
                                <Text style={styles.productMetaText} numberOfLines={1}>Sizes: {product.sizes?.join(", ") || 'N/A'}</Text>
                                <Text style={styles.productPrice}>${product.price.toFixed(2)}</Text>
                            </View>

                            <View style={styles.actionButtons}>
                                <TouchableOpacity
                                    activeOpacity={0.7}
                                    onPress={() => router.push(`/admin/products/edit/${product._id}`)}
                                    style={styles.editButton}
                                >
                                    <Ionicons name="create-outline" size={18} color="#FF3399" />
                                </TouchableOpacity>
                                <TouchableOpacity
                                    activeOpacity={0.7}
                                    onPress={() => confirmDeleteProduct(product._id, product.name)}
                                    style={styles.deleteButton}
                                >
                                    <Ionicons name="trash-outline" size={18} color="#EF4444" />
                                </TouchableOpacity>
                            </View>
                        </View>
                    ))
                )}
            </ScrollView>

            {/* DELETE CONFIRMATION MODAL */}
            <Modal visible={deleteModalVisible} animationType="fade" transparent>
                <Pressable style={styles.modalOverlay} onPress={() => setDeleteModalVisible(false)}>
                    <Pressable style={styles.modalContent} onPress={(e) => e.stopPropagation()}>
                        <View style={styles.modalHeaderBox}>
                            <View style={styles.trashIconBg}>
                                <Ionicons name="trash-outline" size={24} color="#EF4444" />
                            </View>
                            <Text style={styles.modalTitle}>Delete Product</Text>
                            <Text style={styles.modalSubtitle}>
                                Are you sure you want to delete <Text style={{ fontFamily: 'Outfit_700', color: '#0F172A' }}>"{productToDelete?.name}"</Text>? This action cannot be undone.
                            </Text>
                        </View>
                        <View style={styles.modalActions}>
                            <TouchableOpacity
                                style={styles.cancelBtn}
                                onPress={() => setDeleteModalVisible(false)}
                                disabled={deleting}
                            >
                                <Text style={styles.cancelBtnText}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={styles.deleteConfirmBtn}
                                onPress={handlePerformDelete}
                                disabled={deleting}
                            >
                                {deleting ? (
                                    <ActivityIndicator size="small" color="#ffffff" />
                                ) : (
                                    <Text style={styles.deleteConfirmBtnText}>Delete</Text>
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
        backgroundColor: '#FFFFFF',
    },
    centerComponent: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
    },
    topBar: {
        paddingHorizontal: 20,
        paddingTop: 16,
        paddingBottom: 16,
        backgroundColor: '#FFFFFF',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    topBarTitle: {
        fontSize: 22,
        fontWeight: '800',
        color: '#000000',
        fontFamily: 'Outfit_800',
    },
    addButton: {
        backgroundColor: '#FF3399',
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 9999,
        flexDirection: 'row',
        alignItems: 'center',
        shadowColor: '#FF3399',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 6,
        elevation: 4,
    },
    addButtonText: {
        color: '#ffffff',
        fontWeight: '600',
        marginLeft: 4,
        fontFamily: 'Outfit_600',
        fontSize: 14,
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        padding: 20,
        paddingBottom: 40,
    },
    emptyComponent: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 80,
    },
    secondaryText: {
        color: '#94A3B8',
        fontSize: 15,
        fontFamily: 'Outfit_500',
    },
    productCard: {
        backgroundColor: '#FFFFFF',
        padding: 16,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: '#F1F5F9',
        marginBottom: 16,
        flexDirection: 'row',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.04,
        shadowRadius: 8,
        elevation: 2,
    },
    productImage: {
        width: 72,
        height: 72,
        borderRadius: 16,
        backgroundColor: '#F8FAFC',
        marginRight: 16,
        borderWidth: 1,
        borderColor: '#F1F5F9',
    },
    productDetails: {
        flex: 1,
    },
    productName: {
        fontWeight: '700',
        color: '#0F172A',
        fontSize: 16,
        fontFamily: 'Outfit_700',
        marginBottom: 4,
    },
    productMetaText: {
        color: '#64748B',
        fontSize: 12,
        marginBottom: 2,
        fontFamily: 'Outfit_500',
    },
    productPrice: {
        color: '#0F172A',
        fontWeight: '800',
        fontSize: 15,
        marginTop: 6,
        fontFamily: 'Outfit_800',
    },
    actionButtons: {
        flexDirection: 'column',
        alignItems: 'center',
        gap: 10,
    },
    editButton: {
        padding: 10,
        backgroundColor: '#FDF2F8',
        borderRadius: 9999,
    },
    deleteButton: {
        padding: 10,
        backgroundColor: '#FEF2F2',
        borderRadius: 9999,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.4)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    modalContent: {
        width: '100%',
        maxWidth: 360,
        backgroundColor: '#ffffff',
        borderRadius: 24,
        padding: 28,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.1,
        shadowRadius: 20,
        elevation: 10,
    },
    modalHeaderBox: {
        alignItems: 'center',
        marginBottom: 24,
    },
    trashIconBg: {
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: '#FEF2F2',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: '800',
        color: '#0F172A',
        marginBottom: 8,
        fontFamily: 'Outfit_800',
    },
    modalSubtitle: {
        fontSize: 14,
        color: '#64748B',
        textAlign: 'center',
        lineHeight: 22,
        fontFamily: 'Outfit_500',
    },
    modalActions: {
        flexDirection: 'row',
        width: '100%',
        gap: 12,
    },
    cancelBtn: {
        flex: 1,
        paddingVertical: 12,
        borderRadius: 12,
        backgroundColor: '#F8FAFC',
        alignItems: 'center',
    },
    cancelBtnText: {
        color: '#475569',
        fontWeight: '600',
        fontSize: 14,
        fontFamily: 'Outfit_600',
    },
    deleteConfirmBtn: {
        flex: 1,
        backgroundColor: '#EF4444',
        paddingVertical: 12,
        borderRadius: 12,
        alignItems: 'center',
        shadowColor: '#EF4444',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 6,
        elevation: 3,
    },
    deleteConfirmBtnText: {
        color: '#ffffff',
        fontWeight: '700',
        fontSize: 14,
        fontFamily: 'Outfit_700',
    },
});
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { ScrollView, Text, TouchableOpacity, View, ActivityIndicator, RefreshControl, Image, Alert, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { COLORS } from "@/assets/constants";
// import { dummyProducts } from "@/assets/assets";
import { useAuth } from "@clerk/expo";
import api from "../../../../../constants/api";

export default function AdminProducts() {
    const {getToken}=useAuth()
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [products, setProducts] = useState([]);

    const fetchProducts = async () => {
      try {
        const {data}=await api.get("/products",{params:{limit:999}})
        if(data.success){
            setProducts(data.data)
        }
      } catch (error:any) {
        console.error("failed to fetch products")
        Toast.show({
            type:"error",
            text1:"failed to fetch products",
            text2:error.response?.data?.message || "something went wrong"
        })
      }
      finally:{
        setLoading(false)
        setRefreshing(false)
      }
    };

    useEffect(() => {
        fetchProducts();
    }, []);

    const onRefresh = () => {
        setRefreshing(true);
        fetchProducts();
    };

    const performDelete = async (id: string) => {
      try {
        const token=await getToken()
        const {data}=await api.delete(`/products/$id`,
            {headers:{Authorization:`Bearer ${token}`}}
        )
        if(data.success){
            Toast.show({
                type:"success",
                text1:"success",
                text2:"Product deleted"
            })
            fetchProducts()
        }
      } 
      catch (error:any) {
        Toast.show({
              type:"error",
                text1:"failed to  delete product",
                text2:error.response?.data?.message || "something went wrong"
        })
      }
    };

    const deleteProduct = async (id: string) => {
        Alert.alert(
            "Delete Product",
            "Are you sure you want to delete this product?",
            [
                { text: "Cancel", style: "cancel" as const },
                {
                    text: "Delete",
                    style: "destructive" as const,
                    onPress: () => performDelete(id)
                }
            ]
        );
    };

    if (loading && !refreshing) {
        return (
            <View style={styles.centerComponent}>
                <ActivityIndicator size="large" color={COLORS.primary || '#000'} />
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
                                source={{ uri: product.images && product.images.length > 0 ? product.images[0] : 'https://via.placeholder.com/150' }}
                                style={styles.productImage}
                                resizeMode="cover"
                            />

                            <View style={styles.productDetails}>
                                <Text style={styles.productName} numberOfLines={1}>{product.name}</Text>
                                <Text style={styles.productMetaText} numberOfLines={1}>Category : {product.category || 'Others'}</Text>
                                <Text style={styles.productMetaText} numberOfLines={1}>Stock : {product.stock}</Text>
                                <Text style={styles.productMetaText} numberOfLines={1}>Sizes : {product.sizes?.join(", ") || 'N/A'}</Text>
                                <Text style={styles.productPrice}>${product.price.toFixed(2)}</Text>
                            </View>

                            <View style={styles.actionButtons}>
                                <TouchableOpacity
                                    activeOpacity={0.7}
                                    onPress={() => router.push(`/admin/products/edit/${product._id}`)}
                                    style={styles.editButton}
                                >
                                    <Ionicons name="create-outline" size={18} color="#333333" />
                                </TouchableOpacity>
                                <TouchableOpacity
                                    activeOpacity={0.7}
                                    onPress={() => deleteProduct(product._id)}
                                    style={styles.deleteButton}
                                >
                                    <Ionicons name="trash-outline" size={18} color="#333333" />
                                </TouchableOpacity>
                            </View>
                        </View>
                    ))
                )}
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f9fafb', // surface color
    },
    centerComponent: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f9fafb',
    },
    topBar: {
        padding: 16,
        backgroundColor: '#ffffff',
        borderWidth: 1,
        borderColor: '#f3f4f6', // gray-100
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    topBarTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#111827', // primary text
    },
    addButton: {
        backgroundColor: '#1f2937', // gray-800
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 9999,
        flexDirection: 'row',
        alignItems: 'center',
    },
    addButtonText: {
        color: '#ffffff',
        fontWeight: '500',
        marginLeft: 4,
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        padding: 8,
        paddingBottom: 32,
    },
    emptyComponent: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 80,
    },
    secondaryText: {
        color: '#6b7280', // secondary color
        fontSize: 15,
    },
    productCard: {
        backgroundColor: '#ffffff',
        padding: 12,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#f3f4f6',
        marginBottom: 12,
        flexDirection: 'row',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.02,
        shadowRadius: 2,
        elevation: 1,
    },
    productImage: {
        width: 64,
        height: 64,
        borderRadius: 8,
        backgroundColor: '#f3f4f6',
        marginRight: 12,
    },
    productDetails: {
        flex: 1,
    },
    productName: {
        fontWeight: '700',
        color: '#111827',
        fontSize: 16,
    },
    productMetaText: {
        color: '#6b7280',
        fontSize: 12,
        marginBottom: 2,
    },
    productPrice: {
        color: '#111827',
        fontWeight: '700',
        fontSize: 14,
        marginTop: 2,
    },
    actionButtons: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    editButton: {
        padding: 8,
        backgroundColor: '#f1f5f9', // slate-50
        borderRadius: 9999,
        marginRight: 8,
    },
    deleteButton: {
        padding: 8,
        backgroundColor: '#f9fafb', // gray-50
        borderRadius: 9999,
    },
});
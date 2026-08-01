import React, { useState } from "react";
import { ScrollView, Text, TextInput, TouchableOpacity, View, Switch, Image, ActivityIndicator, Modal, FlatList, TouchableWithoutFeedback, StyleSheet } from "react-native";
import Toast from 'react-native-toast-message';
import { COLORS } from "@/assets/constants";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { CATEGORIES } from "@/assets/constants";
import { useRouter } from "expo-router";
import { useAuth } from "@clerk/expo";
import api from "../../../../../constants/api";

export default function AddProduct() {
    const router=useRouter()
    const {getToken}=useAuth()
    const [submitting, setSubmitting] = useState(false);
    const [modalVisible, setModalVisible] = useState(false);

    // Form state
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [price, setPrice] = useState("");
    const [stock, setStock] = useState("");
    const [category, setCategory] = useState("Men");
    const [sizes, setSizes] = useState("");
    const [images, setImages] = useState<string[]>([]);
    const [isFeatured, setIsFeatured] = useState(false);

    // PICK MULTIPLE IMAGES (MAX 5)
    const pickImages = async () => {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
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
        if (!name || !price || !category || sizes.length < 1) {
            Toast.show({
                type: 'error',
                text1: 'Missing Fields',
                text2: 'Please fill in all required fields'
            });
            return;
        }

        setSubmitting(true);
        const token = await getToken();
        const formData = new FormData();

        const fields = {
            name, description, price,
            stock: stock || '0',
            category,
            isFeatured: String(isFeatured),
            sizes
        }

        Object.entries(fields).forEach(([key, value]) => {
            formData.append(key, value)
        })

        for (const [i, uri] of images.entries()) {
            const filename = `image-${i}.jpg`;

            formData.append("images", {
                uri,
                name: filename,
                type: "image/jpeg"
            } as any)
        }

        try {
            const { data } = await api.post("/products/add", formData, {
                headers: { Authorization: `Bearer ${token}` },
            })

            if (!data?.success) throw new Error("Upload failed")

            Toast.show({
                type: 'success',
                text1: 'Success',
                text2: 'Product created'
            })
            router.replace("/admin/products")

        } catch (error: any) {
            console.error(error);
            Toast.show({
                type: 'error',
                text1: 'Failed to Create Product',
                text2: error.response?.data?.message || 'Something went wrong'
            })
        } finally {
            setSubmitting(false)
        }
    };

    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
            <View style={styles.card}>
                {/* NAME */}
                <Text style={styles.inputLabel}>Product Name *</Text>
                <TextInput
                    style={styles.input}
                    placeholder="e.g. Wireless Headphones"
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

                {/* CATEGORY */}
                <Text style={styles.inputLabel}>Category</Text>
                <TouchableOpacity
                    activeOpacity={0.7}
                    onPress={() => setModalVisible(true)}
                    style={styles.dropdownButton}
                >
                    <Text style={styles.dropdownText}>{category}</Text>
                    <Ionicons name="chevron-down" size={20} color={COLORS.secondary || '#6b7280'} />
                </TouchableOpacity>

                {/* CATEGORY MODAL */}
                <Modal visible={modalVisible} animationType="slide" transparent>
                    <TouchableWithoutFeedback onPress={() => setModalVisible(false)}>
                        <View style={styles.modalOverlay}>
                            <View style={styles.modalContent}>
                                <Text style={styles.modalTitle}>Select Category</Text>

                                <FlatList
                                    data={CATEGORIES}
                                    keyExtractor={(item) => String(item.id)}
                                    renderItem={({ item }) => {
                                        const isSelected = category === item.name;
                                        return (
                                            <TouchableOpacity
                                                activeOpacity={0.8}
                                                style={[
                                                    styles.modalItem,
                                                    isSelected && styles.modalItemActive
                                                ]}
                                                onPress={() => {
                                                    setCategory(item.name);
                                                    setModalVisible(false);
                                                }}
                                            >
                                                <View style={styles.modalItemRow}>
                                                    <Text style={[
                                                        styles.modalItemText,
                                                        isSelected && styles.modalItemTextActive
                                                    ]}>
                                                        {item.name}
                                                    </Text>
                                                    {isSelected && (
                                                        <Ionicons
                                                            name="checkmark"
                                                            size={20}
                                                            color={COLORS.primary || '#000'}
                                                        />
                                                    )}
                                                </View>
                                            </TouchableOpacity>
                                        );
                                    }}
                                />
                            </View>
                        </View>
                    </TouchableWithoutFeedback>
                </Modal>

                {/* STOCK */}
                <Text style={styles.inputLabel}>Stock Level</Text>
                <TextInput
                    style={styles.input}
                    placeholder="0"
                    placeholderTextColor="#9ca3af"
                    keyboardType="number-pad"
                    value={stock}
                    onChangeText={setStock}
                />

                {/* SIZES */}
                <Text style={styles.inputLabel}>Sizes (comma separated)</Text>
                <TextInput
                    style={styles.input}
                    placeholder="e.g. S, M, L, XL"
                    placeholderTextColor="#9ca3af"
                    value={sizes}
                    onChangeText={setSizes}
                />

                {/* IMAGE PICKER */}
                <Text style={styles.inputLabel}>Product Images (max 5)</Text>
                <TouchableOpacity onPress={pickImages} activeOpacity={0.8} style={styles.imagePickerContainer}>
                    {images.length > 0 ? (
                        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                            {images.map((uri, i) => (
                                <Image
                                    key={i}
                                    source={{ uri }}
                                    style={styles.pickedImage}
                                />
                            ))}
                        </ScrollView>
                    ) : (
                        <View style={styles.uploadPlaceholder}>
                            <Ionicons
                                name="cloud-upload-outline"
                                size={32}
                                color={COLORS.secondary || '#6b7280'}
                            />
                            <Text style={styles.uploadPlaceholderText}>Tap to upload images</Text>
                        </View>
                    )}
                </TouchableOpacity>

                {/* DESCRIPTION */}
                <Text style={styles.inputLabel}>Description</Text>
                <TextInput
                    style={[styles.input, styles.multilineInput]}
                    placeholder="Enter product specifications..."
                    placeholderTextColor="#9ca3af"
                    multiline
                    value={description}
                    onChangeText={setDescription}
                />

                {/* FEATURED */}
                <View style={styles.switchRow}>
                    <Text style={styles.switchLabel}>Featured Product</Text>
                    <Switch
                        value={isFeatured}
                        onValueChange={setIsFeatured}
                        trackColor={{ false: "#eee", true: COLORS.primary || '#000' }}
                    />
                </View>

                {/* SUBMIT BUTTON */}
                <TouchableOpacity
                    onPress={handleSubmit}
                    disabled={submitting}
                    activeOpacity={0.8}
                    style={[
                        styles.submitButton, 
                        submitting && styles.submitButtonDisabled
                    ]}
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
        backgroundColor: '#f9fafb', // surface color
    },
    scrollContent: {
        padding: 16,
    },
    card: {
        backgroundColor: '#ffffff',
        padding: 16,
        borderRadius: 12,
        marginBottom: 80, // ताकि कीबोर्ड और बॉटम स्पेसिंग बनी रहे
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.03,
        shadowRadius: 2,
        elevation: 2,
        borderWidth: 1,
        borderColor: '#f3f4f6',
    },
    inputLabel: {
        color: '#6b7280', // secondary text
        fontSize: 12,
        fontWeight: '700',
        marginBottom: 6,
        textTransform: 'uppercase',
    },
    input: {
        backgroundColor: '#f3f4f6', // surface input bg
        padding: 14,
        borderRadius: 8,
        color: '#111827', // primary text
        fontSize: 15,
        marginBottom: 16,
    },
    multilineInput: {
        height: 96,
        textAlignVertical: 'top',
        marginBottom: 24,
    },
    dropdownButton: {
        backgroundColor: '#f3f4f6',
        padding: 14,
        borderRadius: 8,
        marginBottom: 16,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    dropdownText: {
        color: '#111827',
        fontSize: 15,
    },
    imagePickerContainer: {
        marginBottom: 16,
        width: '100%',
    },
    uploadPlaceholder: {
        width: '100%',
        height: 128,
        borderRadius: 8,
        backgroundColor: '#f3f4f6', // gray-100
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderStyle: 'dashed',
        borderColor: '#d1d5db', // gray-300
    },
    uploadPlaceholderText: {
        color: '#6b7280',
        fontSize: 12,
        marginTop: 8,
    },
    pickedImage: {
        width: 128,
        height: 128,
        borderRadius: 8,
        marginRight: 8,
    },
    switchRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 24,
    },
    switchLabel: {
        color: '#111827',
        fontWeight: '700',
        fontSize: 15,
    },
    submitButton: {
        backgroundColor: '#000000', // primary app color
        paddingVertical: 16,
        borderRadius: 12,
        alignItems: 'center',
    },
    submitButtonDisabled: {
        opacity: 0.7,
    },
    submitButtonText: {
        color: '#ffffff',
        fontWeight: '700',
        fontSize: 18,
    },
    // Modal internal styles
    modalOverlay: {
        flex: 1,
        justifyContent: 'flex-end',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalContent: {
        backgroundColor: '#ffffff',
        borderTopLeftRadius: 16,
        borderTopRightRadius: 16,
        padding: 16,
        maxHeight: '50%',
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: '700',
        textAlign: 'center',
        marginBottom: 16,
        color: '#111827',
    },
    modalItem: {
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#f3f4f6',
    },
    modalItemActive: {
        backgroundColor: 'rgba(0, 0, 0, 0.03)', // subtle background for selection
    },
    modalItemRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    modalItemText: {
        fontSize: 15,
        color: '#111827',
    },
    modalItemTextActive: {
        fontWeight: '700',
        color: '#000000',
    },
});
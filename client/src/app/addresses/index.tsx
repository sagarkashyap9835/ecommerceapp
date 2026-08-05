import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import { ScrollView, Text, TouchableOpacity, View, Modal, TextInput, ActivityIndicator, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Header from "../../../components/Header";
import { COLORS } from "@/assets/constants";
import type { Address } from "@/assets/constants/types";
import { useAuth } from "@/context/AuthContext";
import Toast from "react-native-toast-message";
import api from "../../../constants/api";

export default function Addresses() {
    const { getToken } = useAuth();
    const [addresses, setAddresses] = useState<Address[]>([]);
    const [loading, setLoading] = useState(true);
    const [modalVisible, setModalVisible] = useState(false);

    // Form state
    const [type, setType] = useState("Home");
    const [villageHouseCode, setVillageHouseCode] = useState("");
    const [street, setStreet] = useState("");
    const [city, setCity] = useState("");
    const [state, setState] = useState("");
    const [zipCode, setZipCode] = useState("");
    const [country, setCountry] = useState("");
    const [isDefault, setIsDefault] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    // Edit state
    const [isEditing, setIsEditing] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);

    const fetchAddresses = async () => {
        try {
            setLoading(true);
            const token = await getToken();
            const { data } = await api.get("/address", {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (data.success) {
                setAddresses(data.data);
            }
        } catch (error: any) {
            console.error("Error fetching addresses:", error);
            Toast.show({
                type: "error",
                text1: "Failed to Fetch Addresses",
                text2: error.response?.data?.message || "Something went wrong"
            });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAddresses();
    }, []);

    const handleEditSearch = (item: Address) => {
        setIsEditing(true);
        setEditingId(item._id);
        setType(item.type);
        setVillageHouseCode(item.villageHouseCode || "");
        setStreet(item.street);
        setCity(item.city);
        setState(item.state);
        setZipCode(item.zipCode);
        setCountry(item.country);
        setIsDefault(item.isDefault);
        setModalVisible(true);
    };

    const handleSaveAddress = async () => {
        if (!street || !city || !state || !zipCode || !country) {
            Toast.show({
                type: "error",
                text1: "Missing Fields",
                text2: "Please fill in all required address fields."
            });
            return;
        }

        // Format street to include village house code if provided and not already present
        let formattedStreet = street.trim();
        const cleanCode = villageHouseCode.trim();
        if (cleanCode && !formattedStreet.toLowerCase().includes("house #") && !formattedStreet.toLowerCase().includes(cleanCode)) {
            formattedStreet = `House #${cleanCode}, ${formattedStreet}`;
        }

        try {
            setSubmitting(true);
            const token = await getToken();
            const payload = {
                type,
                villageHouseCode: cleanCode,
                street: formattedStreet,
                city: city.trim(),
                state: state.trim(),
                zipCode: zipCode.trim(),
                country: country.trim(),
                isDefault
            };

            if (isEditing && editingId) {
                const { data } = await api.put(`/address/${editingId}`, payload, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                if (data.success) {
                    Toast.show({
                        type: "success",
                        text1: "Success",
                        text2: "Address saved successfully"
                    });
                }
            } else {
                const { data } = await api.post("/address", payload, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                if (data.success) {
                    Toast.show({
                        type: "success",
                        text1: "Success",
                        text2: "Address saved successfully"
                    });
                }
            }

            fetchAddresses();
            setModalVisible(false);
            resetForm();
        } catch (error: any) {
            console.error("Error saving address:", error);
            Toast.show({
                type: "error",
                text1: "Failed to Save",
                text2: error.response?.data?.message || "Something went wrong"
            });
        } finally {
            setSubmitting(false);
        }
    };

    const handleDeleteAddress = async (id: string) => {
        try {
            const token = await getToken();
            const { data } = await api.delete(`/address/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (data.success) {
                Toast.show({
                    type: "success",
                    text1: "Success",
                    text2: "Address deleted"
                });
                fetchAddresses();
            }
        } catch (error: any) {
            console.error("Error deleting address:", error);
            Toast.show({
                type: "error",
                text1: "Failed to Delete",
                text2: error.response?.data?.message || "Something went wrong"
            });
        }
    };

    const resetForm = () => {
        setStreet("");
        setCity("");
        setState("");
        setZipCode("");
        setCountry("");
        setType("Home");
        setIsDefault(false);
        setIsEditing(false);
        setEditingId(null);
    };

    const openAddModal = () => {
        resetForm();
        setModalVisible(true);
    };

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <Header title="Shipping Addresses" showBack />

            {loading ? (
                <View style={styles.centerComponent}>
                    <ActivityIndicator size="large" color={COLORS.primary || '#000'} />
                </View>
            ) : (
                <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
                    {addresses.length === 0 ? (
                        <Text style={styles.noAddressText}>No addresses found</Text>
                    ) : (
                        addresses.map((item) => (
                            <View key={item._id} style={styles.addressCard}>
                                <View style={styles.addressHeader}>
                                    <View style={styles.row}>
                                        <Ionicons
                                            name={item.type === "Home" ? "home-outline" : "briefcase-outline"}
                                            size={20}
                                            color={COLORS.primary || '#000'}
                                        />
                                        <Text style={styles.addressTypeText}>{item.type}</Text>
                                        {item.isDefault && (
                                            <View style={styles.defaultBadge}>
                                                <Text style={styles.defaultBadgeText}>Default</Text>
                                            </View>
                                        )}
                                    </View>
                                    <View style={styles.actionButtons}>
                                        <TouchableOpacity onPress={() => handleEditSearch(item)} activeOpacity={0.7} style={styles.actionBtnMargin}>
                                            <Ionicons name="pencil-outline" size={20} color={COLORS.secondary || '#6b7280'} />
                                        </TouchableOpacity>
                                        <TouchableOpacity onPress={() => handleDeleteAddress(item._id)} activeOpacity={0.7}>
                                            <Ionicons name="trash-outline" size={20} color="#EF4444" />
                                        </TouchableOpacity>
                                    </View>
                                </View>
                                {item.villageHouseCode ? (
                                    <View style={{ backgroundColor: "#ECFDF5", paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6, marginVertical: 4, alignSelf: "flex-start", marginLeft: 28, borderWidth: 1, borderColor: "#A7F3D0" }}>
                                        <Text style={{ fontSize: 12, fontWeight: "700", color: "#065F46" }}>
                                            🏡 House / Gram Code: #{item.villageHouseCode}
                                        </Text>
                                    </View>
                                ) : null}
                                <Text style={styles.addressDetailText}>
                                    {item.street}, {item.city}, {item.state} {item.zipCode}, {item.country}
                                </Text>
                            </View>
                        ))
                    )}

                    <TouchableOpacity style={styles.addAddressCard} onPress={openAddModal} activeOpacity={0.8}>
                        <Ionicons name="add" size={24} color={COLORS.secondary || '#6b7280'} />
                        <Text style={styles.addAddressText}>Add New Address</Text>
                    </TouchableOpacity>
                </ScrollView>
            )}

            {/* Add/Edit Address Modal */}
            <Modal animationType="slide" transparent={true} visible={modalVisible} onRequestClose={() => setModalVisible(false)}>
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>{isEditing ? "Edit Address" : "Add New Address"}</Text>
                            <TouchableOpacity onPress={() => setModalVisible(false)} activeOpacity={0.7}>
                                <Ionicons name="close" size={24} color={COLORS.primary || '#000'} />
                            </TouchableOpacity>
                        </View>

                        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.modalScrollContent}>
                            <Text style={styles.inputLabel}>Label</Text>
                            <View style={styles.labelContainer}>
                                {["Home", "Work", "Other"].map((t) => (
                                    <TouchableOpacity 
                                        key={t} 
                                        onPress={() => setType(t)} 
                                        activeOpacity={0.9}
                                        style={[
                                            styles.labelButton, 
                                            type === t ? styles.labelButtonActive : styles.labelButtonInactive
                                        ]}
                                    >
                                        <Text style={type === t ? styles.labelTextActive : styles.labelTextInactive}>{t}</Text>
                                    </TouchableOpacity>
                                ))}
                            </View>

                            <Text style={styles.inputLabel}>Village / Gram House Code (e.g. 1, 2, 3...)</Text>
                            <TextInput 
                                style={styles.input} 
                                placeholder="e.g. House #1, #2, #5" 
                                placeholderTextColor="#9ca3af"
                                value={villageHouseCode} 
                                onChangeText={setVillageHouseCode} 
                            />

                            <Text style={styles.inputLabel}>Street Address / Landmark</Text>
                            <TextInput 
                                style={styles.input} 
                                placeholder="Near Gram Panchayat / Main Road" 
                                placeholderTextColor="#9ca3af"
                                value={street} 
                                onChangeText={setStreet} 
                            />

                            <View style={styles.inputRow}>
                                <View style={styles.flex1}>
                                    <Text style={styles.inputLabel}>City</Text>
                                    <TextInput 
                                        style={styles.input} 
                                        placeholder="New York" 
                                        placeholderTextColor="#9ca3af"
                                        value={city} 
                                        onChangeText={setCity} 
                                    />
                                </View>
                                <View style={styles.flex2}>
                                    <Text style={styles.inputLabel}>State</Text>
                                    <TextInput 
                                        style={styles.input} 
                                        placeholder="NY" 
                                        placeholderTextColor="#9ca3af"
                                        value={state} 
                                        onChangeText={setState} 
                                    />
                                </View>
                            </View>

                            <View style={styles.inputRow}>
                                <View style={styles.flex1}>
                                    <Text style={styles.inputLabel}>Zip Code</Text>
                                    <TextInput 
                                        style={styles.input} 
                                        placeholder="10001" 
                                        placeholderTextColor="#9ca3af"
                                        value={zipCode} 
                                        onChangeText={setZipCode} 
                                        keyboardType="numeric" 
                                    />
                                </View>
                                <View style={styles.flex2}>
                                    <Text style={styles.inputLabel}>Country</Text>
                                    <TextInput 
                                        style={styles.input} 
                                        placeholder="USA" 
                                        placeholderTextColor="#9ca3af"
                                        value={country} 
                                        onChangeText={setCountry} 
                                    />
                                </View>
                            </View>

                            <TouchableOpacity style={styles.checkboxContainer} onPress={() => setIsDefault(!isDefault)} activeOpacity={0.8}>
                                <View style={[
                                    styles.checkbox, 
                                    isDefault ? styles.checkboxChecked : styles.checkboxUnchecked
                                ]}>
                                    {isDefault && <Ionicons name="checkmark" size={14} color="white" />}
                                </View>
                                <Text style={styles.checkboxLabel}>Set as default address</Text>
                            </TouchableOpacity>

                            <TouchableOpacity 
                                style={[styles.submitButton, submitting && { backgroundColor: '#4b5563' }]} 
                                onPress={handleSaveAddress} 
                                disabled={submitting} 
                                activeOpacity={0.8}
                            >
                                {submitting ? (
                                    <ActivityIndicator color="white" />
                                ) : (
                                    <Text style={styles.submitButtonText}>Save Address</Text>
                                )}
                            </TouchableOpacity>
                        </ScrollView>
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f9fafb',
    },
    centerComponent: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        paddingHorizontal: 16,
        paddingTop: 16,
    },
    noAddressText: {
        textAlign: 'center',
        color: '#6b7280',
        marginTop: 40,
        fontSize: 15,
    },
    addressCard: {
        backgroundColor: '#ffffff',
        padding: 16,
        borderRadius: 12,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: '#e5e7eb',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 2,
    },
    addressHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 8,
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    addressTypeText: {
        fontSize: 16,
        fontWeight: '700',
        color: '#111827',
        marginLeft: 8,
    },
    defaultBadge: {
        backgroundColor: '#eff6ff', 
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 4,
        marginLeft: 8,
    },
    defaultBadgeText: {
        color: '#1d4ed8', 
        fontSize: 12,
        fontWeight: '700',
    },
    actionButtons: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    actionBtnMargin: {
        marginRight: 16,
    },
    addressDetailText: {
        color: '#4b5563',
        fontSize: 14,
        lineHeight: 20,
        marginLeft: 28, 
    },
    addAddressCard: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
        borderWidth: 1,
        borderStyle: 'dashed',
        borderColor: '#d1d5db',
        borderRadius: 12,
        marginTop: 8,
        marginBottom: 32,
    },
    addAddressText: {
        color: '#4b5563',
        fontWeight: '500',
        marginLeft: 8,
        fontSize: 15,
    },
    modalOverlay: {
        flex: 1,
        justifyContent: 'flex-end',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalContent: {
        backgroundColor: '#ffffff',
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        padding: 24,
        height: '85%',
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 24,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: '#111827',
    },
    modalScrollContent: {
        paddingBottom: 40,
    },
    inputLabel: {
        color: '#111827',
        fontWeight: '500',
        marginBottom: 8,
        fontSize: 14,
    },
    labelContainer: {
        flexDirection: 'row',
        marginBottom: 16,
    },
    labelButton: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 9999,
        borderWidth: 1,
        marginRight: 12,
    },
    labelButtonActive: {
        backgroundColor: '#000000', 
        borderColor: '#000000',
    },
    labelButtonInactive: {
        backgroundColor: '#ffffff',
        borderColor: '#d1d5db',
    },
    labelTextActive: {
        color: '#ffffff',
        fontWeight: '500',
    },
    labelTextInactive: {
        color: '#111827',
    },
    input: {
        backgroundColor: '#f3f4f6', 
        padding: 16,
        borderRadius: 12,
        color: '#111827',
        fontSize: 15,
        marginBottom: 16,
    },
    inputRow: {
        flexDirection: 'row',
    },
    flex1: {
        flex: 1,
        marginRight: 8,
    },
    flex2: {
        flex: 1,
        marginLeft: 8,
    },
    checkboxContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 32,
        marginTop: 8,
    },
    checkbox: {
        width: 20,
        height: 20,
        borderWidth: 1,
        borderRadius: 4,
        marginRight: 8,
        alignItems: 'center',
        justifyContent: 'center',
    },
    checkboxChecked: {
        backgroundColor: '#000000',
        borderColor: '#000000',
    },
    checkboxUnchecked: {
        borderColor: '#d1d5db',
    },
    checkboxLabel: {
        color: '#111827',
        fontSize: 14,
    },
    submitButton: {
        width: '100%',
        backgroundColor: '#000000',
        paddingVertical: 16,
        borderRadius: 9999,
        alignItems: 'center',
        marginBottom: 20,
    },
    submitButtonText: {
        color: '#ffffff',
        fontWeight: '700',
        fontSize: 18,
    },
});

import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { ScrollView, Text, TouchableOpacity, View, ActivityIndicator, RefreshControl, StyleSheet, Modal, Pressable, TextInput } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import Toast from 'react-native-toast-message';
import api from "../../../../constants/api";
import { useAuth } from "@/context/AuthContext";

export default function AdminSales() {
    const { getToken } = useAuth();
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [sales, setSales] = useState<any[]>([]);

    const [modalVisible, setModalVisible] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    // Form Stats
    const [saleId, setSaleId] = useState("");
    const [name, setName] = useState("");
    const [subtitle, setSubtitle] = useState("");

    const [startdate, setStartDate] = useState(new Date());
    const [endDate, setEndDate] = useState(new Date(Date.now() + 86400000)); // Default +1 day

    const [showStartPicker, setShowStartPicker] = useState(false);
    const [showEndPicker, setShowEndPicker] = useState(false);

    const [priceRules, setPriceRules] = useState([{ minPrice: 0, maxPrice: 999, discountAmount: 50 }]);

    const fetchSales = async () => {
        try {
            const token = await getToken();
            const { data } = await api.get("/sale/all", { headers: { Authorization: `Bearer ${token}` } });
            if (data.success) {
                setSales(data.data);
            }
        } catch (error: any) {
            Toast.show({
                type: "error",
                text1: "Failed to fetch sales",
                text2: error.response?.data?.message || "Something went wrong"
            });
        }
        finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchSales();
    }, []);

    const onRefresh = () => {
        setRefreshing(true);
        fetchSales();
    };

    const handleOpenCreate = () => {
        setIsEditMode(false);
        setName("");
        setSubtitle("");
        setStartDate(new Date());
        setEndDate(new Date(Date.now() + 86400000));
        setPriceRules([{ minPrice: 0, maxPrice: 999, discountAmount: 50 }]);
        setModalVisible(true);
    };

    const handleOpenEdit = (sale: any) => {
        setIsEditMode(true);
        setSaleId(sale._id);
        setName(sale.name);
        setSubtitle(sale.subtitle || "");
        setStartDate(new Date(sale.startAt));
        setEndDate(new Date(sale.endAt));
        setPriceRules(sale.priceRules.length ? sale.priceRules : [{ minPrice: 0, maxPrice: 999, discountAmount: 50 }]);
        setModalVisible(true);
    };

    const handleDeleteSale = async (id: string, sname: string) => {
        try {
            const token = await getToken();
            const { data } = await api.delete(`/sale/${id}`, { headers: { Authorization: `Bearer ${token}` } });
            if (data.success) {
                fetchSales();
                Toast.show({ type: "success", text1: "Sale Deleted", text2: `${sname} removed.` });
            }
        } catch (err: any) {
            Toast.show({ type: "error", text1: "Error", text2: err.message });
        }
    };

    const handleSubmit = async () => {
        if (!name.trim()) return Toast.show({ type: "error", text1: "Validation", text2: "Sale Name required" });
        if (startdate >= endDate) return Toast.show({ type: "error", text1: "Validation", text2: "Start date must be before end date" });
        if (priceRules.some(r => r.minPrice >= r.maxPrice)) return Toast.show({ type: "error", text1: "Validation", text2: "Invalid price rule ranges" });

        setSubmitting(true);
        try {
            const token = await getToken();
            const payload = {
                name,
                subtitle,
                startAt: startdate,
                endAt: endDate,
                priceRules
            };

            if (isEditMode) {
                await api.put(`/sale/${saleId}`, payload, { headers: { Authorization: `Bearer ${token}` } });
                Toast.show({ type: "success", text1: "Sale Updated", text2: "Sale configuration saved!" });
            } else {
                await api.post(`/sale/create`, payload, { headers: { Authorization: `Bearer ${token}` } });
                Toast.show({ type: "success", text1: "Sale Created", text2: "Festival Sale activated!" });
            }
            setModalVisible(false);
            fetchSales();
        } catch (error: any) {
            Toast.show({
                type: "error",
                text1: "Operation Failed",
                text2: error.response?.data?.message || "Overlap or Server Error"
            });
        } finally {
            setSubmitting(false);
        }
    };

    const addRule = () => setPriceRules([...priceRules, { minPrice: 1000, maxPrice: 1999, discountAmount: 100 }]);

    const updateRule = (index: number, key: string, value: string) => {
        const nr = [...priceRules];
        (nr[index] as any)[key] = Number(value);
        setPriceRules(nr);
    };

    const removeRule = (index: number) => {
        setPriceRules(priceRules.filter((_, i) => i !== index));
    };

    if (loading && !refreshing) {
        return <View style={styles.centerComponent}><ActivityIndicator size="large" color="#FF3399" /></View>;
    }

    return (
        <View style={styles.container}>
            <View style={styles.topBar}>
                <Text style={styles.topBarTitle}>Festival Sales</Text>
                <View style={{ flexDirection: 'row', gap: 10 }}>
                    <TouchableOpacity onPress={() => router.push('/(tabs)/admin/first-order-discount' as any)} style={[styles.addButton, { backgroundColor: '#F3F4F6' }]}>
                        <Ionicons name="gift-outline" size={20} color="#000" />
                        <Text style={[styles.addButtonText, { color: '#000' }]}>First Order</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={handleOpenCreate} style={styles.addButton}>
                        <Ionicons name="add" size={20} color="white" />
                        <Text style={styles.addButtonText}>Create Sale</Text>
                    </TouchableOpacity>
                </View>
            </View>

            <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>
                {sales.length === 0 ? (
                    <View style={styles.emptyComponent}><Text style={styles.secondaryText}>No active or scheduled sales</Text></View>
                ) : (
                    sales.map((sale: any) => (
                        <View key={sale._id} style={styles.saleCard}>
                            <View style={styles.cardHeader}>
                                <View>
                                    <Text style={styles.saleName}>{sale.name}</Text>
                                    <Text style={styles.saleSub}>{sale.subtitle}</Text>
                                </View>
                                <View style={[styles.statusBadge, sale.status === 'ACTIVE' ? styles.statusActive : sale.status === 'EXPIRED' ? styles.statusExpired : styles.statusSched]}>
                                    <Text style={styles.statusText}>{sale.status}</Text>
                                </View>
                            </View>
                            <Text style={styles.dateText}>From: {new Date(sale.startAt).toLocaleString()}</Text>
                            <Text style={styles.dateText}>To: {new Date(sale.endAt).toLocaleString()}</Text>

                            <View style={styles.actionRow}>
                                <TouchableOpacity style={styles.editBtn} onPress={() => handleOpenEdit(sale)}>
                                    <Ionicons name="create-outline" size={16} color="#0284C7" />
                                    <Text style={styles.editBtnTxt}>Edit</Text>
                                </TouchableOpacity>
                                <TouchableOpacity style={styles.deleteBtn} onPress={() => handleDeleteSale(sale._id, sale.name)}>
                                    <Ionicons name="trash-outline" size={16} color="#EF4444" />
                                    <Text style={styles.delBtnTxt}>Delete</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    ))
                )}
            </ScrollView>

            <Modal visible={modalVisible} animationType="slide" presentationStyle="pageSheet">
                <View style={styles.modalContainer}>
                    <View style={styles.modalHeader}>
                        <Text style={styles.modalTitle}>{isEditMode ? 'Edit Sale' : 'Create Festival Sale'}</Text>
                        <TouchableOpacity onPress={() => setModalVisible(false)}><Ionicons name="close" size={28} color="#000" /></TouchableOpacity>
                    </View>
                    <ScrollView style={styles.modalBody}>
                        <Text style={styles.label}>Sale Name</Text>
                        <TextInput style={styles.input} placeholder="e.g. Diwali Sale" value={name} onChangeText={setName} />

                        <Text style={styles.label}>Sale Subtitle</Text>
                        <TextInput style={styles.input} placeholder="e.g. Special Diwali Discounts" value={subtitle} onChangeText={setSubtitle} />

                        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                            <View style={{ flex: 1, marginRight: 10 }}>
                                <Text style={styles.label}>Start Date & Time</Text>
                                <TouchableOpacity style={styles.dateBtn} onPress={() => setShowStartPicker(true)}>
                                    <Text>{startdate.toLocaleString()}</Text>
                                </TouchableOpacity>
                            </View>
                            <View style={{ flex: 1 }}>
                                <Text style={styles.label}>End Date & Time</Text>
                                <TouchableOpacity style={styles.dateBtn} onPress={() => setShowEndPicker(true)}>
                                    <Text>{endDate.toLocaleString()}</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                        <View style={{ flexDirection: 'row', gap: 10, marginBottom: 16 }}>
                            <TouchableOpacity style={{ backgroundColor: '#F3F4F6', padding: 8, borderRadius: 8 }} onPress={() => setStartDate(new Date())}>
                                <Text style={{ fontSize: 12 }}>Set Start = Now</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={{ backgroundColor: '#FEE2E2', padding: 8, borderRadius: 8 }} onPress={() => setEndDate(new Date(startdate.getTime() + 2 * 60000))}>
                                <Text style={{ fontSize: 12, color: '#EF4444', fontWeight: 'bold' }}>+ 2 Mins</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={{ backgroundColor: '#DBEAFE', padding: 8, borderRadius: 8 }} onPress={() => setEndDate(new Date(startdate.getTime() + 60 * 60000))}>
                                <Text style={{ fontSize: 12, color: '#2563EB' }}>+ 1 Hour</Text>
                            </TouchableOpacity>
                        </View>

                        {showStartPicker && (
                            <DateTimePicker value={startdate} mode="time" display="default" onChange={(e, d) => { setShowStartPicker(false); if (d) setStartDate(d); }} />
                        )}
                        {showEndPicker && (
                            <DateTimePicker value={endDate} mode="time" display="default" onChange={(e, d) => { setShowEndPicker(false); if (d) setEndDate(d); }} />
                        )}

                        <Text style={[styles.label, { marginTop: 20 }]}>Discount Rules</Text>
                        {priceRules.map((rule, idx) => (
                            <View key={idx} style={styles.ruleBox}>
                                <View style={styles.ruleRow}>
                                    <View style={{ flex: 1 }}><Text style={styles.sLabel}>Min (₹)</Text><TextInput style={styles.inputS} keyboardType="numeric" value={rule.minPrice.toString()} onChangeText={(v) => updateRule(idx, 'minPrice', v)} /></View>
                                    <View style={{ flex: 1 }}><Text style={styles.sLabel}>Max (₹)</Text><TextInput style={styles.inputS} keyboardType="numeric" value={rule.maxPrice.toString()} onChangeText={(v) => updateRule(idx, 'maxPrice', v)} /></View>
                                    <View style={{ flex: 1 }}><Text style={styles.sLabel}>Off (₹)</Text><TextInput style={styles.inputS} keyboardType="numeric" value={rule.discountAmount.toString()} onChangeText={(v) => updateRule(idx, 'discountAmount', v)} /></View>
                                </View>
                                {priceRules.length > 1 && (
                                    <TouchableOpacity onPress={() => removeRule(idx)}><Text style={{ color: '#EF4444', textAlign: 'right', marginTop: 5 }}>Remove</Text></TouchableOpacity>
                                )}
                            </View>
                        ))}
                        <TouchableOpacity style={styles.addRuleBtn} onPress={addRule}><Text style={{ color: '#0284C7', fontWeight: 'bold' }}>+ Add Price Range</Text></TouchableOpacity>

                        <TouchableOpacity style={styles.saveBtn} onPress={handleSubmit} disabled={submitting}>
                            {submitting ? <ActivityIndicator color="#fff" /> : <Text style={styles.saveBtnText}>Save Sale</Text>}
                        </TouchableOpacity>
                    </ScrollView>
                </View>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#FFFFFF' },
    centerComponent: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    topBar: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 16, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    topBarTitle: { fontSize: 22, fontWeight: '800', fontFamily: 'Outfit_800' },
    addButton: { backgroundColor: '#FF3399', paddingHorizontal: 16, paddingVertical: 10, borderRadius: 9999, flexDirection: 'row', alignItems: 'center' },
    addButtonText: { color: '#ffffff', fontWeight: '600', marginLeft: 4 },
    scrollView: { flex: 1 },
    scrollContent: { padding: 20, paddingBottom: 40 },
    emptyComponent: { flex: 1, justifyContent: 'center', alignItems: 'center', marginTop: 80 },
    secondaryText: { color: '#94A3B8' },
    saleCard: { backgroundColor: '#F8FAFC', padding: 16, borderRadius: 16, borderWidth: 1, borderColor: '#E2E8F0', marginBottom: 16 },
    cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 },
    saleName: { fontSize: 18, fontWeight: 'bold', color: '#0F172A' },
    saleSub: { fontSize: 13, color: '#64748B' },
    statusBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
    statusActive: { backgroundColor: '#10B981' },
    statusExpired: { backgroundColor: '#94A3B8' },
    statusSched: { backgroundColor: '#F59E0B' },
    statusText: { color: '#FFF', fontSize: 11, fontWeight: 'bold' },
    dateText: { fontSize: 13, color: '#475569', marginBottom: 4 },
    actionRow: { flexDirection: 'row', justifyContent: 'flex-end', marginTop: 10, gap: 10 },
    editBtn: { flexDirection: 'row', backgroundColor: '#E0F2FE', padding: 8, borderRadius: 8, alignItems: 'center' },
    editBtnTxt: { color: '#0284C7', marginLeft: 4, fontSize: 13, fontWeight: '600' },
    deleteBtn: { flexDirection: 'row', backgroundColor: '#FEE2E2', padding: 8, borderRadius: 8, alignItems: 'center' },
    delBtnTxt: { color: '#EF4444', marginLeft: 4, fontSize: 13, fontWeight: '600' },
    modalContainer: { flex: 1, backgroundColor: '#FFF' },
    modalHeader: { flexDirection: 'row', justifyContent: 'space-between', padding: 20, borderBottomWidth: 1, borderColor: '#eee' },
    modalTitle: { fontSize: 20, fontWeight: 'bold' },
    modalBody: { padding: 20 },
    label: { fontSize: 14, fontWeight: '600', color: '#333', marginBottom: 6 },
    input: { borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 12, marginBottom: 16 },
    dateBtn: { borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 12, marginBottom: 16, backgroundColor: '#F9FAFB' },
    ruleBox: { backgroundColor: '#F1F5F9', padding: 12, borderRadius: 8, marginBottom: 10 },
    ruleRow: { flexDirection: 'row', gap: 10 },
    sLabel: { fontSize: 11, color: '#666', marginBottom: 4 },
    inputS: { backgroundColor: '#FFF', borderWidth: 1, borderColor: '#ddd', borderRadius: 6, padding: 8 },
    addRuleBtn: { padding: 10, alignSelf: 'flex-start', marginBottom: 30 },
    saveBtn: { backgroundColor: '#FF3399', padding: 15, borderRadius: 12, alignItems: 'center', marginBottom: 50 },
    saveBtnText: { color: '#FFF', fontWeight: 'bold', fontSize: 16 }
});

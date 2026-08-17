import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { ScrollView, Text, TouchableOpacity, View, ActivityIndicator, RefreshControl, StyleSheet, TextInput, Switch } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Toast from 'react-native-toast-message';
import api from "../../../../constants/api";
import { useAuth } from "@/context/AuthContext";

export default function AdminFirstOrderDiscount() {
    const { getToken } = useAuth();
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    const [isEnabled, setIsEnabled] = useState(false);
    const [title, setTitle] = useState("Welcome Offer");
    const [subtitle, setSubtitle] = useState("Get discount on your first order");

    const [priceRules, setPriceRules] = useState([{ minPrice: 0, maxPrice: 499, discountAmount: 20 }]);

    const fetchSettings = async () => {
        try {
            const token = await getToken();
            const { data } = await api.get("/first-order/settings", { headers: { Authorization: `Bearer ${token}` } });
            if (data.success && data.data) {
                const settings = data.data;
                setIsEnabled(settings.isEnabled || false);
                setTitle(settings.title || "Welcome Offer");
                setSubtitle(settings.subtitle || "Get discount on your first order");
                if (settings.priceRules && settings.priceRules.length > 0) {
                    setPriceRules(settings.priceRules);
                }
            }
        } catch (error: any) {
            Toast.show({
                type: "error",
                text1: "Failed to fetch settings",
                text2: error.response?.data?.message || "Something went wrong"
            });
        }
        finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchSettings();
    }, []);

    const onRefresh = () => {
        setRefreshing(true);
        fetchSettings();
    };

    const handleSubmit = async () => {
        if (!title.trim()) return Toast.show({ type: "error", text1: "Validation", text2: "Title required" });
        if (priceRules.some(r => r.minPrice >= r.maxPrice)) return Toast.show({ type: "error", text1: "Validation", text2: "Invalid price rule ranges (Max must be greater than Min)" });

        setSubmitting(true);
        try {
            const token = await getToken();
            const payload = {
                isEnabled,
                title,
                subtitle,
                priceRules
            };

            const { data } = await api.put("/first-order/settings", payload, { headers: { Authorization: `Bearer ${token}` } });
            if (data.success) {
                Toast.show({ type: "success", text1: "Success", text2: "First Order settings updated successfully!" });
            }
            fetchSettings();
        } catch (error: any) {
            Toast.show({
                type: "error",
                text1: "Update Failed",
                text2: error.response?.data?.message || "Server Error"
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
                <TouchableOpacity onPress={() => router.back()} style={{ marginRight: 10 }}>
                    <Ionicons name="arrow-back" size={24} color="#000" />
                </TouchableOpacity>
                <Text style={styles.topBarTitle}>First Order Discount</Text>
            </View>

            <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>

                <View style={styles.card}>
                    <View style={styles.statusRow}>
                        <View>
                            <Text style={styles.sectionTitle}>Enable Feature</Text>
                            <Text style={styles.sectionSub}>Turn on to give new users a discount</Text>
                        </View>
                        <Switch
                            trackColor={{ false: '#767577', true: '#FF3399' }}
                            thumbColor={isEnabled ? '#f4f3f4' : '#f4f3f4'}
                            onValueChange={() => setIsEnabled(!isEnabled)}
                            value={isEnabled}
                        />
                    </View>
                </View>

                {isEnabled && (
                    <View style={styles.card}>
                        <Text style={styles.label}>Title</Text>
                        <TextInput style={styles.input} placeholder='e.g. "Welcome Offer"' value={title} onChangeText={setTitle} />

                        <Text style={styles.label}>Subtitle</Text>
                        <TextInput style={styles.input} placeholder='e.g. "Get discount on your first order"' value={subtitle} onChangeText={setSubtitle} />

                        <Text style={[styles.sectionTitle, { marginTop: 20 }]}>Discount Rules based on original price</Text>
                        {priceRules.map((rule, idx) => (
                            <View key={idx} style={styles.ruleBox}>
                                <View style={styles.ruleRow}>
                                    <View style={{ flex: 1 }}><Text style={styles.sLabel}>Min (₹)</Text><TextInput style={styles.inputS} keyboardType="numeric" value={rule.minPrice.toString()} onChangeText={(v) => updateRule(idx, 'minPrice', v)} /></View>
                                    <View style={{ flex: 1 }}><Text style={styles.sLabel}>Max (₹)</Text><TextInput style={styles.inputS} keyboardType="numeric" value={rule.maxPrice.toString()} onChangeText={(v) => updateRule(idx, 'maxPrice', v)} /></View>
                                    <View style={{ flex: 1 }}><Text style={styles.sLabel}>Off (₹)</Text><TextInput style={styles.inputS} keyboardType="numeric" value={rule.discountAmount.toString()} onChangeText={(v) => updateRule(idx, 'discountAmount', v)} /></View>
                                </View>

                                <View style={styles.previewRow}>
                                    <Text style={styles.previewText}>Preview: ₹{(rule.maxPrice - rule.discountAmount) < 0 ? 0 : 450} → ₹{((450 - rule.discountAmount) < 0 ? 0 : (450 - rule.discountAmount))}</Text>
                                    {priceRules.length > 1 && (
                                        <TouchableOpacity onPress={() => removeRule(idx)}><Text style={{ color: '#EF4444', fontWeight: 'bold' }}>Remove</Text></TouchableOpacity>
                                    )}
                                </View>
                            </View>
                        ))}
                        <TouchableOpacity style={styles.addRuleBtn} onPress={addRule}><Text style={{ color: '#0284C7', fontWeight: 'bold' }}>+ Add Price Range</Text></TouchableOpacity>

                    </View>
                )}

                <TouchableOpacity style={styles.saveBtn} onPress={handleSubmit} disabled={submitting}>
                    {submitting ? <ActivityIndicator color="#fff" /> : <Text style={styles.saveBtnText}>Save Settings</Text>}
                </TouchableOpacity>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#FFFFFF' },
    centerComponent: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    topBar: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 16, flexDirection: 'row', alignItems: 'center', backgroundColor: '#F8FAFC', borderBottomWidth: 1, borderColor: '#E2E8F0' },
    topBarTitle: { fontSize: 22, fontWeight: '800', fontFamily: 'Outfit_800' },
    scrollView: { flex: 1 },
    scrollContent: { padding: 20, paddingBottom: 40 },
    card: { backgroundColor: '#F8FAFC', padding: 16, borderRadius: 16, borderWidth: 1, borderColor: '#E2E8F0', marginBottom: 16 },
    statusRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    sectionTitle: { fontSize: 16, fontWeight: 'bold', color: '#0F172A', marginBottom: 4 },
    sectionSub: { fontSize: 13, color: '#64748B' },
    label: { fontSize: 14, fontWeight: '600', color: '#333', marginBottom: 6 },
    input: { borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 12, marginBottom: 16, backgroundColor: '#FFF' },
    ruleBox: { backgroundColor: '#F1F5F9', padding: 12, borderRadius: 8, marginBottom: 10, borderWidth: 1, borderColor: '#E2E8F0' },
    ruleRow: { flexDirection: 'row', gap: 10 },
    sLabel: { fontSize: 11, color: '#666', marginBottom: 4 },
    inputS: { backgroundColor: '#FFF', borderWidth: 1, borderColor: '#ddd', borderRadius: 6, padding: 8 },
    previewRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 10, borderTopWidth: 1, borderColor: '#E2E8F0', paddingTop: 8 },
    previewText: { fontSize: 12, color: '#0F172A' },
    addRuleBtn: { padding: 10, alignSelf: 'flex-start', marginBottom: 10 },
    saveBtn: { backgroundColor: '#FF3399', padding: 15, borderRadius: 12, alignItems: 'center', marginTop: 10 },
    saveBtnText: { color: '#FFF', fontWeight: 'bold', fontSize: 16 }
});

import { useRouter } from "expo-router";
import React, { useEffect, useState, useRef } from "react";
import { ScrollView, Text, View, ActivityIndicator, RefreshControl, StyleSheet, TouchableOpacity, Animated } from "react-native";
import { COLORS } from "@/assets/constants";
import { useAuth } from "@/context/AuthContext";
import api from "../../../../constants/api";
import { Ionicons } from "@expo/vector-icons";

// Helper for status colors
const getLocalStatusColor = (status: string) => {
    if (!status) return { bgColor: '#F1F5F9', textColor: '#475569' };
    switch (status.toLowerCase()) {
        case 'placed': return { bgColor: '#FEF3C7', textColor: '#92400E' };
        case 'processing': return { bgColor: '#E0E7FF', textColor: '#3730A3' };
        case 'shipped': return { bgColor: '#F3E8FF', textColor: '#6B21A8' };
        case 'delivered': return { bgColor: '#D1FAE5', textColor: '#065F46' };
        case 'cancelled': return { bgColor: '#FEE2E2', textColor: '#991B1B' };
        default: return { bgColor: '#F1F5F9', textColor: '#475569' };
    }
};

export default function AdminDashboard() {
    const { getToken } = useAuth();
    const router = useRouter();
    const [loading, setLoading] = useState(true);   
    const [refreshing, setRefreshing] = useState(false);
    const [timeFilter, setTimeFilter] = useState<'monthly' | 'weekly' | 'today'>('monthly');
    const [stats, setStats] = useState({
        totalUsers: 0,
        totalProducts: 0,
        totalOrders: 0,
        totalRevenue: 0,
        recentOrders: []
    });

    const fetchStats = async () => {
        try {
            const token = await getToken();
            const { data } = await api.get('/admin/dashboard', {
                headers: { Authorization: `Bearer ${token}` }
            });
            if(data.success) {
                setStats(data.data);
            }
        } catch (error) {
          console.error("failed to fetch admin stats", error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchStats();
    }, []);

    const onRefresh = () => {
        setRefreshing(true);
        fetchStats();
    };

    if (loading && !refreshing) {
        return (
            <View style={styles.centerComponent}>
                <ActivityIndicator size="large" color="#FF3399" />
            </View>
        );
    }

    const filteredOrders = stats.recentOrders.filter((order: any) => {
        if (timeFilter === 'monthly') return true; 
        const orderDate = new Date(order.createdAt).getTime();
        const now = new Date().getTime();
        const diffDays = (now - orderDate) / (1000 * 3600 * 24);
        if (timeFilter === 'today') return diffDays <= 1;
        if (timeFilter === 'weekly') return diffDays <= 7;
        return true;
    });

    return (
        <View style={styles.mainContainer}>
            <ScrollView
                style={styles.container}
                contentContainerStyle={styles.scrollContent}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
                showsVerticalScrollIndicator={false}
            >
                {/* Stats Grid */}
                <View style={styles.statsGrid}>
                    <StatCard label="Revenue" value={`$${stats.totalRevenue.toFixed(2)}`} isDark={true} progress={85} />
                    <StatCard label="Total Orders" value={stats.totalOrders.toString()} progress={62} color="#818CF8" />
                    <StatCard label="Total Users" value={stats.totalUsers.toString()} progress={80} color="#34D399" />
                    <StatCard label="Total Products" value={stats.totalProducts.toString()} progress={45} color="#FF3399" />
                </View>

                {/* Order List Section Header */}
                <View style={styles.sectionHeaderRow}>
                    <Text style={styles.sectionTitle}>Order List</Text>
                    <View style={styles.timeToggle}>
                        <TouchableOpacity onPress={() => setTimeFilter('monthly')} style={timeFilter === 'monthly' ? styles.timeToggleActive : null}>
                            <Text style={timeFilter === 'monthly' ? styles.timeToggleTextActive : styles.timeToggleText}>Monthly</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => setTimeFilter('weekly')} style={timeFilter === 'weekly' ? styles.timeToggleActive : null}>
                            <Text style={timeFilter === 'weekly' ? styles.timeToggleTextActive : styles.timeToggleText}>Weekly</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => setTimeFilter('today')} style={timeFilter === 'today' ? styles.timeToggleActive : null}>
                            <Text style={timeFilter === 'today' ? styles.timeToggleTextActive : styles.timeToggleText}>Today</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Orders List */}
                <View style={styles.orderListContainer}>
                    {filteredOrders.length === 0 ? (
                        <View style={styles.emptyCard}>
                            <Text style={styles.secondaryText}>No recent orders</Text>
                        </View>
                    ) : (
                        filteredOrders.map((order: any) => {
                            const { bgColor, textColor } = getLocalStatusColor(order.orderStatus);

                            return (
                                <View key={order._id} style={styles.orderListItem}>
                                    <View style={styles.orderListLeft}>
                                        <View style={styles.orderAvatar}>
                                            <Text style={styles.orderAvatarText}>
                                                {(order.user?.name || '?').charAt(0).toUpperCase()}
                                            </Text>
                                        </View>
                                        <View>
                                            <Text style={styles.orderUserName}>{order.user?.name || 'Unknown User'}</Text>
                                            <Text style={styles.orderDate}>
                                                {new Date(order.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                            </Text>
                                        </View>
                                    </View>
                                    
                                    <View style={styles.orderListRight}>
                                        <Text style={styles.orderPrice}>+ ${order.totalAmount.toFixed(2)}</Text>
                                        <View style={[styles.statusBadge, { backgroundColor: bgColor }]}>
                                            <Text style={[styles.statusText, { color: textColor }]}>
                                                {order.orderStatus}
                                            </Text>
                                        </View>
                                    </View>
                                </View>
                            );
                        })
                    )}
                </View>
            </ScrollView>
        </View>
    );
}

const StatCard = ({ label, value, isDark, progress, color }: { label: string, value: string, isDark?: boolean, progress: number, color?: string }) => {
    const progressAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.timing(progressAnim, {
            toValue: progress,
            duration: 1200,
            useNativeDriver: false,
        }).start();
    }, [progress]);

    const widthInterpolation = progressAnim.interpolate({
        inputRange: [0, 100],
        outputRange: ['0%', '100%']
    });

    return (
        <View style={[styles.statCard, isDark && styles.statCardDark]}>
            <Text style={[styles.statValue, isDark && styles.statValueDark]}>{value}</Text>
            <Text style={[styles.statLabel, isDark && styles.statLabelDark]}>{label}</Text>
            
            <View style={styles.progressRow}>
                <Text style={[styles.progressText, isDark && styles.progressTextDark]}>0%</Text>
                <Text style={[styles.progressText, isDark && styles.progressTextDark]}>{progress}%</Text>
            </View>
            <View style={[styles.progressBarBg, isDark && styles.progressBarBgDark]}>
                <Animated.View style={[styles.progressBarFill, { width: widthInterpolation, backgroundColor: isDark ? '#FFFFFF' : (color || '#FF3399') }]} />
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    mainContainer: {
        flex: 1,
        backgroundColor: '#FFFFFF',
    },
    headerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingTop: 60, 
        paddingBottom: 20,
        backgroundColor: '#FFFFFF',
    },
    headerTitle: {
        fontSize: 26,
        fontWeight: '800',
        color: '#000000',
        fontFamily: 'Outfit_800',
    },
    headerIcons: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    darkIconCircle: {
        backgroundColor: '#000',
        width: 32,
        height: 32,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
    },
    container: {
        flex: 1,
        backgroundColor: '#FFFFFF',
    },
    scrollContent: {
        paddingHorizontal: 20,
        paddingBottom: 40,
    },
    centerComponent: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
    },
    statsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        marginBottom: 10,
    },
    statCard: {
        backgroundColor: '#FFFFFF',
        width: '48%',
        padding: 16,
        borderRadius: 16,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: '#F1F5F9',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.02,
        shadowRadius: 4,
        elevation: 1,
    },
    statCardDark: {
        backgroundColor: '#FF3399',
        borderColor: '#FF3399',
        shadowColor: '#FF3399',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.25,
        shadowRadius: 10,
        elevation: 5,
    },
    statValue: {
        fontSize: 22,
        fontWeight: '800',
        color: '#0F172A',
        fontFamily: 'Outfit_800',
        marginBottom: 4,
    },
    statValueDark: {
        color: '#FFFFFF',
    },
    statLabel: {
        fontSize: 13,
        color: '#64748B',
        fontFamily: 'Outfit_500',
        marginBottom: 20,
    },
    statLabelDark: {
        color: '#FDF2F8',
    },
    progressRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 6,
    },
    progressText: {
        fontSize: 10,
        color: '#94A3B8',
        fontFamily: 'Outfit_500',
    },
    progressTextDark: {
        color: '#FDF2F8',
    },
    progressBarBg: {
        height: 6,
        backgroundColor: '#F1F5F9',
        borderRadius: 3,
        overflow: 'hidden',
    },
    progressBarBgDark: {
        backgroundColor: '#E72A84',
    },
    progressBarFill: {
        height: '100%',
        borderRadius: 3,
    },
    sectionHeaderRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
        marginTop: 10,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '800',
        color: '#0F172A',
        fontFamily: 'Outfit_800',
    },
    timeToggle: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    timeToggleText: {
        fontSize: 12,
        color: '#94A3B8',
        fontFamily: 'Outfit_500',
    },
    timeToggleActive: {
        backgroundColor: '#FF3399',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 12,
    },
    timeToggleTextActive: {
        fontSize: 12,
        color: '#FFFFFF',
        fontFamily: 'Outfit_600',
    },
    orderListContainer: {
        marginTop: 8,
    },
    orderListItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#F1F5F9',
    },
    orderListLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    orderAvatar: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: '#F8FAFC',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#E2E8F0',
    },
    orderAvatarText: {
        fontSize: 16,
        fontWeight: '700',
        color: '#475569',
        fontFamily: 'Outfit_700',
    },
    orderUserName: {
        fontSize: 15,
        fontWeight: '700',
        color: '#0F172A',
        fontFamily: 'Outfit_700',
    },
    orderDate: {
        fontSize: 12,
        color: '#94A3B8',
        marginTop: 4,
        fontFamily: 'Outfit_500',
    },
    orderListRight: {
        alignItems: 'flex-end',
        gap: 8,
    },
    orderPrice: {
        fontSize: 14,
        fontWeight: '700',
        color: '#0F172A',
        fontFamily: 'Outfit_700',
    },
    statusBadge: {
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 8,
    },
    statusText: {
        fontSize: 11,
        fontWeight: '700',
        fontFamily: 'Outfit_700',
        textTransform: 'capitalize',
    },
    emptyCard: {
        padding: 40,
        alignItems: 'center',
        justifyContent: 'center',
    },
    secondaryText: {
        color: '#94A3B8',
        fontSize: 15,
        fontFamily: 'Outfit_500',
    }
});
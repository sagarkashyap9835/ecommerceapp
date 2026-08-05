import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { ScrollView, Text, View, ActivityIndicator, RefreshControl, StyleSheet } from "react-native";
import { COLORS, getStatusColor } from "@/assets/constants";
// import { dummyAdminStats } from "@/assets/assets";
import { useAuth } from "@/context/AuthContext";
import api from "../../../../constants/api";

export default function AdminDashboard() {
    const {getToken}=useAuth()
    const router = useRouter();
    const [loading, setLoading] = useState(true);   
    const [refreshing, setRefreshing] = useState(false);
    const [stats, setStats] = useState({
        totalUsers: 0,
        totalProducts: 0,
        totalOrders: 0,
        totalRevenue: 0,
        recentOrders: []
    });

    const fetchStats = async () => {
        // setStats(dummyAdminStats as any);
        // setLoading(false);
        // setRefreshing(false);

        try {
            const token=await getToken()
            const { data }=await api.get('/admin/dashboard', {headers:{
                Authorization:`Bearer ${token}`
            }})
            if(data.success){
                setStats(data.data)
            }
        } catch (error) {
          console.error("failed to fetch admin stats", error);
        }
        finally{
        setLoading(false);
        setRefreshing(false)
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
                <ActivityIndicator size="large" color={COLORS.primary || '#000'} />
            </View>
        );
    }

    return (
        <ScrollView
            style={styles.container}
            contentContainerStyle={styles.scrollContent}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        >
            {/* Overview Section */}
            <View style={styles.sectionContainer}>
                <Text style={styles.sectionTitle}>Overview</Text>
                <View style={styles.statsGrid}>
                    <StatCard label="Total Revenue" value={`$${stats.totalRevenue.toFixed(2)}`} />
                    <StatCard label="Total Orders" value={stats.totalOrders.toString()} />
                    <StatCard label="Products" value={stats.totalProducts.toString()} />
                    <StatCard label="Users" value={stats.totalUsers.toString()} />
                </View>
            </View>

            {/* Recent Orders Section */}
            <View style={styles.sectionContainer}>
                <Text style={styles.sectionTitle}>Recent Orders</Text>
                {stats.recentOrders.length === 0 ? (
                    <View style={styles.emptyCard}>
                        <Text style={styles.secondaryText}>No recent orders</Text>
                    </View>
                ) : (
                    stats.recentOrders.map((order: any) => {
                        // getStatusColor से ऑब्जेक्ट निकालें और सेफ रखें
                        const statusStyles = (getStatusColor(order.orderStatus) as any) || {};
                        const bgColor = statusStyles.backgroundColor || '#f3f4f6';
                        const textColor = statusStyles.color || '#111827';

                        return (
                            <View key={order._id} style={styles.orderCard}>
                                <View style={styles.orderHeader}>
                                    <View>
                                        <Text style={styles.orderProductsCount}>
                                            Total Products : {order.items.reduce((acc: number, item: any) => acc + item.quantity, 0)}
                                        </Text>
                                        <Text style={styles.orderDate}>
                                            {new Date(order.createdAt).toLocaleDateString()}
                                        </Text>
                                    </View>
                                    
                                    {/* सुरक्षित तरीके से बैकग्राउंड कलर दिया */}
                                    <View style={[styles.statusBadge, { backgroundColor: bgColor }]}>
                                        {/* सुरक्षित तरीके से टेक्स्ट कलर दिया */}
                                        <Text style={[styles.statusText, { color: textColor }]}>
                                            {order.orderStatus}
                                        </Text>
                                    </View>
                                </View>

                                <View style={styles.productsList}>
                                    {order.items.map((item: any) => (
                                        <Text key={item._id} style={styles.productItemText}>
                                            {item.name} x {item.quantity}
                                        </Text>
                                    ))}
                                </View>

                                <View style={styles.divider} />

                                <View style={styles.orderFooter}>
                                    <View style={styles.userInfoRow}>
                                        <View style={styles.avatarCircle}>
                                            <Text style={styles.avatarText}>
                                                {(order.user?.name || '?').charAt(0).toUpperCase()}
                                            </Text>
                                        </View>
                                        <Text style={styles.userName}>{order.user?.name || 'Unknown User'}</Text>
                                    </View>
                                    <Text style={styles.totalAmount}>${order.totalAmount.toFixed(2)}</Text>
                                </View>
                            </View>
                        );
                    })
                )}
            </View>
        </ScrollView>
    );
}

const StatCard = ({ label, value }: { label: string, value: string }) => (
    <View style={styles.statCard}>
        <Text style={styles.statValue}>{value}</Text>
        <Text style={styles.statLabel}>{label}</Text>
    </View>
);

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f9fafb',
    },
    scrollContent: {
        padding: 16,
    },
    centerComponent: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f9fafb',
    },
    sectionContainer: {
        marginBottom: 24,
    },
    sectionTitle: {
        fontSize: 24,
        fontWeight: '700',
        color: '#111827',
        marginBottom: 16,
        letterSpacing: -0.5,
    },
    statsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
    },
    statCard: {
        backgroundColor: '#ffffff',
        padding: 20,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: '#f3f4f6',
        width: '48%',
        marginBottom: 16,
        justifyContent: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.04,
        shadowRadius: 3,
        elevation: 1,
    },
    statValue: {
        fontSize: 20,
        fontWeight: '700',
        color: '#111827',
        marginBottom: 4,
    },
    statLabel: {
        fontSize: 12,
        fontWeight: '500',
        color: '#6b7280',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    emptyCard: {
        backgroundColor: '#ffffff',
        padding: 24,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: '#f3f4f6',
        alignItems: 'center',
    },
    secondaryText: {
        color: '#6b7280',
        fontSize: 14,
    },
    orderCard: {
        backgroundColor: '#ffffff',
        padding: 20,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: '#f3f4f6',
        marginBottom: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.03,
        shadowRadius: 4,
        elevation: 2,
    },
    orderHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    orderProductsCount: {
        fontWeight: '700',
        color: '#111827',
        fontSize: 16,
    },
    orderDate: {
        color: '#6b7280',
        fontSize: 12,
        marginTop: 4,
    },
    statusBadge: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 9999,
        justifyContent: 'center',
        alignItems: 'center',
    },
    statusText: {
        fontSize: 10,
        fontWeight: '700',
        textTransform: 'uppercase',
    },
    productsList: {
        paddingBottom: 8,
    },
    productItemText: {
        color: '#6b7280',
        fontSize: 12,
        marginTop: 4,
    },
    divider: {
        height: 1,
        backgroundColor: '#f3f4f6',
        marginVertical: 12,
    },
    orderFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    userInfoRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    avatarCircle: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: '#f3f4f6',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 8,
    },
    avatarText: {
        color: '#111827',
        fontWeight: '700',
        fontSize: 12,
    },
    userName: {
        color: '#6b7280',
        fontSize: 14,
    },
    totalAmount: {
        fontSize: 18,
        fontWeight: '700',
        color: '#111827',
    },
});
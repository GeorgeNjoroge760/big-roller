import React, { useState, useCallback } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator, RefreshControl, ScrollView } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import client from '../../api/client';
import { useAuth } from '../../context/AuthContext';

export default function AdminDashboard({ navigation }) {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useFocusEffect(useCallback(() => {
    fetchStats();
  }, []));

  const fetchStats = async () => {
    try {
      const { data } = await client.get('/dashboard/');
      setStats(data);
    } catch { }
    setLoading(false);
  };

  if (loading) return <View style={styles.center}><ActivityIndicator size="large" color="#2e7d32" /></View>;

  return (
    <ScrollView style={styles.container} refreshControl={<RefreshControl refreshing={loading} onRefresh={fetchStats} />}>
      <View style={styles.topBar}>
        <View>
          <Text style={styles.greeting}>Welcome,</Text>
          <Text style={styles.name}>{user?.username}</Text>
        </View>
        <TouchableOpacity onPress={() => navigation.navigate('Notifications')}>
          <Ionicons name="notifications" size={26} color="#2e7d32" />
        </TouchableOpacity>
      </View>

      <Text style={styles.sectionTitle}>Club Overview</Text>
      <View style={styles.statsGrid}>
        <View style={[styles.statCard, { borderLeftColor: '#d4a84b' }]}>
          <Ionicons name="cash" size={24} color="#d4a84b" />
          <Text style={styles.statValue}>Ksh {stats?.total_revenue_today || 0}</Text>
          <Text style={styles.statLabel}>Today's Revenue</Text>
        </View>
        <View style={[styles.statCard, { borderLeftColor: '#3498db' }]}>
          <Ionicons name="receipt" size={24} color="#3498db" />
          <Text style={styles.statValue}>{stats?.pending_orders || 0}</Text>
          <Text style={styles.statLabel}>Pending Orders</Text>
        </View>
        <View style={[styles.statCard, { borderLeftColor: '#2e7d32' }]}>
          <Ionicons name="cube" size={24} color="#2e7d32" />
          <Text style={styles.statValue}>{stats?.total_products || 0}</Text>
          <Text style={styles.statLabel}>Products</Text>
        </View>
        <View style={[styles.statCard, { borderLeftColor: '#c0392b' }]}>
          <Ionicons name="warning" size={24} color="#c0392b" />
          <Text style={styles.statValue}>{stats?.low_stock || 0}</Text>
          <Text style={styles.statLabel}>Low Stock</Text>
        </View>
      </View>

      <TouchableOpacity style={styles.navBtn} onPress={() => navigation.navigate('Products')}>
        <Ionicons name="cube" size={22} color="#fff" />
        <Text style={styles.navText}>Manage Products</Text>
      </TouchableOpacity>

      <TouchableOpacity style={[styles.navBtn, { backgroundColor: '#3498db' }]} onPress={() => navigation.navigate('Users')}>
        <Ionicons name="people" size={22} color="#fff" />
        <Text style={styles.navText}>Manage Users</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f0f7f0', paddingTop: 60, paddingHorizontal: 16 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f0f7f0' },
  topBar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
  greeting: { fontSize: 14, color: '#8aaa8a' },
  name: { fontSize: 22, fontWeight: '700', color: '#1b3b1b' },
  sectionTitle: { fontSize: 16, fontWeight: '600', color: '#4a7a4a', marginBottom: 12 },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 24 },
  statCard: { width: '48%', backgroundColor: '#fff', borderRadius: 12, padding: 14, borderLeftWidth: 3, borderWidth: 1, borderColor: '#c8e6c9', marginBottom: 10 },
  statValue: { fontSize: 16, fontWeight: '800', color: '#1b3b1b', marginTop: 8 },
  statLabel: { fontSize: 12, color: '#4a7a4a', marginTop: 2 },
  navBtn: { flexDirection: 'row', backgroundColor: '#2e7d32', borderRadius: 14, padding: 16, alignItems: 'center', justifyContent: 'center', gap: 10, marginBottom: 12 },
  navText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});

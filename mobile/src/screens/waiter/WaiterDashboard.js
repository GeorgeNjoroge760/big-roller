import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator, RefreshControl, ScrollView } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import client from '../../api/client';
import { useAuth } from '../../context/AuthContext';

export default function WaiterDashboard({ navigation }) {
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

      <Text style={styles.sectionTitle}>Your Overview</Text>
      <View style={styles.statsRow}>
        <View style={[styles.statCard, { borderLeftColor: '#f39c12' }]}>
          <Text style={styles.statValue}>{stats?.pending || 0}</Text>
          <Text style={styles.statLabel}>Pending</Text>
        </View>
        <View style={[styles.statCard, { borderLeftColor: '#3498db' }]}>
          <Text style={styles.statValue}>{stats?.active || 0}</Text>
          <Text style={styles.statLabel}>Active</Text>
        </View>
        <View style={[styles.statCard, { borderLeftColor: '#2e7d32' }]}>
          <Text style={styles.statValue}>Ksh {stats?.total_sales || 0}</Text>
          <Text style={styles.statLabel}>Sales</Text>
        </View>
      </View>

      <TouchableOpacity style={styles.menuBtn} onPress={() => navigation.navigate('Menu')}>
        <Ionicons name="menu" size={24} color="#fff" />
        <Text style={styles.menuBtnText}>Browse Menu</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.ordersBtn} onPress={() => navigation.navigate('Orders')}>
        <Ionicons name="receipt" size={24} color="#fff" />
        <Text style={styles.menuBtnText}>My Orders</Text>
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
  statsRow: { flexDirection: 'row', gap: 10, marginBottom: 24 },
  statCard: {
    flex: 1, backgroundColor: '#fff', borderRadius: 12, padding: 14,
    borderLeftWidth: 3, borderWidth: 1, borderColor: '#c8e6c9',
  },
  statValue: { fontSize: 18, fontWeight: '800', color: '#1b3b1b' },
  statLabel: { fontSize: 12, color: '#4a7a4a', marginTop: 4 },
  menuBtn: {
    flexDirection: 'row', backgroundColor: '#d4a84b', borderRadius: 14, padding: 18,
    alignItems: 'center', justifyContent: 'center', gap: 10, marginBottom: 12,
  },
  ordersBtn: {
    flexDirection: 'row', backgroundColor: '#2e7d32', borderRadius: 14, padding: 18,
    alignItems: 'center', justifyContent: 'center', gap: 10,
  },
  menuBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});

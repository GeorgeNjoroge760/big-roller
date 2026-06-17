import React, { useState, useCallback } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator, RefreshControl, ScrollView } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import client from '../../api/client';
import { useAuth } from '../../context/AuthContext';

export default function CounterDashboard({ navigation }) {
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

      <Text style={styles.sectionTitle}>Counter Overview</Text>
      <View style={styles.statsRow}>
        <View style={[styles.statCard, { borderLeftColor: '#f39c12' }]}>
          <Text style={styles.statValue}>{stats?.pending_orders || 0}</Text>
          <Text style={styles.statLabel}>Pending</Text>
        </View>
        <View style={[styles.statCard, { borderLeftColor: '#3498db' }]}>
          <Text style={styles.statValue}>{stats?.claimed || 0}</Text>
          <Text style={styles.statLabel}>Claimed</Text>
        </View>
        <View style={[styles.statCard, { borderLeftColor: '#2e7d32' }]}>
          <Text style={styles.statValue}>{stats?.completed_today || 0}</Text>
          <Text style={styles.statLabel}>Done Today</Text>
        </View>
      </View>

      <TouchableOpacity style={styles.actionBtn} onPress={() => navigation.navigate('Pending')}>
        <Ionicons name="list" size={24} color="#fff" />
        <Text style={styles.actionText}>View Pending Orders</Text>
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
  statCard: { flex: 1, backgroundColor: '#fff', borderRadius: 12, padding: 14, borderLeftWidth: 3, borderWidth: 1, borderColor: '#c8e6c9' },
  statValue: { fontSize: 18, fontWeight: '800', color: '#1b3b1b' },
  statLabel: { fontSize: 12, color: '#4a7a4a', marginTop: 4 },
  actionBtn: { flexDirection: 'row', backgroundColor: '#2e7d32', borderRadius: 14, padding: 18, alignItems: 'center', justifyContent: 'center', gap: 10 },
  actionText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});

import React, { useState, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import client from '../../api/client';

export default function PendingOrders({ navigation }) {
  const [orders, setOrders] = useState([]);
  const [filter, setFilter] = useState('pending');
  const [loading, setLoading] = useState(true);

  useFocusEffect(useCallback(() => {
    fetchOrders();
  }, []));

  const fetchOrders = async () => {
    try {
      const { data } = await client.get(`/orders/?status=${filter}`);
      setOrders(data);
    } catch { }
    setLoading(false);
  };

  const acceptOrder = async (id) => {
    try {
      await client.post(`/orders/${id}/accept/`);
      fetchOrders();
    } catch (e) {
      Alert.alert('Error', e.response?.data?.error || 'Failed');
    }
  };

  if (loading) return <View style={styles.center}><ActivityIndicator size="large" color="#2e7d32" /></View>;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Orders</Text>

      <View style={styles.filterRow}>
        {['pending', 'claimed', 'preparing'].map(s => (
          <TouchableOpacity key={s} style={[styles.filterChip, filter === s && styles.filterActive]}
            onPress={() => setFilter(s)}>
            <Text style={[styles.filterText, filter === s && styles.filterTextActive]}>{s}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={orders}
        keyExtractor={item => String(item.id)}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.card} onPress={() => navigation.navigate('OrderDetail', { orderId: item.id })}>
            <View style={styles.cardHeader}>
              <Text style={styles.orderNum}>{item.order_number}</Text>
              <Text style={styles.customer}>{item.customer_name}</Text>
            </View>
            <Text style={styles.waiter}>Waiter: {item.waiter_name || 'N/A'}</Text>
            <Text style={styles.total}>Ksh {item.total_amount}</Text>
            {filter === 'pending' && (
              <TouchableOpacity style={styles.acceptBtn} onPress={() => acceptOrder(item.id)}>
                <Text style={styles.acceptText}>Accept</Text>
              </TouchableOpacity>
            )}
          </TouchableOpacity>
        )}
        ListEmptyComponent={<Text style={styles.empty}>No orders</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f0f7f0', paddingTop: 60, paddingHorizontal: 16 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f0f7f0' },
  title: { fontSize: 22, fontWeight: '700', color: '#1b3b1b', marginBottom: 12 },
  filterRow: { flexDirection: 'row', gap: 8, marginBottom: 12 },
  filterChip: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, backgroundColor: '#e8f5e9', borderWidth: 1, borderColor: '#c8e6c9' },
  filterActive: { backgroundColor: '#2e7d32', borderColor: '#2e7d32' },
  filterText: { fontSize: 13, color: '#4a7a4a', fontWeight: '500' },
  filterTextActive: { color: '#fff' },
  card: { backgroundColor: '#fff', borderRadius: 12, padding: 14, marginBottom: 10, borderWidth: 1, borderColor: '#c8e6c9' },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  orderNum: { fontSize: 15, fontWeight: '700', color: '#1b3b1b' },
  customer: { fontSize: 13, color: '#4a7a4a' },
  waiter: { fontSize: 12, color: '#8aaa8a', marginBottom: 4 },
  total: { fontSize: 16, fontWeight: '700', color: '#d4a84b' },
  acceptBtn: { backgroundColor: '#2e7d32', borderRadius: 8, paddingVertical: 8, alignItems: 'center', marginTop: 8 },
  acceptText: { color: '#fff', fontWeight: '700', fontSize: 14 },
  empty: { textAlign: 'center', color: '#8aaa8a', marginTop: 40 },
});

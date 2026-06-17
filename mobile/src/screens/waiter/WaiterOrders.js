import React, { useState, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import client from '../../api/client';

const statusColors = {
  pending: '#f39c12', claimed: '#3498db', preparing: '#9b59b6',
  ready: '#27ae60', picked_up: '#2e7d32', delivered: '#2e7d32', cancelled: '#c0392b',
};

export default function WaiterOrders({ navigation }) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useFocusEffect(useCallback(() => {
    fetchOrders();
  }, []));

  const fetchOrders = async () => {
    try {
      const { data } = await client.get('/orders/');
      setOrders(data);
    } catch { }
    setLoading(false);
  };

  if (loading) return <View style={styles.center}><ActivityIndicator size="large" color="#2e7d32" /></View>;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>My Orders</Text>
      <FlatList
        data={orders}
        keyExtractor={item => String(item.id)}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.card} onPress={() => navigation.navigate('OrderDetail', { orderId: item.id })}>
            <View style={styles.cardHeader}>
              <Text style={styles.orderNum}>{item.order_number}</Text>
              <View style={[styles.statusBadge, { backgroundColor: statusColors[item.status] || '#888' }]}>
                <Text style={styles.statusText}>{item.status}</Text>
              </View>
            </View>
            <View style={styles.cardBody}>
              <Text style={styles.customer}>{item.customer_name}</Text>
              <Text style={styles.total}>Ksh {item.total_amount}</Text>
            </View>
            <Text style={styles.date}>{new Date(item.created_at).toLocaleString()}</Text>
          </TouchableOpacity>
        )}
        ListEmptyComponent={<Text style={styles.empty}>No orders yet</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f0f7f0', paddingTop: 60, paddingHorizontal: 16 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f0f7f0' },
  title: { fontSize: 22, fontWeight: '700', color: '#1b3b1b', marginBottom: 16 },
  card: { backgroundColor: '#fff', borderRadius: 12, padding: 14, marginBottom: 10, borderWidth: 1, borderColor: '#c8e6c9' },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  orderNum: { fontSize: 15, fontWeight: '700', color: '#1b3b1b' },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 3, borderRadius: 10 },
  statusText: { color: '#fff', fontWeight: '600', fontSize: 11 },
  cardBody: { flexDirection: 'row', justifyContent: 'space-between' },
  customer: { fontSize: 13, color: '#4a7a4a' },
  total: { fontSize: 15, fontWeight: '700', color: '#d4a84b' },
  date: { fontSize: 11, color: '#8aaa8a', marginTop: 6 },
  empty: { textAlign: 'center', color: '#8aaa8a', marginTop: 40 },
});

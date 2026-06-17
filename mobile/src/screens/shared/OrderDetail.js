import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import client from '../../api/client';
import { useAuth } from '../../context/AuthContext';

export default function OrderDetail({ route, navigation }) {
  const { orderId } = route.params;
  const { role } = useAuth();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => { fetchOrder(); }, []);

  const fetchOrder = async () => {
    try {
      const { data } = await client.get(`/orders/${orderId}/`);
      setOrder(data);
    } catch { }
    setLoading(false);
  };

  const handleAction = async (action) => {
    setActionLoading(true);
    try {
      await client.post(`/orders/${orderId}/${action}/`);
      fetchOrder();
    } catch (e) {
      alert(e.response?.data?.error || 'Action failed');
    }
    setActionLoading(false);
  };

  if (loading) return <View style={styles.center}><ActivityIndicator size="large" color="#2e7d32" /></View>;
  if (!order) return <View style={styles.center}><Text>Order not found</Text></View>;

  const statusColors = {
    pending: '#f39c12', claimed: '#3498db', preparing: '#9b59b6',
    ready: '#27ae60', picked_up: '#2e7d32', delivered: '#2e7d32', cancelled: '#c0392b',
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#1b3b1b" />
        </TouchableOpacity>
        <Text style={styles.title}>Order {order.order_number}</Text>
        <View style={[styles.statusBadge, { backgroundColor: statusColors[order.status] || '#888' }]}>
          <Text style={styles.statusText}>{order.status}</Text>
        </View>
      </View>

      <View style={styles.infoCard}>
        <View style={styles.infoRow}>
          <Text style={styles.label}>Customer:</Text>
          <Text style={styles.value}>{order.customer_name}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.label}>Waiter:</Text>
          <Text style={styles.value}>{order.waiter_name || 'N/A'}</Text>
        </View>
        {order.counter_name && (
          <View style={styles.infoRow}>
            <Text style={styles.label}>Counter:</Text>
            <Text style={styles.value}>{order.counter_name}</Text>
          </View>
        )}
        <View style={styles.infoRow}>
          <Text style={styles.label}>Date:</Text>
          <Text style={styles.value}>{new Date(order.created_at).toLocaleString()}</Text>
        </View>
        {order.notes ? (
          <View style={styles.infoRow}>
            <Text style={styles.label}>Notes:</Text>
            <Text style={styles.value}>{order.notes}</Text>
          </View>
        ) : null}
      </View>

      <Text style={styles.sectionTitle}>Items</Text>
      <FlatList
        data={order.items}
        keyExtractor={item => String(item.id)}
        renderItem={({ item }) => (
          <View style={styles.itemRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.itemName}>{item.product_name}</Text>
              <Text style={styles.itemQty}>x{item.quantity} @ Ksh {item.unit_price}</Text>
            </View>
            <Text style={styles.itemTotal}>Ksh {item.subtotal}</Text>
          </View>
        )}
      />

      <View style={styles.totalRow}>
        <Text style={styles.totalLabel}>Total</Text>
        <Text style={styles.totalAmount}>Ksh {order.total_amount}</Text>
      </View>

      {role === 'counter' && order.status === 'pending' && (
        <TouchableOpacity style={styles.actionBtn} onPress={() => handleAction('accept')} disabled={actionLoading}>
          {actionLoading ? <ActivityIndicator color="#fff" /> : <Text style={styles.actionText}>Accept Order</Text>}
        </TouchableOpacity>
      )}

      {(role === 'counter' && order.status === 'claimed') && (
        <TouchableOpacity style={styles.actionBtn} onPress={() => navigation.navigate('ProcessOrder', { orderId: order.id })}>
          <Text style={styles.actionText}>Process Receipt</Text>
        </TouchableOpacity>
      )}

      {order.status !== 'delivered' && order.status !== 'cancelled' && role !== 'counter' && (
        <TouchableOpacity style={[styles.actionBtn, { backgroundColor: '#c0392b' }]} onPress={() => handleAction('cancel')}>
          <Text style={styles.actionText}>Cancel Order</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f0f7f0', paddingTop: 60, paddingHorizontal: 16 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f0f7f0' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 },
  title: { fontSize: 18, fontWeight: '700', color: '#1b3b1b', flex: 1, marginLeft: 12 },
  statusBadge: { paddingHorizontal: 12, paddingVertical: 4, borderRadius: 12 },
  statusText: { color: '#fff', fontWeight: '600', fontSize: 12 },
  infoCard: { backgroundColor: '#fff', borderRadius: 12, padding: 14, marginBottom: 16, borderWidth: 1, borderColor: '#c8e6c9' },
  infoRow: { flexDirection: 'row', paddingVertical: 4 },
  label: { color: '#4a7a4a', fontSize: 13, width: 80 },
  value: { color: '#1b3b1b', fontWeight: '500', fontSize: 13, flex: 1 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: '#1b3b1b', marginBottom: 8 },
  itemRow: { flexDirection: 'row', backgroundColor: '#fff', borderRadius: 8, padding: 10, marginBottom: 6, borderWidth: 1, borderColor: '#c8e6c9' },
  itemName: { fontSize: 14, fontWeight: '500', color: '#1b3b1b' },
  itemQty: { fontSize: 12, color: '#4a7a4a', marginTop: 2 },
  itemTotal: { fontSize: 14, fontWeight: '700', color: '#d4a84b' },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 12, marginTop: 8 },
  totalLabel: { fontSize: 16, fontWeight: '700', color: '#1b3b1b' },
  totalAmount: { fontSize: 18, fontWeight: '800', color: '#d4a84b' },
  actionBtn: { backgroundColor: '#2e7d32', borderRadius: 12, paddingVertical: 14, alignItems: 'center', marginTop: 12 },
  actionText: { color: '#fff', fontWeight: '700', fontSize: 15 },
});

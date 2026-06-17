import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import client from '../../api/client';

const paymentMethods = ['cash', 'card', 'mobile', 'mpesa'];

export default function ProcessOrder({ route, navigation }) {
  const { orderId } = route.params;
  const [order, setOrder] = useState(null);
  const [method, setMethod] = useState('cash');
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);

  useEffect(() => { fetchOrder(); }, []);

  const fetchOrder = async () => {
    try {
      const { data } = await client.get(`/orders/${orderId}/`);
      setOrder(data);
    } catch { }
    setLoading(false);
  };

  const process = async () => {
    setProcessing(true);
    try {
      await client.post(`/orders/${orderId}/process/`, { method });
      Alert.alert('Success', 'Order processed!', [
        { text: 'OK', onPress: () => navigation.goBack() }
      ]);
    } catch (e) {
      Alert.alert('Error', e.response?.data?.error || 'Failed');
    }
    setProcessing(false);
  };

  if (loading) return <View style={styles.center}><ActivityIndicator size="large" color="#2e7d32" /></View>;
  if (!order) return null;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="close" size={24} color="#1b3b1b" />
        </TouchableOpacity>
        <Text style={styles.title}>Process Order</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.infoCard}>
        <Text style={styles.orderNum}>{order.order_number}</Text>
        <Text style={styles.customer}>{order.customer_name}</Text>
      </View>

      <Text style={styles.sectionTitle}>Items</Text>
      <FlatList
        data={order.items}
        keyExtractor={item => String(item.id)}
        renderItem={({ item }) => (
          <View style={styles.itemRow}>
            <Text style={styles.itemName}>{item.product_name} x{item.quantity}</Text>
            <Text style={styles.itemTotal}>Ksh {item.subtotal}</Text>
          </View>
        )}
      />

      <View style={styles.totalRow}>
        <Text style={styles.totalLabel}>Total</Text>
        <Text style={styles.totalAmount}>Ksh {order.total_amount}</Text>
      </View>

      <Text style={styles.sectionTitle}>Payment Method</Text>
      <View style={styles.methodRow}>
        {paymentMethods.map(m => (
          <TouchableOpacity key={m} style={[styles.methodChip, method === m && styles.methodActive]}
            onPress={() => setMethod(m)}>
            <Text style={[styles.methodText, method === m && styles.methodTextActive]}>{m}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <TouchableOpacity style={styles.processBtn} onPress={process} disabled={processing}>
        {processing ? <ActivityIndicator color="#fff" /> : (
          <Text style={styles.processText}>Complete & Print Receipt</Text>
        )}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f0f7f0', paddingTop: 60, paddingHorizontal: 16 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f0f7f0' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  title: { fontSize: 20, fontWeight: '700', color: '#1b3b1b' },
  infoCard: { backgroundColor: '#fff', borderRadius: 12, padding: 14, marginBottom: 16, borderWidth: 1, borderColor: '#c8e6c9' },
  orderNum: { fontSize: 16, fontWeight: '700', color: '#1b3b1b' },
  customer: { fontSize: 13, color: '#4a7a4a', marginTop: 4 },
  sectionTitle: { fontSize: 16, fontWeight: '600', color: '#4a7a4a', marginBottom: 8, marginTop: 8 },
  itemRow: { flexDirection: 'row', justifyContent: 'space-between', backgroundColor: '#fff', borderRadius: 8, padding: 10, marginBottom: 6, borderWidth: 1, borderColor: '#c8e6c9' },
  itemName: { fontSize: 14, color: '#1b3b1b' },
  itemTotal: { fontSize: 14, fontWeight: '700', color: '#d4a84b' },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 12, marginBottom: 8 },
  totalLabel: { fontSize: 18, fontWeight: '700', color: '#1b3b1b' },
  totalAmount: { fontSize: 20, fontWeight: '800', color: '#d4a84b' },
  methodRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 24 },
  methodChip: { paddingHorizontal: 20, paddingVertical: 10, borderRadius: 20, backgroundColor: '#e8f5e9', borderWidth: 1, borderColor: '#c8e6c9' },
  methodActive: { backgroundColor: '#2e7d32', borderColor: '#2e7d32' },
  methodText: { fontSize: 14, color: '#4a7a4a', fontWeight: '500' },
  methodTextActive: { color: '#fff' },
  processBtn: { backgroundColor: '#2e7d32', borderRadius: 14, paddingVertical: 16, alignItems: 'center', marginTop: 'auto' },
  processText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});

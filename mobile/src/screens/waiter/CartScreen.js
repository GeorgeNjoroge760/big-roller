import React, { useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, TextInput, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import client from '../../api/client';

export default function CartScreen({ route, navigation }) {
  const { cart } = route.params;
  const [items, setItems] = useState(Object.values(cart));
  const [customerName, setCustomerName] = useState('Walk-in Customer');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);

  const updateQty = (productId, delta) => {
    setItems(prev => prev.map(item => {
      if (item.id !== productId) return item;
      const qty = item.quantity + delta;
      return qty <= 0 ? null : { ...item, quantity: qty };
    }).filter(Boolean));
  };

  const total = items.reduce((sum, item) => sum + parseFloat(item.price) * item.quantity, 0);

  const placeOrder = async () => {
    if (items.length === 0) {
      Alert.alert('Error', 'Cart is empty');
      return;
    }
    setLoading(true);
    try {
      await client.post('/orders/place/', {
        customer_name: customerName,
        notes,
        items: items.map(item => ({ product_id: item.id, quantity: item.quantity })),
      });
      Alert.alert('Success', 'Order placed!', [
        { text: 'OK', onPress: () => navigation.navigate('Orders') }
      ]);
    } catch (e) {
      Alert.alert('Error', e.response?.data?.error || 'Failed to place order');
    }
    setLoading(false);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="close" size={24} color="#1b3b1b" />
        </TouchableOpacity>
        <Text style={styles.title}>Cart ({items.length})</Text>
        <View style={{ width: 24 }} />
      </View>

      <TextInput style={styles.input} placeholder="Customer name" placeholderTextColor="#8aaa8a"
        value={customerName} onChangeText={setCustomerName} />
      <TextInput style={styles.input} placeholder="Notes (optional)" placeholderTextColor="#8aaa8a"
        value={notes} onChangeText={setNotes} multiline />

      <FlatList
        data={items}
        keyExtractor={item => String(item.id)}
        renderItem={({ item }) => (
          <View style={styles.itemRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.itemName}>{item.name}</Text>
              <Text style={styles.itemPrice}>Ksh {item.price}</Text>
            </View>
            <View style={styles.qtyRow}>
              <TouchableOpacity style={styles.qtyBtn} onPress={() => updateQty(item.id, -1)}>
                <Ionicons name="remove" size={16} color="#fff" />
              </TouchableOpacity>
              <Text style={styles.qtyText}>{item.quantity}</Text>
              <TouchableOpacity style={styles.qtyBtn} onPress={() => updateQty(item.id, 1)}>
                <Ionicons name="add" size={16} color="#fff" />
              </TouchableOpacity>
            </View>
            <Text style={styles.subtotal}>Ksh {(item.price * item.quantity).toFixed(0)}</Text>
          </View>
        )}
      />

      <View style={styles.footer}>
        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>Total</Text>
          <Text style={styles.totalAmount}>Ksh {total.toFixed(2)}</Text>
        </View>
        <TouchableOpacity style={styles.orderBtn} onPress={placeOrder} disabled={loading}>
          {loading ? <ActivityIndicator color="#fff" /> : (
            <Text style={styles.orderBtnText}>Place Order</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f0f7f0', paddingTop: 60, paddingHorizontal: 16 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  title: { fontSize: 20, fontWeight: '700', color: '#1b3b1b' },
  input: { backgroundColor: '#fff', borderRadius: 10, padding: 12, fontSize: 14, borderWidth: 1, borderColor: '#c8e6c9', marginBottom: 10 },
  itemRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 10, padding: 12, marginBottom: 8, borderWidth: 1, borderColor: '#c8e6c9' },
  itemName: { fontSize: 14, fontWeight: '600', color: '#1b3b1b' },
  itemPrice: { fontSize: 12, color: '#4a7a4a', marginTop: 2 },
  qtyRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginHorizontal: 12 },
  qtyBtn: { backgroundColor: '#2e7d32', borderRadius: 6, width: 26, height: 26, justifyContent: 'center', alignItems: 'center' },
  qtyText: { fontSize: 16, fontWeight: '700', color: '#1b3b1b', minWidth: 20, textAlign: 'center' },
  subtotal: { fontSize: 14, fontWeight: '700', color: '#d4a84b', minWidth: 60, textAlign: 'right' },
  footer: { borderTopWidth: 1, borderTopColor: '#c8e6c9', paddingTop: 16, paddingBottom: 32 },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  totalLabel: { fontSize: 18, fontWeight: '700', color: '#1b3b1b' },
  totalAmount: { fontSize: 20, fontWeight: '800', color: '#d4a84b' },
  orderBtn: { backgroundColor: '#2e7d32', borderRadius: 14, paddingVertical: 16, alignItems: 'center' },
  orderBtnText: { color: '#fff', fontSize: 18, fontWeight: '700' },
});

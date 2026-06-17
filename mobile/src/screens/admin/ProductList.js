import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import client from '../../api/client';

export default function ProductList({ navigation }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const { data } = await client.get('/products/');
        setProducts(data);
      } catch { }
      setLoading(false);
    })();
  }, []);

  if (loading) return <View style={styles.center}><ActivityIndicator size="large" color="#2e7d32" /></View>;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Products ({products.length})</Text>
      <FlatList
        data={products}
        keyExtractor={item => String(item.id)}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={styles.cardLeft}>
              <Text style={styles.productName}>{item.name}</Text>
              <Text style={styles.productCat}>{item.category_name}</Text>
            </View>
            <View style={styles.cardRight}>
              <Text style={styles.price}>Ksh {item.price}</Text>
              <View style={[styles.stockBadge, { backgroundColor: item.stock <= item.min_stock_level ? '#f39c12' : '#2e7d32' }]}>
                <Text style={styles.stockText}>{item.stock} left</Text>
              </View>
            </View>
          </View>
        )}
        ListEmptyComponent={<Text style={styles.empty}>No products</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f0f7f0', paddingTop: 60, paddingHorizontal: 16 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f0f7f0' },
  title: { fontSize: 22, fontWeight: '700', color: '#1b3b1b', marginBottom: 16 },
  card: { flexDirection: 'row', justifyContent: 'space-between', backgroundColor: '#fff', borderRadius: 12, padding: 14, marginBottom: 8, borderWidth: 1, borderColor: '#c8e6c9' },
  cardLeft: { flex: 1 },
  productName: { fontSize: 15, fontWeight: '600', color: '#1b3b1b' },
  productCat: { fontSize: 12, color: '#8aaa8a', marginTop: 2 },
  cardRight: { alignItems: 'flex-end' },
  price: { fontSize: 15, fontWeight: '700', color: '#d4a84b' },
  stockBadge: { paddingHorizontal: 10, paddingVertical: 3, borderRadius: 10, marginTop: 4 },
  stockText: { color: '#fff', fontWeight: '600', fontSize: 11 },
  empty: { textAlign: 'center', color: '#8aaa8a', marginTop: 40 },
});

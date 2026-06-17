import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, TextInput, StyleSheet, ActivityIndicator, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import client from '../../api/client';

export default function MenuScreen({ navigation }) {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCat, setSelectedCat] = useState(null);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [cart, setCart] = useState({});

  useEffect(() => {
    (async () => {
      try {
        const [pRes, cRes] = await Promise.all([
          client.get('/products/'),
          client.get('/categories/'),
        ]);
        setProducts(pRes.data);
        setCategories(cRes.data);
      } catch { }
      setLoading(false);
    })();
  }, []);

  const addToCart = (product) => {
    setCart(prev => {
      const qty = (prev[product.id]?.quantity || 0) + 1;
      return { ...prev, [product.id]: { ...product, quantity: qty } };
    });
  };

  const removeFromCart = (productId) => {
    setCart(prev => {
      if (!prev[productId]) return prev;
      if (prev[productId].quantity <= 1) {
        const { [productId]: _, ...rest } = prev;
        return rest;
      }
      return { ...prev, [productId]: { ...prev[productId], quantity: prev[productId].quantity - 1 } };
    });
  };

  const filtered = products.filter(p => {
    if (selectedCat && p.category !== selectedCat) return false;
    if (search && !p.name.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const cartCount = Object.values(cart).reduce((sum, item) => sum + item.quantity, 0);

  if (loading) return <View style={styles.center}><ActivityIndicator size="large" color="#2e7d32" /></View>;

  return (
    <View style={styles.container}>
      <View style={styles.topBar}>
        <Text style={styles.title}>Menu</Text>
        <TouchableOpacity onPress={() => navigation.navigate('Cart', { cart })} style={styles.cartBtn}>
          <Ionicons name="cart" size={24} color="#2e7d32" />
          {cartCount > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{cartCount}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      <TextInput
        style={styles.search}
        placeholder="Search products..."
        placeholderTextColor="#8aaa8a"
        value={search}
        onChangeText={setSearch}
      />

      <FlatList
        horizontal
        data={categories}
        keyExtractor={item => String(item.id)}
        showsHorizontalScrollIndicator={false}
        style={styles.catList}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[styles.catChip, selectedCat === item.id && styles.catActive]}
            onPress={() => setSelectedCat(selectedCat === item.id ? null : item.id)}
          >
            <Text style={[styles.catText, selectedCat === item.id && styles.catTextActive]}>{item.name}</Text>
          </TouchableOpacity>
        )}
      />

      <FlatList
        data={filtered}
        keyExtractor={item => String(item.id)}
        numColumns={2}
        columnWrapperStyle={{ gap: 10 }}
        contentContainerStyle={{ paddingBottom: 20 }}
        renderItem={({ item }) => {
          const inCart = cart[item.id];
          return (
            <View style={styles.productCard}>
              <View style={styles.productImg}>
                <Ionicons name="cube" size={32} color="#c8e6c9" />
              </View>
              <Text style={styles.productName}>{item.name}</Text>
              <Text style={styles.productCat}>{item.category_name}</Text>
              <Text style={styles.productPrice}>Ksh {item.price}</Text>
              <View style={styles.productActions}>
                {inCart ? (
                  <View style={styles.qtyRow}>
                    <TouchableOpacity style={styles.qtyBtn} onPress={() => removeFromCart(item.id)}>
                      <Ionicons name="remove" size={16} color="#fff" />
                    </TouchableOpacity>
                    <Text style={styles.qtyText}>{inCart.quantity}</Text>
                    <TouchableOpacity style={styles.qtyBtn} onPress={() => addToCart(item)}>
                      <Ionicons name="add" size={16} color="#fff" />
                    </TouchableOpacity>
                  </View>
                ) : (
                  <TouchableOpacity style={styles.addBtn} onPress={() => addToCart(item)}>
                    <Ionicons name="add" size={18} color="#fff" />
                    <Text style={styles.addText}>Add</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          );
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f0f7f0', paddingTop: 60, paddingHorizontal: 12 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f0f7f0' },
  topBar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  title: { fontSize: 22, fontWeight: '700', color: '#1b3b1b' },
  cartBtn: { position: 'relative', padding: 4 },
  badge: { position: 'absolute', top: -4, right: -4, backgroundColor: '#c0392b', borderRadius: 10, width: 20, height: 20, justifyContent: 'center', alignItems: 'center' },
  badgeText: { color: '#fff', fontSize: 11, fontWeight: '700' },
  search: { backgroundColor: '#fff', borderRadius: 12, padding: 12, fontSize: 14, borderWidth: 1, borderColor: '#c8e6c9', marginBottom: 12 },
  catList: { maxHeight: 44, marginBottom: 12 },
  catChip: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, backgroundColor: '#e8f5e9', marginRight: 8, borderWidth: 1, borderColor: '#c8e6c9' },
  catActive: { backgroundColor: '#2e7d32', borderColor: '#2e7d32' },
  catText: { fontSize: 13, color: '#4a7a4a', fontWeight: '500' },
  catTextActive: { color: '#fff' },
  productCard: { flex: 1, backgroundColor: '#fff', borderRadius: 12, padding: 10, marginBottom: 10, borderWidth: 1, borderColor: '#c8e6c9' },
  productImg: { height: 80, backgroundColor: '#f8fcf8', borderRadius: 8, justifyContent: 'center', alignItems: 'center', marginBottom: 8 },
  productName: { fontSize: 14, fontWeight: '600', color: '#1b3b1b' },
  productCat: { fontSize: 11, color: '#8aaa8a', marginTop: 2 },
  productPrice: { fontSize: 15, fontWeight: '800', color: '#d4a84b', marginTop: 4 },
  productActions: { marginTop: 8 },
  addBtn: { flexDirection: 'row', backgroundColor: '#2e7d32', borderRadius: 8, paddingVertical: 6, justifyContent: 'center', alignItems: 'center', gap: 4 },
  addText: { color: '#fff', fontWeight: '600', fontSize: 13 },
  qtyRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  qtyBtn: { backgroundColor: '#2e7d32', borderRadius: 6, width: 28, height: 28, justifyContent: 'center', alignItems: 'center' },
  qtyText: { fontSize: 16, fontWeight: '700', color: '#1b3b1b', minWidth: 20, textAlign: 'center' },
});

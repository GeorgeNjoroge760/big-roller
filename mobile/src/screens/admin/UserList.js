import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import client from '../../api/client';

const roleColors = { admin: '#c0392b', waiter: '#2e7d32', counter: '#2980b9' };

export default function UserList({ navigation }) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const { data } = await client.get('/auth/me/');
        // We'd need a users endpoint - for now show current user
        setUsers([data]);
      } catch { }
      setLoading(false);
    })();
  }, []);

  if (loading) return <View style={styles.center}><ActivityIndicator size="large" color="#2e7d32" /></View>;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Users ({users.length})</Text>
      <FlatList
        data={users}
        keyExtractor={item => String(item.id)}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Ionicons name="person-circle" size={40} color="#2e7d32" />
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={styles.username}>{item.username}</Text>
              <Text style={styles.email}>{item.email || 'No email'}</Text>
            </View>
            <View style={[styles.roleBadge, { backgroundColor: roleColors[item.profile?.role] || '#888' }]}>
              <Text style={styles.roleText}>{item.profile?.role || 'N/A'}</Text>
            </View>
          </View>
        )}
        ListEmptyComponent={<Text style={styles.empty}>No users</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f0f7f0', paddingTop: 60, paddingHorizontal: 16 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f0f7f0' },
  title: { fontSize: 22, fontWeight: '700', color: '#1b3b1b', marginBottom: 16 },
  card: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 12, padding: 14, marginBottom: 8, borderWidth: 1, borderColor: '#c8e6c9' },
  username: { fontSize: 15, fontWeight: '600', color: '#1b3b1b' },
  email: { fontSize: 12, color: '#4a7a4a', marginTop: 2 },
  roleBadge: { paddingHorizontal: 12, paddingVertical: 4, borderRadius: 12 },
  roleText: { color: '#fff', fontWeight: '600', fontSize: 12 },
  empty: { textAlign: 'center', color: '#8aaa8a', marginTop: 40 },
});

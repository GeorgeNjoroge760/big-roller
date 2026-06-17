import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import client from '../../api/client';

const typeColors = { info: '#2e7d32', success: '#27ae60', warning: '#f39c12', danger: '#c0392b' };

export default function NotificationsScreen({ navigation }) {
  const [notifs, setNotifs] = useState([]);
  const [loading, setLoading] = useState(true);

  useFocusEffect(useCallback(() => {
    fetchNotifs();
  }, []));

  const fetchNotifs = async () => {
    try {
      const { data } = await client.get('/notifications/');
      setNotifs(data);
    } catch { }
    setLoading(false);
  };

  const markRead = async (id) => {
    try {
      await client.post(`/notifications/${id}/read/`);
      setNotifs(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
    } catch { }
  };

  if (loading) return <View style={styles.center}><ActivityIndicator size="large" color="#2e7d32" /></View>;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#1b3b1b" />
        </TouchableOpacity>
        <Text style={styles.title}>Notifications</Text>
        <TouchableOpacity onPress={async () => {
          await client.post('/notifications/read-all/');
          fetchNotifs();
        }}>
          <Text style={styles.markAll}>Mark all read</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={notifs}
        keyExtractor={item => String(item.id)}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[styles.card, !item.is_read && styles.unread]}
            onPress={() => markRead(item.id)}
          >
            <View style={styles.row}>
              <View style={[styles.dot, { backgroundColor: typeColors[item.notification_type] || '#2e7d32' }]} />
              <View style={{ flex: 1 }}>
                <Text style={[styles.notifTitle, !item.is_read && styles.bold]}>{item.title}</Text>
                <Text style={styles.message}>{item.message}</Text>
                <Text style={styles.date}>{new Date(item.created_at).toLocaleDateString()}</Text>
              </View>
            </View>
          </TouchableOpacity>
        )}
        ListEmptyComponent={<Text style={styles.empty}>No notifications</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f0f7f0', paddingTop: 60, paddingHorizontal: 16 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f0f7f0' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 },
  title: { fontSize: 20, fontWeight: '700', color: '#1b3b1b', flex: 1, marginLeft: 12 },
  markAll: { color: '#2e7d32', fontWeight: '600', fontSize: 13 },
  card: { backgroundColor: '#fff', borderRadius: 12, padding: 14, marginBottom: 8, borderWidth: 1, borderColor: '#c8e6c9' },
  unread: { borderLeftWidth: 3, borderLeftColor: '#2e7d32' },
  row: { flexDirection: 'row', gap: 10 },
  dot: { width: 10, height: 10, borderRadius: 5, marginTop: 5 },
  notifTitle: { fontSize: 14, color: '#1b3b1b' },
  bold: { fontWeight: '700' },
  message: { fontSize: 13, color: '#4a7a4a', marginTop: 2 },
  date: { fontSize: 11, color: '#8aaa8a', marginTop: 4 },
  empty: { textAlign: 'center', color: '#8aaa8a', marginTop: 40 },
});

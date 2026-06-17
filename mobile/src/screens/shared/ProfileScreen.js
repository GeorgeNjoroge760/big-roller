import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';

export default function ProfileScreen() {
  const { user, logout } = useAuth();
  const profile = user?.profile || {};
  const roleColors = { admin: '#c0392b', waiter: '#2e7d32', counter: '#2980b9' };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Ionicons name="cafe" size={28} color="#d4a84b" />
        <Text style={styles.title}>Cheers Club</Text>
      </View>

      <View style={styles.avatar}>
        <Ionicons name="person-circle" size={80} color="#2e7d32" />
      </View>
      <Text style={styles.name}>{user?.username}</Text>
      <View style={[styles.badge, { backgroundColor: roleColors[profile.role] || '#2e7d32' }]}>
        <Text style={styles.badgeText}>{profile.role?.charAt(0).toUpperCase() + profile.role?.slice(1) || 'N/A'}</Text>
      </View>

      <View style={styles.infoCard}>
        <View style={styles.infoRow}>
          <Ionicons name="person" size={18} color="#4a7a4a" />
          <Text style={styles.infoLabel}>Username</Text>
          <Text style={styles.infoValue}>{user?.username}</Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.infoRow}>
          <Ionicons name="mail" size={18} color="#4a7a4a" />
          <Text style={styles.infoLabel}>Email</Text>
          <Text style={styles.infoValue}>{user?.email || 'N/A'}</Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.infoRow}>
          <Ionicons name="phone" size={18} color="#4a7a4a" />
          <Text style={styles.infoLabel}>Phone</Text>
          <Text style={styles.infoValue}>{profile.phone || 'N/A'}</Text>
        </View>
      </View>

      <TouchableOpacity style={styles.logoutBtn} onPress={logout}>
        <Ionicons name="log-out" size={20} color="#fff" />
        <Text style={styles.logoutText}>Logout</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f0f7f0', paddingTop: 60, alignItems: 'center' },
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: 20, gap: 8 },
  title: { fontSize: 22, fontWeight: '800', color: '#d4a84b' },
  avatar: { marginBottom: 8 },
  name: { fontSize: 22, fontWeight: '700', color: '#1b3b1b' },
  badge: { paddingHorizontal: 16, paddingVertical: 4, borderRadius: 20, marginBottom: 24 },
  badgeText: { color: '#fff', fontWeight: '600', fontSize: 13 },
  infoCard: {
    backgroundColor: '#fff', borderRadius: 16, padding: 16, width: '85%',
    borderWidth: 1, borderColor: '#c8e6c9', marginBottom: 24,
  },
  infoRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 8, gap: 10 },
  infoLabel: { color: '#4a7a4a', fontSize: 14, flex: 1 },
  infoValue: { color: '#1b3b1b', fontWeight: '600', fontSize: 14 },
  divider: { height: 1, backgroundColor: '#e8f5e9' },
  logoutBtn: {
    flexDirection: 'row', backgroundColor: '#c0392b', borderRadius: 12, paddingVertical: 14,
    paddingHorizontal: 32, alignItems: 'center', gap: 8,
  },
  logoutText: { color: '#fff', fontWeight: '600', fontSize: 16 },
});

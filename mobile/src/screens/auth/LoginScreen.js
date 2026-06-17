import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, KeyboardAvoidingView, Platform, Alert, ActivityIndicator
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';

export default function LoginScreen() {
  const { login } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPwd, setShowPwd] = useState(false);

  const handleLogin = async () => {
    if (!username || !password) {
      Alert.alert('Error', 'Please enter username and password');
      return;
    }
    setLoading(true);
    try {
      await login(username, password);
    } catch (e) {
      Alert.alert('Login Failed', e.response?.data?.error || 'Invalid credentials');
    }
    setLoading(false);
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <View style={styles.card}>
        <View style={styles.logo}>
          <Ionicons name="cafe" size={48} color="#fff" />
        </View>
        <Text style={styles.title}>Cheers Club</Text>
        <Text style={styles.subtitle}>Club & Bar Management</Text>

        <View style={styles.inputGroup}>
          <Ionicons name="person" size={20} color="#8aaa8a" style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="Username"
            placeholderTextColor="#8aaa8a"
            value={username}
            onChangeText={setUsername}
            autoCapitalize="none"
          />
        </View>

        <View style={styles.inputGroup}>
          <Ionicons name="lock-closed" size={20} color="#8aaa8a" style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="Password"
            placeholderTextColor="#8aaa8a"
            value={password}
            onChangeText={setPassword}
            secureTextEntry={!showPwd}
          />
          <TouchableOpacity onPress={() => setShowPwd(!showPwd)}>
            <Ionicons name={showPwd ? 'eye-off' : 'eye'} size={20} color="#8aaa8a" />
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.button} onPress={handleLogin} disabled={loading}>
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Sign In</Text>
          )}
        </TouchableOpacity>

        <Text style={styles.footer}>
          <Ionicons name="cafe" size={12} color="#d4a84b" /> Cheers Club & Bar
        </Text>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f0f7f0', justifyContent: 'center', alignItems: 'center', padding: 24 },
  card: {
    backgroundColor: '#fff', borderRadius: 20, padding: 32, width: '100%', maxWidth: 400,
    borderWidth: 1, borderColor: '#c8e6c9', shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 32, elevation: 8,
  },
  logo: {
    width: 72, height: 72, borderRadius: 20, backgroundColor: '#2e7d32',
    justifyContent: 'center', alignItems: 'center', alignSelf: 'center', marginBottom: 16,
    shadowColor: '#2e7d32', shadowOpacity: 0.25, shadowRadius: 24, elevation: 8,
  },
  title: { fontSize: 28, fontWeight: '800', color: '#d4a84b', textAlign: 'center' },
  subtitle: { fontSize: 14, color: '#8aaa8a', textAlign: 'center', marginBottom: 32 },
  inputGroup: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#f8fcf8',
    borderWidth: 1, borderColor: '#c8e6c9', borderRadius: 12, paddingHorizontal: 14,
    marginBottom: 16, height: 50,
  },
  inputIcon: { marginRight: 10 },
  input: { flex: 1, fontSize: 16, color: '#1b3b1b' },
  button: {
    backgroundColor: '#2e7d32', borderRadius: 12, height: 50, justifyContent: 'center',
    alignItems: 'center', marginTop: 8, shadowColor: '#2e7d32', shadowOpacity: 0.2, shadowRadius: 16, elevation: 4,
  },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  footer: { textAlign: 'center', marginTop: 24, color: '#8aaa8a', fontSize: 12 },
});

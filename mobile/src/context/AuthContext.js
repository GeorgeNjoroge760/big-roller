import React, { createContext, useState, useEffect, useContext } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import client, { login as apiLogin, logout as apiLogout } from '../api/client';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const stored = await AsyncStorage.getItem('user');
        const token = await AsyncStorage.getItem('access_token');
        if (stored && token) {
          setUser(JSON.parse(stored));
        }
      } catch { }
      setLoading(false);
    })();
  }, []);

  const login = async (username, password) => {
    const data = await apiLogin(username, password);
    await AsyncStorage.setItem('user', JSON.stringify(data.user));
    setUser(data.user);
    return data;
  };

  const logout = async () => {
    await apiLogout();
    setUser(null);
  };

  const role = user?.profile?.role || null;

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, role }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

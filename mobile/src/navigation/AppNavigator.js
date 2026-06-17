import React from 'react';
import { ActivityIndicator, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';

// Auth
import LoginScreen from '../screens/auth/LoginScreen';

// Waiter
import WaiterDashboard from '../screens/waiter/WaiterDashboard';
import MenuScreen from '../screens/waiter/MenuScreen';
import CartScreen from '../screens/waiter/CartScreen';
import WaiterOrders from '../screens/waiter/WaiterOrders';
import OrderDetail from '../screens/shared/OrderDetail';

// Counter
import CounterDashboard from '../screens/counter/CounterDashboard';
import PendingOrders from '../screens/counter/PendingOrders';
import ProcessOrder from '../screens/counter/ProcessOrder';

// Admin
import AdminDashboard from '../screens/admin/AdminDashboard';
import ProductList from '../screens/admin/ProductList';
import UserList from '../screens/admin/UserList';

// Shared
import ProfileScreen from '../screens/shared/ProfileScreen';
import NotificationsScreen from '../screens/shared/NotificationsScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function WaiterTabs() {
  return (
    <Tab.Navigator screenOptions={{ headerShown: false, tabBarActiveTintColor: '#2e7d32' }}>
      <Tab.Screen name="Dashboard" component={WaiterDashboard}
        options={{ tabBarIcon: ({ color, size }) => <Ionicons name="speedometer" size={size} color={color} /> }} />
      <Tab.Screen name="Menu" component={MenuScreen}
        options={{ tabBarIcon: ({ color, size }) => <Ionicons name="menu" size={size} color={color} /> }} />
      <Tab.Screen name="Orders" component={WaiterOrders}
        options={{ tabBarIcon: ({ color, size }) => <Ionicons name="receipt" size={size} color={color} /> }} />
      <Tab.Screen name="Profile" component={ProfileScreen}
        options={{ tabBarIcon: ({ color, size }) => <Ionicons name="person" size={size} color={color} /> }} />
    </Tab.Navigator>
  );
}

function CounterTabs() {
  return (
    <Tab.Navigator screenOptions={{ headerShown: false, tabBarActiveTintColor: '#2e7d32' }}>
      <Tab.Screen name="Dashboard" component={CounterDashboard}
        options={{ tabBarIcon: ({ color, size }) => <Ionicons name="speedometer" size={size} color={color} /> }} />
      <Tab.Screen name="Pending" component={PendingOrders}
        options={{ tabBarIcon: ({ color, size }) => <Ionicons name="list" size={size} color={color} /> }} />
      <Tab.Screen name="Profile" component={ProfileScreen}
        options={{ tabBarIcon: ({ color, size }) => <Ionicons name="person" size={size} color={color} /> }} />
    </Tab.Navigator>
  );
}

function AdminTabs() {
  return (
    <Tab.Navigator screenOptions={{ headerShown: false, tabBarActiveTintColor: '#2e7d32' }}>
      <Tab.Screen name="Dashboard" component={AdminDashboard}
        options={{ tabBarIcon: ({ color, size }) => <Ionicons name="speedometer" size={size} color={color} /> }} />
      <Tab.Screen name="Products" component={ProductList}
        options={{ tabBarIcon: ({ color, size }) => <Ionicons name="cube" size={size} color={color} /> }} />
      <Tab.Screen name="Users" component={UserList}
        options={{ tabBarIcon: ({ color, size }) => <Ionicons name="people" size={size} color={color} /> }} />
      <Tab.Screen name="Profile" component={ProfileScreen}
        options={{ tabBarIcon: ({ color, size }) => <Ionicons name="person" size={size} color={color} /> }} />
    </Tab.Navigator>
  );
}

function MainNavigator() {
  const { role } = useAuth();
  if (role === 'waiter') return <WaiterTabs />;
  if (role === 'counter') return <CounterTabs />;
  if (role === 'admin') return <AdminTabs />;
  return <WaiterTabs />;
}

export default function AppNavigator() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f0f7f0' }}>
        <ActivityIndicator size="large" color="#2e7d32" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!user ? (
          <Stack.Screen name="Login" component={LoginScreen} />
        ) : (
          <>
            <Stack.Screen name="Main" component={MainNavigator} />
            <Stack.Screen name="Cart" component={CartScreen} options={{ presentation: 'modal' }} />
            <Stack.Screen name="OrderDetail" component={OrderDetail} />
            <Stack.Screen name="ProcessOrder" component={ProcessOrder} options={{ presentation: 'modal' }} />
            <Stack.Screen name="Notifications" component={NotificationsScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

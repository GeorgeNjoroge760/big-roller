import { Platform } from 'react-native';

// For Android emulator, 10.0.2.2 maps to host machine's localhost.
// For iOS simulator, localhost works directly.
// For a physical phone on the same WiFi, replace with your PC's LAN IP (e.g. http://192.168.1.100:8000).
const DEV_API_URL = Platform.select({
  android: 'http://10.0.2.2:8000/api',
  ios: 'http://localhost:8000/api',
  default: 'http://localhost:8000/api',
});

const PROD_API_URL = 'https://georgen760.pythonanywhere.com/api';

export const API_URL = __DEV__ ? DEV_API_URL : PROD_API_URL;

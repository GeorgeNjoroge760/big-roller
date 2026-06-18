import { Platform } from 'react-native';

const DEV_IP = '192.168.8.202';
const DEV_PORT = '8000';
const DEV_API_URL = `http://${DEV_IP}:${DEV_PORT}/api`;
const PROD_API_URL = 'https://georgen760.pythonanywhere.com/api';

const API_URL = __DEV__ ? DEV_API_URL : PROD_API_URL;

export { API_URL };

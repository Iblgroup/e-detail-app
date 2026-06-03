import Axios from 'axios';
import { API_BASE_URL } from '@/config/api-base-url';

if (!API_BASE_URL) {
  console.warn(
    'No API base URL is configured. Set EXPO_PUBLIC_API_BASE_URL for deployed builds, EXPO_PUBLIC_LOCAL_API_BASE_URL for local web, or EXPO_PUBLIC_NATIVE_API_BASE_URL for Metro on a device if needed.'
  );
}

const axios = Axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
  timeout: 30000,
});

axios.interceptors.request.use(
  (config) => {
    console.log(`[API Request] ${config.method?.toUpperCase()} ${config.baseURL ?? ''}${config.url ?? ''}`);
    return config;
  },
  (error) => {
    console.error('[API Request Error]', error);
    return Promise.reject(error);
  },
);

axios.interceptors.response.use(
  (response) => {
    console.log(`[API Response] ${response.config.url}`, response.status);
    return response.data;
  },
  (error) => {
    const status = error.response?.status;
    const message = error.response?.data?.message || error.message;

    console.error(`[API Error] ${status || 'Network Error'}:`, error.response?.data || message);
    return Promise.reject(error);
  },
);

export default axios;

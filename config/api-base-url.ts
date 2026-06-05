import Constants from 'expo-constants';
import { Platform } from 'react-native';

const DEFAULT_LOCAL_API_BASE_URL = 'http://localhost:3017/api';

function trimEnv(value: string | undefined) {
  return value?.trim() ?? '';
}

function isLoopbackHost(hostname: string) {
  return hostname === 'localhost' || hostname === '127.0.0.1' || hostname === '0.0.0.0';
}

function getMetroHost() {
  const hostUri = trimEnv(Constants.expoConfig?.hostUri);
  if (!hostUri) {
    return '';
  }

  return hostUri.split('/')[0]?.split(':')[0] ?? '';
}

function deriveNativeLocalApiBaseUrl(localApiBaseUrl: string) {
  try {
    const metroHost = getMetroHost();
    const url = new URL(localApiBaseUrl);

    if (metroHost && isLoopbackHost(url.hostname)) {
      url.hostname = metroHost;
      return url.toString().replace(/\/$/, '');
    }

    if (Platform.OS === 'android' && url.hostname === 'localhost') {
      url.hostname = '10.0.2.2';
      return url.toString().replace(/\/$/, '');
    }

    return localApiBaseUrl;
  } catch {
    return localApiBaseUrl;
  }
}

function isNativeDevRuntime() {
  return Platform.OS !== 'web' && typeof __DEV__ !== 'undefined' && __DEV__;
}

export function getApiBaseUrl() {
  const deployedApiBaseUrl = trimEnv(process.env.EXPO_PUBLIC_API_BASE_URL);
  const localApiBaseUrl =
    trimEnv(process.env.EXPO_PUBLIC_LOCAL_API_BASE_URL) ||
    DEFAULT_LOCAL_API_BASE_URL;
  const nativeApiBaseUrl = trimEnv(process.env.EXPO_PUBLIC_NATIVE_API_BASE_URL);

  if (Platform.OS === 'web') {
    return deployedApiBaseUrl || localApiBaseUrl;
  }

  if (isNativeDevRuntime()) {
    return nativeApiBaseUrl || deriveNativeLocalApiBaseUrl(localApiBaseUrl);
  }

  return deployedApiBaseUrl;
}

export const API_BASE_URL = getApiBaseUrl();


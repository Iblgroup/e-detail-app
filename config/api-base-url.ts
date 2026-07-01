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

// Build the API URL from the Metro host so the API always follows whatever
// network the dev machine is on (no per-network .env edits). Returns '' when it
// can't confidently derive a reachable host, so callers can fall back.
function deriveNativeLocalApiBaseUrl(localApiBaseUrl: string) {
  try {
    const metroHost = getMetroHost();
    const url = new URL(localApiBaseUrl);

    // Real device / LAN: use the same host Metro is served from.
    if (metroHost && !isLoopbackHost(metroHost) && isLoopbackHost(url.hostname)) {
      url.hostname = metroHost;
      return url.toString().replace(/\/$/, '');
    }

    // Android emulator: localhost -> host machine.
    if (Platform.OS === 'android' && isLoopbackHost(url.hostname)) {
      url.hostname = '10.0.2.2';
      return url.toString().replace(/\/$/, '');
    }

    return '';
  } catch {
    return '';
  }
}

function isDevRuntime() {
  return typeof __DEV__ !== 'undefined' && __DEV__;
}

function isNativeDevRuntime() {
  return Platform.OS !== 'web' && isDevRuntime();
}

export function getApiBaseUrl() {
  const deployedApiBaseUrl = trimEnv(process.env.EXPO_PUBLIC_API_BASE_URL);
  const localApiBaseUrl =
    trimEnv(process.env.EXPO_PUBLIC_LOCAL_API_BASE_URL) ||
    DEFAULT_LOCAL_API_BASE_URL;
  const nativeApiBaseUrl = trimEnv(process.env.EXPO_PUBLIC_NATIVE_API_BASE_URL);

  if (Platform.OS === 'web') {
    // Local dev → the local server (localhost); only production web builds use
    // the deployed URL.
    if (isDevRuntime()) {
      return localApiBaseUrl;
    }
    return deployedApiBaseUrl || localApiBaseUrl;
  }

  if (isNativeDevRuntime()) {
    // Prefer the Metro-host-derived URL (auto-follows the current network);
    // fall back to the explicit native env, then the local default.
    return (
      deriveNativeLocalApiBaseUrl(localApiBaseUrl) ||
      nativeApiBaseUrl ||
      localApiBaseUrl
    );
  }

  return deployedApiBaseUrl;
}

export const API_BASE_URL = getApiBaseUrl();

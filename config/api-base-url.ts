const DEFAULT_LOCAL_API_BASE_URL = 'http://localhost:3017/api';

function trimEnv(value: string | undefined) {
  return value?.trim() ?? '';
}

function isLocalWebHost() {
  if (typeof window === 'undefined') return false;

  return (
    window.location.hostname === 'localhost' ||
    window.location.hostname === '127.0.0.1'
  );
}

export function getApiBaseUrl() {
  const deployedApiBaseUrl = trimEnv(process.env.EXPO_PUBLIC_API_BASE_URL);
  const localApiBaseUrl =
    trimEnv(process.env.EXPO_PUBLIC_LOCAL_API_BASE_URL) ||
    DEFAULT_LOCAL_API_BASE_URL;

  if (isLocalWebHost()) {
    return localApiBaseUrl;
  }

  return deployedApiBaseUrl;
}

export const API_BASE_URL = getApiBaseUrl();

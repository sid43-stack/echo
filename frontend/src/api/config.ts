/**
 * API configuration - environment-based backend URL (local first).
 * Do not modify backend; this layer only defines how the frontend reaches it.
 */

const FALLBACK_BASE_URL = 'http://localhost:3000';

function getEnv(name: string): string | undefined {
  if (typeof import.meta !== 'undefined' && typeof import.meta.env !== 'undefined') {
    const v = (import.meta.env as Record<string, unknown>)[name];
    return typeof v === 'string' ? v : undefined;
  }
  return undefined;
}

/**
 * Backend base URL. Prefer VITE_API_URL; otherwise use localhost:3000.
 */
export function getApiBaseUrl(): string {
  const url = getEnv('VITE_API_URL');
  if (url && url.trim() !== '') {
    return url.replace(/\/$/, '');
  }
  return FALLBACK_BASE_URL;
}

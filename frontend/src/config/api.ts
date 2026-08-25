/**
 * Auren Frontend API Configuration Helper
 *
 * Resolves the backend service URL for API requests, discovery manifests,
 * and sponsorship authorizations.
 *
 * Order of Precedence:
 * 1. NEXT_PUBLIC_AUREN_API_URL environment variable (if explicitly set)
 * 2. Production fallback: https://auren-cc2f.onrender.com (in production build or on Vercel)
 * 3. Development fallback: http://localhost:3001
 */

const PRODUCTION_API_URL = 'https://auren-cc2f.onrender.com';
const DEVELOPMENT_API_URL = 'http://localhost:3001';

export const AUREN_API_URL: string =
  process.env.NEXT_PUBLIC_AUREN_API_URL ||
  (typeof window !== 'undefined' && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1'
    ? PRODUCTION_API_URL
    : process.env.NODE_ENV === 'production'
    ? PRODUCTION_API_URL
    : DEVELOPMENT_API_URL);

/**
 * Builds a clean, fully-qualified backend endpoint URL.
 *
 * @example
 * getApiUrl('/sponsor') => 'https://auren-cc2f.onrender.com/sponsor'
 * getApiUrl('agent/opportunities') => 'https://auren-cc2f.onrender.com/agent/opportunities'
 */
export function getApiUrl(endpoint: string): string {
  const base = (
    process.env.NEXT_PUBLIC_AUREN_API_URL ||
    (typeof window !== 'undefined' && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1'
      ? PRODUCTION_API_URL
      : process.env.NODE_ENV === 'production'
      ? PRODUCTION_API_URL
      : DEVELOPMENT_API_URL)
  ).replace(/\/+$/, '');

  const path = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  return `${base}${path}`;
}

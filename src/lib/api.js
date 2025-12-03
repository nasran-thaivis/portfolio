/**
 * API URL Helper
 * Uses environment variable NEXT_PUBLIC_API_URL for production
 * Falls back to localhost:3001 for development
 *
 * NOTE:
 * - This URL points to the **NestJS Backend** (e.g. Render / Docker service)
 * - Next.js API routes under `/src/app/api/*` are acting as a proxy layer
 * - Frontend code can either:
 *   - Call Next.js routes (`/api/...`) for SSR / edge-friendly behavior, or
 *   - Call Backend directly via this helper (for purely client-side calls)
 */
export const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

/**
 * Get base URL for Next.js API routes
 * Works in both client-side and server-side rendering
 */
function getNextApiBaseUrl() {
  // Client-side: use window.location.origin
  if (typeof window !== 'undefined') {
    return window.location.origin;
  }

  // Server-side: use environment variables
  if (process.env.NEXT_PUBLIC_SITE_URL) {
    return process.env.NEXT_PUBLIC_SITE_URL;
  }

  // Vercel automatically sets VERCEL_URL
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }

  // Fallback to localhost for development
  return 'http://localhost:3000';
}

/**
 * Get full **backend** API endpoint URL (NestJS)
 * @param {string} endpoint - Backend endpoint (e.g., '/api/hero-section')
 * @returns {string} - Full URL to Backend
 */
export function getApiUrl(endpoint) {
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  return `${API_URL}${cleanEndpoint}`;
}

/**
 * Thin wrapper around fetch for calling Backend API
 * - Adds timeout handling
 * - Keeps interface very close to native fetch
 *
 * @param {string} endpoint - Backend endpoint path (e.g. '/api/hero-section')
 * @param {RequestInit & { timeoutMs?: number }} options - fetch options
 */
export async function fetchBackend(endpoint, options = {}) {
  const { timeoutMs = 10000, ...fetchOptions } = options;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const url = getApiUrl(endpoint);
    const response = await fetch(url, {
      ...fetchOptions,
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    throw error;
  }
}

/**
 * Convenience helpers for common resources
 * These are optional but make the call sites clearer.
 */

// Users
export async function backendGetUserByUsername(username) {
  const res = await fetchBackend(`/api/users/username/${encodeURIComponent(username)}`, {
    cache: 'no-store',
  });
  return res;
}

// Hero section - เรียก Next.js API route (proxy to backend)
export async function backendGetHeroSection(username) {
  const baseUrl = getNextApiBaseUrl();
  const query = username ? `?username=${encodeURIComponent(username)}` : '';
  const res = await fetch(`${baseUrl}/api/hero-section${query}`, {
    cache: 'no-store',
  });
  return res;
}

// About section - เรียก Next.js API route (proxy to backend)
export async function backendGetAboutSection(username) {
  const baseUrl = getNextApiBaseUrl();
  const query = username ? `?username=${encodeURIComponent(username)}` : '';
  const res = await fetch(`${baseUrl}/api/about-section${query}`, {
    cache: 'no-store',
  });
  return res;
}

// Projects - เรียก Next.js API route (proxy to backend)
export async function backendGetProjects(username) {
  const baseUrl = getNextApiBaseUrl();
  const query = username ? `?username=${encodeURIComponent(username)}` : '';
  const res = await fetch(`${baseUrl}/api/projects${query}`, {
    cache: 'no-store',
  });
  return res;
}

// Reviews - เรียก Next.js API route (proxy to backend)
export async function backendGetReviews(username) {
  const baseUrl = getNextApiBaseUrl();
  const query = username ? `?username=${encodeURIComponent(username)}` : '';
  const res = await fetch(`${baseUrl}/api/reviews${query}`, {
    cache: 'no-store',
  });
  return res;
}


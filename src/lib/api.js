/**
 * API URL Helper
 * Uses environment variable NEXT_PUBLIC_API_URL for production
 * Falls back to localhost:3001 for development
 */
export const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

/**
 * Get full API endpoint URL
 * @param {string} endpoint - API endpoint (e.g., '/api/hero-section')
 * @returns {string} - Full URL
 */
export function getApiUrl(endpoint) {
  // Remove leading slash if present to avoid double slashes
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  return `${API_URL}${cleanEndpoint}`;
}


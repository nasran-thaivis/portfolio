/**
 * Get base URL for API calls
 * Works in both client-side and server-side rendering
 * 
 * In Vercel production:
 * - Uses VERCEL_URL if available (automatically set by Vercel)
 * - Falls back to NEXT_PUBLIC_SITE_URL if set
 * - Uses https:// protocol in production
 * 
 * In development:
 * - Uses NEXT_PUBLIC_SITE_URL if set
 * - Falls back to http://localhost:3000
 */
export function getBaseUrl(): string {
  // Client-side: use window.location.origin
  if (typeof window !== 'undefined') {
    return window.location.origin;
  }

  // Server-side: use environment variables
  // Vercel automatically sets VERCEL_URL (e.g., "your-app.vercel.app")
  // We need to add https:// protocol
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }

  // Use NEXT_PUBLIC_SITE_URL if set
  if (process.env.NEXT_PUBLIC_SITE_URL) {
    return process.env.NEXT_PUBLIC_SITE_URL;
  }

  // Fallback to localhost for development
  return 'http://localhost:3000';
}


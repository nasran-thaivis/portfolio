/**
 * Clean URL by removing invalid characters and formatting
 */
function cleanUrl(url: string): string {
  return url
    .replace(/^https?:\/\//, '')  // Remove http:// or https:// if present
    .replace(/,.*$/, '')          // Remove everything after comma (e.g., ",http")
    .replace(/[^a-zA-Z0-9.\-:]/g, '') // Remove invalid characters
    .trim();                       // Remove whitespace
}

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
    const cleanedUrl = cleanUrl(process.env.VERCEL_URL);
    return `https://${cleanedUrl}`;
  }

  // Use NEXT_PUBLIC_SITE_URL if set
  if (process.env.NEXT_PUBLIC_SITE_URL) {
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;
    // If it already has protocol, clean and return as is
    if (siteUrl.startsWith('http://') || siteUrl.startsWith('https://')) {
      const cleanedUrl = cleanUrl(siteUrl);
      // Determine protocol
      const protocol = siteUrl.startsWith('https://') ? 'https://' : 'http://';
      return `${protocol}${cleanedUrl}`;
    }
    // If no protocol, assume https for production
    const cleanedUrl = cleanUrl(siteUrl);
    return `https://${cleanedUrl}`;
  }

  // Fallback to localhost for development
  return 'http://localhost:3000';
}


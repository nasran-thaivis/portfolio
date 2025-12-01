/**
 * Utility function to convert DigitalOcean Spaces URLs or paths to proxy URLs
 * @param {string} urlOrPath - The image URL or path (can be public URL, private URL, or path like 'images/file.jpeg')
 * @returns {string} - Proxy URL if from DigitalOcean Spaces, original value otherwise
 */
export function getSignedImageUrl(urlOrPath) {
  if (!urlOrPath) return urlOrPath;

  const isPath = !urlOrPath.startsWith('http://') && !urlOrPath.startsWith('https://');
  
  // Check if it's a relative path from backend proxy (starts with /api/upload/image)
  if (isPath && urlOrPath.startsWith('/api/upload/image')) {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
    return `${apiUrl}${urlOrPath}`;
  }
  
  // Check if it's a DigitalOcean Spaces URL or path
  // DigitalOcean Spaces URLs typically contain 'digitaloceanspaces.com'
  // Paths from DigitalOcean Spaces typically start with 'images/', 'logos/', etc.
  const isDigitalOceanSpace = 
    urlOrPath.includes('digitaloceanspaces.com') || 
    urlOrPath.includes('sgp1.digitaloceanspaces.com') ||
    urlOrPath.includes('nyc3.digitaloceanspaces.com') ||
    urlOrPath.includes('ams3.digitaloceanspaces.com') ||
    urlOrPath.includes('fra1.digitaloceanspaces.com') ||
    // Check if it's a path that looks like DigitalOcean Spaces path (starts with common folders)
    (isPath && (urlOrPath.startsWith('images/') || urlOrPath.startsWith('logos/') || urlOrPath.startsWith('uploads/')));

  // If not a DigitalOcean Space URL or path, return as-is
  if (!isDigitalOceanSpace) {
    return urlOrPath;
  }

  // Create proxy URL
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
  const encodedPath = encodeURIComponent(urlOrPath);
  return `${apiUrl}/api/upload/image?path=${encodedPath}`;
}

/**
 * Convert multiple image URLs to proxy URLs
 * @param {string|string[]} urls - Single URL or array of URLs
 * @returns {string|string[]} - Proxy URL(s)
 */
export function getSignedImageUrls(urls) {
  if (Array.isArray(urls)) {
    return urls.map(url => getSignedImageUrl(url));
  }
  return getSignedImageUrl(urls);
}

/**
 * Normalize image URL back to path for database storage
 * Converts proxy URLs or full URLs back to paths (e.g., 'images/file.jpeg')
 * @param {string} urlOrPath - Proxy URL, full URL, or path
 * @returns {string} - Path in bucket (e.g., 'images/file.jpeg')
 */
export function normalizeImageUrl(urlOrPath) {
  if (!urlOrPath) return urlOrPath;

  // If it's already a path (no http:// or https://), return as-is
  if (!urlOrPath.startsWith('http://') && !urlOrPath.startsWith('https://')) {
    // Check if it's a proxy URL path (starts with /api/upload/image)
    if (urlOrPath.startsWith('/api/upload/image')) {
      try {
        const url = new URL(urlOrPath, 'http://localhost'); // Use dummy base URL to parse query string
        const pathParam = url.searchParams.get('path');
        if (pathParam) {
          return decodeURIComponent(pathParam);
        }
      } catch (error) {
        console.warn(`Could not parse proxy URL: ${urlOrPath}`, error);
      }
    }
    // If it's a regular path, return as-is
    return urlOrPath;
  }

  // If it's a full URL (http:// or https://)
  try {
    const url = new URL(urlOrPath);
    
    // Check if it's a proxy URL (e.g., http://localhost:3001/api/upload/image?path=...)
    if (url.pathname === '/api/upload/image') {
      const pathParam = url.searchParams.get('path');
      if (pathParam) {
        return decodeURIComponent(pathParam);
      }
    }

    // If it's a DigitalOcean Spaces URL, extract the path
    if (url.hostname.includes('digitaloceanspaces.com')) {
      // URL format: https://bucket-name.region.digitaloceanspaces.com/images/file.jpeg
      // or: https://region.digitaloceanspaces.com/bucket-name/images/file.jpeg
      const pathname = url.pathname;
      // Remove leading slash
      const path = pathname.startsWith('/') ? pathname.substring(1) : pathname;
      return path;
    }

    // For other URLs, try to extract path from pathname
    const pathname = url.pathname;
    const path = pathname.startsWith('/') ? pathname.substring(1) : pathname;
    return path;
  } catch (error) {
    console.warn(`Could not normalize URL: ${urlOrPath}`, error);
    // If parsing fails, return original value
    return urlOrPath;
  }
}


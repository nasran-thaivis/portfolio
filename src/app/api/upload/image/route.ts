import { NextRequest, NextResponse } from "next/server";

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3005';
const TIMEOUT_MS = 30000; // 30 seconds for file uploads

async function fetchWithTimeout(url: string, options: RequestInit = {}) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    throw error;
  }
}

// POST: Upload image
export async function POST(request: NextRequest) {
  try {
    // Get authentication headers from request
    const userId = request.headers.get('x-user-id') || '';
    const username = request.headers.get('x-username') || '';

    console.log(`[API Proxy] Upload request received - userId: ${userId || 'none'}, username: ${username || 'none'}`);

    // Get form data from request
    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      console.error('[API Proxy] No file in request');
      return NextResponse.json(
        { success: false, message: 'No file uploaded' },
        { status: 400 }
      );
    }

    console.log(`[API Proxy] File received: ${file.name}, size: ${file.size} bytes, type: ${file.type}`);

    // Create new FormData for backend
    const backendFormData = new FormData();
    backendFormData.append('file', file);

    // Prepare headers for backend request
    const headers: HeadersInit = {};
    if (userId) headers['x-user-id'] = userId;
    if (username) headers['x-username'] = username;

    const backendUrl = `${API_URL}/api/upload/image`;

    try {
      const response = await fetchWithTimeout(backendUrl, {
        method: 'POST',
        headers,
        body: backendFormData,
      });

      if (response.ok) {
        const data = await response.json();
        console.log(`[API Proxy] Upload successful: ${data.url}`);
        return NextResponse.json(data);
      }

      const errorData = await response.json().catch(() => ({}));
      const errorMessage = errorData.message || `Upload failed with status ${response.status}`;
      console.error(`[API Proxy] Upload failed: ${errorMessage} (status: ${response.status})`);
      
      return NextResponse.json(
        { success: false, message: errorMessage },
        { status: response.status }
      );
    } catch (fetchError: any) {
      // Network error or timeout
      if (
        fetchError.name === 'AbortError' ||
        (fetchError.name === 'TypeError' && fetchError.message.includes('fetch'))
      ) {
        console.warn(`[API Proxy] Backend unavailable for POST /api/upload/image:`, fetchError.message);
        return NextResponse.json(
          { success: false, message: "Backend is not available. Please make sure the backend server is running." },
          { status: 503 }
        );
      }

      throw fetchError;
    }
  } catch (error: any) {
    console.error(`[API Proxy] Error in POST /api/upload/image:`, error?.message || error);
    return NextResponse.json(
      { success: false, message: error?.message || "Internal server error" },
      { status: 500 }
    );
  }
}

// GET: Retrieve signed URL or proxy image
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const path = searchParams.get('path');
    const url = searchParams.get('url');

    if (!path && !url) {
      return NextResponse.json(
        { success: false, message: 'path or url parameter is required' },
        { status: 400 }
      );
    }

    const queryParam = path ? `path=${encodeURIComponent(path)}` : `url=${encodeURIComponent(url!)}`;
    const backendUrl = `${API_URL}/api/upload/image?${queryParam}`;

    try {
      const response = await fetchWithTimeout(backendUrl, {
        cache: "no-store",
      });

      if (response.ok) {
        // If it's an image, return it as-is
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.startsWith('image/')) {
          const imageBuffer = await response.arrayBuffer();
          return new NextResponse(imageBuffer, {
            headers: {
              'Content-Type': contentType,
              'Cache-Control': 'public, max-age=3600',
            },
          });
        }

        // Otherwise return JSON
        const data = await response.json();
        return NextResponse.json(data);
      }

      const errorData = await response.json().catch(() => ({}));
      return NextResponse.json(
        { success: false, message: errorData.message || "Failed to retrieve image" },
        { status: response.status }
      );
    } catch (fetchError: any) {
      // Network error or timeout
      if (
        fetchError.name === 'AbortError' ||
        (fetchError.name === 'TypeError' && fetchError.message.includes('fetch'))
      ) {
        console.warn(`[API Proxy] Backend unavailable for GET /api/upload/image`);
        return NextResponse.json(
          { success: false, message: "Backend is not available. Please make sure the backend server is running." },
          { status: 503 }
        );
      }

      throw fetchError;
    }
  } catch (error: any) {
    console.error(`[API Proxy] Error in GET /api/upload/image:`, error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}


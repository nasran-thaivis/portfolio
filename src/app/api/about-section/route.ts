import { NextRequest, NextResponse } from "next/server";

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
const TIMEOUT_MS = 10000; // 10 seconds

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

// Default data fallback when backend unavailable
const DEFAULT_ABOUT_DATA = {
  title: "About Me",
  description: "I am a passionate developer...",
  imageUrl: "https://placehold.co/600x400",
};

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const username = searchParams.get('username');
    
    const queryString = username ? `?username=${encodeURIComponent(username)}` : '';
    const backendUrl = `${API_URL}/api/about-section${queryString}`;

    // Try backend first
    try {
      const response = await fetchWithTimeout(backendUrl, {
        cache: "no-store",
      });

      if (response.ok) {
        const data = await response.json();
        return NextResponse.json(data);
      }

      // If backend returns error, fall back to default data
      throw new Error(`Backend error: ${response.status}`);
    } catch (fetchError: any) {
      // Network error or timeout - backend unavailable
      if (
        fetchError.name === 'AbortError' ||
        (fetchError.name === 'TypeError' && fetchError.message.includes('fetch'))
      ) {
        console.warn(`[API Proxy] Backend unavailable for /api/about-section, returning default data`);
        
        // Return default data to allow pages to render
        return NextResponse.json(DEFAULT_ABOUT_DATA);
      }

      throw fetchError;
    }
  } catch (error: any) {
    console.error("GET /api/about-section error", error);
    // Return default data even on error
    return NextResponse.json(DEFAULT_ABOUT_DATA);
  }
}

export async function PATCH(request: NextRequest) {
  try {
    // 1. อ่าน Header
    const userId = request.headers.get("x-user-id");
    const username = request.headers.get("x-username");

    if (!userId && !username) {
      return NextResponse.json({ error: "Unauthorized: Missing User ID or Username" }, { status: 401 });
    }

    const body = await request.json();

    // 2. ส่งต่อไปยัง NestJS Backend
    const backendUrl = `${API_URL}/api/about-section`;
    
    // Prepare headers for backend request
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };
    if (userId) headers['x-user-id'] = userId;
    if (username) headers['x-username'] = username;

    try {
      const response = await fetchWithTimeout(backendUrl, {
        method: 'PATCH',
        headers,
        body: JSON.stringify(body),
      });

      if (response.ok) {
        const data = await response.json();
        return NextResponse.json(data);
      }

      const errorData = await response.json().catch(() => ({}));
      return NextResponse.json(
        { error: errorData.message || "Failed to update about section" },
        { status: response.status }
      );
    } catch (fetchError: any) {
      // Network error or timeout
      if (
        fetchError.name === 'AbortError' ||
        (fetchError.name === 'TypeError' && fetchError.message.includes('fetch'))
      ) {
        console.warn(`[API Proxy] Backend unavailable for PATCH /api/about-section`);
        return NextResponse.json(
          { error: "Backend is not available. Please make sure the backend server is running." },
          { status: 503 }
        );
      }

      throw fetchError;
    }
  } catch (error: any) {
    console.error("PATCH /api/about-section error", error);
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
  }
}
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
const DEFAULT_HERO_DATA = {
  title: "Welcome",
  description: "This is my portfolio",
  imageUrl: "https://placehold.co/1920x1080",
};

// GET: ดึงข้อมูล
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const username = searchParams.get("username");
    
    const queryString = username ? `?username=${encodeURIComponent(username)}` : '';
    const backendUrl = `${API_URL}/api/hero-section${queryString}`;

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
        console.warn(`[API Proxy] Backend unavailable for /api/hero-section, returning default data`);
        
        // Return default data to allow pages to render
        return NextResponse.json(DEFAULT_HERO_DATA);
      }

      throw fetchError;
    }
  } catch (error: any) {
    console.error("GET /api/hero-section error", error);
    // Return default data even on error
    return NextResponse.json(DEFAULT_HERO_DATA);
  }
}

// PATCH: บันทึกข้อมูล (ส่งต่อไปยัง Backend)
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { username, title, description, imageUrl } = body;

    // Get authentication headers from request
    const userId = request.headers.get('x-user-id') || '';
    const requestUsername = request.headers.get('x-username') || username || '';

    if (!userId && !requestUsername) {
      return NextResponse.json({ message: "User ID or Username is required" }, { status: 400 });
    }

    // ส่งต่อไปยัง NestJS Backend
    const backendUrl = `${API_URL}/api/hero-section`;
    
    // Prepare headers for backend request
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };
    if (userId) headers['x-user-id'] = userId;
    if (requestUsername) headers['x-username'] = requestUsername;

    try {
      const response = await fetchWithTimeout(backendUrl, {
        method: 'PATCH',
        headers,
        body: JSON.stringify({ title, description, imageUrl }),
      });

      if (response.ok) {
        const data = await response.json();
        return NextResponse.json(data);
      }

      const errorData = await response.json().catch(() => ({}));
      return NextResponse.json(
        { message: errorData.message || "Failed to update hero section" },
        { status: response.status }
      );
    } catch (fetchError: any) {
      // Network error or timeout
      if (
        fetchError.name === 'AbortError' ||
        (fetchError.name === 'TypeError' && fetchError.message.includes('fetch'))
      ) {
        console.warn(`[API Proxy] Backend unavailable for PATCH /api/hero-section`);
        return NextResponse.json(
          { message: "Backend is not available. Please make sure the backend server is running." },
          { status: 503 }
        );
      }

      throw fetchError;
    }
  } catch (error: any) {
    console.error("PATCH /api/hero-section error", error);
    return NextResponse.json({ message: error.message || "Internal server error" }, { status: 500 });
  }
}
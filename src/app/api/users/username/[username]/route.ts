import { NextResponse } from "next/server";

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3005';
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

export async function GET(
  request: Request,
  { params }: { params: Promise<{ username: string }> }
) {
  try {
    const { username } = await params;
    const backendUrl = `${API_URL}/api/users/username/${encodeURIComponent(username)}`;

    try {
      const response = await fetchWithTimeout(backendUrl, {
        cache: "no-store",
      });

      if (response.ok) {
        const data = await response.json();
        return NextResponse.json(data);
      }

      // If backend returns 404, return null user
      if (response.status === 404) {
        return NextResponse.json(
          { success: false, message: `User with username '${username}' not found` },
          { status: 404 }
        );
      }

      // Other errors from backend
      const errorData = await response.json().catch(() => ({}));
      throw new Error(`Backend error: ${response.status}`);
    } catch (fetchError: any) {
      // Network error or timeout - backend unavailable
      if (
        fetchError.name === 'AbortError' ||
        (fetchError.name === 'TypeError' && fetchError.message.includes('fetch'))
      ) {
        console.warn(`[API Proxy] Backend unavailable for /api/users/username/${username}, returning null`);
        
        // Return null user structure to allow pages to render
        return NextResponse.json(
          { success: false, message: `User with username '${username}' not found` },
          { status: 404 }
        );
      }

      throw fetchError;
    }
  } catch (error: any) {
    console.error(`[API Proxy] Error in GET /api/users/username/[username]:`, error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}


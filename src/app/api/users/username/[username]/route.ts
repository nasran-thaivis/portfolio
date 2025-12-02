import { NextResponse } from "next/server";

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

export async function GET(
  request: Request,
  { params }: { params: Promise<{ username: string }> }
) {
  let username: string;
  try {
    const resolvedParams = await params;
    username = resolvedParams.username;
    const backendUrl = `${API_URL}/api/users/username/${encodeURIComponent(username)}`;

    try {
      const response = await fetchWithTimeout(backendUrl, {
        cache: "no-store",
      });

      if (response.ok) {
        const data = await response.json();
        console.log(`[API Proxy] Backend response for username ${username}:`, data);
        
        // Backend ส่งกลับมาเป็น { success: true, user: {...} }
        // Extract user object และส่งกลับ user โดยตรง
        if (data && data.user) {
          console.log(`[API Proxy] Extracted user from response:`, data.user);
          return NextResponse.json(data.user);
        }
        
        // ถ้าไม่มี user property แต่มี id หรือ username โดยตรง แสดงว่าเป็น user object แล้ว
        if (data && (data.id || data.username)) {
          console.log(`[API Proxy] Response is already a user object:`, data);
          return NextResponse.json(data);
        }
        
        // ถ้าไม่มี user property ให้ส่งกลับ data โดยตรง (fallback)
        console.warn(`[API Proxy] Unexpected response format for username ${username}:`, data);
        return NextResponse.json(data);
      }

      // If backend returns 404, return null user
      if (response.status === 404) {
        return NextResponse.json(
          { success: false, message: `User with username '${username}' not found` },
          { status: 404 }
        );
      }

      // Try to parse error message to check if it's a "not found" error
      let errorData: any = {};
      try {
        const text = await response.text();
        if (text) {
          try {
            errorData = JSON.parse(text);
          } catch {
            errorData = { message: text };
          }
        }
      } catch {
        // If we can't parse, continue with empty object
      }

      // Check if error message indicates user not found
      const errorMessage = errorData?.message || errorData?.error || '';
      const isNotFoundError = 
        errorMessage.toLowerCase().includes('not found') ||
        errorMessage.toLowerCase().includes('does not exist') ||
        response.status === 404;

      if (isNotFoundError) {
        return NextResponse.json(
          { success: false, message: `User with username '${username}' not found` },
          { status: 404 }
        );
      }

      // Other errors from backend - log but still treat as not found for user lookup
      console.warn(`[API Proxy] Backend returned ${response.status} for username ${username}:`, errorMessage);
      return NextResponse.json(
        { success: false, message: `User with username '${username}' not found` },
        { status: 404 }
      );
    } catch (fetchError: any) {
      // Network error or timeout - backend unavailable
      if (
        fetchError.name === 'AbortError' ||
        (fetchError.name === 'TypeError' && fetchError.message.includes('fetch'))
      ) {
        console.warn(`[API Proxy] Backend unavailable for /api/users/username/${username}, returning 404`);
        
        // Return 404 when backend is unavailable (treat as user not found)
        return NextResponse.json(
          { success: false, message: `User with username '${username}' not found` },
          { status: 404 }
        );
      }

      // For any other fetch errors, treat as user not found
      console.warn(`[API Proxy] Fetch error for username ${username}:`, fetchError.message);
      return NextResponse.json(
        { success: false, message: `User with username '${username}' not found` },
        { status: 404 }
      );
    }
  } catch (error: any) {
    // Catch-all error handler - treat as user not found instead of 500
    console.error(`[API Proxy] Error in GET /api/users/username/[username]:`, error);
    const errorUsername = username || 'unknown';
    return NextResponse.json(
      { success: false, message: `User with username '${errorUsername}' not found` },
      { status: 404 }
    );
  }
}


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

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const username = searchParams.get('username');
    
    // Get authentication headers from request
    const userId = request.headers.get('x-user-id') || '';
    const requestUsername = request.headers.get('x-username') || '';
    
    const queryString = username ? `?username=${encodeURIComponent(username)}` : '';
    const backendUrl = `${API_URL}/api/projects${queryString}`;

    // Prepare headers for backend request
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };
    if (userId) headers['x-user-id'] = userId;
    if (requestUsername) headers['x-username'] = requestUsername;

    try {
      const response = await fetchWithTimeout(backendUrl, {
        cache: "no-store",
        headers,
      });

      if (response.ok) {
        const data = await response.json();
        return NextResponse.json(data);
      }

      // If backend returns error, return empty array
      throw new Error(`Backend error: ${response.status}`);
    } catch (fetchError: any) {
      // Network error or timeout - backend unavailable
      if (
        fetchError.name === 'AbortError' ||
        (fetchError.name === 'TypeError' && fetchError.message.includes('fetch'))
      ) {
        console.warn(`[API Proxy] Backend unavailable for /api/projects, returning empty array`);
        
        // Return empty array to allow pages to render
        return NextResponse.json([]);
      }

      throw fetchError;
    }
  } catch (error: any) {
    console.error(`[API Proxy] Error in GET /api/projects:`, error);
    
    // Return empty array even on error
    return NextResponse.json([]);
  }
}

export async function POST(request: NextRequest) {
  try {
    // Parse request body (log error ถ้า parse ไม่ได้)
    let body: any;
    try {
      body = await request.json();
    } catch (parseError: any) {
      console.error("[API Proxy] Failed to parse JSON body for POST /api/projects:", parseError);
      return NextResponse.json(
        {
          success: false,
          message: "Invalid JSON body",
        },
        { status: 400 }
      );
    }

    // Get authentication headers from request
    const userId = request.headers.get('x-user-id') || '';
    const username = request.headers.get('x-username') || '';

    const backendUrl = `${API_URL}/api/projects`;

    // Prepare headers for backend request
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };
    if (userId) headers['x-user-id'] = userId;
    if (username) headers['x-username'] = username;

    try {
      // ส่งต่อไปยัง NestJS ผ่าน fetchWithTimeout
      const response = await fetchWithTimeout(backendUrl, {
        method: 'POST',
        headers,
        body: JSON.stringify(body),
      });

      const text = await response.text();
      let data: any = {};
      try {
        data = text ? JSON.parse(text) : {};
      } catch (jsonError) {
        console.warn("[API Proxy] Non-JSON response from backend POST /api/projects:", text);
      }

      if (response.ok) {
        // บันทึกสำเร็จ
        return NextResponse.json(data, { status: 201 });
      }

      // ถ้า backend ตอบ error ให้ส่งข้อความนั้นออกมาเลย
      const message =
        data?.message ||
        data?.error ||
        data?.detail ||
        `Failed to create project (status ${response.status})`;

      console.error("[API Proxy] Backend error from POST /api/projects:", {
        status: response.status,
        message,
        data,
      });

      return NextResponse.json(
        {
          success: false,
          message,
        },
        { status: response.status }
      );
    } catch (fetchError: any) {
      // Network error / timeout
      console.error("[API Proxy] Network error calling backend POST /api/projects:", fetchError);

      const isTimeout =
        fetchError?.name === "AbortError" ||
        (fetchError?.name === "TypeError" && String(fetchError?.message || "").includes("fetch"));

      const message = isTimeout
        ? "Backend service timeout while creating project"
        : fetchError?.message || "Failed to reach backend service";

      return NextResponse.json(
        {
          success: false,
          message,
        },
        { status: 502 }
      );
    }
  } catch (error: any) {
    console.error(`[API Proxy] Error in POST /api/projects:`, error);
    return NextResponse.json(
      { success: false, message: error?.message || "Internal server error" },
      { status: 500 }
    );
  }
}


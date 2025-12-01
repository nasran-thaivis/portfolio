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

// ✅ แก้ไข Type ให้รองรับ Next.js 15 (Params เป็น Promise)
type RouteParams = {
  params: Promise<{ id: string }>;
};

export async function PATCH(
  request: NextRequest,
  props: RouteParams
) {
  try {
    // ✅ ต้อง await params ก่อนใช้งาน
    const params = await props.params;
    const { id } = params;
    
    const body = await request.json();
    
    // Get authentication headers from request
    const userId = request.headers.get('x-user-id') || '';
    const username = request.headers.get('x-username') || '';
    
    const backendUrl = `${API_URL}/api/projects/${id}`;

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
        { success: false, message: errorData.message || "Failed to update project" },
        { status: response.status }
      );
    } catch (fetchError: any) {
      // Network error or timeout
      if (
        fetchError.name === 'AbortError' ||
        (fetchError.name === 'TypeError' && fetchError.message.includes('fetch'))
      ) {
        console.warn(`[API Proxy] Backend unavailable for PATCH /api/projects/${id}`);
        return NextResponse.json(
          { success: false, message: "Backend is not available. Please make sure the backend server is running." },
          { status: 503 }
        );
      }

      throw fetchError;
    }
  } catch (error: any) {
    console.error(`[API Proxy] Error in PATCH /api/projects/[id]:`, error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  props: RouteParams
) {
  try {
    // ✅ ต้อง await params ก่อนใช้งาน
    const params = await props.params;
    const { id } = params;
    
    // Get authentication headers from request
    const userId = request.headers.get('x-user-id') || '';
    const username = request.headers.get('x-username') || '';
    
    const backendUrl = `${API_URL}/api/projects/${id}`;

    // Prepare headers for backend request
    const headers: HeadersInit = {};
    if (userId) headers['x-user-id'] = userId;
    if (username) headers['x-username'] = username;

    try {
      const response = await fetchWithTimeout(backendUrl, {
        method: 'DELETE',
        headers,
      });

      if (response.ok) {
        const data = await response.json().catch(() => ({ success: true }));
        return NextResponse.json(data);
      }

      const errorData = await response.json().catch(() => ({}));
      return NextResponse.json(
        { success: false, message: errorData.message || "Failed to delete project" },
        { status: response.status }
      );
    } catch (fetchError: any) {
      // Network error or timeout
      if (
        fetchError.name === 'AbortError' ||
        (fetchError.name === 'TypeError' && fetchError.message.includes('fetch'))
      ) {
        console.warn(`[API Proxy] Backend unavailable for DELETE /api/projects/${id}`);
        return NextResponse.json(
          { success: false, message: "Backend is not available. Please make sure the backend server is running." },
          { status: 503 }
        );
      }

      throw fetchError;
    }
  } catch (error: any) {
    console.error(`[API Proxy] Error in DELETE /api/projects/[id]:`, error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
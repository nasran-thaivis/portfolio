import { NextRequest, NextResponse } from "next/server";

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

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    // [จุดที่แก้ 1] ดึง Authorization Header (Token) ที่ส่งมาจากหน้าบ้าน
    const authHeader = request.headers.get('authorization');
    
    // เก็บ header อื่นๆ เผื่อใช้ (optional)
    const userId = request.headers.get('x-user-id');
    const username = request.headers.get('x-username');
    
    const backendUrl = `${API_URL}/api/reviews/${id}`;

    // Prepare headers for backend request
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    // [จุดที่แก้ 2] สำคัญมาก! ต้องส่ง Token ไปให้ Backend ด้วย
    // เพราะ Controller ฝั่ง NestJS เช็ค @CurrentUser จาก Token นี้
    if (authHeader) {
      headers['Authorization'] = authHeader;
    }

    // (Optional) ส่งค่าเดิมไปด้วยกันเหนียว
    if (userId) headers['x-user-id'] = userId;
    if (username) headers['x-username'] = username;

    try {
      const response = await fetchWithTimeout(backendUrl, {
        method: 'DELETE',
        headers, // ส่ง headers ที่มี token ไปแล้ว
      });

      if (response.ok) {
        // บางที Backend ส่ง 200 แต่ไม่มี body หรือเป็น text
        const data = await response.json().catch(() => ({ success: true }));
        return NextResponse.json(data);
      }

      const errorData = await response.json().catch(() => ({}));
      return NextResponse.json(
        { success: false, message: errorData.message || "Failed to delete review at backend" },
        { status: response.status }
      );
    } catch (fetchError: any) {
      // Network error or timeout logic...
      if (
        fetchError.name === 'AbortError' ||
        (fetchError.name === 'TypeError' && fetchError.message.includes('fetch'))
      ) {
        console.warn(`[API Proxy] Backend unavailable for DELETE /api/reviews/${id}`);
        return NextResponse.json(
          { success: false, message: "Backend is not available. Please make sure the backend server is running." },
          { status: 503 }
        );
      }
      throw fetchError;
    }
  } catch (error: any) {
    console.error(`[API Proxy] Error in DELETE /api/reviews/[id]:`, error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
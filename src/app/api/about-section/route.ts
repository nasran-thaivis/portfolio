// ตัวอย่างไฟล์: src/app/api/about-section/route.js

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma"; // ปรับ path ตามของคุณ

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

export async function PATCH(request) {
  try {
    // 1. อ่าน Header
    const userId = request.headers.get("x-user-id");
    // const username = request.headers.get("x-username"); // อันเก่าเราไม่ใช้แล้ว

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized: Missing User ID" }, { status: 401 });
    }

    const body = await request.json();

    // 2. ✅ จุดที่ต้องแก้: ใช้ userId ในการค้นหา (where: { id: userId })
    // อย่าใช้ where: { username: ... } เพราะค่าที่ได้มาอาจเป็น ID
    const updatedAbout = await prisma.aboutSection.upsert({
      where: {
        userId: userId, // ตรวจสอบว่า Schema คุณเชื่อม Relation ด้วย userId ใช่ไหม
      },
      update: {
        title: body.title,
        description: body.description,
        imageUrl: body.imageUrl,
      },
      create: {
        userId: userId, // สร้างผูกกับ userId โดยตรง
        title: body.title,
        description: body.description,
        imageUrl: body.imageUrl,
      },
    });

    return NextResponse.json(updatedAbout);

  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
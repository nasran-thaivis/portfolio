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

// Placeholder database helper (fallback when backend unavailable).
const DB = {
  async getReviews() {
    return [];
  },
  async createReview(payload) {
    return { id: Date.now().toString(), ...payload };
  },
};

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const username = searchParams.get('username');
    
    const queryString = username ? `?username=${encodeURIComponent(username)}` : '';
    const backendUrl = `${API_URL}/api/reviews${queryString}`;

    // Try backend first
    try {
      const response = await fetchWithTimeout(backendUrl, {
        cache: "no-store",
      });

      if (response.ok) {
        const data = await response.json();
        return NextResponse.json(data);
      }

      // If backend returns error, fall back to empty array
      throw new Error(`Backend error: ${response.status}`);
    } catch (fetchError: any) {
      // Network error or timeout - backend unavailable
      if (
        fetchError.name === 'AbortError' ||
        (fetchError.name === 'TypeError' && fetchError.message.includes('fetch'))
      ) {
        console.warn(`[API Proxy] Backend unavailable for /api/reviews, returning empty array`);
        
        // Return empty array to allow pages to render
        const reviews = await DB.getReviews();
        return NextResponse.json(reviews);
      }

      throw fetchError;
    }
  } catch (error: any) {
    console.error("GET /api/reviews error", error);
    // Return empty array even on error
    return NextResponse.json([]);
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, rating, comment, username: bodyUsername } = body || {};
    
    // Validate payload
    if (!name || !comment) {
      return NextResponse.json({ error: "Invalid payload: name and comment are required" }, { status: 400 });
    }

    // Convert rating to number if it's a string
    const ratingNumber = typeof rating === "string" ? Number(rating) : Number(rating);
    if (isNaN(ratingNumber) || ratingNumber < 1 || ratingNumber > 5) {
      return NextResponse.json({ error: "Invalid payload: rating must be a number between 1 and 5" }, { status: 400 });
    }

    // Extract authentication headers from request
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };
    const userId = req.headers.get("x-user-id");
    const headerUsername = req.headers.get("x-username");
    if (userId) headers["x-user-id"] = userId;
    if (headerUsername) headers["x-username"] = headerUsername;

    // Get username from body or headers (backend requires username in body)
    const username = bodyUsername || headerUsername;
    if (!username) {
      return NextResponse.json({ error: "Username is required to create a review" }, { status: 400 });
    }

    // Prepare payload for backend (backend expects: username, name, rating, comment)
    const payload = {
      username,
      name,
      rating: ratingNumber,
      comment,
    };

    const backendUrl = `${API_URL}/api/reviews`;

    // Try backend first
    try {
      const response = await fetchWithTimeout(backendUrl, {
        method: "POST",
        headers,
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        const data = await response.json();
        return NextResponse.json(data, { status: 201 });
      }

      // If backend returns error, return the error
      const errorData = await response.json().catch(() => ({ error: `Backend error: ${response.status}` }));
      return NextResponse.json(errorData, { status: response.status });
    } catch (fetchError: any) {
      // Network error or timeout - backend unavailable
      if (
        fetchError.name === 'AbortError' ||
        (fetchError.name === 'TypeError' && fetchError.message.includes('fetch'))
      ) {
        console.warn(`[API Proxy] Backend unavailable for POST /api/reviews, using fallback`);
        
        // Fallback to placeholder DB
        const created = await DB.createReview(payload);
        return NextResponse.json({ ok: true, review: created }, { status: 201 });
      }

      throw fetchError;
    }
  } catch (err: any) {
    console.error("POST /api/reviews error", err);
    return NextResponse.json({ error: err?.message || "Failed to create review" }, { status: 500 });
  }
}

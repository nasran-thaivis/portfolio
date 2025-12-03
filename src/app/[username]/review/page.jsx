import Container from "../../components/Container";
import { notFound } from "next/navigation";
import { getBaseUrl } from "../../../lib/getBaseUrl";

// Runtime configuration for Vercel
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

async function getUserByUsername(username) {
  try {
    const baseUrl = getBaseUrl();
    
    // Validate baseUrl to prevent invalid URLs
    if (!baseUrl || baseUrl.includes(',http') || baseUrl.includes(',https')) {
      console.error(`[ReviewPage] Invalid baseUrl detected: ${baseUrl}`);
      console.warn(`[ReviewPage] Using fallback user due to invalid baseUrl`);
      return { id: null, username, fallback: true };
    }
    
    const url = `${baseUrl}/api/users/username/${username}`;
    console.log(`[ReviewPage] Fetching user: ${url}`);

    const res = await fetch(url, {
      cache: "no-store",
    });

    // If response is not ok, check if it's a real 404 (user not found) or backend error
    if (!res.ok) {
      // If status is 404, it means user truly doesn't exist in database
      if (res.status === 404) {
        console.error(`[ReviewPage] User not found in database: ${username}, status: ${res.status}`);
        return null; // Return null to trigger 404
      }
      
      // For 5xx errors or other errors, backend might be unavailable
      // Return fallback user to allow page to render
      console.warn(`[ReviewPage] Backend error (${res.status}) for ${username}, using fallback user`);
      return { id: null, username, fallback: true };
    }

    const data = await res.json();

    // Check if this is a fallback user (from API route when backend unavailable)
    if (data && data.fallback === true) {
      console.log(`[ReviewPage] Using fallback user for ${username} (backend unavailable)`);
      return data;
    }

    // ✅ เช็คจากรูปแบบข้อมูลจริงที่ Backend ส่งกลับมา (raw user object)
    // ตัวอย่าง: { id: '...', username: '...', ... }
    if (data && (data.id || data.username)) {
      console.log(`[ReviewPage] User found: ${data.username || username}`);
      return data;
    }

    console.error(`[ReviewPage] Invalid response format for user: ${username}`, data);
    // Return fallback user instead of null to prevent 404
    console.warn(`[ReviewPage] Using fallback user due to invalid response format`);
    return { id: null, username, fallback: true };
  } catch (error) {
    console.error(`[ReviewPage] Error loading user ${username}:`, error);
    // Network error or timeout - return fallback user
    console.warn(`[ReviewPage] Backend timeout/unavailable, using fallback user for ${username}`);
    return { id: null, username, fallback: true };
  }
}

async function getReviews(username) {
  try {
    const baseUrl = getBaseUrl();
    const res = await fetch(`${baseUrl}/api/reviews?username=${username}`, {
      cache: "no-store",
    });
    
    if (!res.ok) {
      console.warn(`[ReviewPage] Reviews fetch failed: ${res.status}`);
      return [];
    }
    
    const data = await res.json();
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error("[ReviewPage] Error loading reviews:", error);
    return [];
  }
}

// ฟังก์ชันช่วยแปลงเลข 5 -> ⭐⭐⭐⭐⭐
function renderStars(rating) {
  return "⭐".repeat(rating);
}

export default async function ReviewPage({ params }) {
  // Next.js 15: params is a Promise, must await before use
  const { username } = await params;

  // ตรวจสอบว่า user มีอยู่จริง
  const user = await getUserByUsername(username);
  
  // ถ้าไม่พบ user และไม่ใช่ fallback user ให้แสดง 404
  // (fallback user means backend unavailable, so we show page anyway)
  if (!user || (!user.id && !user.fallback)) {
    console.warn(`[ReviewPage] User ${username} not found in database, showing 404`);
    notFound();
  }
  
  // Log if using fallback user
  if (user?.fallback) {
    console.log(`[ReviewPage] Using fallback user for ${username} - backend may be unavailable`);
  }
  
  // ดึงข้อมูล reviews (ถ้าเป็น fallback user อาจจะดึงไม่ได้ แต่ไม่เป็นไร)
  const reviews = await getReviews(username);

  return (
    <Container title="Client Reviews">
      <div className="text-center mb-10">
        <h2 className="text-3xl font-bold text-white"></h2>
        <p className="text-gray-400 mt-2">เสียงตอบรับจากลูกค้าที่น่ารักของเรา</p>
      </div>

      {reviews.length === 0 ? (
        <div className="text-center py-20 text-gray-500 border-2 border-dashed border-zinc-800 rounded-xl">
          ยังไม่มีรีวิวในขณะนี้
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {reviews.map((review) => (
            <div key={review.id} className="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl shadow-lg hover:border-zinc-600 transition">
              <div className="flex items-center gap-4 mb-4">
                <img
                  src={review.avatarUrl || `https://ui-avatars.com/api/?name=${review.name}&background=random`}
                  alt={review.name}
                  className="w-12 h-12 rounded-full object-cover"
                />
                <div>
                  <h4 className="font-bold text-white">{review.name}</h4>
                  <div className="text-yellow-400 text-sm tracking-widest">
                    {renderStars(review.rating)}
                  </div>
                </div>
              </div>

              <p className="text-gray-300 text-sm leading-relaxed italic">
                {review.comment}&quot;
              </p>

              <div className="mt-4 text-xs text-gray-500 text-right">
                {new Date(review.createdAt).toLocaleDateString("th-TH")}
              </div>
            </div>
          ))}
        </div>
      )}
    </Container>
  );
}


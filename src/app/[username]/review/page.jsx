import Container from "../../components/Container";
import { notFound } from "next/navigation";

// Helper to get base URL for API calls
function getBaseUrl() {
  if (typeof window !== 'undefined') {
    return window.location.origin;
  }
  return process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
}

async function getUserByUsername(username) {
  try {
    const baseUrl = getBaseUrl();
    const url = `${baseUrl}/api/users/username/${username}`;
    console.log(`[ReviewPage] Fetching user: ${url}`);
    
    const res = await fetch(url, {
      cache: "no-store",
    });
    
    if (!res.ok) {
      console.error(`[ReviewPage] User not found: ${username}, status: ${res.status}`);
      return null;
    }
    
    const data = await res.json();
    
    // Handle both success:false and success:true formats
    if (data.success === false) {
      console.error(`[ReviewPage] User not found: ${username}`);
      return null;
    }
    
    if (data.success && data.user) {
      console.log(`[ReviewPage] User found: ${username}`, data.user.username);
      return data.user;
    }
    
    // Fallback: if data has user properties directly
    if (data.username || data.email) {
      return data;
    }
    
    console.error(`[ReviewPage] Invalid response format for user: ${username}`, data);
    return null;
  } catch (error) {
    console.error(`[ReviewPage] Error loading user ${username}:`, error);
    return null;
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
  const { username } = await params;

  // ตรวจสอบว่า user มีอยู่จริง (แต่ยังแสดงหน้าได้แม้ไม่พบ user)
  const user = await getUserByUsername(username);
  
  const reviews = await getReviews(username);

  // Only show 404 if we really can't render anything
  // For now, allow page to render with empty reviews
  if (!user) {
    console.warn(`[ReviewPage] User ${username} not found, rendering with default data`);
  }

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


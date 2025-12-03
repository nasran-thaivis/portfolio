import Container from "../../components/Container";
import { getSignedImageUrl } from "../../../lib/imageUtils";
import { notFound } from "next/navigation";
import { getBaseUrl } from "../../../lib/getBaseUrl";

// Runtime configuration for Vercel
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// 1. ฟังก์ชันดึงข้อมูล user จาก username
async function getUserByUsername(username) {
  try {
    const baseUrl = getBaseUrl();
    
    // Validate baseUrl to prevent invalid URLs
    if (!baseUrl || baseUrl.includes(',http') || baseUrl.includes(',https')) {
      console.error(`[AboutPage] Invalid baseUrl detected: ${baseUrl}`);
      console.warn(`[AboutPage] Using fallback user due to invalid baseUrl`);
      return { id: null, username, fallback: true };
    }
    
    // เรียกไปที่ API Route ของ Next.js (ซึ่งจะไปเรียก Backend จริงอีกที)
    const url = `${baseUrl}/api/users/username/${username}`;
    console.log(`[AboutPage] Fetching user: ${url}`);
    
    const res = await fetch(url, {
      cache: "no-store",
    });
    
    // If response is not ok, check if it's a real 404 (user not found) or backend error
    if (!res.ok) {
      // If status is 404, it means user truly doesn't exist in database
      if (res.status === 404) {
        console.error(`[AboutPage] User not found in database: ${username}, status: ${res.status}`);
        return null; // Return null to trigger 404
      }
      
      // For 5xx errors or other errors, backend might be unavailable
      // Return fallback user to allow page to render
      console.warn(`[AboutPage] Backend error (${res.status}) for ${username}, using fallback user`);
      return { id: null, username, fallback: true };
    }
    
    const data = await res.json();
    
    // Check if this is a fallback user (from API route when backend unavailable)
    if (data && data.fallback === true) {
      console.log(`[AboutPage] Using fallback user for ${username} (backend unavailable)`);
      return data;
    }
    
    // ✅ แก้ไข: เช็คแค่ว่ามีข้อมูล ID หรือ Username ส่งกลับมาไหม
    // Backend ส่งมาเป็น { id: "...", username: "...", ... } เลยเช็คตรงๆ ได้เลย
    if (data && (data.id || data.username)) {
      console.log(`[AboutPage] User found: ${data.username}`);
      return data;
    }
    
    console.error(`[AboutPage] Invalid response format for user: ${username}`, data);
    // Return fallback user instead of null to prevent 404
    console.warn(`[AboutPage] Using fallback user due to invalid response format`);
    return { id: null, username, fallback: true };

  } catch (error) {
    console.error(`[AboutPage] Error loading user ${username}:`, error);
    // Network error or timeout - return fallback user
    console.warn(`[AboutPage] Backend timeout/unavailable, using fallback user for ${username}`);
    return { id: null, username, fallback: true };
  }
}

// 2. ฟังก์ชันดึงข้อมูล Server Side (About Section)
async function getAboutData(username) {
  try {
    const baseUrl = getBaseUrl();
    const res = await fetch(`${baseUrl}/api/about-section?username=${username}`, {
      cache: "no-store",
    });
    
    if (!res.ok) {
      console.warn(`[AboutPage] About section fetch failed: ${res.status}`);
      return null;
    }
    
    const data = await res.json();
    
    // ถ้ามีรูปภาพ ให้ทำ Signed URL (ถ้าใช้ DigitalOcean Spaces)
    if (data && data.imageUrl) {
      data.imageUrl = getSignedImageUrl(data.imageUrl);
    }
    return data;
  } catch (error) {
    console.error("[AboutPage] Error loading about data:", error);
    return null;
  }
}

export default async function AboutPage({ params }) {
  // Next.js 15: params is a Promise, must await before use
  const { username } = await params;

  // 1. ตรวจสอบว่า user มีอยู่จริงไหม
  const user = await getUserByUsername(username);

  // ถ้าไม่พบ user และไม่ใช่ fallback user ให้ดีดไปหน้า 404 ทันที
  // (fallback user means backend unavailable, so we show page anyway)
  if (!user || (!user.id && !user.fallback)) {
    console.warn(`[AboutPage] User ${username} not found in database, triggering 404`);
    notFound();
  }
  
  // Log if using fallback user
  if (user?.fallback) {
    console.log(`[AboutPage] Using fallback user for ${username} - backend may be unavailable`);
  }

  // 2. ถ้าเจอ User แล้ว ค่อยดึงข้อมูล About (ถ้าเป็น fallback user อาจจะดึงไม่ได้ แต่ไม่เป็นไร)
  const data = await getAboutData(username);

  // ค่า Default (กรณี User มีตัวตน แต่ยังไม่ได้สร้างข้อมูล About)
  const about = data || {
    title: "About Me",
    description: "Waiting for update...",
    imageUrl: "https://placehold.co/600x400?text=No+Image",
  };

  return (
    <Container title="About">
      <div className="flex flex-col md:flex-row items-center gap-10 mt-8 bg-zinc-900/50 p-8 rounded-3xl border border-zinc-800">
        {/* รูปภาพซ้าย */}
        <div className="w-full md:w-1/2">
          <div className="relative h-64 md:h-96 w-full rounded-2xl overflow-hidden shadow-2xl border-4 border-zinc-700 rotate-2 hover:rotate-0 transition-transform duration-500">
            <img
              src={about.imageUrl || "https://placehold.co/600x400"}
              alt="Profile"
              className="w-full h-full object-cover"
            />
          </div>
        </div>

        {/* เนื้อหาขวา */}
        <div className="w-full md:w-1/2 space-y-6 text-left">
          <h2 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-green-400">
            {about.title}
          </h2>
          <div className="text-gray-300 leading-relaxed whitespace-pre-line text-lg">
            {about.description}
          </div>

          {/* Stats (Mock Data - อาจจะเชื่อม Database ในอนาคต) */}
          <div className="grid grid-cols-3 gap-4 pt-4 border-t border-zinc-700">
            <div>
              <h3 className="text-2xl font-bold text-white">2+</h3>
              <p className="text-xs text-gray-500 uppercase tracking-wide">Years Exp</p>
            </div>
            <div>
              <h3 className="text-2xl font-bold text-white">10+</h3>
              <p className="text-xs text-gray-500 uppercase tracking-wide">Projects</p>
            </div>
            <div>
              <h3 className="text-2xl font-bold text-white">100%</h3>
              <p className="text-xs text-gray-500 uppercase tracking-wide">Passion</p>
            </div>
          </div>
        </div>
      </div>
    </Container>
  );
}
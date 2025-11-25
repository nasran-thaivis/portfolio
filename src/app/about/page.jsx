import Container from "../components/Container";
import { getSignedImageUrl } from "../../lib/imageUtils";
// import Image from "next/image"; // ถ้าอยากใช้ next/image ก็เปิดบรรทัดนี้

// Helper to get base URL for API calls
function getBaseUrl() {
  if (typeof window !== 'undefined') {
    return window.location.origin;
  }
  return process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
}

// 1. ฟังก์ชันดึงข้อมูล Server Side
async function getAboutData() {
  try {
    // สร้าง AbortController สำหรับ timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 seconds timeout
    
    // Use Next.js API route which proxies to backend
    const baseUrl = getBaseUrl();
    const res = await fetch(`${baseUrl}/api/about-section`, {
      cache: "no-store",
      signal: controller.signal,
    }).catch((fetchError) => {
      // จัดการ network errors
      if (fetchError.name === 'AbortError') {
        console.warn("About data fetch timeout");
      } else if (fetchError.name === 'TypeError' && fetchError.message.includes('fetch')) {
        console.warn("About data fetch failed - backend may not be running");
      } else {
        console.warn("About data fetch error:", fetchError);
      }
      throw fetchError;
    }).finally(() => {
      clearTimeout(timeoutId);
    });

    // ตรวจสอบ response status ก่อน parse JSON
    if (!res.ok) {
      console.warn(`Failed to fetch about data: ${res.status} ${res.statusText}`);
      return null;
    }

    let data;
    try {
      data = await res.json();
    } catch (jsonError) {
      console.error("Failed to parse about data response:", jsonError);
      return null;
    }

    // แปลง imageUrl เป็น full backend URL
    if (data && data.imageUrl) {
      data.imageUrl = getSignedImageUrl(data.imageUrl);
    }
    return data;
  } catch (error) {
    // จัดการทุกประเภทของ errors
    if (error.name === 'AbortError') {
      console.warn("About data fetch timeout");
    } else if (error.name === 'TypeError' && error.message.includes('fetch')) {
      console.warn("About data fetch failed - backend may not be running");
    } else {
      console.error("About data fetch error:", error);
    }
    return null;
  }
}

export default async function AboutPage() {
  // 2. เรียกข้อมูล
  const data = await getAboutData();
  
  // 3. ค่า Default
  const about = data || {
    title: "About Me",
    description: "Loading...",
    imageUrl: "https://placehold.co/600x400",
  };

  return (
    <Container title="About">
      <div className="flex flex-col md:flex-row items-center gap-10 mt-8 bg-zinc-900/50 p-8 rounded-3xl border border-zinc-800">
        {/* รูปภาพซ้าย */}
        <div className="w-full md:w-1/2">
          <div className="relative h-64 md:h-96 w-full rounded-2xl overflow-hidden shadow-2xl border-4 border-zinc-700 rotate-2 hover:rotate-0 transition-transform duration-500">
            <img
              src={about.imageUrl}
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
          
          {/* Stats เล็กๆ น้อยๆ (Hardcode ไปก่อน) */}
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
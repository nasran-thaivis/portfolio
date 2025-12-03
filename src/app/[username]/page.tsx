import Link from "next/link";
import { getSignedImageUrl } from "../../lib/imageUtils";
import { notFound } from "next/navigation";
import { getBaseUrl } from "../../lib/getBaseUrl";

async function getUserByUsername(username: string) {
  try {
    const baseUrl = getBaseUrl();
    
    // Validate baseUrl to prevent invalid URLs
    if (!baseUrl || baseUrl.includes(',http') || baseUrl.includes(',https')) {
      console.error(`[UserProfile] Invalid baseUrl detected: ${baseUrl}`);
      // Return fallback user instead of null to prevent 404
      console.warn(`[UserProfile] Using fallback user due to invalid baseUrl`);
      return { id: null, username, fallback: true };
    }
    
    const url = `${baseUrl}/api/users/username/${username}`;
    console.log(`[UserProfile] Fetching user: ${url}`);

    const res = await fetch(url, {
      cache: "no-store",
    });

    // If response is not ok, check if it's a real 404 (user not found) or backend error
    if (!res.ok) {
      // If status is 404, it means user truly doesn't exist in database
      if (res.status === 404) {
        console.error(`[UserProfile] User not found in database: ${username}, status: ${res.status}`);
        try {
          const errorData = await res.json();
          console.error(`[UserProfile] Error response:`, errorData);
        } catch (e) {
          // Ignore JSON parse errors
        }
        return null; // Return null to trigger 404
      }
      
      // For 5xx errors or other errors, backend might be unavailable
      // Return fallback user to allow page to render
      console.warn(`[UserProfile] Backend error (${res.status}) for ${username}, using fallback user`);
      return { id: null, username, fallback: true };
    }

    const data = await res.json();
    console.log(`[UserProfile] Response data:`, data);

    // ✅ เช็คจากรูปแบบข้อมูลจริงที่ Backend ส่งกลับมา (raw user object)
    // อาจเป็น { id: '...', username: '...', ... } โดยตรง หรือ { success: true, user: {...} }
    let user = data;
    if (data && data.user) {
      // ถ้า response เป็น { success: true, user: {...} }
      user = data.user;
    }

    // Check if this is a fallback user (from API route when backend unavailable)
    if (user && user.fallback === true) {
      console.log(`[UserProfile] Using fallback user for ${username} (backend unavailable)`);
      return user;
    }

    if (user && (user.id || user.username)) {
      console.log(`[UserProfile] User found: ${user.username || username} (${user.id})`);
      return user;
    }

    console.error(`[UserProfile] Invalid response format for user: ${username}`, data);
    // Return fallback user instead of null to prevent 404
    console.warn(`[UserProfile] Using fallback user due to invalid response format`);
    return { id: null, username, fallback: true };
  } catch (error) {
    console.error(`[UserProfile] Error loading user ${username}:`, error);
    // Network error or timeout - return fallback user
    console.warn(`[UserProfile] Backend timeout/unavailable, using fallback user for ${username}`);
    return { id: null, username, fallback: true };
  }
}

// 2. ฟังก์ชันดึงข้อมูล Hero Section จาก username
async function getHeroData(username: string) {
  try {
    const baseUrl = getBaseUrl();
    
    // Validate baseUrl to prevent invalid URLs
    if (!baseUrl || baseUrl.includes(',http') || baseUrl.includes(',https')) {
      console.error(`[UserProfile] Invalid baseUrl detected: ${baseUrl}`);
      return null; // Will use default hero data
    }
    
    const url = `${baseUrl}/api/hero-section?username=${username}`;
    console.log(`[UserProfile] Fetching hero data from: ${url}`);
    
    const res = await fetch(url, {
      cache: "no-store",
    });
    
    if (!res.ok) {
      console.warn(`[UserProfile] Hero section fetch failed: ${res.status} - will use default data`);
      return null; // Will use default hero data
    }
    
    const data = await res.json();
    if (data && data.imageUrl) {
      data.imageUrl = getSignedImageUrl(data.imageUrl);
    }
    console.log(`[UserProfile] Hero data loaded successfully for ${username}`);
    return data;
  } catch (error: any) {
    console.error(`[UserProfile] Error loading hero data for ${username}:`, {
      message: error.message,
      name: error.name,
      code: error.code,
    });
    console.warn(`[UserProfile] Using default hero data due to error`);
    return null; // Will use default hero data
  }
}

export default async function UserProfilePage({ params }: { params: Promise<{ username: string }> }) {
  const { username } = await params;
  console.log(`[UserProfilePage] Fetching user: ${username}`);
  // ดึงข้อมูล user
  const user = await getUserByUsername(username);
  
  // ถ้าไม่พบ user และไม่ใช่ fallback user ให้แสดง 404
  // (fallback user means backend unavailable, so we show page anyway)
  if (!user || (!user.id && !user.fallback)) {
    console.warn(`[UserProfile] User ${username} not found in database, showing 404`);
    notFound();
  }
  
  // Log if using fallback user
  if (user?.fallback) {
    console.log(`[UserProfile] Using fallback user for ${username} - backend may be unavailable`);
  }
  
  // ดึงข้อมูล Hero Section (ถ้าเป็น fallback user อาจจะดึงไม่ได้ แต่ไม่เป็นไร)
  const heroData = await getHeroData(username);

  // ค่าเริ่มต้น - use username if user not found
  const displayName = user?.name || user?.username || username;
  const hero = heroData || {
    title: `Welcome to ${displayName}'s Portfolio`,
    description: user?.fallback 
      ? "Welcome to my portfolio website. Content is being loaded..."
      : "Welcome to my portfolio website.",
    imageUrl: "https://placehold.co/1920x1080",
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden bg-black">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <img
          src={hero.imageUrl}
          alt="Background"
          className="w-full h-full object-cover opacity-50"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-black/90"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 text-center px-4 max-w-4xl mx-auto animate-fade-in-up">
        <h1 className="text-5xl md:text-7xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-600 mb-6 drop-shadow-lg">
          {hero.title}
        </h1>

        <p className="text-xl md:text-2xl text-gray-300 mb-10 max-w-2xl mx-auto leading-relaxed">
          {hero.description}
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href={`/${username}/portfolio`}
            className="px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-full font-bold text-lg transition transform hover:scale-105 shadow-lg hover:shadow-blue-500/25"
          >
            View My Work
          </Link>
          <Link
            href={`/${username}/contact`}
            className="px-8 py-4 bg-transparent border-2 border-white/20 hover:bg-white/10 text-white rounded-full font-bold text-lg transition transform hover:scale-105 backdrop-blur-sm"
          >
            Get in Touch
          </Link>
        </div>
      </div>
    </div>
  );
}


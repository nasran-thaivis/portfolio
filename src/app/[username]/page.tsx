import Link from "next/link";
import { getSignedImageUrl } from "../../lib/imageUtils";
import { notFound } from "next/navigation";
import { getBaseUrl } from "../../lib/getBaseUrl";

async function getUserByUsername(username: string) {
  try {
    const baseUrl = getBaseUrl();
    const url = `${baseUrl}/api/users/username/${username}`;
    console.log(`[UserProfile] Fetching user: ${url}`);

    const res = await fetch(url, {
      cache: "no-store",
    });

    if (!res.ok) {
      console.error(`[UserProfile] User not found: ${username}, status: ${res.status}`);
      // Try to get error message from response
      try {
        const errorData = await res.json();
        console.error(`[UserProfile] Error response:`, errorData);
      } catch (e) {
        // Ignore JSON parse errors
      }
      return null;
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

    if (user && (user.id || user.username)) {
      console.log(`[UserProfile] User found: ${user.username || username} (${user.id})`);
      return user;
    }

    console.error(`[UserProfile] Invalid response format for user: ${username}`, data);
    return null;
  } catch (error) {
    console.error(`[UserProfile] Error loading user ${username}:`, error);
    return null;
  }
}

// 2. ฟังก์ชันดึงข้อมูล Hero Section จาก username
async function getHeroData(username: string) {
  try {
    const baseUrl = getBaseUrl();
    const res = await fetch(`${baseUrl}/api/hero-section?username=${username}`, {
      cache: "no-store",
    });
    
    if (!res.ok) {
      console.warn(`[UserProfile] Hero section fetch failed: ${res.status}`);
      return null;
    }
    
    const data = await res.json();
    if (data && data.imageUrl) {
      data.imageUrl = getSignedImageUrl(data.imageUrl);
    }
    return data;
  } catch (error) {
    console.error("Error loading hero data:", error);
    return null;
  }
}

export default async function UserProfilePage({ params }: { params: Promise<{ username: string }> }) {
  const { username } = await params;

  // ดึงข้อมูล user
  const user = await getUserByUsername(username);
  
  // ถ้าไม่พบ user และไม่ใช่ fallback user ให้แสดง 404
  if (!user || (!user.id && !user.fallback)) {
    console.warn(`[UserProfile] User ${username} not found, showing 404`);
    notFound();
  }
  
  // ดึงข้อมูล Hero Section (ถ้าเป็น fallback user อาจจะดึงไม่ได้ แต่ไม่เป็นไร)
  const heroData = await getHeroData(username);

  // ค่าเริ่มต้น - use username if user not found
  const displayName = user?.name || username;
  const hero = heroData || {
    title: `Welcome to ${displayName}'s Portfolio`,
    description: "Welcome to my portfolio website.",
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


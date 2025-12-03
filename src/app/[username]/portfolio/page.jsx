import Container from "../../components/Container";
import { notFound } from "next/navigation";
import PortfolioClient from "./PortfolioClient";
import { getBaseUrl } from "../../../lib/getBaseUrl";

// Runtime configuration for Vercel
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

async function getUserByUsername(username) {
  try {
    const baseUrl = getBaseUrl();
    
    // Validate baseUrl to prevent invalid URLs
    if (!baseUrl || baseUrl.includes(',http') || baseUrl.includes(',https')) {
      console.error(`[PortfolioPage] Invalid baseUrl detected: ${baseUrl}`);
      console.warn(`[PortfolioPage] Using fallback user due to invalid baseUrl`);
      return { id: null, username, fallback: true };
    }
    
    const url = `${baseUrl}/api/users/username/${username}`;
    console.log(`[PortfolioPage] Fetching user: ${url}`);

    const res = await fetch(url, {
      cache: "no-store",
    });

    // If response is not ok, check if it's a real 404 (user not found) or backend error
    if (!res.ok) {
      // If status is 404, it means user truly doesn't exist in database
      if (res.status === 404) {
        console.error(`[PortfolioPage] User not found in database: ${username}, status: ${res.status}`);
        return null; // Return null to trigger 404
      }
      
      // For 5xx errors or other errors, backend might be unavailable
      // Return fallback user to allow page to render
      console.warn(`[PortfolioPage] Backend error (${res.status}) for ${username}, using fallback user`);
      return { id: null, username, fallback: true };
    }

    const data = await res.json();

    // ✅ เช็คจากรูปแบบข้อมูลจริงที่ Backend ส่งกลับมา
    // อาจเป็น { id: '...', username: '...', ... } หรือ { success: true, user: {...} }
    let user = data;
    if (data && data.user) {
      // ถ้า response เป็น { success: true, user: {...} }
      user = data.user;
    }
    
    // Check if this is a fallback user (from API route when backend unavailable)
    if (user && user.fallback === true) {
      console.log(`[PortfolioPage] Using fallback user for ${username} (backend unavailable)`);
      return user;
    }
    
    if (user && (user.id || user.username)) {
      console.log(`[PortfolioPage] User found: ${user.username || username}`);
      return user;
    }

    console.error(`[PortfolioPage] Invalid response format for user: ${username}`, data);
    // Return fallback user instead of null to prevent 404
    console.warn(`[PortfolioPage] Using fallback user due to invalid response format`);
    return { id: null, username, fallback: true };
  } catch (error) {
    console.error(`[PortfolioPage] Error loading user ${username}:`, error);
    // Network error or timeout - return fallback user
    console.warn(`[PortfolioPage] Backend timeout/unavailable, using fallback user for ${username}`);
    return { id: null, username, fallback: true };
  }
}

export default async function PortfolioPage({ params }) {
  // Next.js 15: params is a Promise, must await before use
  const { username } = await params;

  // ตรวจสอบว่า user มีอยู่จริง
  const user = await getUserByUsername(username);

  // ถ้าไม่พบ user และไม่ใช่ fallback user ให้แสดง 404
  // (fallback user means backend unavailable, so we show page anyway)
  if (!user || (!user.id && !user.fallback)) {
    console.warn(`[PortfolioPage] User ${username} not found in database, showing 404`);
    notFound();
  }
  
  // Log if using fallback user
  if (user?.fallback) {
    console.log(`[PortfolioPage] Using fallback user for ${username} - backend may be unavailable`);
  }

  return (
    <Container title="Portfolio">
      <div className="text-center mb-12">
        <h2 className="text-3xl font-bold text-white mb-4"></h2>
        <p className="text-gray-400 max-w-2xl mx-auto">
          รวมผลงานทั้งหมดที่ดึงมาจาก Database
        </p>
      </div>
      <PortfolioClient username={username} />
    </Container>
  );
}

import Container from "../../components/Container";
import { notFound } from "next/navigation";
import PortfolioClient from "./PortfolioClient";
import { getBaseUrl } from "../../../lib/getBaseUrl";

// ฟังก์ชันดึงข้อมูล user จาก username
async function getUserByUsername(username) {
  try {
    const baseUrl = getBaseUrl();
    const url = `${baseUrl}/api/users/username/${username}`;
    console.log(`[PortfolioPage] Fetching user: ${url}`);
    
    const res = await fetch(url, {
      cache: "no-store",
    });
    
    if (!res.ok) {
      console.error(`[PortfolioPage] User not found: ${username}, status: ${res.status}`);
      return null;
    }
    
    const data = await res.json();
    
    // Handle both success:false and success:true formats
    if (data.success === false) {
      console.error(`[PortfolioPage] User not found: ${username}`);
      return null;
    }
    
    if (data.success && data.user) {
      console.log(`[PortfolioPage] User found: ${username}`, data.user.username);
      return data.user;
    }
    
    // Fallback: if data has user properties directly
    if (data.username || data.email) {
      return data;
    }
    
    console.error(`[PortfolioPage] Invalid response format for user: ${username}`, data);
    return null;
  } catch (error) {
    console.error(`[PortfolioPage] Error loading user ${username}:`, error);
    return null;
  }
}

export default async function PortfolioPage({ params }) {
  const { username } = await params;

  // ตรวจสอบว่า user มีอยู่จริง
  const user = await getUserByUsername(username);

  // ถ้าไม่พบ user ให้แสดง 404
  if (!user) {
    console.warn(`[PortfolioPage] User ${username} not found, showing 404`);
    notFound();
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

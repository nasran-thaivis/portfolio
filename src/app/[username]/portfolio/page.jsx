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

    // ✅ เช็คจากรูปแบบข้อมูลจริงที่ Backend ส่งกลับมา (raw user object)
    // ตัวอย่าง: { id: '...', username: '...', ... }
    if (data && (data.id || data.username)) {
      console.log(`[PortfolioPage] User found: ${data.username || username}`);
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
  // Next.js 15: params is a Promise, must await before use
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

import HomeClient from "./components/HomeClient";

// Runtime configuration for Vercel
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// === Home Page ===
// หน้าแรกของเว็บไซต์ - แสดง hero section จาก admin เมื่อ login แล้ว
export default function HomePage() {
  return <HomeClient />;
}
"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../contexts/AuthContext";
import AdminClient from "../../admin/AdminClient";

// === Admin Dashboard สำหรับแต่ละ User ===
export default function UserAdminPage({ params }) {
  // Next.js 15: params is a Promise, use React's use() hook to unwrap it
  const { username } = use(params);
  const { currentUser, isAuthenticated, loading: authLoading } = useAuth();
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [checking, setChecking] = useState(true);
  const router = useRouter();

  useEffect(() => {
    if (authLoading) return;

    // ตรวจสอบว่า user login แล้วหรือยัง
    if (!isAuthenticated || !currentUser) {
      router.push("/login");
      return;
    }

    // ตรวจสอบว่า username ใน URL ตรงกับ user ที่ login หรือไม่
    if (currentUser.username !== username) {
      // Redirect ไป admin ของตัวเอง
      router.push(`/${currentUser.username}/admin`);
      return;
    }

    setIsAuthorized(true);
    setChecking(false);
  }, [isAuthenticated, currentUser, username, authLoading, router]);

  if (authLoading || checking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[var(--color-primary)]/10 to-[var(--color-secondary)]/10">
        <div className="text-center">
          <div className="inline-block w-16 h-16 border-4 border-[var(--color-primary)] border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-gray-600 font-medium">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthorized) {
    return null;
  }

  return <AdminClient />;
}


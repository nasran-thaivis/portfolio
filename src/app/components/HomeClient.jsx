"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Container from "./Container";
import { getSignedImageUrl } from "../../lib/imageUtils";
import { useAuth } from "../contexts/AuthContext";

// === Component หน้า Home (Client-side) ===
// ดึงข้อมูล hero section จาก API เมื่อ login แล้ว
export default function HomeClient() {
  const { currentUser, loading: authLoading } = useAuth();
  const [heroData, setHeroData] = useState(null);
  const [loading, setLoading] = useState(true);

  // ดึงข้อมูลจาก API
  useEffect(() => {
    // รอให้ AuthContext โหลดเสร็จก่อน
    if (authLoading) {
      return;
    }

    const fetchHeroData = async () => {
      if (!currentUser?.username) {
        setLoading(false);
        return;
      }

      try {
        console.log(`[HomeClient] Fetching hero data for username: ${currentUser.username}`);
        const res = await fetch(`/api/hero-section?username=${currentUser.username}`, {
          cache: "no-store",
        });
        
        if (res.ok) {
          const data = await res.json();
          if (data) {
            // แปลง imageUrl เป็น signed URL
            const formattedData = {
              ...data,
              imageUrl: data.imageUrl ? getSignedImageUrl(data.imageUrl) : data.imageUrl,
            };
            console.log(`[HomeClient] Hero data loaded:`, formattedData);
            setHeroData(formattedData);
          }
        } else {
          console.warn(`[HomeClient] Failed to fetch hero data: ${res.status}`);
        }
      } catch (error) {
        console.error("[HomeClient] Error fetching hero data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchHeroData();
  }, [currentUser, authLoading]);

  // รอให้ AuthContext โหลดเสร็จก่อน
  if (authLoading || loading) {
    return (
      <Container title="Home">
        <div className="text-center py-20 animate-pulse">
          <p className="text-xl text-gray-300">กำลังโหลดข้อมูล...</p>
        </div>
      </Container>
    );
  }

  if (!currentUser) {
    return (
      <div className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-[var(--color-primary)]/10 via-[var(--color-secondary)]/5 to-[var(--color-primary)]/10">
        <div className="relative z-10 text-center px-4 max-w-4xl mx-auto animate-fade-in-up">
          <h1 className="text-5xl md:text-7xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-600 mb-6 drop-shadow-lg">
            Welcome to Portfolio Platform
          </h1>
          <p className="text-xl md:text-2xl text-gray-700 mb-10 max-w-2xl mx-auto leading-relaxed">
            Create your own portfolio website in minutes. Showcase your work, share your story, and connect with clients.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/register"
              className="px-8 py-4 bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-secondary)] hover:opacity-90 text-white rounded-full font-bold text-lg transition transform hover:scale-105 shadow-lg hover:shadow-xl"
            >
              Get Started
            </Link>
            <Link
              href="/login"
              className="px-8 py-4 bg-transparent border-2 border-[var(--color-primary)] hover:bg-[var(--color-primary)]/10 text-[var(--color-primary)] rounded-full font-bold text-lg transition transform hover:scale-105"
            >
              Sign In
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // ค่าเริ่มต้น
  const displayName = currentUser?.name || currentUser?.username || "User";
  const hero = heroData || {
    title: `Welcome to ${displayName}'s Portfolio`,
    description: "Welcome to my portfolio website.",
    imageUrl: "https://placehold.co/1920x1080",
  };

  return (
    <Container title="Home">
      <div className="relative min-h-[60vh] flex items-center justify-center overflow-hidden rounded-2xl bg-black">
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
        <div className="relative z-10 text-center px-4 max-w-4xl mx-auto animate-fade-in-up py-12">
          <h1 className="text-4xl md:text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-600 mb-6 drop-shadow-lg">
            {hero.title}
          </h1>

          <p className="text-lg md:text-xl text-gray-300 mb-10 max-w-2xl mx-auto leading-relaxed">
            {hero.description}
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href={`/${currentUser.username}/portfolio`}
              className="px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-full font-bold text-lg transition transform hover:scale-105 shadow-lg hover:shadow-blue-500/25"
            >
              View My Work
            </Link>
            <Link
              href={`/${currentUser.username}/contact`}
              className="px-8 py-4 bg-transparent border-2 border-white/20 hover:bg-white/10 text-white rounded-full font-bold text-lg transition transform hover:scale-105 backdrop-blur-sm"
            >
              Get in Touch
            </Link>
          </div>
        </div>
      </div>
    </Container>
  );
}


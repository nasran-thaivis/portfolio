"use client";

import { useState, useEffect } from "react";
import { getSignedImageUrl } from "../../lib/imageUtils";
import { useAuth } from "../contexts/AuthContext";

// === Component สำหรับแสดงรูปภาพพร้อม proxy URL ===
const ProfileImageWithSignedUrl = ({ src, alt, className }) => {
  if (!src) return null;

  // แปลง URL เป็น proxy URL ถ้าเป็น DigitalOcean Spaces URL
  const imageUrl = getSignedImageUrl(src);

  return (
    <img
      src={imageUrl}
      alt={alt}
      className={className}
    />
  );
};

// === ข้อมูลเริ่มต้น ===
const DEFAULT_DATA = {
  title: "About Me",
  description: "IT Support / Programmer",
  imageUrl: "",
  content: `I am highly motivated to develop my skills in IT and programming. I am eager to learn new things, grow with the organization, and continuously improve myself. I am cheerful, adaptable, and a quick learner.

I'm passionate about creating modern web applications and providing excellent IT support.`,
  skills: "Next.js, React, Tailwind CSS, WordPress, LAN/Hardware, Microsoft Office",
};

// === Component หน้า About (Client-side) ===
// ดึงข้อมูลจาก API
export default function AboutClient() {
  const { currentUser, loading: authLoading } = useAuth();
  const [data, setData] = useState(DEFAULT_DATA);
  const [loading, setLoading] = useState(true);

  // ดึงข้อมูลจาก API
  useEffect(() => {
    // รอให้ AuthContext โหลดเสร็จก่อน
    if (authLoading) {
      return;
    }

    const fetchAboutData = async () => {
      if (!currentUser?.username) {
        setLoading(false);
        return;
      }

      try {
        console.log(`[AboutClient] Fetching about data for username: ${currentUser.username}`);
        // ใช้ relative URL สำหรับ client-side
        const res = await fetch(`/api/about-section?username=${currentUser.username}`, {
          cache: "no-store",
        });
        
        if (res.ok) {
          const aboutData = await res.json();
          if (aboutData) {
            // แปลง imageUrl เป็น signed URL
            const formattedData = {
              ...aboutData,
              imageUrl: aboutData.imageUrl ? getSignedImageUrl(aboutData.imageUrl) : aboutData.imageUrl,
              title: aboutData.title || DEFAULT_DATA.title,
              description: aboutData.description || DEFAULT_DATA.description,
              content: aboutData.content || aboutData.description || DEFAULT_DATA.content,
              skills: aboutData.skills || DEFAULT_DATA.skills,
            };
            console.log(`[AboutClient] About data loaded:`, formattedData);
            setData(formattedData);
          }
        } else {
          console.warn(`[AboutClient] Failed to fetch about data: ${res.status}`);
        }
      } catch (error) {
        console.error("[AboutClient] Error fetching about data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAboutData();
  }, [currentUser, authLoading]);

  // รอให้ AuthContext โหลดเสร็จก่อน
  if (authLoading || loading) {
    return (
      <div className="text-center py-20 animate-pulse">
        <p className="text-xl text-gray-300">กำลังโหลดข้อมูล...</p>
      </div>
    );
  }

  if (!currentUser) {
    return (
      <div className="text-center py-20 text-gray-500">
        <p className="text-xl mb-4">กรุณาเข้าสู่ระบบเพื่อดูข้อมูล</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
        {/* Hero Section with Description */}
        {data.description && (
          <div className="text-center py-6">
            <p className="text-2xl sm:text-3xl text-gray-300 italic font-medium bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-secondary)] bg-clip-text text-transparent">
              {data.description}
            </p>
          </div>
        )}

        {/* Profile Image */}
        {data.imageUrl && (
          <div className="flex justify-center my-8">
            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-secondary)] rounded-full blur opacity-75 group-hover:opacity-100 transition duration-300"></div>
              <ProfileImageWithSignedUrl
                src={data.imageUrl}
                alt={data.title}
                className="relative w-48 h-48 sm:w-56 sm:h-56 rounded-full object-cover border-4 border-white shadow-2xl"
              />
            </div>
          </div>
        )}

        {/* Content Section */}
        <div className="bg-gradient-to-br from-zinc-800/50 to-zinc-800/30 border-2 border-zinc-700 rounded-2xl p-6 sm:p-8">
          <div className="prose prose-invert max-w-none">
            <div className="text-gray-300 whitespace-pre-wrap leading-relaxed text-base sm:text-lg">
              {data.content}
            </div>
          </div>
        </div>

        {/* Skills Section */}
        {data.skills && (
          <div className="bg-gradient-to-br from-[var(--color-primary)]/20 to-[var(--color-secondary)]/20 border-2 border-[var(--color-primary)]/30 rounded-2xl p-6 sm:p-8 shadow-2xl">
            <h3 className="text-2xl sm:text-3xl font-bold text-white mb-6 flex items-center gap-3">
              <span className="text-3xl">💼</span>
              <span className="bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-secondary)] bg-clip-text text-transparent">
                Skills & Technologies
              </span>
            </h3>
            <div className="flex flex-wrap gap-3">
              {data.skills.split(',').map((skill, index) => (
                <span
                  key={index}
                  className="group relative px-5 py-3 bg-gradient-to-br from-white to-gray-100 text-gray-800 font-bold rounded-xl text-sm shadow-lg hover:shadow-2xl transform hover:scale-110 transition-all duration-300 border-2 border-[var(--color-primary)]/30 hover:border-[var(--color-primary)]"
                >
                  <span className="relative z-10">{skill.trim()}</span>
                  <div className="absolute inset-0 bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-secondary)] opacity-0 group-hover:opacity-20 rounded-xl transition-opacity duration-300"></div>
                </span>
              ))}
            </div>
          </div>
        )}
    </div>
  );
}


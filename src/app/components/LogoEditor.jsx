"use client";
import Image from "next/image";
import { useState, useRef, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { usePathname } from "next/navigation";

export default function LogoEditor({ size = 36, showControls = true }) {
  const [logo, setLogo] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const inputRef = useRef(null);
  const { currentUser } = useAuth();
  const pathname = usePathname();

  // ดึง username จาก currentUser หรือ pathname
  const getUsername = () => {
    if (currentUser?.username) {
      return currentUser.username;
    }
    // ถ้าไม่มี currentUser ลองดึงจาก pathname (เช่น /username/...)
    const usernameMatch = pathname?.match(/^\/([^\/]+)/);
    return usernameMatch ? usernameMatch[1] : null;
  };

  // === 2. ฟังก์ชัน: โหลด Logo จาก Database ===
  useEffect(() => {
    const fetchLogo = async () => {
      const username = getUsername();
      if (!username) {
        // ถ้าไม่มี username ไม่ต้อง fetch
        return;
      }

      try {
        // Encode username เพื่อป้องกันปัญหาเมื่อมีอักขระพิเศษ (เช่น @, .)
        const encodedUsername = encodeURIComponent(username);
        // ใช้ Next.js API route แทนการเรียก backend โดยตรง (แก้ปัญหา CORS)
        const apiUrl = `/api/hero-section?username=${encodedUsername}`;
        
        // สร้าง AbortController สำหรับ timeout
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 seconds timeout
        
        const res = await fetch(apiUrl, {
          signal: controller.signal,
        }).catch((fetchError) => {
          // จัดการ network errors (เช่น backend ไม่ได้รัน, CORS, timeout)
          if (fetchError.name === 'AbortError') {
            console.warn("Logo fetch timeout - backend may be slow or unavailable");
          } else if (fetchError.name === 'TypeError' && fetchError.message.includes('fetch')) {
            console.warn("Logo fetch failed - backend may not be running:", fetchError.message);
          } else {
            console.warn("Logo fetch error:", fetchError);
          }
          throw fetchError;
        }).finally(() => {
          clearTimeout(timeoutId);
        });
        
        // ตรวจสอบ response status ก่อน parse JSON
        if (!res.ok) {
          // ถ้า response ไม่ ok ให้ log error แต่ไม่ throw
          console.warn(`Failed to fetch logo: ${res.status} ${res.statusText}`);
          return;
        }

        const data = await res.json();
        
        // ตรวจสอบว่ามี imageUrl และไม่ใช่ค่า default placeholder
        if (data && data.imageUrl && data.imageUrl !== 'https://placehold.co/1920x1080') {
          setLogo(data.imageUrl);
        }
      } catch (error) {
        // จัดการทุกประเภทของ errors (network, timeout, JSON parse, etc.)
        if (error.name === 'AbortError') {
          console.warn("Logo fetch timeout");
        } else if (error.name === 'TypeError' && error.message.includes('fetch')) {
          console.warn("Logo fetch failed - backend may not be running");
        } else {
          console.error("Failed to fetch logo:", error);
        }
        // ไม่ต้อง set error state เพราะเป็น optional feature
      }
    };

    fetchLogo();
  }, [currentUser, pathname]);

  // === 3. ฟังก์ชัน: อัปโหลดรูปและบันทึก (S3 Upload) ===
  const handleFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("Please select an image file");
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      alert("Image size should be less than 2MB");
      return;
    }

    setIsLoading(true);

    try {
      // อัปโหลดไป S3 ก่อน
      const formDataToUpload = new FormData();
      formDataToUpload.append('file', file);

      // ใช้ Next.js API route แทนการเรียก backend โดยตรง (แก้ปัญหา CORS)
      const headers = {};
      if (currentUser?.id) headers['x-user-id'] = currentUser.id;
      if (currentUser?.username) headers['x-username'] = currentUser.username;

      const uploadRes = await fetch('/api/upload/image', {
        method: 'POST',
        headers,
        body: formDataToUpload,
      });

      if (!uploadRes.ok) {
        throw new Error('Failed to upload image to S3');
      }

      const { url } = await uploadRes.json();

      // จากนั้นบันทึก URL ลง Database
      const username = getUsername();
      if (!username || !currentUser) {
        throw new Error("Authentication required");
      }
      
      // ใช้ Next.js API route แทนการเรียก backend โดยตรง (แก้ปัญหา CORS)
      const res = await fetch('/api/hero-section', {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "x-username": username,
          "x-user-id": currentUser.id || "",
        },
        body: JSON.stringify({
          imageUrl: url
        }),
      });

      if (!res.ok) {
        throw new Error("Failed to update logo");
      }

      setLogo(url);
      alert("Logo updated successfully!");

    } catch (error) {
      console.error("LogoEditor: unable to save logo", error);
      alert("Failed to save logo. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // === 4. ฟังก์ชัน: ลบ Logo ===
  const clearLogo = async () => {
    if (!confirm("Are you sure you want to remove the logo?")) return;
    
    const username = getUsername();
    if (!username || !currentUser) {
      alert("Authentication required");
      return;
    }
    
    setIsLoading(true);
    try {
       // ใช้ Next.js API route แทนการเรียก backend โดยตรง (แก้ปัญหา CORS)
       const res = await fetch('/api/hero-section', {
            method: "PATCH",
            headers: { 
              "Content-Type": "application/json",
              "x-username": username,
              "x-user-id": currentUser.id || "",
            },
            body: JSON.stringify({ imageUrl: null }), 
        });

        if (res.ok) {
            setLogo(null);
        }
    } catch (error) {
        console.error("Failed to remove logo", error);
    } finally {
        setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center gap-3">
      <div className="flex flex-col items-center">
        {/* === ส่วนแสดงผลรูปภาพ === */}
        <div className="relative overflow-hidden rounded border border-zinc-700" style={{ width: size, height: size }}>
          {isLoading ? (
            <div className="w-full h-full flex items-center justify-center bg-zinc-800">
                <span className="text-xs text-gray-400">...</span>
            </div>
          ) : logo ? (
            <Image
              src={logo}
              alt="Site Logo"
              fill
              sizes={`${size}px`}
              unoptimized 
              className="object-cover"
              priority
            />
          ) : (
            <div className="w-full h-full bg-zinc-800 flex items-center justify-center text-white font-semibold text-sm">
              NS
            </div>
          )}
        </div>

        {/* === ปุ่มควบคุม === */}
        {showControls && (
          <div className="mt-2 flex items-center gap-2">
            <button
              onClick={() => inputRef.current?.click()}
              disabled={isLoading}
              className="text-[10px] px-2 py-1 bg-zinc-800 hover:bg-zinc-700 text-white rounded transition-colors disabled:opacity-50"
            >
              {logo ? "Edit" : "Upload"}
            </button>
            {logo && (
              <button
                onClick={clearLogo}
                disabled={isLoading}
                className="text-[10px] px-2 py-1 bg-red-600 hover:bg-red-700 text-white rounded transition-colors disabled:opacity-50"
              >
                Remove
              </button>
            )}
          </div>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        onChange={handleFile}
        className="hidden"
      />
    </div>
  );
}
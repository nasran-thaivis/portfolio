"use client";

import { useState, useEffect, useRef } from "react";
import { useParams } from "next/navigation";
import { getSignedImageUrl, normalizeImageUrl } from "../../../lib/imageUtils";
// import { getApiUrl } from "../../../lib/api"; // ไม่ได้ใช้ในนี้ ลบออกหรือ comment ไว้ก็ได้ครับ
import { useAuth } from "../../contexts/AuthContext";

export default function HomeEditor() {
  const params = useParams();
  const { currentUser } = useAuth();
  
  // ✅ แก้ไขแล้ว: ลบ ( as string ) ออก
  const currentUsername = params?.username || currentUser?.username || '';

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    imageUrl: "",
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef(null);

  // 1. ดึงข้อมูลปัจจุบันมาแสดงในฟอร์ม
  useEffect(() => {
    const fetchData = async () => {
      // ถ้าไม่มี username ให้จบการทำงาน
      if (!currentUsername) {
        setIsLoading(false);
        return;
      }
      
      try {
        // Use Next.js API route with username query parameter
        const res = await fetch(`/api/hero-section?username=${encodeURIComponent(currentUsername)}`);
        
        if (!res.ok) {
          console.warn("[HomeEditor] Failed to fetch hero section, using empty form");
          setIsLoading(false);
          return;
        }
        
        const data = await res.json();
        if (data) {
          setFormData({
            title: data.title || "",
            description: data.description || "",
            imageUrl: data.imageUrl ? getSignedImageUrl(data.imageUrl) : "",
          });
        }
      } catch (error) {
        console.error("[HomeEditor] Failed to load data", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [currentUsername]);

  // 2. อัปโหลดรูปภาพจากเครื่อง (S3 Upload)
  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      alert("❌ กรุณาเลือกไฟล์รูปภาพเท่านั้น");
      return;
    }

    // Validate file size (max 5MB for background images)
    if (file.size > 5 * 1024 * 1024) {
      alert("❌ ไฟล์รูปภาพต้องมีขนาดไม่เกิน 5MB");
      return;
    }

    setIsUploading(true);

    try {
      const formDataToUpload = new FormData();
      formDataToUpload.append('file', file);

      const headers = {};
      if (currentUser?.id) headers['x-user-id'] = currentUser.id;
      if (currentUser?.username) headers['x-username'] = currentUser.username;

      const uploadRes = await fetch('/api/upload/image', {
        method: 'POST',
        headers,
        body: formDataToUpload,
      });

      if (!uploadRes.ok) {
        throw new Error('อัปโหลดล้มเหลว');
      }

      const { url } = await uploadRes.json();
      setFormData({ ...formData, imageUrl: getSignedImageUrl(url) });
      alert('✅ อัปโหลดรูปภาพสำเร็จ!');
    } catch (error) {
      console.error(error);
      alert('❌ อัปโหลดล้มเหลว กรุณาลองใหม่');
    } finally {
      setIsUploading(false);
    }
  };

  // 3. ลบรูปภาพ
  const handleRemoveImage = () => {
    if (confirm("คุณต้องการลบรูปภาพนี้หรือไม่?")) {
      setFormData({ ...formData, imageUrl: "" });
    }
  };

  // 4. บันทึกข้อมูล (PATCH)
  const handleSave = async (e) => {
    e.preventDefault();
    
    if (!currentUsername) {
      alert("❌ ไม่พบ username กรุณาตรวจสอบ URL");
      return;
    }
    
    try {
      // Normalize imageUrl to path before saving
      const dataToSave = {
        ...formData,
        imageUrl: formData.imageUrl ? normalizeImageUrl(formData.imageUrl) : formData.imageUrl,
        username: currentUsername, // ส่งไปบอกหลังบ้านว่าเป็นของใคร (fallback ถ้า header ไม่มี)
      };

      const headers = {
        "Content-Type": "application/json",
      };

      // ส่งข้อมูล user จริงไปที่ API (ให้ backend ผูกกับ user ใน DB อย่างถูกต้อง)
      if (currentUser?.id) {
        headers["x-user-id"] = currentUser.id;
      }
      if (currentUser?.username && currentUser.username !== currentUser.id) {
        headers["x-username"] = currentUser.username;
      }

      const res = await fetch("/api/hero-section", {
        method: "PATCH",
        headers,
        body: JSON.stringify(dataToSave),
      });

      if (res.ok) {
        // const data = await res.json(); // ไม่จำเป็นต้องใช้ data ก็ได้
        alert("✅ บันทึกข้อมูลเรียบร้อย! (ไปดูหน้าแรกได้เลย)");
      } else {
        const errorData = await res.json().catch(() => ({}));
        const errorMessage = errorData.message || "บันทึกไม่สำเร็จ";
        alert(`❌ ${errorMessage}`);
      }
    } catch (error) {
      console.error("[HomeEditor] Save error:", error);
      alert("❌ ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้ กรุณาตรวจสอบว่า Database กำลังทำงานอยู่");
    }
  };

  if (isLoading) return <div className="p-8 text-center">Loading editor...</div>;

  return (
    <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-200">
      <div className="flex items-center gap-2 mb-6 border-b pb-4">
        <span className="text-2xl">🏠</span>
        <h3 className="text-xl font-bold text-gray-800">Edit Home Page</h3>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Title */}
        <div>
          <label className="block text-gray-700 font-semibold mb-2">Title (หัวข้อหลัก)</label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-black"
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-gray-700 font-semibold mb-2">Description (คำบรรยาย)</label>
          <textarea
            rows="4"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-black"
          ></textarea>
        </div>

        {/* Background Image */}
        <div>
          <label className="block text-gray-700 font-semibold mb-2">Background Image</label>
          
          {/* Upload & Remove Buttons */}
          <div className="flex gap-3 mb-4">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isUploading ? (
                <>
                  <span className="animate-spin">⏳</span>
                  Uploading...
                </>
              ) : (
                <>
                  📤 Upload Image
                </>
              )}
            </button>
            
            {formData.imageUrl && (
              <button
                type="button"
                onClick={handleRemoveImage}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition flex items-center gap-2"
              >
                🗑️ Remove
              </button>
            )}
          </div>

          {/* Hidden File Input */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            className="hidden"
          />

          {/* Preview Image */}
          {formData.imageUrl && (
            <div className="mt-4 h-40 w-full rounded-lg overflow-hidden bg-gray-100 border">
              <img src={getSignedImageUrl(formData.imageUrl)} alt="Preview" className="w-full h-full object-cover" />
            </div>
          )}
        </div>

        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-3 rounded-lg font-bold hover:bg-blue-700 transition shadow-lg"
        >
          Save Changes 💾
        </button>
      </form>
    </div>
  );
}
"use client";

import { useState, useEffect, useRef } from "react";
// ปรับ import path ให้ตรงกับโครงสร้างโปรเจกต์ของคุณ
import { getSignedImageUrl, normalizeImageUrl } from "../../../lib/imageUtils";
import { useAuth } from "../../contexts/AuthContext";

export default function AboutEditor() {
  const { currentUser } = useAuth();
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    imageUrl: "",
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef(null);

  // Load initial data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch("/api/about-section");
        
        if (!res.ok) {
          console.warn("[AboutEditor] Failed to fetch about section, using empty form");
          setIsLoading(false);
          return;
        }
        
        const data = await res.json();
        if (data) {
          setFormData({
            ...data,
            imageUrl: data.imageUrl ? getSignedImageUrl(data.imageUrl) : data.imageUrl,
          });
        }
      } catch (error) {
        console.error("[AboutEditor] Failed to load data", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  // Upload image logic
  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("❌ กรุณาเลือกไฟล์รูปภาพเท่านั้น");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert("❌ ไฟล์รูปภาพต้องมีขนาดไม่เกิน 5MB");
      return;
    }

    setIsUploading(true);

    try {
      const formDataToUpload = new FormData();
      formDataToUpload.append('file', file);

      const headers = {};
      // Add auth headers for upload
      if (currentUser?.id) headers['x-user-id'] = currentUser.id;
      if (currentUser?.username && currentUser.username !== currentUser.id) {
        headers['x-username'] = currentUser.username;
      }

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

  const handleRemoveImage = () => {
    if (confirm("คุณต้องการลบรูปภาพนี้หรือไม่?")) {
      setFormData({ ...formData, imageUrl: "" });
    }
  };

  // --- FIXED SAVE FUNCTION ---
  const handleSave = async (e) => {
    e.preventDefault();
    
    // Validate basics
    if (!currentUser) {
      alert("❌ กรุณา Login ก่อนบันทึกข้อมูล");
      return;
    }
    
    try {
      const dataToSave = {
        ...formData,
        imageUrl: formData.imageUrl ? normalizeImageUrl(formData.imageUrl) : formData.imageUrl,
      };

      const headers = {
        "Content-Type": "application/json",
      };

      // 1. ใส่ User ID
      if (currentUser?.id) {
        headers['x-user-id'] = currentUser.id;
      }

      // 2. ใส่ Username โดยกรองไม่ให้ส่ง ID ไปผิดช่อง
      const isValidUsername = (name, id) => {
          return name && name !== id && name.length < 25;
      };

      if (isValidUsername(currentUser?.username, currentUser?.id)) {
        headers['x-username'] = currentUser.username;
      } else {
         console.warn("Username ดูเหมือนจะเป็น ID หรือไม่ถูกต้อง จึงไม่ส่ง header x-username");
         // headers['x-username'] = "Kam19"; // Uncomment บรรทัดนี้ถ้ายัง Error เดิม
      }

      console.log("Sending Headers:", headers);

      const res = await fetch("/api/about-section", {
        method: "PATCH",
        headers,
        body: JSON.stringify(dataToSave),
      });
      
      if (res.ok) {
        alert("✅ Updated About Page!");
      } else {
        const errorData = await res.json().catch(() => ({}));
        const errorMessage = errorData.message || errorData.error || `Error updating (${res.status})`;
        console.error("Server Response Error:", errorMessage);
        alert(`❌ ${errorMessage}`);
      }
    } catch (error) {
      console.error("[AboutEditor] Save error:", error);
      alert(`❌ ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้: ${error.message}`);
    }
  };

  if (isLoading) return <div>Loading...</div>;

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
      <h3 className="text-xl font-bold text-gray-800 mb-4 border-b pb-2">Edit About Page</h3>
      <form onSubmit={handleSave} className="space-y-4">
        <div>
          <label className="block text-gray-700 font-semibold mb-1">Title</label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            className="w-full p-3 border rounded-lg text-black"
          />
        </div>
        <div>
          <label className="block text-gray-700 font-semibold mb-1">Description</label>
          <textarea
            rows="6"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className="w-full p-3 border rounded-lg text-black"
          ></textarea>
        </div>
        <div>
          <label className="block text-gray-700 font-semibold mb-1">Image</label>
          
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

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            className="hidden"
          />

          {formData.imageUrl && (
            <div className="mt-4 h-40 w-full rounded-lg overflow-hidden bg-gray-100 border">
              <img src={getSignedImageUrl(formData.imageUrl)} alt="Preview" className="w-full h-full object-cover" />
            </div>
          )}
        </div>
        <button type="submit" className="w-full bg-blue-600 text-white py-3 rounded-lg font-bold hover:bg-blue-700">
          Save Changes 💾
        </button>
      </form>
    </div>
  );
}
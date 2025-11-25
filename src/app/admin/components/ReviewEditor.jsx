"use client";
import { useState, useEffect } from "react";
import { useAuth } from "../../contexts/AuthContext";

export default function ReviewEditor() {
  const { currentUser } = useAuth();
  const [reviews, setReviews] = useState([]);
  const [formData, setFormData] = useState({ name: "", rating: 5, comment: "" });

  // 1. โหลดข้อมูล
  const fetchReviews = async () => {
    try {
      // Prepare headers with authentication
      const headers = {};
      if (currentUser?.id) headers['x-user-id'] = currentUser.id;
      if (currentUser?.username) headers['x-username'] = currentUser.username;

      // Use Next.js API route which proxies to backend
      const res = await fetch("/api/reviews", {
        headers,
      });
      
      if (!res.ok) {
        console.warn("[ReviewEditor] Failed to fetch reviews, using empty list");
        setReviews([]);
        return;
      }
      
      const data = await res.json();
      setReviews(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("[ReviewEditor] Failed to fetch reviews", error);
      setReviews([]);
    }
  };

  useEffect(() => { fetchReviews(); }, [currentUser]);

  // 2. เพิ่มรีวิว
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Prepare headers with authentication
      const headers = { "Content-Type": "application/json" };
      if (currentUser?.id) headers["x-user-id"] = currentUser.id;
      if (currentUser?.username) headers["x-username"] = currentUser.username;

      // Prepare body with username (backend requires it)
      const body = {
        ...formData,
        username: currentUser?.username || "",
      };

      // Use Next.js API route which proxies to backend
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers,
        body: JSON.stringify(body),
      });
      
      if (res.ok) {
        alert("✅ Review Added!");
        setFormData({ name: "", rating: 5, comment: "" });
        fetchReviews();
      } else {
        const errorData = await res.json().catch(() => ({}));
        alert(`❌ ${errorData.error || "Failed to add review"}`);
      }
    } catch (error) {
      console.error("[ReviewEditor] Failed to add review", error);
      alert("❌ ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้ กรุณาตรวจสอบว่า Backend กำลังทำงานอยู่");
    }
  };

  // 3. ลบรีวิว
  const handleDelete = async (id) => {
    if(!confirm("Delete this review?")) return;
    
    try {
      // Prepare headers with authentication
      const headers = {};
      if (currentUser?.id) headers["x-user-id"] = currentUser.id;
      if (currentUser?.username) headers["x-username"] = currentUser.username;

      const res = await fetch(`/api/reviews/${id}`, {
        method: "DELETE",
        headers,
      });

      if (res.ok) {
        fetchReviews();
      } else {
        const errorData = await res.json().catch(() => ({}));
        alert(`❌ ${errorData.message || "Failed to delete review"}`);
      }
    } catch (error) {
      console.error("[ReviewEditor] Failed to delete review", error);
      alert("❌ ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้ กรุณาตรวจสอบว่า Backend กำลังทำงานอยู่");
    }
  };

  return (
    <div className="space-y-8">
      {/* Form */}
      <div className="bg-white p-6 rounded-xl shadow-sm border">
        <h3 className="text-xl font-bold text-gray-800 mb-4">Add New Review</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <input 
              placeholder="Client Name" 
              value={formData.name}
              onChange={e => setFormData({...formData, name: e.target.value})}
              className="p-3 border rounded-lg w-full text-black" required 
            />
            <select 
              value={formData.rating}
              onChange={e => setFormData({...formData, rating: e.target.value})}
              className="p-3 border rounded-lg w-full text-black"
            >
              <option value="5">⭐⭐⭐⭐⭐ (5)</option>
              <option value="4">⭐⭐⭐⭐ (4)</option>
              <option value="3">⭐⭐⭐ (3)</option>
            </select>
          </div>
          <textarea 
            placeholder="Comment..." 
            rows="3"
            value={formData.comment}
            onChange={e => setFormData({...formData, comment: e.target.value})}
            className="p-3 border rounded-lg w-full text-black" required
          ></textarea>
          <button type="submit" className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700">+ Add Review</button>
        </form>
      </div>

      {/* List */}
      <div className="bg-white p-6 rounded-xl shadow-sm border">
        <h3 className="text-xl font-bold text-gray-800 mb-4">All Reviews</h3>
        <div className="space-y-3">
          {reviews.map(review => (
            <div key={review.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg border">
              <div>
                <div className="font-bold text-gray-800">{review.name} <span className="text-yellow-500 text-sm">{"⭐".repeat(review.rating)}</span></div>
                <div className="text-sm text-gray-500 truncate max-w-md">{review.comment}</div>
              </div>
              <button onClick={() => handleDelete(review.id)} className="text-red-500 hover:text-red-700 text-sm px-3 py-1 border border-red-200 rounded">Delete</button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
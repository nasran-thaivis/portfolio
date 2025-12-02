"use client";

import { useEffect, useState } from "react";
import Container from "../components/Container";
import { useAuth } from "../contexts/AuthContext";

// === Component สำหรับแสดงดาว (Stars) ===
function Stars({ value }) {
  // แสดงดาวเต็มตาม rating (1-5) และดาวว่างสำหรับส่วนที่เหลือ
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <svg
          key={i}
          className={`w-4 h-4 ${i < value ? "text-amber-400" : "text-zinc-600"}`}
          viewBox="0 0 24 24"
          fill={i < value ? "currentColor" : "none"}
          stroke="currentColor"
          strokeWidth="2"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
        </svg>
      ))}
    </div>
  );
}

export default function ReviewClient() {
  const { currentUser } = useAuth();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [error, setError] = useState(null);

  // Form state
  const [name, setName] = useState("");
  const [comment, setComment] = useState("");
  const [rating, setRating] = useState(5);

  // ดึงข้อมูลจาก API
  useEffect(() => {
    const fetchReviews = async () => {
      if (!currentUser?.username) {
        setLoading(false);
        return;
      }

      try {
        const res = await fetch(`/api/reviews?username=${currentUser.username}`, {
          cache: "no-store",
        });
        
        if (res.ok) {
          const data = await res.json();
          setReviews(Array.isArray(data) ? data : []);
        } else {
          console.warn(`[ReviewClient] Failed to fetch reviews: ${res.status}`);
          setReviews([]);
        }
      } catch (error) {
        console.error("[ReviewClient] Error fetching reviews:", error);
        setReviews([]);
      } finally {
        setLoading(false);
      }
    };

    fetchReviews();
  }, [currentUser]);

  // === ฟังก์ชันจัดการ: Submit Review ===
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage("");

    // === Validation: ตรวจสอบข้อมูลก่อน submit ===
    if (!name.trim()) {
      setError("Please enter your name");
      return;
    }
    if (!comment.trim()) {
      setError("Please write a short review");
      return;
    }

    if (!currentUser?.username) {
      setError("Please login to submit a review");
      return;
    }

    setIsSubmitting(true);

    try {
      const headers = {
        "Content-Type": "application/json",
      };
      if (currentUser?.id) headers['x-user-id'] = currentUser.id;
      if (currentUser?.username) headers['x-username'] = currentUser.username;

      const body = {
        name: name.trim(),
        rating: Number(rating),
        comment: comment.trim(),
        username: currentUser.username,
      };

      const res = await fetch("/api/reviews", {
        method: "POST",
        headers,
        body: JSON.stringify(body),
      });

      if (res.ok) {
        const newReview = await res.json();
        setReviews((prev) => [newReview, ...prev]);
        setName("");
        setComment("");
        setRating(5);
        setSuccessMessage("Review added — thank you!");
        setTimeout(() => setSuccessMessage(""), 3000);
      } else {
        const errorData = await res.json().catch(() => ({}));
        setError(errorData.error || "Failed to add review");
      }
    } catch (error) {
      console.error("[ReviewClient] Error submitting review:", error);
      setError("Failed to submit review. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <Container title="Reviews">
        <div className="text-center py-20 animate-pulse">
          <p className="text-xl text-gray-300">กำลังโหลดข้อมูล...</p>
        </div>
      </Container>
    );
  }

  if (!currentUser) {
    return (
      <Container title="Reviews">
        <div className="text-center py-20 text-gray-500">
          <p className="text-xl mb-4">กรุณาเข้าสู่ระบบเพื่อดูรีวิว</p>
        </div>
      </Container>
    );
  }

  return (
    <Container title="Reviews">
      <div className="space-y-6">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-gray-300 mb-2">Share Your Experience</h2>
          <p className="text-gray-500">Let us know what you think about our work!</p>
        </div>

      {/* === Form สำหรับเพิ่ม Review === */}
      <form onSubmit={handleSubmit} className="bg-zinc-800/50 border-2 border-zinc-700 rounded-2xl p-6 space-y-4 shadow-xl">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Input: ชื่อผู้รีวิว */}
          <input
            placeholder="Your name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="sm:col-span-2 rounded-xl border-2 border-zinc-600 px-4 py-3 bg-zinc-900 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent transition-all"
          />
          {/* Select: Rating (1-5 ดาว) */}
          <select
            value={rating}
            onChange={(e) => setRating(Number(e.target.value))}
            className="rounded-xl border-2 border-zinc-600 px-4 py-3 bg-zinc-900 text-white focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent transition-all"
          >
            {[5, 4, 3, 2, 1].map((v) => (
              <option key={v} value={v}>
                {v} ★ {v === 5 ? "Excellent" : v === 4 ? "Great" : v === 3 ? "Good" : v === 2 ? "Fair" : "Poor"}
              </option>
            ))}
          </select>
        </div>

        {/* Textarea: ข้อความรีวิว */}
        <textarea
          placeholder="Write a short review..."
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          className="w-full rounded-xl border-2 border-zinc-600 px-4 py-3 bg-zinc-900 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent resize-none transition-all"
          rows={4}
        />

        {/* ปุ่ม Submit */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-secondary)] hover:from-[var(--color-primary)]/90 hover:to-[var(--color-secondary)]/90 text-white font-bold py-3 px-6 rounded-xl shadow-lg hover:shadow-2xl transform hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
        >
          {isSubmitting ? "⏳ Submitting..." : "⭐ Add Review"}
        </button>

        {/* === แสดงสถานะ: Error และ Success Messages === */}
        {error && (
          <div className="text-sm text-red-300 bg-red-500/20 border-2 border-red-500/50 rounded-xl px-4 py-3 flex items-center gap-2">
            <span className="text-xl">❌</span>
            {error}
          </div>
        )}
        {successMessage && (
          <div className="text-sm text-emerald-300 bg-emerald-500/20 border-2 border-emerald-500/50 rounded-xl px-4 py-3 flex items-center gap-2">
            <span className="text-xl">✅</span>
            {successMessage}
          </div>
        )}
      </form>

      {/* === ส่วนแสดง Reviews เป็น Box เล็กๆ ด้านล่าง === */}
      <div className="mt-8 space-y-4">
        <h3 className="text-xl font-bold text-gray-300 mb-4 flex items-center gap-2">
          <span className="text-2xl">💬</span>
          All Reviews ({reviews.length})
        </h3>
        
        {/* แสดงข้อความเมื่อยังไม่มีรีวิว */}
        {reviews.length === 0 && (
          <div className="text-center py-12 px-4 border-2 border-dashed border-zinc-700 rounded-2xl bg-zinc-800/30">
            <div className="text-5xl mb-3">📝</div>
            <p className="text-lg font-semibold text-gray-300 mb-1">No reviews yet</p>
            <p className="text-sm text-gray-500">Be the first to share your experience!</p>
          </div>
        )}

        {/* === Loop แสดง Reviews แต่ละอันเป็น Box === */}
        {reviews.map((r) => {
          const reviewRating = Math.max(0, Math.min(5, Number(r.rating || 0)));
          const reviewerName = r.name || r.reviewerName || "Anonymous";
          const reviewComment = r.comment || r.text || "";
          const reviewDate = r.createdAt || r.timestamp;

          // Format วันที่ก่อน render (แก้ error impure function)
          let formattedDate = "Just now";
          if (reviewDate) {
            try {
              const dateObj = new Date(reviewDate);
              formattedDate = dateObj.toLocaleString("th-TH", {
                year: "numeric",
                month: "short",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              });
            } catch (e) {
              formattedDate = "Just now";
            }
          }

          return (
            <article
              key={r.id || r.timestamp}
              className="p-5 rounded-2xl border-2 border-zinc-700 bg-gradient-to-br from-zinc-800/70 to-zinc-800/50 hover:from-zinc-800 hover:to-zinc-800/70 hover:border-[var(--color-primary)]/50 transition-all duration-300 shadow-lg hover:shadow-2xl transform hover:scale-[1.02]"
            >
              {/* ส่วนบน: ชื่อผู้รีวิว, วันที่, และดาว */}
              <div className="flex items-start justify-between gap-4 mb-4">
                <div className="flex items-center gap-3 flex-1">
                  {/* Avatar Circle: แสดงตัวอักษรแรกของชื่อ */}
                  <div className="h-12 w-12 rounded-full bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-secondary)] flex items-center justify-center font-bold text-white text-lg flex-shrink-0 shadow-lg">
                    {reviewerName.charAt(0).toUpperCase()}
                  </div>

                  {/* ชื่อและวันที่ */}
                  <div className="flex-1 min-w-0">
                    <div className="text-base font-bold text-white truncate">{reviewerName}</div>
                    <div className="text-xs text-gray-400">{formattedDate}</div>
                  </div>
                </div>

                {/* ดาว Rating: แสดงด้านขวาบน */}
                <div className="flex-shrink-0 bg-zinc-900/50 px-3 py-1.5 rounded-lg">
                  <Stars value={reviewRating} />
                </div>
              </div>

              {/* ส่วนล่าง: ข้อความรีวิว */}
              <p className="text-sm text-gray-200 leading-relaxed whitespace-pre-wrap break-words pl-15 border-l-4 border-[var(--color-primary)]/30 pl-4">
                {reviewComment}
              </p>
            </article>
          );
        })}
      </div>
    </Container>
  );
}

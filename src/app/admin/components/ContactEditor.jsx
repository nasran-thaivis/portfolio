"use client";

import { useState, useEffect } from "react";
import { useAuth } from "../../contexts/AuthContext";

const DEFAULT_DATA = {
  phone: "062-209-5297",
  email: null,
};

export default function ContactEditor() {
  const { currentUser } = useAuth();
  const [contactData, setContactData] = useState(DEFAULT_DATA);
  const [successMessage, setSuccessMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Load initial data from API
  useEffect(() => {
    const fetchData = async () => {
      if (!currentUser) {
        setIsLoading(false);
        return;
      }

      try {
        const username = currentUser.username || currentUser.id;
        const url = `/api/contact-section?username=${encodeURIComponent(username)}`;

        const res = await fetch(url, {
          cache: "no-store",
        });
        
        if (!res.ok) {
          console.warn("[ContactEditor] Failed to fetch contact section, using default data");
          setIsLoading(false);
          return;
        }
        
        const data = await res.json();
        if (data) {
          setContactData({
            phone: data.phone || DEFAULT_DATA.phone,
            email: data.email || null,
          });
        }
      } catch (error) {
        console.error("[ContactEditor] Failed to load data", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [currentUser]);

  const handleSave = async () => {
    if (!currentUser) {
      alert("❌ กรุณา Login ก่อนบันทึกข้อมูล");
      return;
    }

    setIsSaving(true);
    setSuccessMessage("");

    try {
      const dataToSave = {
        phone: contactData.phone || null,
        email: contactData.email || null,
      };

      const headers = {
        "Content-Type": "application/json",
      };

      // Add authentication headers
      if (currentUser?.id) {
        headers['x-user-id'] = currentUser.id;
      }
      if (currentUser?.username && currentUser.username !== currentUser.id) {
        headers['x-username'] = currentUser.username;
      }

      const res = await fetch("/api/contact-section", {
        method: "PATCH",
        headers,
        body: JSON.stringify(dataToSave),
      });
      
      if (res.ok) {
        setSuccessMessage("✅ Contact info saved successfully!");
        setTimeout(() => setSuccessMessage(""), 3000);
      } else {
        const errorData = await res.json().catch(() => ({}));
        const errorMessage = errorData.message || errorData.error || `Error updating (${res.status})`;
        console.error("Server Response Error:", errorMessage);
        alert(`❌ ${errorMessage}`);
      }
    } catch (error) {
      console.error("[ContactEditor] Save error:", error);
      alert(`❌ ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้: ${error.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin text-4xl mb-4">⏳</div>
          <p className="text-gray-600">Loading contact information...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <h2 className="text-2xl font-bold text-[var(--color-text)] mb-6 pb-3 border-b-2 border-gray-200 flex items-center gap-2">
        <span>📞</span>
        Edit Contact Information
      </h2>

      {successMessage && (
        <div className="bg-green-50 border-2 border-green-200 rounded-xl px-4 py-3 text-green-700 font-medium">
          {successMessage}
        </div>
      )}

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          📱 Phone Number
        </label>
        <input
          type="tel"
          value={contactData.phone}
          onChange={(e) => setContactData({ ...contactData, phone: e.target.value })}
          className="w-full bg-white text-gray-900 border-2 border-gray-300 focus:border-[var(--color-primary)] focus:ring-4 focus:ring-[var(--color-primary)]/20 rounded-xl px-4 py-3 transition-all"
          placeholder="062-209-5297"
        />
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          📧 Email Address
        </label>
        <input
          type="email"
          value={contactData.email}
          onChange={(e) => setContactData({ ...contactData, email: e.target.value })}
          className="w-full bg-white text-gray-900 border-2 border-gray-300 focus:border-[var(--color-primary)] focus:ring-4 focus:ring-[var(--color-primary)]/20 rounded-xl px-4 py-3 transition-all"
          placeholder="your.email@example.com"
        />
      </div>

      <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4">
        <p className="text-sm text-blue-700">
          <strong>ℹ️ Note:</strong> These contact details will be displayed in the footer and contact page.
        </p>
      </div>

      <button
        onClick={handleSave}
        disabled={isSaving}
        className="mt-6 bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-secondary)] hover:opacity-90 text-white px-8 py-3 rounded-xl font-bold transition-all shadow-lg hover:shadow-2xl transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
      >
        {isSaving ? (
          <>
            <span className="animate-spin">⏳</span> Saving...
          </>
        ) : (
          <>💾 Save Contact Info</>
        )}
      </button>
    </div>
  );
}


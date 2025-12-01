"use client";

import { useState, useEffect } from "react";
import { SOCIAL } from "../data/socialLinks";

// === คีย์สำหรับอ่านข้อมูล Contact จาก localStorage ===
const STORAGE_KEY = "admin_contact_content";

export default function Footer() {
  const [copied, setCopied] = useState("");

  // State: เก็บข้อมูล Contact (อ่านจาก Admin Dashboard)
  const [contactData, setContactData] = useState({
    phone: "062-209-5297",
    email: "Nasran@thaivis.com",
  });

  // === Effect: โหลดข้อมูล Contact จาก localStorage ===
  useEffect(() => {
    try {
      // Check if we're in browser environment
      if (typeof window !== 'undefined') {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
          setContactData(JSON.parse(stored));
        }
      }
    } catch (error) {
      console.warn("Footer: failed to load contact data", error);
    }
  }, []);

  const { phone, email } = contactData;

  // Copy helper
  const handleCopy = async (val, label) => {
    try {
      await navigator.clipboard.writeText(val);
      setCopied(label);
      setTimeout(() => setCopied(""), 2000);
    } catch (e) {
      console.error("Copy failed", e);
    }
  };

  return (
    <footer className="w-full bg-gradient-to-br from-zinc-900 via-zinc-800 to-zinc-900 border-t-2 border-[var(--color-primary)]/30 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Section 1: Get in Touch */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-[var(--color-primary)] mb-4 flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
              </svg>
              Get in Touch
            </h3>
            
            {/* Phone */}
            <div className="flex items-center gap-3 group">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-[var(--color-primary)]" viewBox="0 0 20 20" fill="currentColor">
                <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
              </svg>
              <a href={`tel:${phone.replace(/[^0-9+]/g, "")}`} className="text-gray-300 hover:text-[var(--color-primary)] transition-colors">
                {phone}
              </a>
              <button
                onClick={() => handleCopy(phone, "phone")}
                className="ml-auto text-xs px-3 py-1.5 bg-[var(--color-primary)]/20 hover:bg-[var(--color-primary)]/30 text-[var(--color-primary)] rounded-lg transition-all transform hover:scale-105 font-medium"
              >
                {copied === "phone" ? "✓ Copied" : "Copy"}
              </button>
            </div>

            {/* Email */}
            <div className="flex items-center gap-3 group">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-[var(--color-secondary)]" viewBox="0 0 20 20" fill="currentColor">
                <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
              </svg>
              <a href={`mailto:${email}`} className="text-gray-300 hover:text-[var(--color-secondary)] transition-colors truncate">
                {email}
              </a>
              <button
                onClick={() => handleCopy(email, "email")}
                className="ml-auto text-xs px-3 py-1.5 bg-[var(--color-secondary)]/20 hover:bg-[var(--color-secondary)]/30 text-[var(--color-secondary)] rounded-lg transition-all transform hover:scale-105 font-medium"
              >
                {copied === "email" ? "✓ Copied" : "Copy"}
              </button>
            </div>
          </div>

          {/* Section 2: Social Media */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-[var(--color-primary)] mb-4 flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path d="M15 8a3 3 0 10-2.977-2.63l-4.94 2.47a3 3 0 100 4.319l4.94 2.47a3 3 0 10.895-1.789l-4.94-2.47a3.027 3.027 0 000-.74l4.94-2.47C13.456 7.68 14.19 8 15 8z" />
              </svg>
              Follow Us
            </h3>
            <div className="flex flex-wrap gap-3">
              {SOCIAL.facebook && (
                <a
                  href={SOCIAL.facebook}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 border border-blue-500/30 hover:border-blue-500/50 transition-all transform hover:scale-105 shadow-lg hover:shadow-blue-500/20"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M22 12.07C22 6.48 17.52 2 11.93 2S2 6.48 2 12.07C2 17.1 5.66 21.24 10.44 22v-7.03H7.9V12.07h2.54V9.79c0-2.5 1.49-3.88 3.77-3.88 1.09 0 2.23.2 2.23.2v2.45h-1.25c-1.23 0-1.6.76-1.6 1.54v1.86h2.72l-.44 2.9h-2.28V22C18.34 21.24 22 17.1 22 12.07z"/>
                  </svg>
                  <span className="font-medium">Facebook</span>
                </a>
              )}

              {SOCIAL.instagram && (
                <a
                  href={SOCIAL.instagram}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-pink-500/10 hover:bg-pink-500/20 text-pink-400 border border-pink-500/30 hover:border-pink-500/50 transition-all transform hover:scale-105 shadow-lg hover:shadow-pink-500/20"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M7 2h10a5 5 0 0 1 5 5v10a5 5 0 0 1-5 5H7a5 5 0 0 1-5-5V7a5 5 0 0 1 5-5zm5 5.5A4.5 4.5 0 1 0 16.5 12 4.505 4.505 0 0 0 12 7.5zm6.6-1.9a1.1 1.1 0 1 0 1.1 1.1 1.1 1.1 0 0 0-1.1-1.1z"/>
                  </svg>
                  <span className="font-medium">Instagram</span>
                </a>
              )}

              {SOCIAL.tiktok && (
                <a
                  href={SOCIAL.tiktok}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gray-500/10 hover:bg-gray-500/20 text-gray-300 border border-gray-500/30 hover:border-gray-500/50 transition-all transform hover:scale-105 shadow-lg hover:shadow-gray-500/20"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M16 3h3v2h-1.5C17.12 5 16 6.12 16 7.5V13a4 4 0 1 1-4-4V5a2 2 0 0 0 2 2h1V3z"/>
                  </svg>
                  <span className="font-medium">TikTok</span>
                </a>
              )}
            </div>
          </div>

          {/* Section 3: About */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-[var(--color-primary)] mb-4 flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
              About
            </h3>
            <p className="text-gray-400 text-sm leading-relaxed">
              Modern portfolio website built with Next.js and Tailwind CSS. 
              Showcasing projects, reviews, and contact information.
            </p>
            <div className="pt-4 border-t border-gray-700">
              <p className="text-gray-500 text-xs">
                © {new Date().getFullYear()} All rights reserved.
              </p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}


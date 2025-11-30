"use client";

import { useState } from "react";
import HomeEditor from "./components/HomeEditor";
import AboutEditor from "./components/AboutEditor";
import ContactEditor from "./components/ContactEditor";
import PortfolioEditor from "./components/PortfolioEditor";
import ReviewEditor from "./components/ReviewEditor";
import ThemeEditor from "./components/ThemeEditor";
import ContactSubmissionsViewer from "./components/ContactSubmissionsViewer";

// === Component หลักของ Admin Dashboard ===
export default function AdminClient() {
  // State: หน้าที่กำลังแก้ไข
  const [activeTab, setActiveTab] = useState("home");

  // === Tabs Navigation ===
  const tabs = [
    { id: "home", label: "Home", icon: "🏠" },
    { id: "about", label: "About", icon: "👤" },
    { id: "portfolio", label: "Portfolio", icon: "💼" },
    { id: "review", label: "Review", icon: "⭐" },
    { id: "contact", label: "Contact", icon: "📧" },
    { id: "messages", label: "Messages", icon: "📬" },
    { id: "theme", label: "Theme", icon: "🎨" },
  ];

  return (
    <div className="min-h-screen px-4 sm:px-6 py-8">
      <div className="w-full max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8 bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-secondary)] rounded-2xl p-8 shadow-xl">
          <h1 className="text-3xl sm:text-4xl font-bold text-white">Admin Dashboard</h1>
          <p className="text-white/90 mt-2">Manage your website content and customize your theme</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-3 mb-8 overflow-x-auto pb-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-5 py-3 rounded-xl text-sm font-semibold transition-all whitespace-nowrap shadow-md hover:shadow-lg transform hover:-translate-y-0.5 ${
                activeTab === tab.id
                  ? "bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-secondary)] text-white"
                  : "bg-white text-gray-700 hover:bg-gray-50 border border-gray-200"
              }`}
            >
              <span className="text-lg mr-2">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content Area */}
        <div className="bg-white border-2 border-gray-200 rounded-2xl p-6 sm:p-8 shadow-xl">
          {/* === Home Tab === */}
          {activeTab === "home" && <HomeEditor />}

          {/* === About Tab === */}
          {activeTab === "about" && <AboutEditor />}

          {/* === Portfolio Tab === */}
          {activeTab === "portfolio" && <PortfolioEditor />}

          {/* === Review Tab === */}
          {activeTab === "review" && <ReviewEditor />}

          {/* === Contact Tab === */}
          {activeTab === "contact" && <ContactEditor />}

          {/* === Messages Tab === */}
          {activeTab === "messages" && <ContactSubmissionsViewer />}

          {/* === Theme Tab === */}
          {activeTab === "theme" && <ThemeEditor />}
        </div>
      </div>
    </div>
  );
}


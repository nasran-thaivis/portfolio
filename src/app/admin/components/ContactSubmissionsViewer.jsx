"use client";

import { useState, useEffect } from "react";
import { useAuth } from "../../contexts/AuthContext";

export default function ContactSubmissionsViewer() {
  const { currentUser } = useAuth();
  const [contacts, setContacts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedIds, setExpandedIds] = useState(new Set());

  useEffect(() => {
    fetchContacts();
  }, [currentUser]);

  const fetchContacts = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // สร้าง URL พร้อม username query parameter
      const username = currentUser?.username;
      const apiUrl = username 
        ? `/api/contact?username=${encodeURIComponent(username)}`
        : "/api/contact";
      
      const res = await fetch(apiUrl);
      
      if (!res.ok) {
        throw new Error("Failed to fetch contact submissions");
      }
      
      const data = await res.json();
      if (data.success && Array.isArray(data.requests)) {
        // Sort by date (newest first)
        const sorted = data.requests.sort((a, b) => {
          return new Date(b.createdAt) - new Date(a.createdAt);
        });
        setContacts(sorted);
      } else {
        setContacts([]);
      }
    } catch (err) {
      console.error("Error fetching contacts:", err);
      setError(err.message || "Failed to load contact submissions");
    } finally {
      setIsLoading(false);
    }
  };

  const toggleExpand = (id) => {
    setExpandedIds((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleString("th-TH", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return dateString;
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      new: { label: "New", color: "bg-blue-100 text-blue-800 border-blue-300" },
      read: { label: "Read", color: "bg-yellow-100 text-yellow-800 border-yellow-300" },
      replied: { label: "Replied", color: "bg-green-100 text-green-800 border-green-300" },
    };
    
    const config = statusConfig[status] || statusConfig.new;
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${config.color}`}>
        {config.label}
      </span>
    );
  };

  const truncateMessage = (message, maxLength = 100) => {
    if (message.length <= maxLength) return message;
    return message.substring(0, maxLength) + "...";
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin text-4xl mb-4">⏳</div>
          <p className="text-gray-600">Loading contact submissions...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border-2 border-red-200 rounded-xl p-6">
        <div className="flex items-center gap-2 text-red-700">
          <span className="text-2xl">❌</span>
          <div>
            <p className="font-semibold">Error loading contacts</p>
            <p className="text-sm">{error}</p>
          </div>
        </div>
        <button
          onClick={fetchContacts}
          className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (contacts.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-4">📭</div>
        <h3 className="text-xl font-semibold text-gray-700 mb-2">No Contact Submissions</h3>
        <p className="text-gray-500">No contact messages have been submitted yet.</p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-[var(--color-text)] pb-3 border-b-2 border-gray-200 flex items-center gap-2">
          <span>📬</span>
          Contact Submissions ({contacts.length})
        </h2>
        <button
          onClick={fetchContacts}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center gap-2"
        >
          <span>🔄</span>
          Refresh
        </button>
      </div>

      <div className="space-y-4">
        {contacts.map((contact) => {
          const isExpanded = expandedIds.has(contact.id);
          const messagePreview = truncateMessage(contact.message, 100);
          const showFullMessage = isExpanded || contact.message.length <= 100;

          return (
            <div
              key={contact.id}
              className="bg-white border-2 border-gray-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                        <span>👤</span>
                        {contact.name}
                      </h3>
                      <a
                        href={`mailto:${contact.email}`}
                        className="text-blue-600 hover:text-blue-800 hover:underline text-sm mt-1 flex items-center gap-1"
                      >
                        <span>📧</span>
                        {contact.email}
                      </a>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      {getStatusBadge(contact.status)}
                      <span className="text-xs text-gray-500">
                        {formatDate(contact.createdAt)}
                      </span>
                    </div>
                  </div>

                  <div className="mt-3">
                    <p className="text-gray-700 whitespace-pre-wrap">
                      {showFullMessage ? contact.message : messagePreview}
                    </p>
                    {contact.message.length > 100 && (
                      <button
                        onClick={() => toggleExpand(contact.id)}
                        className="mt-2 text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center gap-1"
                      >
                        {isExpanded ? (
                          <>
                            <span>▲</span>
                            Show Less
                          </>
                        ) : (
                          <>
                            <span>▼</span>
                            Show More
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}


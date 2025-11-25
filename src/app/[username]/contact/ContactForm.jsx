"use client";

import { useState } from "react";
import { getApiUrl } from "../../../lib/api";

export default function ContactForm({ username }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState(null);

  async function handleSubmit(e) {
    e.preventDefault();
    setStatus("loading");

    try {
      // ส่ง userId ใน query parameter
      const res = await fetch(getApiUrl(`/api/contact?userId=${username}`), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, message }),
      });

      const data = await res.json().catch(() => ({}));

      if (res.ok) {
        setStatus("success");
        setName("");
        setEmail("");
        setMessage("");
      } else {
        setStatus({ error: data.message || "Failed to send message." });
      }
    } catch (err) {
      console.error("Connection Error:", err);
      setStatus({ error: "Cannot connect to server. Is Backend running?" });
    }
  }

  return (
    <form className="max-w-2xl mx-auto" onSubmit={handleSubmit}>
      <div className="grid grid-cols-1 gap-5">
        <label className="block">
          <span className="text-sm font-semibold text-gray-300 mb-2 block flex items-center gap-2">
            <span>👤</span> Your Name
          </span>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            placeholder="John Doe"
            className="mt-1 w-full rounded-xl bg-zinc-900 border-2 border-zinc-700 px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent transition-all"
          />
        </label>

        <label className="block">
          <span className="text-sm font-semibold text-gray-300 mb-2 block flex items-center gap-2">
            <span>📧</span> Your Email
          </span>
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            type="email"
            required
            placeholder="john@example.com"
            className="mt-1 w-full rounded-xl bg-zinc-900 border-2 border-zinc-700 px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent transition-all"
          />
        </label>

        <label className="block">
          <span className="text-sm font-semibold text-gray-300 mb-2 block flex items-center gap-2">
            <span>💬</span> Message
          </span>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={6}
            required
            placeholder="Write your message here..."
            className="mt-1 w-full rounded-xl bg-zinc-900 border-2 border-zinc-700 px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent resize-none transition-all"
          />
        </label>

        <button
          type="submit"
          disabled={status === "loading"}
          className="w-full bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-secondary)] hover:from-[var(--color-primary)]/90 hover:to-[var(--color-secondary)]/90 text-white font-bold py-4 px-6 rounded-xl shadow-lg hover:shadow-2xl transform hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
        >
          {status === "loading" ? "📤 Sending..." : "📨 Send Message"}
        </button>

        {status === "success" && (
          <div className="text-sm text-emerald-300 bg-emerald-500/20 border-2 border-emerald-500/50 rounded-xl px-4 py-3 flex items-center gap-2 animate-fade-in">
            <span className="text-xl">✅</span>
            <span>Message sent successfully — thank you!</span>
          </div>
        )}

        {status && status.error && (
          <div className="text-sm text-red-300 bg-red-500/20 border-2 border-red-500/50 rounded-xl px-4 py-3 flex items-center gap-2 animate-fade-in">
            <span className="text-xl">❌</span>
            <span>{status.error}</span>
          </div>
        )}
      </div>
    </form>
  );
}


"use client";

import { useState } from "react";
import { SOCIAL } from "../../data/socialLinks";

export default function Container({ title, children }) {
  // Local copy state for temporary "Copied" feedback
  const [copied, setCopied] = useState("");

  // Primary contact values used in the Container contact box
  const phone = "062-209-5297";
  const email = "Nasran@thaivis.com";

  // Copy helper: write to clipboard and show short feedback
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
    <section className="min-h-[60vh] p-6">
      <div className="max-w-5xl mx-auto bg-white dark:bg-[#070707] rounded-lg shadow p-6 flex flex-col">
        {title && (
          <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">{title}</h1>
        )}

        {/* Main content area for the page */}
        <div className="mt-4 text-zinc-700 dark:text-zinc-300 flex-1">{children}</div>

        {/* Contact box: in-flow, appears at bottom of this container. This
            is intentionally non-fixed so it sits inside the page layout. */}
        <div className="mt-8 pt-6 border-t">
          <div className="space-y-3 text-sm text-zinc-700 dark:text-zinc-300">
            <div className="flex items-center gap-3">
              <span className="w-20 text-zinc-500">Phone</span>
              <a href={"tel:" + phone.replace(/[^0-9+]/g, "")} className="font-medium text-emerald-600 dark:text-emerald-400">{phone}</a>
              <button onClick={() => handleCopy(phone, "phone")} className="ml-3 text-[11px] px-2 py-0.5 bg-zinc-100 hover:bg-zinc-200 rounded">{copied === "phone" ? "Copied" : "Copy"}</button>
            </div>

            <div className="flex items-center gap-3">
              <span className="w-20 text-zinc-500">Email</span>
              <a href={"mailto:" + email} className="font-medium text-sky-600 dark:text-sky-400">{email}</a>
              <button onClick={() => handleCopy(email, "email")} className="ml-3 text-[11px] px-2 py-0.5 bg-zinc-100 hover:bg-zinc-200 rounded">{copied === "email" ? "Copied" : "Copy"}</button>
            </div>

            <div className="flex items-start gap-3">
              <span className="w-20 text-zinc-500">Follow</span>
              <div className="flex items-center gap-2">
                {SOCIAL.facebook && (
                  <a href={SOCIAL.facebook} target="_blank" rel="noreferrer" className="flex items-center gap-2 px-2 py-1 rounded bg-blue-50 hover:bg-blue-100 text-blue-700 text-sm">
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M22 12.07C22 6.48 17.52 2 11.93 2S2 6.48 2 12.07C2 17.1 5.66 21.24 10.44 22v-7.03H7.9V12.07h2.54V9.79c0-2.5 1.49-3.88 3.77-3.88 1.09 0 2.23.2 2.23.2v2.45h-1.25c-1.23 0-1.6.76-1.6 1.54v1.86h2.72l-.44 2.9h-2.28V22C18.34 21.24 22 17.1 22 12.07z"/></svg>
                  </a>
                )}

                {SOCIAL.instagram && (
                  <a href={SOCIAL.instagram} target="_blank" rel="noreferrer" className="flex items-center gap-2 px-2 py-1 rounded bg-pink-50 hover:bg-pink-100 text-pink-600 text-sm">
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M7 2h10a5 5 0 0 1 5 5v10a5 5 0 0 1-5 5H7a5 5 0 0 1-5-5V7a5 5 0 0 1 5-5zm8 3h-6a1 1 0 0 0-1 1v2h8V6a1 1 0 0 0-1-1zm-3 5a3 3 0 1 0 .001 6.001A3 3 0 0 0 12 10z"/></svg>
                  </a>
                )}

                {SOCIAL.tiktok && (
                  <a href={SOCIAL.tiktok} target="_blank" rel="noreferrer" className="flex items-center gap-2 px-2 py-1 rounded bg-black text-white hover:opacity-90 text-sm">
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M16 3h2.5v1.9A5 5 0 0 0 21 5v3.5a3.5 3.5 0 1 1-3.5-3.5V3zM9 8.5A5.5 5.5 0 1 0 14.5 14v-2.2A3.2 3.2 0 1 1 11 8.5V17a5 5 0 1 1-5-5v-3.5A5 5 0 0 0 9 17v-8.5z"/></svg>
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

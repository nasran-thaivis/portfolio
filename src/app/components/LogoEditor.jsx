"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";

const STORAGE_KEY = "site_logo_base64_v1";

// LogoEditor is a small client-side utility to let the user replace the
// sidebar logo image. The image is stored in localStorage as a base64
// data URL so edits persist in the browser. This is intentionally a
// client-only tool (no server upload) and is useful for quick branding.
export default function LogoEditor({ size = 36 }) {
  const [logo, setLogo] = useState(null);
  const inputRef = useRef(null);

  useEffect(() => {
    try {
      const cached = localStorage.getItem(STORAGE_KEY);
      if (cached) setLogo(cached);
    } catch (e) {
      // ignore
    }
  }, []);

  // Read the selected file and store it as a base64 data URL in localStorage
  const handleFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const base = reader.result;
      try {
        localStorage.setItem(STORAGE_KEY, base);
      } catch (e) {
        console.error("unable to save logo", e);
      }
      setLogo(base);
    };
    reader.readAsDataURL(file);
  };

  // Remove logo from localStorage and reset state
  const clearLogo = () => {
    localStorage.removeItem(STORAGE_KEY);
    setLogo(null);
  };

  return (
    <div className="flex items-center gap-3">
      <div className="flex flex-col items-center">
        <div className="relative" style={{ width: size, height: size }}>
          {logo ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={logo} alt="logo" className="w-full h-full object-cover rounded" />
          ) : (
            <div className="w-full h-full bg-zinc-200 dark:bg-zinc-800 rounded flex items-center justify-center text-zinc-700 dark:text-zinc-300 font-medium">NS</div>
          )}
        </div>

        <div className="mt-2 flex items-center gap-2">
          <button onClick={() => inputRef.current?.click()} className="text-[10px] px-1 py-0.5 bg-zinc-100 rounded hover:bg-zinc-200">Edit</button>
          {logo && (
            <button onClick={clearLogo} className="text-[10px] px-1 py-0.5 bg-rose-100 text-rose-700 rounded hover:bg-rose-200">Remove</button>
          )}
        </div>
      </div>

      <input ref={inputRef} type="file" accept="image/*" onChange={handleFile} className="hidden" />
    </div>
  );
}

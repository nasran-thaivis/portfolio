"use client";

import { useState } from "react";
import { getApiUrl } from "../../../lib/api";

export default function ContactForm({ username }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState(null);
  const [errors, setErrors] = useState({
    name: "",
    email: "",
    message: "",
  });
  const [touched, setTouched] = useState({
    name: false,
    email: false,
    message: false,
  });

  // Validation functions
  const validateName = (value) => {
    if (!value || value.trim().length === 0) {
      return "กรุณากรอกชื่อ";
    }
    
    const trimmedValue = value.trim();
    
    if (trimmedValue.length < 2) {
      return "ชื่อต้องมีอย่างน้อย 2 ตัวอักษร";
    }
    if (trimmedValue.length > 100) {
      return "ชื่อต้องไม่เกิน 100 ตัวอักษร";
    }
    
    // Check if name is only numbers
    if (/^\d+$/.test(trimmedValue)) {
      return "ชื่อไม่สามารถเป็นตัวเลขเท่านั้น";
    }
    
    // Check for repeated characters (more than 5 consecutive same characters)
    if (/(.)\1{3,}/.test(trimmedValue)) {
      return "ชื่อมีตัวอักษรซ้ำกันมากเกินไป";
    }
    
    // Check for too many special characters (more than 30% of length)
    const specialCharCount = (trimmedValue.match(/[^a-zA-Z0-9\s]/g) || []).length;
    if (specialCharCount > trimmedValue.length * 0.3) {
      return "ชื่อมีอักขระพิเศษมากเกินไป";
    }
    
    // Check for spam-like names (case insensitive)
    const spamPatterns = /^(test|admin|user|spam|fake|dummy|temp|guest|anonymous|null|undefined)$/i;
    if (spamPatterns.test(trimmedValue)) {
      return "กรุณากรอกชื่อที่ถูกต้อง";
    }
    
    // Check for names that look like spam (test123, admin123, etc.)
    const spamLikePattern = /^(test|admin|user|spam|fake|dummy)\d+$/i;
    if (spamLikePattern.test(trimmedValue)) {
      return "กรุณากรอกชื่อที่ถูกต้อง";
    }
    
    return "";
  };

  const validateEmail = (value) => {
    if (!value || value.trim().length === 0) {
      return "กรุณากรอกอีเมล";
    }
    
    const trimmedValue = value.trim();
    
    // Check for incomplete emails
    if (trimmedValue === "@" || trimmedValue.startsWith("@") || trimmedValue.endsWith("@")) {
      return "กรุณากรอกอีเมลให้ครบถ้วน";
    }
    
    // Check if email doesn't contain @
    if (!trimmedValue.includes("@")) {
      return "อีเมลต้องมีสัญลักษณ์ @";
    }
    
    // Split email into local and domain parts
    const parts = trimmedValue.split("@");
    if (parts.length !== 2) {
      return "กรุณากรอกอีเมลที่ถูกต้อง";
    }
    
    const [localPart, domainPart] = parts;
    
    // Validate local part
    if (!localPart || localPart.length === 0) {
      return "อีเมลต้องมีชื่อผู้ใช้ก่อน @";
    }
    if (localPart.length > 64) {
      return "ชื่อผู้ใช้อีเมลยาวเกินไป (สูงสุด 64 ตัวอักษร)";
    }
    
    // Validate domain part
    if (!domainPart || domainPart.length === 0) {
      return "อีเมลต้องมีโดเมนหลัง @";
    }
    
    // Check if domain has a dot (for TLD)
    if (!domainPart.includes(".")) {
      return "โดเมนอีเมลต้องมีโดเมนระดับบนสุด (เช่น .com, .org)";
    }
    
    // Split domain into domain name and TLD
    const domainParts = domainPart.split(".");
    if (domainParts.length < 2) {
      return "โดเมนอีเมลต้องมีโดเมนระดับบนสุด";
    }
    
    const tld = domainParts[domainParts.length - 1];
    if (tld.length < 2) {
      return "โดเมนระดับบนสุดของอีเมลต้องมีอย่างน้อย 2 ตัวอักษร";
    }
    
    // More strict email regex: allows letters, numbers, dots, hyphens, underscores, plus signs
    // Local part: 1-64 chars, can contain letters, numbers, dots, hyphens, underscores, plus signs
    // Domain: must have valid domain name and TLD
    const emailRegex = /^[a-zA-Z0-9._+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(trimmedValue)) {
      return "กรุณากรอกอีเมลที่ถูกต้อง";
    }
    
    // Check for fake-looking emails
    const fakeEmailPatterns = [
      /^test@test\./i,
      /^fake@fake\./i,
      /^dummy@dummy\./i,
      /^spam@spam\./i,
      /^temp@temp\./i,
      /^example@example\./i,
      /^admin@admin\./i,
      /^user@user\./i,
    ];
    
    for (const pattern of fakeEmailPatterns) {
      if (pattern.test(trimmedValue)) {
        return "กรุณากรอกอีเมลจริง";
      }
    }
    
    // Check for common disposable email patterns
    const disposablePatterns = [
      /@(10minutemail|tempmail|guerrillamail|mailinator|throwaway)\./i,
    ];
    
    for (const pattern of disposablePatterns) {
      if (pattern.test(trimmedValue)) {
        return "ไม่อนุญาตให้ใช้อีเมลชั่วคราว";
      }
    }
    
    return "";
  };

  const validateMessage = (value) => {
    if (!value || value.trim().length === 0) {
      return "กรุณากรอกข้อความ";
    }
    if (value.trim().length < 10) {
      return "ข้อความต้องมีอย่างน้อย 10 ตัวอักษร";
    }
    if (value.trim().length > 1000) {
      return "ข้อความต้องไม่เกิน 1000 ตัวอักษร";
    }
    return "";
  };

  const validateForm = () => {
    const newErrors = {
      name: validateName(name),
      email: validateEmail(email),
      message: validateMessage(message),
    };
    setErrors(newErrors);
    return !newErrors.name && !newErrors.email && !newErrors.message;
  };

  const handleNameChange = (e) => {
    const value = e.target.value;
    setName(value);
    if (touched.name) {
      setErrors((prev) => ({ ...prev, name: validateName(value) }));
    }
  };

  const handleEmailChange = (e) => {
    const value = e.target.value;
    setEmail(value);
    if (touched.email) {
      setErrors((prev) => ({ ...prev, email: validateEmail(value) }));
    }
  };

  const handleMessageChange = (e) => {
    const value = e.target.value;
    setMessage(value);
    if (touched.message) {
      setErrors((prev) => ({ ...prev, message: validateMessage(value) }));
    }
  };

  const handleBlur = (field) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    if (field === "name") {
      setErrors((prev) => ({ ...prev, name: validateName(name) }));
    } else if (field === "email") {
      setErrors((prev) => ({ ...prev, email: validateEmail(email) }));
    } else if (field === "message") {
      setErrors((prev) => ({ ...prev, message: validateMessage(message) }));
    }
  };

  async function handleSubmit(e) {
    e.preventDefault();
    
    // Mark all fields as touched
    setTouched({ name: true, email: true, message: true });
    
    // Clear previous errors before validation/submission
    setErrors({ name: "", email: "", message: "" });
    
    // Basic frontend validation for real-time feedback (optional, can be skipped)
    // But we'll still do it to prevent unnecessary API calls
    const isValid = validateForm();
    if (!isValid) {
      setStatus({ error: "Please fix the errors above." });
      return;
    }

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
        setErrors({ name: "", email: "", message: "" });
        setTouched({ name: false, email: false, message: false });
      } else {
        // Backend validation errors - show them instead of frontend errors
        if (data.errors && typeof data.errors === 'object') {
          // Backend sent field-specific errors (from ValidationPipe)
          setErrors({
            name: data.errors.name || "",
            email: data.errors.email || "",
            message: data.errors.message || "",
          });
          setTouched({ name: true, email: true, message: true });
          setStatus({ error: data.message || "กรุณาแก้ไขข้อผิดพลาดด้านบน" });
        } else {
          // Other backend errors
          setStatus({ error: data.message || data.error || "ไม่สามารถส่งข้อความได้" });
        }
      }
    } catch (err) {
      console.error("Connection Error:", err);
      setStatus({ error: "ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้ กรุณาตรวจสอบว่า Backend กำลังทำงานอยู่หรือไม่" });
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
            onChange={handleNameChange}
            onBlur={() => handleBlur("name")}
            placeholder="John Doe"
            className={`mt-1 w-full rounded-xl bg-zinc-900 border-2 px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 transition-all ${
              errors.name && touched.name
                ? "border-red-500 focus:ring-red-500 focus:border-red-500"
                : "border-zinc-700 focus:ring-[var(--color-primary)] focus:border-transparent"
            }`}
          />
          {errors.name && touched.name && (
            <p className="mt-1 text-sm text-red-400 flex items-center gap-1">
              <span>⚠️</span>
              {errors.name}
            </p>
          )}
        </label>

        <label className="block">
          <span className="text-sm font-semibold text-gray-300 mb-2 block flex items-center gap-2">
            <span>📧</span> Your Email
          </span>
          <input
            value={email}
            onChange={handleEmailChange}
            onBlur={() => handleBlur("email")}
            type="email"
            placeholder="john@example.com"
            className={`mt-1 w-full rounded-xl bg-zinc-900 border-2 px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 transition-all ${
              errors.email && touched.email
                ? "border-red-500 focus:ring-red-500 focus:border-red-500"
                : "border-zinc-700 focus:ring-[var(--color-primary)] focus:border-transparent"
            }`}
          />
          {errors.email && touched.email && (
            <p className="mt-1 text-sm text-red-400 flex items-center gap-1">
              <span>⚠️</span>
              {errors.email}
            </p>
          )}
        </label>

        <label className="block">
          <span className="text-sm font-semibold text-gray-300 mb-2 block flex items-center gap-2">
            <span>💬</span> Message
          </span>
          <textarea
            value={message}
            onChange={handleMessageChange}
            onBlur={() => handleBlur("message")}
            rows={6}
            placeholder="Write your message here..."
            className={`mt-1 w-full rounded-xl bg-zinc-900 border-2 px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 resize-none transition-all ${
              errors.message && touched.message
                ? "border-red-500 focus:ring-red-500 focus:border-red-500"
                : "border-zinc-700 focus:ring-[var(--color-primary)] focus:border-transparent"
            }`}
          />
          {errors.message && touched.message && (
            <p className="mt-1 text-sm text-red-400 flex items-center gap-1">
              <span>⚠️</span>
              {errors.message}
            </p>
          )}
          {message && !errors.message && (
            <p className="mt-1 text-xs text-gray-400 text-right">
              {message.trim().length}/1000 characters
            </p>
          )}
        </label>

        <button
          type="submit"
          disabled={status === "loading" || (errors.name && touched.name) || (errors.email && touched.email) || (errors.message && touched.message)}
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


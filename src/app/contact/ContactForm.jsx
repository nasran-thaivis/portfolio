"use client";

import { useState } from "react";
import { getApiUrl } from "../../lib/api";

export default function ContactForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState(null); // null, "loading", "success", { error: "..." }
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
      return "Name is required";
    }
    
    const trimmedValue = value.trim();
    
    if (trimmedValue.length < 2) {
      return "Name must be at least 2 characters";
    }
    if (trimmedValue.length > 100) {
      return "Name must be less than 100 characters";
    }
    
    // Check if name is only numbers
    if (/^\d+$/.test(trimmedValue)) {
      return "Name cannot be only numbers";
    }
    
    // Check for repeated characters (more than 5 consecutive same characters)
    if (/(.)\1{5,}/.test(trimmedValue)) {
      return "Name contains too many repeated characters";
    }
    
    // Check for too many special characters (more than 30% of length)
    const specialCharCount = (trimmedValue.match(/[^a-zA-Z0-9\s]/g) || []).length;
    if (specialCharCount > trimmedValue.length * 0.3) {
      return "Name contains too many special characters";
    }
    
    // Check for spam-like names (case insensitive)
    const spamPatterns = /^(test|admin|user|spam|fake|dummy|temp|guest|anonymous|null|undefined)$/i;
    if (spamPatterns.test(trimmedValue)) {
      return "Please enter a valid name";
    }
    
    // Check for names that look like spam (test123, admin123, etc.)
    const spamLikePattern = /^(test|admin|user|spam|fake|dummy)\d+$/i;
    if (spamLikePattern.test(trimmedValue)) {
      return "Please enter a valid name";
    }
    
    return "";
  };

  const validateEmail = (value) => {
    if (!value || value.trim().length === 0) {
      return "Email is required";
    }
    
    const trimmedValue = value.trim();
    
    // Check for incomplete emails
    if (trimmedValue === "@" || trimmedValue.startsWith("@") || trimmedValue.endsWith("@")) {
      return "Please enter a complete email address";
    }
    
    // Check if email doesn't contain @
    if (!trimmedValue.includes("@")) {
      return "Email must contain @ symbol";
    }
    
    // Split email into local and domain parts
    const parts = trimmedValue.split("@");
    if (parts.length !== 2) {
      return "Please enter a valid email address";
    }
    
    const [localPart, domainPart] = parts;
    
    // Validate local part
    if (!localPart || localPart.length === 0) {
      return "Email must have a username before @";
    }
    if (localPart.length > 64) {
      return "Email username is too long (max 64 characters)";
    }
    
    // Validate domain part
    if (!domainPart || domainPart.length === 0) {
      return "Email must have a domain after @";
    }
    
    // Check if domain has a dot (for TLD)
    if (!domainPart.includes(".")) {
      return "Email domain must include a top-level domain (e.g., .com, .org)";
    }
    
    // Split domain into domain name and TLD
    const domainParts = domainPart.split(".");
    if (domainParts.length < 2) {
      return "Email domain must include a top-level domain";
    }
    
    const tld = domainParts[domainParts.length - 1];
    if (tld.length < 2) {
      return "Email top-level domain must be at least 2 characters";
    }
    
    // More strict email regex: allows letters, numbers, dots, hyphens, underscores, plus signs
    // Local part: 1-64 chars, can contain letters, numbers, dots, hyphens, underscores, plus signs
    // Domain: must have valid domain name and TLD
    const emailRegex = /^[a-zA-Z0-9._+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(trimmedValue)) {
      return "Please enter a valid email address";
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
        return "Please enter a real email address";
      }
    }
    
    // Check for common disposable email patterns
    const disposablePatterns = [
      /@(10minutemail|tempmail|guerrillamail|mailinator|throwaway)\./i,
    ];
    
    for (const pattern of disposablePatterns) {
      if (pattern.test(trimmedValue)) {
        return "Disposable email addresses are not allowed";
      }
    }
    
    return "";
  };

  const validateMessage = (value) => {
    if (!value || value.trim().length === 0) {
      return "Message is required";
    }
    if (value.trim().length < 10) {
      return "Message must be at least 10 characters";
    }
    if (value.trim().length > 1000) {
      return "Message must be less than 1000 characters";
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
    
    // Validate form
    const isValid = validateForm();
    if (!isValid) {
      setStatus({ error: "Please fix the errors above." });
      return;
    }

    setStatus("loading");

    try {
      // 🚀 ยิงไปที่ Next.js API Route (ซึ่งจะบันทึกลง JSON file และส่งต่อไปที่ NestJS backend)
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), email: email.trim(), message: message.trim() }),
      });

      // พยายามแปลง response เป็น JSON (เผื่อ Backend ส่ง error message กลับมา)
      const data = await res.json().catch(() => ({})); 

      if (res.ok) {
        // ✅ ถ้า Backend ตอบกลับ 200-299 (สำเร็จ)
        setStatus("success");
        setName("");
        setEmail("");
        setMessage("");
        setErrors({ name: "", email: "", message: "" });
        setTouched({ name: false, email: false, message: false });
      } else {
        // ❌ ถ้ามี Error (เช่น 400, 500)
        // ถ้ามี validation errors จาก server ให้แสดงในแต่ละ field
        if (data.errors && typeof data.errors === 'object') {
          setErrors({
            name: data.errors.name || "",
            email: data.errors.email || "",
            message: data.errors.message || "",
          });
          setTouched({ name: true, email: true, message: true });
          setStatus({ error: data.message || "Please fix the errors above." });
        } else {
          setStatus({ error: data.message || data.error || "Failed to send message." });
        }
      }
    } catch (err) {
      // ❌ ถ้าเชื่อมต่อไม่ได้ (เช่น Backend ปิดอยู่)
      console.error("Connection Error:", err);
      setStatus({ error: "Cannot connect to server. Is Backend running?" });
    }
  }

  return (
    <form className="max-w-2xl mx-auto" onSubmit={handleSubmit}>
      <div className="grid grid-cols-1 gap-5">
        {/* Name Input */}
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

        {/* Email Input */}
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

        {/* Message Input */}
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

        {/* Submit Button */}
        <button 
          type="submit" 
          disabled={status === "loading" || (errors.name && touched.name) || (errors.email && touched.email) || (errors.message && touched.message)}
          className="w-full bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-secondary)] hover:from-[var(--color-primary)]/90 hover:to-[var(--color-secondary)]/90 text-white font-bold py-4 px-6 rounded-xl shadow-lg hover:shadow-2xl transform hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
        >
          {status === "loading" ? "📤 Sending..." : "📨 Send Message"}
        </button>

        {/* Status Messages */}
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
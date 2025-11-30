"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "../contexts/AuthContext";

// === Warning Icon Component ===
const WarningIcon = () => (
  <svg className="inline-block w-3 h-3 mr-1" viewBox="0 0 20 20" fill="currentColor">
    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
  </svg>
);

// === หน้า Register สาธารณะ ===
export default function RegisterPage() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    name: "",
    username: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({
    name: "",
    username: "",
    email: "",
    password: "",
  });
  const [touched, setTouched] = useState({
    name: false,
    username: false,
    email: false,
    password: false,
  });
  const router = useRouter();
  const { register } = useAuth();

  // === Validation Functions ===
  const validateName = (value) => {
    if (!value || value.trim().length === 0) {
      return "กรุณากรอกชื่อเต็ม";
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
    if (/(.)\1{5,}/.test(trimmedValue)) {
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

  const validateUsername = (value) => {
    if (!value || value.trim().length === 0) {
      return "กรุณากรอกชื่อผู้ใช้";
    }
    
    const trimmedValue = value.trim();
    
    if (trimmedValue.length < 1) {
      return "กรุณากรอกชื่อผู้ใช้";
    }
    if (trimmedValue.length > 30) {
      return "ชื่อผู้ใช้ต้องไม่เกิน 30 ตัวอักษร";
    }
    
    // Check for valid username format (alphanumeric, underscore, hyphen)
    const usernameRegex = /^[a-zA-Z0-9_-]+$/;
    if (!usernameRegex.test(trimmedValue)) {
      return "ชื่อผู้ใช้สามารถใช้ได้เฉพาะตัวอักษร ตัวเลข ขีดล่าง และขีดกลาง";
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

  const validatePassword = (value) => {
    if (!value || value.trim().length === 0) {
      return "กรุณากรอกรหัสผ่าน";
    }
    
    if (value.length < 6) {
      return "รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร";
    }
    
    return "";
  };

  // === Handle Submit ===
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    // Validate all fields
    const nameError = validateName(formData.name);
    const usernameError = validateUsername(formData.username);
    const emailError = validateEmail(formData.email);
    const passwordError = validatePassword(formData.password);

    const newFieldErrors = {
      name: nameError,
      username: usernameError,
      email: emailError,
      password: passwordError,
    };

    setFieldErrors(newFieldErrors);

    // Mark all fields as touched
    setTouched({
      name: true,
      username: true,
      email: true,
      password: true,
    });

    // Check if email is fake/invalid
    const isEmailFake = emailError !== "";

    // If email is fake/invalid, validate all fields and show errors
    if (isEmailFake) {
      const hasAnyError = nameError || usernameError || emailError || passwordError;
      if (hasAnyError) {
        setError("กรุณากรอกข้อมูลในทุกช่องให้ถูกต้อง");
        setLoading(false);
        return;
      }
    }

    // If any field has error, stop submission
    if (nameError || usernameError || emailError || passwordError) {
      setError("กรุณากรอกข้อมูลในทุกช่องให้ถูกต้อง");
      setLoading(false);
      return;
    }

    try {
      const result = await register(
        formData.email,
        formData.password,
        formData.name,
        formData.username
      );

      if (result.success) {
        // Redirect to admin dashboard
        // ใช้ window.location.href เพื่อ force reload และโหลด auth state ใหม่
        window.location.href = `/${formData.username}/admin`;
      } else {
        // ถ้า backend ส่ง errors object กลับมา ให้ใช้แทน frontend validation errors
        if (result.errors && typeof result.errors === 'object') {
          const backendErrors = {
            name: result.errors.name || "",
            username: result.errors.username || "",
            email: result.errors.email || "",
            password: result.errors.password || "",
          };
          // อัปเดต field errors ด้วย backend errors (ให้ความสำคัญกับ backend)
          setFieldErrors(backendErrors);
          // ถ้ามี error message ทั่วไป ให้แสดงด้วย
          if (result.message) {
            setError(result.message);
          }
        } else {
          // ถ้าไม่มี errors object ให้แสดง error message ทั่วไป
          setError(result.message);
        }
        setLoading(false);
      }
    } catch (error) {
      console.error("Registration error:", error);
      setError("เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง");
      setLoading(false);
    }
  };

  // === Handle Field Changes ===
  const handleNameChange = (e) => {
    const value = e.target.value;
    setFormData({ ...formData, name: value });
    setFieldErrors((prev) => ({ ...prev, name: validateName(value) }));
  };

  const handleNameBlur = () => {
    setTouched((prev) => ({ ...prev, name: true }));
    setFieldErrors((prev) => ({ ...prev, name: validateName(formData.name) }));
  };

  const handleUsernameChange = (e) => {
    const value = e.target.value;
    setFormData({ ...formData, username: value });
    setFieldErrors((prev) => ({ ...prev, username: validateUsername(value) }));
  };

  const handleUsernameBlur = () => {
    setTouched((prev) => ({ ...prev, username: true }));
    setFieldErrors((prev) => ({ ...prev, username: validateUsername(formData.username) }));
  };

  const handleEmailChange = (e) => {
    const value = e.target.value;
    setFormData({ ...formData, email: value });
    setFieldErrors((prev) => ({ ...prev, email: validateEmail(value) }));
  };

  const handleEmailBlur = () => {
    setTouched((prev) => ({ ...prev, email: true }));
    setFieldErrors((prev) => ({ ...prev, email: validateEmail(formData.email) }));
  };

  const handlePasswordChange = (e) => {
    const value = e.target.value;
    setFormData({ ...formData, password: value });
    setFieldErrors((prev) => ({ ...prev, password: validatePassword(value) }));
  };

  const handlePasswordBlur = () => {
    setTouched((prev) => ({ ...prev, password: true }));
    setFieldErrors((prev) => ({ ...prev, password: validatePassword(formData.password) }));
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[var(--color-primary)]/10 to-[var(--color-secondary)]/10 px-4 py-12">
      <div className="w-full max-w-md">
        {/* Card */}
        <div className="bg-white border-2 border-gray-200 rounded-2xl p-8 shadow-2xl">
          {/* Header */}
          <div className="mb-6 text-center">
            <h1 className="text-3xl font-bold text-[var(--color-text)] mb-2 bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-secondary)] bg-clip-text text-transparent">
              Create Account
            </h1>
            <p className="text-gray-600">Sign up to get started</p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-4 bg-red-50 border-2 border-red-200 rounded-xl px-4 py-3 text-red-700 text-sm">
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            {/* Name */}
            <div>
              <label htmlFor="name" className="block text-sm font-semibold text-gray-700 mb-2">
                Full Name
              </label>
              <input
                id="name"
                type="text"
                value={formData.name}
                onChange={handleNameChange}
                onBlur={handleNameBlur}
                className={`w-full bg-white text-gray-900 border-2 rounded-xl px-4 py-3 transition-all ${
                  fieldErrors.name
                    ? "border-red-500 focus:border-red-500 focus:ring-4 focus:ring-red-500/20"
                    : "border-gray-300 focus:border-[var(--color-primary)] focus:ring-4 focus:ring-[var(--color-primary)]/20"
                }`}
                placeholder="John Doe"
              />
              {fieldErrors.name && (
                <p className="mt-1 text-xs text-red-600 flex items-center">
                  <WarningIcon />
                  {fieldErrors.name}
                </p>
              )}
            </div>

            {/* Username */}
            <div>
              <label htmlFor="username" className="block text-sm font-semibold text-gray-700 mb-2">
                Username
              </label>
              <input
                id="username"
                type="text"
                value={formData.username}
                onChange={handleUsernameChange}
                onBlur={handleUsernameBlur}
                className={`w-full bg-white text-gray-900 border-2 rounded-xl px-4 py-3 transition-all ${
                  fieldErrors.username
                    ? "border-red-500 focus:border-red-500 focus:ring-4 focus:ring-red-500/20"
                    : "border-gray-300 focus:border-[var(--color-primary)] focus:ring-4 focus:ring-[var(--color-primary)]/20"
                }`}
                placeholder="johndoe"
              />
              {fieldErrors.username && (
                <p className="mt-1 text-xs text-red-600 flex items-center">
                  <WarningIcon />
                  {fieldErrors.username}
                </p>
              )}
              {!fieldErrors.username && (
                <p className="mt-1 text-xs text-gray-500">
                  Your profile URL will be: /{formData.username || "username"}
                </p>
              )}
            </div>

            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
                Email Address
              </label>
              <input
                id="email"
                type="email"
                value={formData.email}
                onChange={handleEmailChange}
                onBlur={handleEmailBlur}
                className={`w-full bg-white text-gray-900 border-2 rounded-xl px-4 py-3 transition-all ${
                  fieldErrors.email
                    ? "border-red-500 focus:border-red-500 focus:ring-4 focus:ring-red-500/20"
                    : "border-gray-300 focus:border-[var(--color-primary)] focus:ring-4 focus:ring-[var(--color-primary)]/20"
                }`}
                placeholder="you@example.com"
              />
              {fieldErrors.email && (
                <p className="mt-1 text-xs text-red-600 flex items-center">
                  <WarningIcon />
                  {fieldErrors.email}
                </p>
              )}
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-2">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={formData.password}
                onChange={handlePasswordChange}
                onBlur={handlePasswordBlur}
                className={`w-full bg-white text-gray-900 border-2 rounded-xl px-4 py-3 transition-all ${
                  fieldErrors.password
                    ? "border-red-500 focus:border-red-500 focus:ring-4 focus:ring-red-500/20"
                    : "border-gray-300 focus:border-[var(--color-primary)] focus:ring-4 focus:ring-[var(--color-primary)]/20"
                }`}
                placeholder="••••••••"
                minLength={6}
              />
              {fieldErrors.password && (
                <p className="mt-1 text-xs text-red-600 flex items-center">
                  <WarningIcon />
                  {fieldErrors.password}
                </p>
              )}
              {!fieldErrors.password && (
                <p className="mt-1 text-xs text-gray-500">Minimum 6 characters</p>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-secondary)] hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3 px-4 rounded-xl transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-1"
            >
              {loading ? "Creating Account..." : "Create Account"}
            </button>
          </form>

          {/* Login Link */}
          <div className="mt-6 text-center">
            <p className="text-gray-600 text-sm">
              Already have an account?{" "}
              <Link
                href="/login"
                className="text-[var(--color-primary)] hover:underline font-semibold"
              >
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}


"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "../../contexts/AuthContext";

// === Warning Icon Component ===
const WarningIcon = () => (
  <svg className="inline-block w-3 h-3 mr-1" viewBox="0 0 20 20" fill="currentColor">
    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
  </svg>
);

// === หน้า Login ===
export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [touched, setTouched] = useState({
    email: false,
    password: false,
  });
  const router = useRouter();
  const { login, isAuthenticated, currentUser, loading: authLoading } = useAuth();

  // === Effect: ตรวจสอบสถานะการล็อกอินและ redirect ถ้าล็อกอินอยู่แล้ว ===
  useEffect(() => {
    // รอให้ auth state โหลดเสร็จก่อน
    if (authLoading) return;
    
    // ถ้าล็อกอินอยู่แล้ว → redirect ไปหน้า Admin
    if (isAuthenticated && currentUser?.username) {
      window.location.href = `/${currentUser.username}/admin`;
    }
  }, [isAuthenticated, currentUser, authLoading]);

  // === Validation Functions ===
  const validateEmail = (value) => {
    if (!value || value.trim().length === 0) {
      return "กรุณากรอกอีเมล";
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(value.trim())) {
      return "รูปแบบอีเมลไม่ถูกต้อง";
    }
    return "";
  };

  const validatePassword = (value) => {
    if (!value || value.trim().length === 0) {
      return "กรุณากรอกรหัสผ่าน";
    }
    if (value.length < 6) {
      return "รหัสผ่านต้องมีความยาวอย่างน้อย 6 ตัวอักษร";
    }
    return "";
  };

  // === Handle Field Changes ===
  const handleEmailChange = (e) => {
    const value = e.target.value;
    setEmail(value);
    setEmailError(validateEmail(value));
  };

  const handleEmailBlur = () => {
    setTouched((prev) => ({ ...prev, email: true }));
    setEmailError(validateEmail(email));
  };

  const handlePasswordChange = (e) => {
    const value = e.target.value;
    setPassword(value);
    setPasswordError(validatePassword(value));
  };

  const handlePasswordBlur = () => {
    setTouched((prev) => ({ ...prev, password: true }));
    setPasswordError(validatePassword(password));
  };

  // === Handle Submit ===
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    // Validate all fields
    const emailErr = validateEmail(email);
    const passwordErr = validatePassword(password);

    setEmailError(emailErr);
    setPasswordError(passwordErr);

    // Mark all fields as touched
    setTouched({
      email: true,
      password: true,
    });

    // If any field has error, stop submission
    if (emailErr || passwordErr) {
      setLoading(false);
      return;
    }

    try {
      // เรียกฟังก์ชัน Login (ต้องใช้ await เพราะเป็น async function)
      const result = await login(email, password);

      if (result.success) {
        // Redirect ไปหน้า Admin ของ user หลัง login สำเร็จ
        // ใช้ window.location.href เพื่อ force reload และโหลด auth state ใหม่
        const username = result.user?.username;
        if (username) {
          window.location.href = `/${username}/admin`;
        } else {
          window.location.href = "/";
        }
      } else {
        // ถ้า backend ส่ง errors object กลับมา ให้ใช้แทน frontend validation errors
        if (result.errors && typeof result.errors === 'object') {
          const backendEmailError = result.errors.email || "";
          const backendPasswordError = result.errors.password || "";
          // อัปเดต field errors ด้วย backend errors (ให้ความสำคัญกับ backend)
          setEmailError(backendEmailError);
          setPasswordError(backendPasswordError);
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
      console.error("Login error:", error);
      setError("เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง");
      setLoading(false);
    }
  };

  // แสดง Loading ขณะตรวจสอบ Authentication
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[var(--color-primary)]/10 to-[var(--color-secondary)]/10">
        <div className="text-center">
          <div className="inline-block w-16 h-16 border-4 border-[var(--color-primary)] border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-gray-600 font-medium">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[var(--color-primary)]/10 to-[var(--color-secondary)]/10 px-4 py-12">
      <div className="w-full max-w-md">
        {/* Card */}
        <div className="bg-white border-2 border-gray-200 rounded-2xl p-8 shadow-2xl">
          {/* Header */}
          <div className="mb-6 text-center">
            <h1 className="text-3xl font-bold text-[var(--color-text)] mb-2 bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-secondary)] bg-clip-text text-transparent">Welcome Back</h1>
            <p className="text-gray-600">Sign in to your account</p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-4 bg-red-50 border-2 border-red-200 rounded-xl px-4 py-3 text-red-700 text-sm">
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} noValidate className="space-y-4">
            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
                Email Address
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={handleEmailChange}
                onBlur={handleEmailBlur}
                className={`w-full bg-white text-gray-900 border-2 rounded-xl px-4 py-3 transition-all ${
                  emailError
                    ? "border-red-500 focus:border-red-500 focus:ring-4 focus:ring-red-500/20"
                    : "border-gray-300 focus:border-[var(--color-primary)] focus:ring-4 focus:ring-[var(--color-primary)]/20"
                }`}
                placeholder="you@example.com"
              />
              {emailError && (
                <p className="mt-1 text-xs text-red-500 flex items-center">
                  <WarningIcon />
                  {emailError}
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
                value={password}
                onChange={handlePasswordChange}
                onBlur={handlePasswordBlur}
                className={`w-full bg-white text-gray-900 border-2 rounded-xl px-4 py-3 transition-all ${
                  passwordError
                    ? "border-red-500 focus:border-red-500 focus:ring-4 focus:ring-red-500/20"
                    : "border-gray-300 focus:border-[var(--color-primary)] focus:ring-4 focus:ring-[var(--color-primary)]/20"
                }`}
                placeholder="••••••••"
              />
              {passwordError && (
                <p className="mt-1 text-xs text-red-500 flex items-center">
                  <WarningIcon />
                  {passwordError}
                </p>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-secondary)] hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3 px-4 rounded-xl transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-1"
            >
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </form>

          {/* Register Link */}
          <div className="mt-6 text-center">
            <p className="text-gray-600 text-sm">
              Don&apos;t have an account?{" "}
              <Link
                href="/register"
                className="text-[var(--color-primary)] hover:underline font-semibold"
              >
                Sign up
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}


"use client";

import { createContext, useContext, useState, useEffect } from "react";
import { useRouter } from "next/navigation";

// === Storage Keys ===
const STORAGE_KEYS = {
  currentUser: "auth_user",
  registeredUsers: "registered_users",
};

// === สร้าง Context ===
const AuthContext = createContext();

// === Custom Hook สำหรับใช้งาน AuthContext ===
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}

// === AuthProvider Component ===
export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // === Effect: ตรวจสอบ Authentication เมื่อ Component Mount ===
  useEffect(() => {
    try {
      // Check if we're in browser environment
      if (typeof window !== 'undefined') {
        const storedUser = localStorage.getItem(STORAGE_KEYS.currentUser);
        if (storedUser) {
          const user = JSON.parse(storedUser);
          setCurrentUser(user);
          setIsAuthenticated(true);
        }
      }
    } catch (error) {
      console.error("Failed to load auth state:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  // === ฟังก์ชัน: Register (สมัครสมาชิก) ===
  const register = async (email, password, name, username) => {
    try {
      // Validate basic requirements
      if (!username || username.trim().length === 0) {
        return { success: false, message: "Username is required" };
      }

      // Log registration data (ไม่ log password)
      console.log('[AuthContext] Register request:', { email, name, username, passwordLength: password?.length });

      // เรียก API เพื่อสร้าง user ใหม่
      let response;
      try {
        // สร้าง AbortController สำหรับ timeout
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 seconds timeout
        
        const requestBody = { email, password, name, username };
        console.log('[AuthContext] Sending register request to /api/users:', { email, name, username });
        
        // ใช้ Next.js API route แทนการเรียก backend โดยตรง (แก้ปัญหา CORS)
        response = await fetch("/api/users", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(requestBody),
          signal: controller.signal,
        }).finally(() => {
          clearTimeout(timeoutId);
        });
      } catch (fetchError) {
        // จัดการ network errors (เช่น backend ไม่ได้รัน, CORS, timeout)
        // Fallback: ใช้ localStorage เมื่อ backend ไม่สามารถเชื่อมต่อได้
        if (fetchError.name === 'AbortError' || (fetchError.name === 'TypeError' && fetchError.message.includes('fetch'))) {
          // Backend timeout หรือไม่สามารถเชื่อมต่อได้ - ใช้ fallback mechanism
          if (fetchError.name === 'AbortError') {
            console.warn("Backend timeout, using fallback registration");
          } else {
            console.warn("Backend not available, using fallback registration");
          }
          
          // Fallback: ใช้ localStorage
          try {
            const registeredUsers = JSON.parse(localStorage.getItem(STORAGE_KEYS.registeredUsers) || '[]');
            
            // ตรวจสอบว่า email หรือ username ซ้ำหรือไม่
            const existingUser = registeredUsers.find(
              (u) => u.email === email || u.username === username
            );
            
            if (existingUser) {
              return { 
                success: false, 
                message: existingUser.email === email 
                  ? "Email already exists" 
                  : "Username already exists"
              };
            }
            
            // สร้าง user ใหม่ (เก็บ password สำหรับ fallback login)
            const newUser = {
              id: Date.now().toString(),
              email,
              password, // เก็บ password สำหรับ fallback login (⚠️ ใน production ควร hash)
              name,
              username,
              createdAt: new Date().toISOString(),
            };
            
            registeredUsers.push(newUser);
            localStorage.setItem(STORAGE_KEYS.registeredUsers, JSON.stringify(registeredUsers));
            
            // Login อัตโนมัติหลังสมัคร (ไม่ส่ง password กลับไป)
            const userWithoutPassword = {
              id: newUser.id,
              email: newUser.email,
              name: newUser.name,
              username: newUser.username,
              createdAt: newUser.createdAt,
            };
            localStorage.setItem(STORAGE_KEYS.currentUser, JSON.stringify(userWithoutPassword));
            setCurrentUser(userWithoutPassword);
            setIsAuthenticated(true);
            
            console.warn("⚠️ Using fallback registration (localStorage). Backend is not running.");
            return { 
              success: true, 
              message: "Registration successful (offline mode)", 
              user: userWithoutPassword 
            };
          } catch (fallbackError) {
            console.error("Fallback registration failed:", fallbackError);
            return { 
              success: false, 
              message: "Cannot connect to server. Please make sure the backend is running." 
            };
          }
        } else {
          return { success: false, message: `Network error: ${fetchError.message}` };
        }
      }

      // ตรวจสอบ response status ก่อน parse JSON
      if (!response.ok) {
        let errorMessage = "Registration failed";
        let errors = {};
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorMessage;
          // ถ้ามี errors object จาก backend (validation errors) ให้ดึงมาใช้
          if (errorData.errors && typeof errorData.errors === 'object') {
            errors = errorData.errors;
          }
        } catch (e) {
          errorMessage = `Registration failed: ${response.status} ${response.statusText}`;
        }
        console.error("Registration API error:", errorMessage);
        // ถ้ามี errors object ให้ส่งกลับมาในรูปแบบ structured
        if (Object.keys(errors).length > 0) {
          return { success: false, errors, message: errorMessage };
        }
        return { success: false, message: errorMessage };
      }

      let data;
      try {
        data = await response.json();
      } catch (jsonError) {
        console.error("Failed to parse registration response:", jsonError);
        return { success: false, message: "Invalid response from server" };
      }

      if (!data.success) {
        console.error("Registration failed:", data.message);
        // ถ้ามี errors object ให้ส่งกลับมาในรูปแบบ structured
        if (data.errors && typeof data.errors === 'object' && Object.keys(data.errors).length > 0) {
          return { success: false, errors: data.errors, message: data.message || "Registration failed" };
        }
        return { success: false, message: data.message || "Registration failed" };
      }

      // Login อัตโนมัติหลังสมัคร
      const userWithoutPassword = data.user;
      localStorage.setItem(STORAGE_KEYS.currentUser, JSON.stringify(userWithoutPassword));
      setCurrentUser(userWithoutPassword);
      setIsAuthenticated(true);

      return { success: true, message: "Registration successful", user: userWithoutPassword };
    } catch (error) {
      console.error("Registration failed:", error);
      return { success: false, message: error.message || "Registration failed" };
    }
  };

  // === ฟังก์ชัน: Login (เข้าสู่ระบบ) ===
  const login = async (email, password) => {
    try {
      console.log('[AuthContext] Login request:', { email, hasPassword: !!password });
      
      // เรียก API เพื่อตรวจสอบ credentials
      let response;
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 seconds timeout
        
        console.log('[AuthContext] Sending login request to /api/users');
        
        // ใช้ Next.js API route แทนการเรียก backend โดยตรง (แก้ปัญหา CORS)
        response = await fetch("/api/users", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email, password, action: "login" }),
          signal: controller.signal,
        }).finally(() => {
          clearTimeout(timeoutId);
        });
      } catch (fetchError) {
        // Fallback: ใช้ localStorage เมื่อ backend ไม่สามารถเชื่อมต่อได้
        if (fetchError.name === 'TypeError' && fetchError.message.includes('fetch')) {
          console.warn("Backend not available, using fallback login");
          
          try {
            const registeredUsers = JSON.parse(localStorage.getItem(STORAGE_KEYS.registeredUsers) || '[]');
            const user = registeredUsers.find((u) => u.email === email);
            
            if (!user) {
              return { success: false, message: "Invalid email or password" };
            }
            
            // ตรวจสอบ password ใน fallback mode
            if (user.password !== password) {
              return { success: false, message: "Invalid email or password" };
            }
            
            const userWithoutPassword = {
              id: user.id,
              email: user.email,
              name: user.name,
              username: user.username,
              createdAt: user.createdAt,
            };
            
            localStorage.setItem(STORAGE_KEYS.currentUser, JSON.stringify(userWithoutPassword));
            setCurrentUser(userWithoutPassword);
            setIsAuthenticated(true);
            
            console.warn("⚠️ Using fallback login (localStorage). Backend is not running.");
            return { success: true, message: "Login successful (offline mode)", user: userWithoutPassword };
          } catch (fallbackError) {
            console.error("Fallback login failed:", fallbackError);
            return { success: false, message: "Cannot connect to server. Please make sure the backend is running." };
          }
        }
        
        console.error("Login failed:", fetchError);
        return { success: false, message: "Login failed" };
      }

      // ตรวจสอบ response status ก่อน parse JSON
      if (!response.ok) {
        let errorMessage = "Login failed";
        let errors = {};
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorMessage;
          // ถ้ามี errors object จาก backend (validation errors) ให้ดึงมาใช้
          if (errorData.errors && typeof errorData.errors === 'object') {
            errors = errorData.errors;
          }
        } catch (e) {
          errorMessage = `Login failed: ${response.status} ${response.statusText}`;
        }
        // ถ้ามี errors object ให้ส่งกลับมาในรูปแบบ structured
        if (Object.keys(errors).length > 0) {
          return { success: false, errors, message: errorMessage };
        }
        return { success: false, message: errorMessage };
      }

      let data;
      try {
        data = await response.json();
      } catch (jsonError) {
        console.error("Failed to parse login response:", jsonError);
        return { success: false, message: "Invalid response from server" };
      }

      if (!data.success) {
        // ถ้ามี errors object ให้ส่งกลับมาในรูปแบบ structured
        if (data.errors && typeof data.errors === 'object' && Object.keys(data.errors).length > 0) {
          return { success: false, errors: data.errors, message: data.message || "Login failed" };
        }
        return { success: false, message: data.message || "Login failed" };
      }

      // บันทึก session (ไม่เก็บ password)
      const userWithoutPassword = data.user;
      localStorage.setItem(STORAGE_KEYS.currentUser, JSON.stringify(userWithoutPassword));
      setCurrentUser(userWithoutPassword);
      setIsAuthenticated(true);

      return { success: true, message: "Login successful", user: userWithoutPassword };
    } catch (error) {
      console.error("Login failed:", error);
      return { success: false, message: error.message || "Login failed" };
    }
  };

  // === ฟังก์ชัน: Check Username Availability ===
  const checkUsernameAvailability = async (username) => {
    try {
      // ใช้ Next.js API route แทนการเรียก backend โดยตรง (แก้ปัญหา CORS)
      const response = await fetch(`/api/users/username/${username}`);
      const data = await response.json();
      // ถ้ามี user อยู่แล้ว username ไม่ available
      return !data || !data.id;
    } catch (error) {
      console.error("Failed to check username:", error);
      return false;
    }
  };

  // === ฟังก์ชัน: Logout (ออกจากระบบ) ===
  const logout = () => {
    try {
      localStorage.removeItem(STORAGE_KEYS.currentUser);
      setCurrentUser(null);
      setIsAuthenticated(false);
      router.push("/login");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  // === Value ที่จะส่งไปให้ Context ===
  const value = {
    currentUser,
    isAuthenticated,
    loading,
    login,
    register,
    logout,
    checkUsernameAvailability,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}


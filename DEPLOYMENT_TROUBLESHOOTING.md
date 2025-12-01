# 🔧 คู่มือแก้ไขปัญหา Deployment

## ❌ ปัญหา: Deploy สำเร็จแต่หน้าเว็บไม่ขึ้น

### สาเหตุที่เป็นไปได้:

1. **Environment Variables ไม่ได้ตั้งค่าใน Vercel** ⚠️ **น่าจะเป็นสาเหตุหลัก**
2. Backend ไม่ตอบสนอง
3. CORS Error
4. Runtime Error ใน Frontend

---

## ✅ วิธีแก้ไขทีละขั้นตอน

### ขั้นตอนที่ 1: ตั้งค่า Environment Variables ใน Vercel

1. **ไปที่ Vercel Dashboard**
   - เข้าสู่ระบบที่ [vercel.com](https://vercel.com)
   - เลือก Project ของคุณ

2. **ไปที่ Project Settings → Environment Variables**

3. **เพิ่มตัวแปรต่อไปนี้ (สำคัญมาก!):**

   | Key | Value | จำเป็น |
   |-----|-------|--------|
   | `NEXT_PUBLIC_API_URL` | `https://portfolio-1-yxll.onrender.com` | ✅ **จำเป็น** |
   | `NEXT_PUBLIC_SITE_URL` | `https://your-app.vercel.app` | ⚠️ แนะนำ |
   | `NEXTAUTH_SECRET` | สร้างด้วย `openssl rand -base64 32` | ⚠️ แนะนำ |
   | `NEXTAUTH_URL` | `https://your-app.vercel.app` | ⚠️ แนะนำ |

4. **สำคัญ:** 
   - ✅ ต้องตั้งค่า `NEXT_PUBLIC_API_URL` **ก่อน** deploy
   - ✅ ตรวจสอบว่า URL ไม่มี trailing slash (`/`)
   - ✅ เลือก **Environment** เป็น `Production`, `Preview`, และ `Development` (หรือเลือกทั้งหมด)

5. **Redeploy Project**
   - หลังจากตั้งค่า Environment Variables แล้ว
   - ไปที่ **Deployments** tab
   - คลิก **⋯** (สามจุด) บน deployment ล่าสุด
   - เลือก **Redeploy**

---

### ขั้นตอนที่ 2: ตรวจสอบ Backend

ทดสอบว่า backend ทำงานหรือไม่:

```bash
# ทดสอบ backend โดยตรง
curl https://portfolio-1-yxll.onrender.com/api/hero-section

# หรือเปิดใน browser:
# https://portfolio-1-yxll.onrender.com/api/hero-section
```

**ถ้า backend ไม่ตอบสนอง:**
- ตรวจสอบว่า backend service ทำงานใน Render Dashboard
- ตรวจสอบ logs ใน Render Dashboard → Web Service → Logs

---

### ขั้นตอนที่ 3: ตรวจสอบ CORS

1. **เปิด Browser Console** (F12) เมื่อเข้าเว็บ
2. **ดู Network Tab** → ตรวจสอบ API calls
3. **ถ้ามี CORS Error:**

   ไปที่ **Render Dashboard** → **Web Service** → **Environment Variables**
   
   เพิ่ม/แก้ไข:
   ```
   CORS_ORIGIN=https://your-app.vercel.app,http://localhost:3000
   ```
   
   แล้ว **Redeploy** backend

---

### ขั้นตอนที่ 4: ตรวจสอบ Runtime Errors

1. **เปิด Browser Console** (F12)
2. **ดู Console Tab** → หา error messages
3. **ดู Network Tab** → ตรวจสอบว่า API calls ไปที่ URL ถูกต้อง

**ถ้าเห็น error เกี่ยวกับ `localhost:3001`:**
- แสดงว่า `NEXT_PUBLIC_API_URL` ไม่ได้ตั้งค่าใน Vercel
- กลับไปทำ **ขั้นตอนที่ 1**

---

## 🔍 วิธีตรวจสอบว่า Environment Variables ตั้งค่าถูกต้อง

### ใน Vercel Dashboard:

1. ไปที่ **Project Settings** → **Environment Variables**
2. ตรวจสอบว่ามี `NEXT_PUBLIC_API_URL` และมีค่าเป็น `https://portfolio-1-yxll.onrender.com`

### ใน Browser Console:

1. เปิดเว็บที่ deploy แล้ว
2. เปิด Browser Console (F12)
3. พิมพ์:
   ```javascript
   console.log(process.env.NEXT_PUBLIC_API_URL)
   ```
   
   **ถ้าแสดง `undefined` หรือ `http://localhost:3001`:**
   - แสดงว่า Environment Variables ไม่ได้ตั้งค่า
   - ต้องตั้งค่าใหม่และ Redeploy

---

## 📋 Checklist สำหรับตรวจสอบ

- [ ] `NEXT_PUBLIC_API_URL` ตั้งค่าใน Vercel แล้ว
- [ ] URL ไม่มี trailing slash (`/`)
- [ ] เลือก Environment ทั้งหมด (Production, Preview, Development)
- [ ] Redeploy project หลังจากตั้งค่า Environment Variables
- [ ] Backend ทำงานที่ `https://portfolio-1-yxll.onrender.com`
- [ ] CORS ตั้งค่าใน backend แล้ว
- [ ] ไม่มี error ใน Browser Console

---

## 🚀 Quick Fix (แก้ไขเร็วที่สุด)

1. **ไปที่ Vercel Dashboard** → **Project Settings** → **Environment Variables**
2. **เพิ่ม:**
   ```
   NEXT_PUBLIC_API_URL=https://portfolio-1-yxll.onrender.com
   ```
3. **Redeploy** project
4. **รอให้ deploy เสร็จ** (ประมาณ 2-5 นาที)
5. **ทดสอบเว็บอีกครั้ง**

---

## 📞 ถ้ายังแก้ไม่ได้

1. **ตรวจสอบ Vercel Logs:**
   - ไปที่ **Deployments** → เลือก deployment ล่าสุด → **View Function Logs**

2. **ตรวจสอบ Render Logs:**
   - ไปที่ Render Dashboard → **Web Service** → **Logs**

3. **ตรวจสอบ Browser Console:**
   - เปิด Browser Console (F12) → ดู error messages

4. **ทดสอบ Backend โดยตรง:**
   ```bash
   curl https://portfolio-1-yxll.onrender.com/api/hero-section
   ```


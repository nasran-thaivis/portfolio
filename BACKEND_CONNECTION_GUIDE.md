# คู่มือการเชื่อมต่อ Frontend กับ Backend

## 🔗 Backend URL
**URL ปัจจุบัน:** `https://portfolio-1-yxll.onrender.com`

---

## 📋 วิธีตั้งค่า

### สำหรับ Production (Vercel)

1. **ไปที่ Vercel Dashboard**
   - เข้าสู่ระบบที่ [vercel.com](https://vercel.com)
   - เลือก Project ของคุณ

2. **ตั้งค่า Environment Variables**
   - ไปที่ **Project Settings** → **Environment Variables**
   - เพิ่มตัวแปรต่อไปนี้:

   | Key | Value |
   |-----|-------|
   | `NEXT_PUBLIC_API_URL` | `https://portfolio-1-yxll.onrender.com` |
   | `NEXT_PUBLIC_SITE_URL` | `https://your-app.vercel.app` (URL ของ frontend) |
   | `NEXTAUTH_SECRET` | สร้างด้วยคำสั่ง `openssl rand -base64 32` |
   | `NEXTAUTH_URL` | `https://your-app.vercel.app` (URL ของ frontend) |

3. **Redeploy**
   - หลังจากตั้งค่าแล้ว ให้ **Redeploy** project
   - Vercel จะ rebuild ด้วย environment variables ใหม่

---

### สำหรับ Local Development

1. **สร้างไฟล์ `.env.local`** ใน root directory ของ project

2. **คัดลอกเนื้อหาจาก `.env.local.example`** และแก้ไข:

```env
# ใช้ backend จาก Render สำหรับทดสอบ
NEXT_PUBLIC_API_URL=https://portfolio-1-yxll.onrender.com

# หรือใช้ localhost ถ้า run backend ที่เครื่อง
# NEXT_PUBLIC_API_URL=http://localhost:3001

NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXTAUTH_SECRET=your-random-secret-string-here
NEXTAUTH_URL=http://localhost:3000
```

3. **Restart Development Server**
   ```bash
   npm run dev
   ```

---

## ✅ ตรวจสอบการตั้งค่า

### ตรวจสอบว่า Frontend เชื่อมต่อ Backend ได้

1. **เปิด Browser Console** (F12)
2. **ดู Network Tab** เมื่อโหลดหน้าเว็บ
3. **ตรวจสอบว่า API calls ไปที่ URL ถูกต้อง**

### ทดสอบ API โดยตรง

เปิด browser และไปที่:
```
https://portfolio-1-yxll.onrender.com/api/hero-section
```

ถ้าเห็น JSON response แสดงว่า backend ทำงานปกติ

---

## 🔧 Troubleshooting

### ปัญหา: Frontend ยังโหลดหน้าเว็บไม่ขึ้น (404 Error)

**สาเหตุที่เป็นไปได้:**
1. ❌ `NEXT_PUBLIC_API_URL` ยังไม่ได้ตั้งค่าใน Vercel
2. ❌ ตั้งค่าแล้วแต่ยังไม่ได้ Redeploy
3. ❌ Backend URL ไม่ถูกต้อง

**วิธีแก้:**
1. ✅ ตรวจสอบ Environment Variables ใน Vercel Dashboard
2. ✅ ตรวจสอบว่า URL ไม่มี trailing slash (`/`)
3. ✅ Redeploy project ใน Vercel
4. ✅ ตรวจสอบว่า backend ทำงานที่ `https://portfolio-1-yxll.onrender.com`

### ปัญหา: CORS Error

**สาเหตุ:** Backend ยังไม่ได้ตั้งค่า CORS ให้รองรับ frontend domain

**วิธีแก้:**
1. ไปที่ Render Dashboard → Web Service → Environment Variables
2. เพิ่ม/แก้ไข `CORS_ORIGIN`:
   ```
   CORS_ORIGIN=https://your-app.vercel.app,http://localhost:3000
   ```
3. Redeploy backend

---

## 📝 หมายเหตุ

- ✅ Environment variables ที่ขึ้นต้นด้วย `NEXT_PUBLIC_` จะถูก expose ให้ client-side
- ✅ ต้องตั้งค่า `NEXT_PUBLIC_API_URL` ให้ชี้ไปที่ backend URL จาก Render
- ⚠️ อย่าลืมตั้งค่า `CORS_ORIGIN` ใน backend ให้ตรงกับ frontend URL
- 🔒 ไฟล์ `.env.local` จะไม่ถูก commit เข้า Git (มีใน `.gitignore` แล้ว)

---

## 🔄 อัปเดต Backend URL

ถ้า backend URL เปลี่ยน ให้:

1. **อัปเดตใน Vercel:**
   - Project Settings → Environment Variables
   - แก้ไข `NEXT_PUBLIC_API_URL`
   - Redeploy

2. **อัปเดตใน Local:**
   - แก้ไขไฟล์ `.env.local`
   - Restart development server


# ⚡ Quick Error Fix Guide

## ถ้าเจอ Error บน Vercel ให้ทำตามนี้:

### 1️⃣ ตรวจสอบ Error Code
ดู error code ที่แสดงใน Vercel Dashboard หรือ Browser Console

### 2️⃣ ตรวจสอบ Logs
- **Vercel Dashboard** → **Deployments** → เลือก deployment → **View Function Logs**
- **Browser Console** (F12) → **Console** และ **Network** tabs

### 3️⃣ แก้ไขตาม Error Code

#### 🔴 FUNCTION_INVOCATION_FAILED (500)
```bash
# ตรวจสอบ Environment Variables
# ไปที่ Vercel Dashboard → Project Settings → Environment Variables
# ตรวจสอบว่า NEXT_PUBLIC_API_URL = https://portfolio-1-yxll.onrender.com
```

#### 🔴 FUNCTION_INVOCATION_TIMEOUT (504)
```bash
# ตรวจสอบว่า backend ทำงาน
curl https://portfolio-1-yxll.onrender.com/api/hero-section

# ถ้า backend sleep (Render free tier) ให้รอสักครู่แล้วลองใหม่
```

#### 🔴 NOT_FOUND (404)
```bash
# ตรวจสอบ route structure
# ตรวจสอบว่าไฟล์อยู่ในตำแหน่งที่ถูกต้อง
```

#### 🔴 NO_RESPONSE_FROM_FUNCTION (502)
```bash
# ตรวจสอบ Vercel Function Logs
# ตรวจสอบว่าไม่มี infinite loop ในโค้ด
```

### 4️⃣ Quick Fixes

#### Environment Variables ไม่ถูกต้อง:
1. ไปที่ **Vercel Dashboard** → **Project Settings** → **Environment Variables**
2. ตรวจสอบว่า:
   - ✅ `NEXT_PUBLIC_API_URL` = `https://portfolio-1-yxll.onrender.com`
   - ✅ `NEXT_PUBLIC_SITE_URL` = URL ของ frontend (แนะนำ)
3. **Redeploy** project

#### Backend ไม่ตอบสนอง:
1. ตรวจสอบ Render Dashboard → Web Service → Logs
2. ถ้า backend sleep ให้รอสักครู่แล้วลองใหม่
3. พิจารณา upgrade Render plan

#### CORS Error:
1. ไปที่ Render Dashboard → Web Service → Environment Variables
2. เพิ่ม/แก้ไข:
   ```
   CORS_ORIGIN=https://your-app.vercel.app,http://localhost:3000
   ```
3. Redeploy backend

### 5️⃣ ทดสอบอีกครั้ง
หลังจากแก้ไขแล้ว:
1. Redeploy project
2. รอให้ deploy เสร็จ
3. ทดสอบเว็บอีกครั้ง
4. ตรวจสอบ Browser Console (F12)

---

## 📞 ถ้ายังแก้ไม่ได้

1. ตรวจสอบ **VERCEL_ERROR_CODES_GUIDE.md** สำหรับรายละเอียดเพิ่มเติม
2. ตรวจสอบ Vercel Documentation: https://vercel.com/docs
3. ติดต่อ Vercel Support: https://vercel.com/support


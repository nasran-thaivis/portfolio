# Template สำหรับ Environment Variables

## Backend (Render)

คัดลอกและวางใน Render Dashboard → Web Service → Environment Variables:

```
DATABASE_URL=postgresql://postgres:password@dpg-xxxxx-a.region-postgres.render.com:5432/dbname?schema=public
NODE_ENV=production
CORS_ORIGIN=https://your-app.vercel.app
```

### คำอธิบาย:

- **DATABASE_URL**: Internal Database URL จาก PostgreSQL service บน Render
  - หาได้จาก: Render Dashboard → PostgreSQL Service → Info → Internal Database URL
  - **สำคัญ**: ต้องไม่ใช่ localhost หรือ 127.0.0.1
  
- **NODE_ENV**: `production` สำหรับ production mode

- **CORS_ORIGIN**: Frontend URL จาก Vercel
  - ตัวอย่าง: `https://your-app.vercel.app`
  - สำหรับ multiple domains: `https://domain1.com,https://domain2.com`

---

## Frontend (Vercel)

คัดลอกและวางใน Vercel Dashboard → Project Settings → Environment Variables:

```
NEXT_PUBLIC_API_URL=https://your-backend.onrender.com
NEXT_PUBLIC_SITE_URL=https://your-app.vercel.app
NEXTAUTH_SECRET=0EDCZX+PZN5nYqfWZY562IhWR8kYf5OEIYagUJwrJ6c=
NEXTAUTH_URL=https://your-app.vercel.app
```

### คำอธิบาย:

- **NEXT_PUBLIC_API_URL**: Backend URL จาก Render
  - ตัวอย่าง: `https://profile-backend.onrender.com`
  - **สำคัญ**: ไม่ต้องใส่ trailing slash (`/`)
  
- **NEXT_PUBLIC_SITE_URL**: Frontend URL จาก Vercel
  - ตัวอย่าง: `https://your-app.vercel.app`
  
- **NEXTAUTH_SECRET**: Secret สำหรับ NextAuth
  - สร้างโดยใช้: `openssl rand -base64 32`
  - **สำคัญ**: ต้องเก็บเป็นความลับ
  
- **NEXTAUTH_URL**: Frontend URL จาก Vercel (เหมือนกับ NEXT_PUBLIC_SITE_URL)
  - ตัวอย่าง: `https://your-app.vercel.app`

---

## NEXTAUTH_SECRET ที่สร้างไว้แล้ว

```
0EDCZX+PZN5nYqfWZY562IhWR8kYf5OEIYagUJwrJ6c=
```

**หมายเหตุ**: Secret นี้ถูกสร้างไว้แล้ว คุณสามารถใช้ได้เลย หรือสร้างใหม่ด้วยคำสั่ง:
```bash
openssl rand -base64 32
```

---

## ขั้นตอนการใช้งาน

1. **Deploy Backend ก่อน**:
   - สร้าง PostgreSQL database บน Render
   - สร้าง Web Service
   - ตั้งค่า Backend environment variables (ใช้ DATABASE_URL จาก database)
   - Deploy และบันทึก Backend URL

2. **Deploy Frontend**:
   - เชื่อมต่อ repository กับ Vercel
   - ตั้งค่า Frontend environment variables (ใช้ Backend URL จากขั้นตอนที่ 1)
   - Deploy และบันทึก Frontend URL

3. **อัปเดต CORS**:
   - อัปเดต `CORS_ORIGIN` ใน Backend ด้วย Frontend URL จริง
   - อัปเดต `NEXT_PUBLIC_SITE_URL` และ `NEXTAUTH_URL` ใน Frontend ด้วย Frontend URL จริง

---

## ตรวจสอบการตั้งค่า

หลังจากตั้งค่า environment variables แล้ว ให้ตรวจสอบว่า:

- ✅ Backend สามารถเชื่อมต่อกับ database ได้
- ✅ Frontend สามารถเรียก API จาก backend ได้
- ✅ ไม่มี CORS errors ใน browser console
- ✅ Authentication ทำงานได้ปกติ (ถ้าใช้ NextAuth)

---

## Troubleshooting

### Backend: DATABASE_URL ไม่ถูกต้อง
- ตรวจสอบว่าใช้ Internal Database URL (ไม่ใช่ External)
- ตรวจสอบว่า URL ไม่มี `localhost` หรือ `127.0.0.1`
- ตรวจสอบ logs ใน Render Dashboard

### Frontend: API calls ไม่ทำงาน
- ตรวจสอบว่า `NEXT_PUBLIC_API_URL` ตั้งค่าเป็น Backend URL ที่ถูกต้อง
- ตรวจสอบว่าไม่มี trailing slash (`/`) ใน URL
- ตรวจสอบ browser console สำหรับ errors

### CORS Errors
- ตรวจสอบว่า `CORS_ORIGIN` ใน backend ตรงกับ Frontend URL เป๊ะ
- ตรวจสอบว่า URL มี protocol (`https://`) ด้วย
- ตรวจสอบว่าไม่มี trailing slash ใน `CORS_ORIGIN`


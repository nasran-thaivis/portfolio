# คู่มือ Deploy Step-by-Step

## สถานะปัจจุบัน
- ✅ Git repository เชื่อมต่อกับ GitHub: `https://github.com/nasran-thaivis/portfolio.git`
- ✅ Code ถูก push ไปยัง main branch แล้ว
- ✅ มีบัญชี Render และ Vercel แล้ว

## Phase 2: Deploy Backend บน Render

### ขั้นตอนที่ 1: สร้าง PostgreSQL Database

1. เข้าสู่ [Render Dashboard](https://dashboard.render.com)
2. คลิก "New +" → "PostgreSQL"
3. ตั้งค่าดังนี้:
   - **Name**: `profile-db` (หรือชื่อที่ต้องการ)
   - **Database**: `profiledb` (หรือชื่อที่ต้องการ)
   - **User**: `postgres` (default)
   - **Region**: เลือก region ที่ใกล้ที่สุด (เช่น Singapore, Oregon)
   - **Plan**: เลือก Free tier หรือ plan ที่ต้องการ
4. คลิก "Create Database"
5. รอให้ database สร้างเสร็จ (ประมาณ 1-2 นาที)
6. **สำคัญ**: ไปที่หน้า Info ของ database → คัดลอก **Internal Database URL**
   - รูปแบบ: `postgresql://postgres:password@dpg-xxxxx-a.region-postgres.render.com:5432/dbname?schema=public`
   - **อย่าลืม**: ใช้ Internal Database URL (ไม่ใช่ External) เพื่อความปลอดภัยและประสิทธิภาพ

### ขั้นตอนที่ 2: สร้าง Web Service สำหรับ Backend

1. ใน Render Dashboard คลิก "New +" → "Web Service"
2. เชื่อมต่อกับ Git repository:
   - เลือก "Connect GitHub" (หรือ GitLab)
   - เลือก repository: `nasran-thaivis/portfolio`
   - เลือก branch: `main`
3. ตั้งค่าดังนี้:

   | Setting | Value |
   |---------|-------|
   | **Name** | `profile-backend` |
   | **Environment** | `Node` |
   | **Region** | เลือก region เดียวกับ database |
   | **Branch** | `main` |
   | **Root Directory** | `backend` |
   | **Build Command** | `cd backend && npm ci && npm run build` |
   | **Start Command** | `cd backend && npm run start:prod` |
   | **Instance Type** | Free tier หรือ plan ที่ต้องการ |

4. คลิก "Create Web Service"

### ขั้นตอนที่ 3: ตั้งค่า Environment Variables

1. ในหน้า Web Service ที่สร้างไว้ → ไปที่แท็บ "Environment"
2. เพิ่ม environment variables ดังนี้:

   | Key | Value | หมายเหตุ |
   |-----|-------|----------|
   | `DATABASE_URL` | Internal Database URL ที่คัดลอกมา | **สำคัญมาก** - ต้องไม่ใช่ localhost |
   | `NODE_ENV` | `production` | สำหรับ production mode |
   | `CORS_ORIGIN` | `https://your-app.vercel.app` | **ชั่วคราว** - จะอัปเดตหลังจาก deploy frontend |
   | `PORT` | (เว้นว่างไว้) | Render จะตั้งค่าให้อัตโนมัติ |

3. คลิก "Save Changes"

### ขั้นตอนที่ 4: Deploy Backend

1. Render จะเริ่ม build และ deploy อัตโนมัติ
2. ไปที่แท็บ "Logs" เพื่อดู progress
3. ตรวจสอบ logs ว่ามีข้อความเหล่านี้:
   - ✅ `DATABASE_URL is set: postgresql://...` (password จะถูก mask)
   - ✅ `Generating Prisma Client...`
   - ✅ `Running database migrations...`
   - ✅ `🚀 Backend is running on: http://0.0.0.0:XXXX/api`
4. รอให้ deploy เสร็จ (ประมาณ 3-5 นาที)
5. **บันทึก Backend URL**: จะได้ URL เช่น `https://profile-backend.onrender.com`
   - URL นี้จะใช้สำหรับตั้งค่า frontend

### ตรวจสอบ Backend

ทดสอบว่า backend ทำงาน:
```bash
curl https://your-backend-url.onrender.com/api
```

ควรได้ response กลับมา

---

## Phase 3: Deploy Frontend บน Vercel

### ขั้นตอนที่ 1: เชื่อมต่อ Repository กับ Vercel

1. เข้าสู่ [Vercel Dashboard](https://vercel.com/dashboard)
2. คลิก "Add New..." → "Project"
3. Import Git repository:
   - เลือก "Import Git Repository"
   - เลือก repository: `nasran-thaivis/portfolio`
   - คลิก "Import"
4. ตั้งค่า Project:
   - **Project Name**: `profile-frontend` (หรือชื่อที่ต้องการ)
   - **Framework Preset**: `Next.js` (ควร detect อัตโนมัติ)
   - **Root Directory**: `./` (root ของ repo)
   - **Build Command**: `npm run build` (default)
   - **Output Directory**: `.next` (default)
   - **Install Command**: `npm ci` (default)

### ขั้นตอนที่ 2: สร้าง NEXTAUTH_SECRET

รันคำสั่งนี้ใน terminal เพื่อสร้าง secret:

```bash
openssl rand -base64 32
```

คัดลอกผลลัพธ์ที่ได้ (จะใช้ในขั้นตอนถัดไป)

### ขั้นตอนที่ 3: ตั้งค่า Environment Variables

**หมายเหตุ**: ต้องมี Backend URL จาก Render ก่อน

1. ในหน้า Project Settings → ไปที่ "Environment Variables"
2. เพิ่ม environment variables ดังนี้:

   | Key | Value | หมายเหตุ |
   |-----|-------|----------|
   | `NEXT_PUBLIC_API_URL` | `https://your-backend.onrender.com` | ใช้ Backend URL จาก Render (ไม่มี trailing slash) |
   | `NEXT_PUBLIC_SITE_URL` | `https://your-app.vercel.app` | **ชั่วคราว** - จะอัปเดตหลังจาก deploy |
   | `NEXTAUTH_SECRET` | ผลลัพธ์จาก `openssl rand -base64 32` | Secret สำหรับ NextAuth |
   | `NEXTAUTH_URL` | `https://your-app.vercel.app` | **ชั่วคราว** - จะอัปเดตหลังจาก deploy |

3. เลือก "Production", "Preview", และ "Development" สำหรับทุก environment variable
4. คลิก "Save"

### ขั้นตอนที่ 4: Deploy Frontend

1. คลิก "Deploy"
2. Vercel จะเริ่ม build และ deploy
3. รอให้ build เสร็จ (ประมาณ 2-5 นาที)
4. **บันทึก Frontend URL**: จะได้ URL เช่น `https://your-app.vercel.app`
   - URL นี้จะใช้สำหรับอัปเดต CORS ใน backend

---

## Phase 4: อัปเดต Configuration หลัง Deploy

### ขั้นตอนที่ 1: อัปเดต CORS ใน Backend

1. กลับไปที่ Render Dashboard → Web Service ของ backend
2. ไปที่แท็บ "Environment"
3. อัปเดต `CORS_ORIGIN`:
   - เปลี่ยนจาก `https://your-app.vercel.app` 
   - เป็น Frontend URL จริงที่ได้จาก Vercel (เช่น `https://your-app.vercel.app`)
4. คลิก "Save Changes"
5. Render จะ redeploy อัตโนมัติ (หรือคลิก "Manual Deploy" → "Deploy latest commit")

### ขั้นตอนที่ 2: อัปเดต Frontend Environment Variables

1. กลับไปที่ Vercel Dashboard → Project Settings → Environment Variables
2. อัปเดต environment variables:
   - `NEXT_PUBLIC_SITE_URL`: เปลี่ยนเป็น Frontend URL จริง
   - `NEXTAUTH_URL`: เปลี่ยนเป็น Frontend URL จริง
3. คลิก "Save"
4. ไปที่แท็บ "Deployments" → คลิก "..." บน deployment ล่าสุด → "Redeploy"

---

## Phase 5: ตรวจสอบการ Deploy

### ทดสอบ Backend

1. ทดสอบ API endpoint:
   ```bash
   curl https://your-backend.onrender.com/api
   ```

2. ทดสอบ health check (ถ้ามี):
   ```bash
   curl https://your-backend.onrender.com/api/health
   ```

### ทดสอบ Frontend

1. เปิด Frontend URL ใน browser
2. เปิด Browser Console (F12)
3. ตรวจสอบว่า:
   - ✅ ไม่มี CORS errors
   - ✅ API calls ทำงานได้
   - ✅ หน้าเว็บโหลดได้ปกติ

### ทดสอบ Integration

1. ทดสอบการเรียก API จาก frontend:
   - เปิด Network tab ใน Browser DevTools
   - ทำการใช้งานเว็บ (เช่น login, load data)
   - ตรวจสอบว่า API calls ไปที่ backend URL ที่ถูกต้อง
   - ตรวจสอบว่า response กลับมาปกติ

---

## Troubleshooting

### Backend Issues

**ปัญหา**: `Can't reach database server at localhost:5432`
- **แก้ไข**: ตรวจสอบว่า `DATABASE_URL` ใช้ Internal Database URL จาก Render (ไม่ใช่ localhost)

**ปัญหา**: `CORS Error`
- **แก้ไข**: ตรวจสอบว่า `CORS_ORIGIN` ใน backend ตรงกับ Frontend URL จาก Vercel เป๊ะ (รวม protocol `https://`)

**ปัญหา**: `Migration failed`
- **แก้ไข**: ตรวจสอบ logs ใน Render เพื่อดู error message ที่ละเอียดขึ้น

### Frontend Issues

**ปัญหา**: `API calls fail`
- **แก้ไข**: ตรวจสอบว่า `NEXT_PUBLIC_API_URL` ตั้งค่าเป็น Backend URL ที่ถูกต้อง (ไม่มี trailing slash)

**ปัญหา**: `Build fails`
- **แก้ไข**: ตรวจสอบ build logs ใน Vercel เพื่อดู error message

---

## Checklist สรุป

### Backend (Render)
- [ ] PostgreSQL Database สร้างแล้ว
- [ ] Internal Database URL คัดลอกแล้ว
- [ ] Web Service สร้างแล้ว
- [ ] Environment Variables ตั้งค่าแล้ว:
  - [ ] `DATABASE_URL`
  - [ ] `NODE_ENV=production`
  - [ ] `CORS_ORIGIN` (ชั่วคราว)
- [ ] Backend deploy สำเร็จ
- [ ] Backend URL บันทึกแล้ว

### Frontend (Vercel)
- [ ] Repository เชื่อมต่อแล้ว
- [ ] `NEXTAUTH_SECRET` สร้างแล้ว
- [ ] Environment Variables ตั้งค่าแล้ว:
  - [ ] `NEXT_PUBLIC_API_URL` (Backend URL)
  - [ ] `NEXT_PUBLIC_SITE_URL` (ชั่วคราว)
  - [ ] `NEXTAUTH_SECRET`
  - [ ] `NEXTAUTH_URL` (ชั่วคราว)
- [ ] Frontend deploy สำเร็จ
- [ ] Frontend URL บันทึกแล้ว

### Post-Deployment
- [ ] `CORS_ORIGIN` ใน backend อัปเดตด้วย Frontend URL จริง
- [ ] `NEXT_PUBLIC_SITE_URL` ใน frontend อัปเดตด้วย Frontend URL จริง
- [ ] `NEXTAUTH_URL` ใน frontend อัปเดตด้วย Frontend URL จริง
- [ ] ทดสอบ backend API endpoints
- [ ] ทดสอบ frontend pages
- [ ] ตรวจสอบ CORS ทำงานถูกต้อง
- [ ] ทดสอบ API calls จาก frontend ไปยัง backend

---

## URLs ที่ต้องบันทึก

หลังจาก deploy เสร็จ ให้บันทึก URLs เหล่านี้:

- **Backend URL**: `https://________________.onrender.com`
- **Frontend URL**: `https://________________.vercel.app`
- **Database Internal URL**: `postgresql://________________` (เก็บไว้เป็นความลับ)

---

## สรุป

หลังจากทำตามขั้นตอนทั้งหมดแล้ว:
- ✅ Backend จะรันบน Render พร้อม PostgreSQL database
- ✅ Frontend จะรันบน Vercel
- ✅ CORS ตั้งค่าถูกต้องแล้ว
- ✅ Environment variables ตั้งค่าถูกต้องแล้ว
- ✅ แอปพลิเคชันพร้อมใช้งานแล้ว


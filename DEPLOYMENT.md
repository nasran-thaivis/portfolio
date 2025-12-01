# คู่มือการ Deploy Backend บน Render และ Frontend บน Vercel

## สารบัญ

1. [Backend Deployment (Render)](#backend-deployment-render)
2. [Frontend Deployment (Vercel)](#frontend-deployment-vercel)
3. [CORS Configuration](#cors-configuration)
4. [Environment Variables Summary](#environment-variables-summary)
5. [Troubleshooting](#troubleshooting)

---

## Backend Deployment (Render)

### ข้อกำหนดเบื้องต้น

- บัญชี Render.com
- PostgreSQL database บน Render.com
- Git repository ที่เชื่อมต่อกับ Render

### ขั้นตอนการ Deploy Backend

#### 1. สร้าง PostgreSQL Database บน Render

1. เข้าสู่ [Render Dashboard](https://dashboard.render.com)
2. คลิก "New +" → "PostgreSQL"
3. ตั้งชื่อ database (เช่น `profile-db`)
4. เลือก plan ที่ต้องการ (Free tier มีจำกัด)
5. รอให้ database สร้างเสร็จ
6. คัดลอก **Internal Database URL** (แนะนำ) หรือ **External Database URL**

**วิธีหา Internal Database URL:**
- ไปที่ Render Dashboard → PostgreSQL Service ของคุณ
- ในหน้า "Info" จะมี "Internal Database URL" และ "External Database URL"
- คัดลอก **Internal Database URL** (ปลอดภัยกว่าและเร็วกว่า)

#### 2. สร้าง Web Service บน Render

1. เข้าสู่ Render Dashboard
2. คลิก "New +" → "Web Service"
3. เชื่อมต่อกับ Git repository ของคุณ
4. ตั้งค่าดังนี้:

   | Setting | Value |
   |---------|-------|
   | **Name** | `profile-backend` (หรือชื่อที่ต้องการ) |
   | **Environment** | `Node` |
   | **Region** | เลือก region ที่ใกล้ที่สุด |
   | **Branch** | `main` (หรือ branch ที่ต้องการ) |
   | **Root Directory** | `backend` |
   | **Build Command** | `cd backend && npm ci && npm run build` |
   | **Start Command** | `cd backend && npm run start:prod` |

#### 3. ตั้งค่า Environment Variables

ในหน้า Web Service → แท็บ "Environment" → เพิ่ม environment variables:

| Key | Value | จำเป็น | หมายเหตุ |
|-----|-------|--------|----------|
| `DATABASE_URL` | Internal Database URL จาก PostgreSQL service | ✅ **จำเป็น** | ต้องไม่ใช่ localhost |
| `NODE_ENV` | `production` | ⚠️ แนะนำ | สำหรับ production mode |
| `PORT` | `3001` (หรือ port ที่ Render กำหนดให้) | ❌ ไม่จำเป็น | Render จะกำหนดให้อัตโนมัติ |
| `CORS_ORIGIN` | URL ของ frontend จาก Vercel | ✅ **จำเป็น** | สำหรับ CORS (ดูด้านล่าง) |

**ตัวอย่าง DATABASE_URL:**
```
postgresql://postgres:password123@dpg-xxxxx-a.oregon-postgres.render.com:5432/profiledb?schema=public
```

**สำคัญ:**
- ✅ ใช้ **Internal Database URL** ถ้า database อยู่ใน Render เดียวกัน (แนะนำ)
- ❌ **ห้ามใช้** URL ที่มี `localhost` หรือ `127.0.0.1` ใน production
- ✅ URL ต้องมีรูปแบบ: `postgresql://username:password@host:port/database?schema=public`

#### 4. Deploy

1. Render จะ build และ deploy อัตโนมัติเมื่อคุณ push code ไปยัง repository
2. หรือคลิก "Manual Deploy" → "Deploy latest commit"
3. รอให้ build และ deploy เสร็จ
4. ตรวจสอบ logs เพื่อดูว่า deploy สำเร็จหรือไม่

**สิ่งที่ต้องตรวจสอบใน Logs:**
- ✅ `DATABASE_URL is set: postgresql://...` - ต้องแสดง URL ที่ถูกต้อง (ไม่ใช่ localhost)
- ✅ `Generating Prisma Client...` - แสดงว่า Prisma Client ถูกสร้างแล้ว
- ✅ `Running database migrations...` - แสดงว่า migrations รันสำเร็จ
- ✅ `🚀 Backend is running on: http://0.0.0.0:XXXX/api` - แสดงว่าแอปพลิเคชันเริ่มทำงานแล้ว

---

## Frontend Deployment (Vercel)

### ข้อกำหนดเบื้องต้น

- บัญชี Vercel (สามารถใช้ GitHub account ได้)
- Git repository ที่มี frontend code
- Backend URL จาก Render (ต้อง deploy backend ก่อน)

### ขั้นตอนการ Deploy Frontend

#### 1. เชื่อมต่อ Git Repository

1. เข้าสู่ [Vercel Dashboard](https://vercel.com/dashboard)
2. คลิก "Add New..." → "Project"
3. Import Git repository ของคุณ
4. เลือก repository และ branch ที่ต้องการ

#### 2. ตั้งค่า Project Settings

Vercel จะ detect Next.js project อัตโนมัติ แต่ตรวจสอบว่า:

| Setting | Value |
|---------|-------|
| **Framework Preset** | `Next.js` |
| **Root Directory** | `./` (root ของ repository) |
| **Build Command** | `npm run build` (default) |
| **Output Directory** | `.next` (default) |
| **Install Command** | `npm ci` (default) |

#### 3. ตั้งค่า Environment Variables

ในหน้า Project Settings → Environment Variables → เพิ่ม:

| Key | Value | จำเป็น | หมายเหตุ |
|-----|-------|--------|----------|
| `NEXT_PUBLIC_API_URL` | Backend URL จาก Render | ✅ **จำเป็น** | เช่น `https://your-backend.onrender.com` |
| `NEXT_PUBLIC_SITE_URL` | Frontend URL จาก Vercel | ⚠️ แนะนำ | เช่น `https://your-app.vercel.app` |

**ตัวอย่าง:**
- `NEXT_PUBLIC_API_URL` = `https://profile-backend.onrender.com`
- `NEXT_PUBLIC_SITE_URL` = `https://my-profile.vercel.app`

**สำคัญ:**
- ✅ Environment variables ที่ขึ้นต้นด้วย `NEXT_PUBLIC_` จะถูก expose ให้ client-side
- ✅ ต้องตั้งค่า `NEXT_PUBLIC_API_URL` ให้ชี้ไปที่ backend URL จาก Render
- ⚠️ อย่าลืมตั้งค่า `CORS_ORIGIN` ใน backend ให้ตรงกับ frontend URL จาก Vercel

#### 4. Deploy

1. คลิก "Deploy"
2. Vercel จะ build และ deploy อัตโนมัติ
3. รอให้ build เสร็จ (ประมาณ 2-5 นาที)
4. เมื่อเสร็จแล้ว Vercel จะให้ URL เช่น `https://your-app.vercel.app`

#### 5. ตั้งค่า Custom Domain (Optional)

1. ไปที่ Project Settings → Domains
2. เพิ่ม custom domain ที่ต้องการ
3. ตั้งค่า DNS records ตามที่ Vercel แนะนำ
4. รอให้ DNS propagate (อาจใช้เวลา 24-48 ชั่วโมง)

---

## CORS Configuration

### ตั้งค่า CORS ใน Backend (Render)

ใน Render Dashboard → Web Service → Environment Variables:

**สำหรับ Single Frontend Domain:**
```
CORS_ORIGIN=https://your-app.vercel.app
```

**สำหรับ Multiple Frontend Domains:**
```
CORS_ORIGIN=https://your-app.vercel.app,https://www.your-app.vercel.app,https://your-custom-domain.com
```

**สำหรับ Development และ Production:**
```
CORS_ORIGIN=https://your-app.vercel.app,http://localhost:3000
```

**หมายเหตุ:**
- Backend จะรองรับ CORS จาก domains ที่ระบุใน `CORS_ORIGIN`
- ใช้ comma (`,`) คั่นระหว่าง multiple domains
- ต้องใส่ protocol (`https://` หรือ `http://`) ด้วย

### ตรวจสอบ CORS

หลังจาก deploy แล้ว ให้ทดสอบ:

1. เปิด browser console ใน frontend
2. ทำการเรียก API จาก frontend
3. ตรวจสอบว่าไม่มี CORS error
4. ถ้ามี CORS error ให้ตรวจสอบว่า `CORS_ORIGIN` ใน backend ตั้งค่าถูกต้อง

---

## Environment Variables Summary

### Backend (Render)

| Variable | ตัวอย่าง Value | จำเป็น |
|----------|----------------|--------|
| `DATABASE_URL` | `postgresql://postgres:pass@dpg-xxx.render.com:5432/db?schema=public` | ✅ |
| `NODE_ENV` | `production` | ⚠️ |
| `PORT` | `3001` | ❌ |
| `CORS_ORIGIN` | `https://your-app.vercel.app` | ✅ |

### Frontend (Vercel)

| Variable | ตัวอย่าง Value | จำเป็น |
|----------|----------------|--------|
| `NEXT_PUBLIC_API_URL` | `https://your-backend.onrender.com` | ✅ |
| `NEXT_PUBLIC_SITE_URL` | `https://your-app.vercel.app` | ⚠️ |

---

## Troubleshooting

### Backend Issues

#### ปัญหา: Can't reach database server at `localhost:5432`

**สาเหตุ:** `DATABASE_URL` ยังชี้ไปที่ `localhost`

**วิธีแก้:**
1. ไปที่ Render Dashboard → Web Service → Environment
2. ตรวจสอบว่า `DATABASE_URL` ถูกตั้งค่าไว้
3. ใช้ Internal Database URL จาก PostgreSQL service (ไม่ใช่ localhost)
4. รูปแบบ URL ที่ถูกต้อง: `postgresql://username:password@host:port/database?schema=public`

#### ปัญหา: Prisma Client not generated

**สาเหตุ:** Prisma Client ยังไม่ถูกสร้างด้วย `DATABASE_URL` ที่ถูกต้อง

**วิธีแก้:**
- Script `start:prod` จะสร้าง Prisma Client อัตโนมัติ
- ตรวจสอบ logs ว่า `npx prisma generate` รันสำเร็จหรือไม่

#### ปัญหา: Migration failed

**สาเหตุ:** Database schema ไม่ตรงกับ migrations

**วิธีแก้:**
1. ตรวจสอบว่า migrations ทั้งหมดอยู่ใน `backend/prisma/migrations/`
2. ตรวจสอบ database permissions
3. ตรวจสอบว่า `DATABASE_URL` ชี้ไปที่ database ที่ถูกต้อง

#### ปัญหา: CORS Error

**สาเหตุ:** `CORS_ORIGIN` ไม่ตรงกับ frontend URL

**วิธีแก้:**
1. ตรวจสอบว่า `CORS_ORIGIN` ใน backend ตั้งค่าเป็น frontend URL จาก Vercel
2. ตรวจสอบว่า URL มี protocol (`https://`) ด้วย
3. ถ้ามี multiple domains ให้ใช้ comma คั่น

### Frontend Issues

#### ปัญหา: API calls fail with network error

**สาเหตุ:** `NEXT_PUBLIC_API_URL` ไม่ถูกตั้งค่าหรือตั้งค่าผิด

**วิธีแก้:**
1. ไปที่ Vercel Dashboard → Project Settings → Environment Variables
2. ตรวจสอบว่า `NEXT_PUBLIC_API_URL` ถูกตั้งค่าเป็น backend URL จาก Render
3. ตรวจสอบว่า URL ไม่มี trailing slash (`/`)
4. Redeploy frontend หลังจากแก้ไข environment variables

#### ปัญหา: Build fails

**สาเหตุ:** Dependencies หรือ build errors

**วิธีแก้:**
1. ตรวจสอบ build logs ใน Vercel Dashboard
2. ทดสอบ build locally: `npm run build`
3. ตรวจสอบว่า `package.json` มี dependencies ที่จำเป็นทั้งหมด

#### ปัญหา: Images not loading

**สาเหตุ:** Image URLs ไม่ถูกต้องหรือ backend ไม่ available

**วิธีแก้:**
1. ตรวจสอบว่า backend URL ใน `NEXT_PUBLIC_API_URL` ถูกต้อง
2. ตรวจสอบว่า backend service รันอยู่และ accessible
3. ตรวจสอบ network tab ใน browser console

---

## Checklist ก่อน Deploy

### Backend (Render)

- [ ] PostgreSQL Database สร้างแล้วบน Render
- [ ] Internal Database URL ถูกคัดลอกแล้ว
- [ ] Web Service สร้างแล้ว
- [ ] Root Directory ตั้งเป็น `backend`
- [ ] Build Command: `cd backend && npm ci && npm run build`
- [ ] Start Command: `cd backend && npm run start:prod`
- [ ] Environment Variables ตั้งค่าแล้ว:
  - [ ] `DATABASE_URL` (Internal Database URL)
  - [ ] `NODE_ENV=production`
  - [ ] `CORS_ORIGIN` (frontend URL จาก Vercel)
- [ ] Deploy สำเร็จและไม่มี errors ใน logs

### Frontend (Vercel)

- [ ] Git repository เชื่อมต่อแล้ว
- [ ] Project settings ถูกต้อง (Next.js framework)
- [ ] Environment Variables ตั้งค่าแล้ว:
  - [ ] `NEXT_PUBLIC_API_URL` (backend URL จาก Render)
  - [ ] `NEXT_PUBLIC_SITE_URL` (frontend URL จาก Vercel)
- [ ] Build สำเร็จและไม่มี errors
- [ ] Frontend สามารถเรียก API จาก backend ได้
- [ ] ไม่มี CORS errors

---

## สรุป

หลังจาก deploy สำเร็จ:

### Backend (Render)
- ✅ Database connection ใช้ `DATABASE_URL` จาก Render environment variables
- ✅ Prisma Client ถูกสร้างที่ runtime ด้วย database URL ที่ถูกต้อง
- ✅ Migrations รันอัตโนมัติก่อนเริ่มแอปพลิเคชัน
- ✅ CORS ตั้งค่าให้รองรับ frontend domain จาก Vercel

### Frontend (Vercel)
- ✅ API calls ใช้ `NEXT_PUBLIC_API_URL` ที่ชี้ไปที่ backend จาก Render
- ✅ Build และ deploy อัตโนมัติเมื่อ push code
- ✅ Environment variables ถูก expose ให้ client-side ผ่าน `NEXT_PUBLIC_` prefix

### การทำงานร่วมกัน
- ✅ Frontend บน Vercel สามารถเรียก API จาก backend บน Render ได้
- ✅ CORS ตั้งค่าถูกต้องเพื่อให้ frontend สามารถเข้าถึง backend ได้
- ✅ Database ใช้ PostgreSQL จาก Render

---

## ข้อมูลเพิ่มเติม

- [Render Documentation](https://render.com/docs)
- [Vercel Documentation](https://vercel.com/docs)
- [Prisma Deployment Guide](https://www.prisma.io/docs/guides/deployment)
- [Next.js Deployment](https://nextjs.org/docs/deployment)
- [NestJS Production](https://docs.nestjs.com/recipes/prisma)

---

## Support

ถ้ามีปัญหาหรือคำถาม:
1. ตรวจสอบ logs ใน Render Dashboard (สำหรับ backend)
2. ตรวจสอบ logs ใน Vercel Dashboard (สำหรับ frontend)
3. ตรวจสอบ browser console สำหรับ frontend errors
4. ตรวจสอบ network tab สำหรับ API call errors


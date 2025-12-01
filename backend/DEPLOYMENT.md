# คู่มือการ Deploy Backend บน Render.com

## ข้อกำหนดเบื้องต้น

- บัญชี Render.com
- PostgreSQL database บน Render.com (หรือ external database)
- Git repository ที่เชื่อมต่อกับ Render

## Environment Variables ที่จำเป็น

### 1. DATABASE_URL (จำเป็น)

URL สำหรับเชื่อมต่อกับ PostgreSQL database

**สำหรับ Render PostgreSQL:**
```
postgresql://[username]:[password]@[host]:[port]/[database]?schema=public
```

**ตัวอย่าง:**
```
postgresql://postgres:password123@dpg-xxxxx-a.oregon-postgres.render.com:5432/profiledb?schema=public
```

### 2. PORT (ไม่จำเป็น - มีค่า default)

Port ที่แอปพลิเคชันจะรัน (default: 3001)

```
PORT=3001
```

### 3. NODE_ENV (แนะนำ)

สภาพแวดล้อมการทำงาน

```
NODE_ENV=production
```

### 4. CORS_ORIGIN (ไม่จำเป็น)

URL ของ frontend ที่อนุญาตให้เข้าถึง API (default: http://localhost:3000)

```
CORS_ORIGIN=https://your-frontend-domain.com
```

## ขั้นตอนการ Deploy

### 1. สร้าง PostgreSQL Database บน Render

1. เข้าสู่ Render Dashboard
2. คลิก "New +" → "PostgreSQL"
3. ตั้งชื่อ database และเลือก plan
4. รอให้ database สร้างเสร็จ
5. คัดลอก **Internal Database URL** หรือ **External Database URL**

### 2. สร้าง Web Service บน Render

1. เข้าสู่ Render Dashboard
2. คลิก "New +" → "Web Service"
3. เชื่อมต่อกับ Git repository ของคุณ
4. ตั้งค่าดังนี้:
   - **Name**: ชื่อ service (เช่น `profile-backend`)
   - **Environment**: `Node`
   - **Build Command**: `cd backend && npm ci && npm run build`
   - **Start Command**: `cd backend && npm run start:prod`
   - **Root Directory**: `backend` (ถ้า backend อยู่ใน subdirectory)

### 3. ตั้งค่า Environment Variables

ในหน้า Web Service ของคุณ:

1. ไปที่แท็บ "Environment"
2. เพิ่ม environment variables:

   | Key | Value |
   |-----|-------|
   | `DATABASE_URL` | Internal Database URL จาก PostgreSQL service |
   | `NODE_ENV` | `production` |
   | `PORT` | `3001` (หรือ port ที่ Render กำหนดให้) |
   | `CORS_ORIGIN` | URL ของ frontend (ถ้ามี) |

**สำคัญ:** 
- ใช้ **Internal Database URL** ถ้า database อยู่ใน Render เดียวกัน
- ใช้ **External Database URL** ถ้า database อยู่คนละ service หรือ external

### 4. Deploy

1. Render จะ build และ deploy อัตโนมัติเมื่อคุณ push code ไปยัง repository
2. หรือคลิก "Manual Deploy" → "Deploy latest commit"

## การทำงานของ Start Script

เมื่อแอปพลิเคชันเริ่มทำงาน `start:prod` script จะทำตามลำดับนี้:

1. ✅ ตรวจสอบว่า `DATABASE_URL` ถูกตั้งค่าไว้
2. 🔧 สร้าง Prisma Client ด้วย `DATABASE_URL` ที่ถูกต้อง
3. 📦 รัน database migrations (`prisma migrate deploy`)
4. 🚀 เริ่มแอปพลิเคชัน

## Troubleshooting

### ปัญหา: Can't reach database server at `localhost:5432`

**สาเหตุ:** `DATABASE_URL` ยังชี้ไปที่ `localhost` ซึ่งใช้ไม่ได้ใน production

**วิธีแก้:**
1. ตรวจสอบว่า `DATABASE_URL` ใน Render Environment Variables ถูกตั้งค่าไว้
2. ใช้ Internal Database URL จาก Render PostgreSQL service
3. ตรวจสอบว่า URL ไม่มี `localhost` ในนั้น

### ปัญหา: Prisma Client not generated

**สาเหตุ:** Prisma Client ยังไม่ถูกสร้างด้วย `DATABASE_URL` ที่ถูกต้อง

**วิธีแก้:**
- Script `start:prod` จะสร้าง Prisma Client อัตโนมัติ
- ถ้ายังมีปัญหา ให้ตรวจสอบว่า `DATABASE_URL` ถูกตั้งค่าไว้ก่อน build

### ปัญหา: Migration failed

**สาเหตุ:** Database schema ไม่ตรงกับ migrations

**วิธีแก้:**
1. ตรวจสอบว่า migrations ทั้งหมดอยู่ใน `prisma/migrations/`
2. รัน `npx prisma migrate deploy` ใน local environment เพื่อทดสอบ
3. ตรวจสอบ database permissions

### ปัญหา: Authentication failed

**สาเหตุ:** Username หรือ password ใน `DATABASE_URL` ไม่ถูกต้อง

**วิธีแก้:**
1. ตรวจสอบ `DATABASE_URL` จาก Render PostgreSQL dashboard
2. ใช้ Internal Database URL (มี username/password ที่ถูกต้อง)
3. ตรวจสอบว่า database user มี permissions ที่จำเป็น

### ปัญหา: Database does not exist

**สาเหตุ:** Database name ใน `DATABASE_URL` ไม่ถูกต้อง

**วิธีแก้:**
1. ตรวจสอบ database name ใน Render PostgreSQL dashboard
2. อัปเดต `DATABASE_URL` ให้ตรงกับ database name ที่ถูกต้อง

## ตรวจสอบ Logs

ใน Render Dashboard:
1. ไปที่ Web Service ของคุณ
2. คลิกแท็บ "Logs"
3. ดู logs เพื่อตรวจสอบ:
   - DATABASE_URL ที่ถูกใช้ (password จะถูก mask)
   - การเชื่อมต่อ database
   - Errors ที่เกิดขึ้น

## Best Practices

1. **ใช้ Internal Database URL**: ถ้า database อยู่ใน Render เดียวกัน ใช้ Internal URL เพื่อความปลอดภัยและประสิทธิภาพ
2. **อย่า commit `.env`**: เก็บ environment variables ใน Render Dashboard เท่านั้น
3. **ใช้ Environment Variables**: อย่า hardcode credentials ใน code
4. **ตรวจสอบ Logs**: ดู logs เป็นประจำเพื่อตรวจสอบปัญหา
5. **Backup Database**: ตั้งค่า automatic backups ใน Render PostgreSQL

## ตัวอย่าง DATABASE_URL

### Internal Database URL (แนะนำ)
```
postgresql://postgres:password@dpg-xxxxx-a.oregon-postgres.render.com:5432/profiledb?schema=public
```

### External Database URL
```
postgresql://postgres:password@dpg-xxxxx-a.oregon-postgres.render.com:5432/profiledb?schema=public&sslmode=require
```

## สรุป

หลังจากการ deploy สำเร็จ:
- ✅ Database connection จะใช้ `DATABASE_URL` จาก Render environment variables
- ✅ Prisma Client จะถูกสร้างที่ runtime ด้วย database URL ที่ถูกต้อง
- ✅ Migrations จะรันอัตโนมัติก่อนเริ่มแอปพลิเคชัน
- ✅ Error messages จะช่วยในการ debug ปัญหา

## ข้อมูลเพิ่มเติม

- [Render Documentation](https://render.com/docs)
- [Prisma Deployment Guide](https://www.prisma.io/docs/guides/deployment)
- [NestJS Production](https://docs.nestjs.com/recipes/prisma)


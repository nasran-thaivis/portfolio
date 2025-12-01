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

   | Key | Value | จำเป็น | หมายเหตุ |
   |-----|-------|--------|----------|
   | `DATABASE_URL` | Internal Database URL จาก PostgreSQL service | ✅ จำเป็น | **สำคัญมาก** - ต้องไม่ใช่ localhost |
   | `NODE_ENV` | `production` | ⚠️ แนะนำ | ช่วยให้แอปพลิเคชันทำงานในโหมด production |
   | `PORT` | `3001` (หรือ port ที่ Render กำหนดให้) | ❌ ไม่จำเป็น | Render จะกำหนดให้อัตโนมัติ |
   | `CORS_ORIGIN` | URL ของ frontend (ถ้ามี) | ❌ ไม่จำเป็น | สำหรับอนุญาต CORS requests |

**วิธีหา Internal Database URL:**
1. ไปที่ Render Dashboard → PostgreSQL Service ของคุณ
2. ในหน้า "Info" จะมี "Internal Database URL" และ "External Database URL"
3. คัดลอก **Internal Database URL** (แนะนำให้ใช้ Internal เพราะปลอดภัยกว่าและเร็วกว่า)
4. วาง URL นั้นใน `DATABASE_URL` environment variable

**สำคัญ:** 
- ✅ ใช้ **Internal Database URL** ถ้า database อยู่ใน Render เดียวกัน (แนะนำ)
- ⚠️ ใช้ **External Database URL** ถ้า database อยู่คนละ service หรือ external
- ❌ **ห้ามใช้** URL ที่มี `localhost` หรือ `127.0.0.1` ใน production
- ✅ URL ต้องมีรูปแบบ: `postgresql://username:password@host:port/database?schema=public`

**ตรวจสอบว่า DATABASE_URL ถูกต้อง:**
- URL ต้องเริ่มต้นด้วย `postgresql://` หรือ `postgres://`
- URL ต้องมี `@` และ `/` ในนั้น
- URL ต้องไม่包含 `localhost` หรือ `127.0.0.1`
- Host ควรเป็น Render database host (เช่น `dpg-xxxxx-a.oregon-postgres.render.com`)

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
1. ไปที่ Render Dashboard → Web Service ของคุณ → แท็บ "Environment"
2. ตรวจสอบว่า `DATABASE_URL` ถูกตั้งค่าไว้
3. ถ้ายังไม่ได้ตั้งค่า หรือตั้งค่าผิด:
   - ไปที่ Render Dashboard → PostgreSQL Service ของคุณ
   - คัดลอก **Internal Database URL** (ไม่ใช่ External)
   - วาง URL นั้นใน `DATABASE_URL` environment variable ของ Web Service
4. ตรวจสอบว่า URL ไม่มี `localhost` หรือ `127.0.0.1` ในนั้น
5. รูปแบบ URL ที่ถูกต้อง: `postgresql://username:password@host:port/database?schema=public`
6. หลังจากแก้ไขแล้ว ให้ทำ Manual Deploy ใหม่

**ตัวอย่าง URL ที่ถูกต้อง:**
```
postgresql://postgres:password123@dpg-xxxxx-a.oregon-postgres.render.com:5432/profiledb?schema=public
```

**ตัวอย่าง URL ที่ผิด (จะไม่ทำงาน):**
```
postgresql://postgres:password@localhost:5432/profiledb?schema=public
postgresql://postgres:password@127.0.0.1:5432/profiledb?schema=public
```

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
4. ตรวจสอบว่า `DATABASE_URL` ชี้ไปที่ database ที่ถูกต้อง
5. ดู logs ใน Render Dashboard เพื่อดู error message ที่ละเอียดขึ้น

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
3. ตรวจสอบว่า URL ที่คัดลอกมาจาก Render เป็น Internal Database URL ที่ถูกต้อง

### ปัญหา: Process terminated (SIGTERM)

**สาเหตุ:** Process ถูก terminate เนื่องจาก error ในการเริ่มต้นแอปพลิเคชัน

**วิธีแก้:**
1. ตรวจสอบ logs ใน Render Dashboard เพื่อดู error ที่เกิดขึ้นก่อน SIGTERM
2. ปัญหาส่วนใหญ่มักเกิดจาก:
   - DATABASE_URL ไม่ถูกต้อง (ชี้ไปที่ localhost)
   - Database connection ล้มเหลว
   - Migration failed
3. แก้ไขปัญหาตาม error message ที่แสดงใน logs
4. ตรวจสอบว่า `start:prod` script รันสำเร็จทุกขั้นตอน

### ปัญหา: No open ports detected

**สาเหตุ:** แอปพลิเคชันไม่ bind ไปที่ port ที่ Render กำหนดให้

**วิธีแก้:**
1. ตรวจสอบว่า `main.ts` ใช้ `process.env.PORT` แทน hardcoded port
2. Render จะกำหนด PORT ให้อัตโนมัติผ่าน environment variable
3. ตรวจสอบว่าแอปพลิเคชัน listen ที่ port ที่ถูกต้อง:
   ```typescript
   const port = process.env.PORT || 3001;
   await app.listen(port);
   ```

## ตรวจสอบ Logs

ใน Render Dashboard:
1. ไปที่ Web Service ของคุณ
2. คลิกแท็บ "Logs"
3. ดู logs เพื่อตรวจสอบ:
   - DATABASE_URL ที่ถูกใช้ (password จะถูก mask)
   - การเชื่อมต่อ database
   - Errors ที่เกิดขึ้น

**สิ่งที่ต้องตรวจสอบใน Logs:**
- ✅ `DATABASE_URL is set: postgresql://...` - ต้องแสดง URL ที่ถูกต้อง (ไม่ใช่ localhost)
- ✅ `Connected to PostgreSQL database` - แสดงว่าการเชื่อมต่อสำเร็จ
- ❌ `Can't reach database server at localhost:5432` - แสดงว่า DATABASE_URL ยังชี้ไปที่ localhost
- ❌ `ERROR: DATABASE_URL contains localhost/127.0.0.1` - แสดงว่า URL ไม่ถูกต้อง

## การตรวจสอบ Environment Variables ก่อน Deploy

คุณสามารถใช้ validation script เพื่อตรวจสอบ environment variables ก่อน deploy:

```bash
cd backend
npm run validate:env
```

Script นี้จะตรวจสอบ:
- ✅ DATABASE_URL ถูกตั้งค่าไว้
- ✅ DATABASE_URL ไม่ชี้ไปที่ localhost (ใน production)
- ✅ DATABASE_URL มีรูปแบบที่ถูกต้อง
- ✅ PORT และ NODE_ENV (ถ้ามี)

**หมายเหตุ:** Script นี้จะไม่แสดง password ใน DATABASE_URL เพื่อความปลอดภัย

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

## Checklist ก่อน Deploy

ก่อน deploy ให้ตรวจสอบ:

- [ ] PostgreSQL database ถูกสร้างบน Render แล้ว
- [ ] Internal Database URL ถูกคัดลอกมาจาก PostgreSQL service
- [ ] `DATABASE_URL` environment variable ถูกตั้งค่าใน Web Service แล้ว
- [ ] `DATABASE_URL` ไม่มี `localhost` หรือ `127.0.0.1`
- [ ] `DATABASE_URL` มีรูปแบบที่ถูกต้อง (`postgresql://...`)
- [ ] `NODE_ENV` ถูกตั้งค่าเป็น `production` (แนะนำ)
- [ ] Build command: `cd backend && npm ci && npm run build`
- [ ] Start command: `cd backend && npm run start:prod`
- [ ] Root directory: `backend` (ถ้า backend อยู่ใน subdirectory)

## สรุป

หลังจากการ deploy สำเร็จ:
- ✅ Database connection จะใช้ `DATABASE_URL` จาก Render environment variables
- ✅ Prisma Client จะถูกสร้างที่ runtime ด้วย database URL ที่ถูกต้อง
- ✅ Migrations จะรันอัตโนมัติก่อนเริ่มแอปพลิเคชัน
- ✅ Error messages จะช่วยในการ debug ปัญหา
- ✅ `start:prod` script จะตรวจสอบและแสดง DATABASE_URL (masked) ใน logs
- ✅ แอปพลิเคชันจะ reject DATABASE_URL ที่ชี้ไปที่ localhost ใน production

## ข้อมูลเพิ่มเติม

- [Render Documentation](https://render.com/docs)
- [Prisma Deployment Guide](https://www.prisma.io/docs/guides/deployment)
- [NestJS Production](https://docs.nestjs.com/recipes/prisma)


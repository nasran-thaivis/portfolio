# Quick Reference Card - การ Deploy

## 📋 Checklist เร็วๆ

### Phase 1: Backend (Render)
- [ ] สร้าง PostgreSQL Database → คัดลอก Internal Database URL
- [ ] สร้าง Web Service → เชื่อมต่อ Git repo
- [ ] ตั้งค่า Environment Variables:
  - `DATABASE_URL` = Internal Database URL
  - `NODE_ENV` = `production`
  - `CORS_ORIGIN` = `https://your-app.vercel.app` (ชั่วคราว)
- [ ] Deploy → บันทึก Backend URL

### Phase 2: Frontend (Vercel)
- [ ] เชื่อมต่อ Git Repository
- [ ] ตั้งค่า Environment Variables:
  - `NEXT_PUBLIC_API_URL` = Backend URL จาก Render
  - `NEXT_PUBLIC_SITE_URL` = `https://your-app.vercel.app` (ชั่วคราว)
  - `NEXTAUTH_SECRET` = `0EDCZX+PZN5nYqfWZY562IhWR8kYf5OEIYagUJwrJ6c=`
  - `NEXTAUTH_URL` = `https://your-app.vercel.app` (ชั่วคราว)
- [ ] Deploy → บันทึก Frontend URL

### Phase 3: อัปเดต Configuration
- [ ] อัปเดต `CORS_ORIGIN` ใน Backend = Frontend URL จริง
- [ ] อัปเดต `NEXT_PUBLIC_SITE_URL` ใน Frontend = Frontend URL จริง
- [ ] อัปเดต `NEXTAUTH_URL` ใน Frontend = Frontend URL จริง
- [ ] Redeploy ทั้งสอง

---

## 🔗 URLs ที่ต้องบันทึก

```
Backend URL:  https://________________.onrender.com
Frontend URL: https://________________.vercel.app
Database URL: postgresql://________________ (เก็บเป็นความลับ)
```

---

## ⚙️ Environment Variables

### Backend (Render)
```env
DATABASE_URL=postgresql://postgres:pass@dpg-xxx.render.com:5432/db?schema=public
NODE_ENV=production
CORS_ORIGIN=https://your-app.vercel.app
```

### Frontend (Vercel)
```env
NEXT_PUBLIC_API_URL=https://your-backend.onrender.com
NEXT_PUBLIC_SITE_URL=https://your-app.vercel.app
NEXTAUTH_SECRET=0EDCZX+PZN5nYqfWZY562IhWR8kYf5OEIYagUJwrJ6c=
NEXTAUTH_URL=https://your-app.vercel.app
```

---

## 🛠️ Commands

### สร้าง NEXTAUTH_SECRET
```bash
openssl rand -base64 32
```

### ตรวจสอบ Deployment
```bash
./scripts/check-deployment.sh [backend-url] [frontend-url]
```

### ทดสอบ Backend
```bash
curl https://your-backend.onrender.com/api
```

---

## 📚 เอกสารเพิ่มเติม

- **คู่มือละเอียด**: `DEPLOYMENT_STEP_BY_STEP.md`
- **Template Environment Variables**: `ENV_VARIABLES_TEMPLATE.md`
- **Documentation เดิม**: `DEPLOYMENT.md`, `backend/DEPLOYMENT.md`

---

## ⚠️ สิ่งที่ต้องระวัง

1. **DATABASE_URL**: ต้องใช้ Internal Database URL (ไม่ใช่ localhost)
2. **CORS_ORIGIN**: ต้องตรงกับ Frontend URL เป๊ะ (รวม `https://`)
3. **NEXT_PUBLIC_API_URL**: ไม่ต้องใส่ trailing slash (`/`)
4. **Deploy Backend ก่อน**: เพื่อให้ได้ URL สำหรับตั้งค่า Frontend

---

## 🐛 Troubleshooting เร็วๆ

| ปัญหา | วิธีแก้ |
|-------|---------|
| Database connection failed | ตรวจสอบ DATABASE_URL ไม่ใช่ localhost |
| CORS Error | ตรวจสอบ CORS_ORIGIN ตรงกับ Frontend URL |
| API calls fail | ตรวจสอบ NEXT_PUBLIC_API_URL ถูกต้อง |
| Build fails | ดู logs ใน Render/Vercel Dashboard |


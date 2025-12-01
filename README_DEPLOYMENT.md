# 🚀 คู่มือการ Deploy Website

## เริ่มต้นที่นี่!

เอกสารนี้จะช่วยคุณ deploy website ทั้ง frontend และ backend ไปยัง Render และ Vercel

## 📚 เอกสารที่แนะนำ

### สำหรับผู้เริ่มต้น
👉 **เริ่มจาก**: [`DEPLOYMENT_STEP_BY_STEP.md`](./DEPLOYMENT_STEP_BY_STEP.md)
- คู่มือละเอียดทุกขั้นตอน พร้อมคำอธิบาย
- เหมาะสำหรับผู้ที่เพิ่งเริ่ม deploy

### สำหรับผู้ที่ต้องการดูเร็วๆ
👉 **ใช้**: [`DEPLOYMENT_QUICK_REFERENCE.md`](./DEPLOYMENT_QUICK_REFERENCE.md)
- Checklist เร็วๆ
- Environment variables template
- Commands ที่ใช้บ่อย

### สำหรับดูสรุปสถานะ
👉 **ดู**: [`DEPLOYMENT_SUMMARY.md`](./DEPLOYMENT_SUMMARY.md)
- สรุปสิ่งที่ทำเสร็จแล้ว
- สิ่งที่ต้องทำต่อไป
- Links ไปยังเอกสารอื่นๆ

### สำหรับ Environment Variables
👉 **ใช้**: [`ENV_VARIABLES_TEMPLATE.md`](./ENV_VARIABLES_TEMPLATE.md)
- Template สำหรับ copy-paste
- คำอธิบายแต่ละตัวแปร
- Troubleshooting

## 🛠️ Tools

### Script สำหรับตรวจสอบ Deployment
```bash
./scripts/check-deployment.sh [backend-url] [frontend-url]
```

ตัวอย่าง:
```bash
./scripts/check-deployment.sh https://profile-backend.onrender.com https://your-app.vercel.app
```

## 📋 ขั้นตอนคร่าวๆ

1. **Deploy Backend บน Render**
   - สร้าง PostgreSQL Database
   - สร้าง Web Service
   - ตั้งค่า Environment Variables
   - Deploy

2. **Deploy Frontend บน Vercel**
   - เชื่อมต่อ Repository
   - ตั้งค่า Environment Variables
   - Deploy

3. **อัปเดต Configuration**
   - อัปเดต CORS ใน Backend
   - อัปเดต URLs ใน Frontend

4. **ตรวจสอบ**
   - ทดสอบ endpoints
   - ตรวจสอบ CORS
   - ทดสอบ integration

## ⚡ Quick Start

1. อ่าน [`DEPLOYMENT_STEP_BY_STEP.md`](./DEPLOYMENT_STEP_BY_STEP.md)
2. ทำตาม Phase 2 (Backend)
3. ทำตาม Phase 3 (Frontend)
4. ทำตาม Phase 4 (Post-Deployment)
5. ใช้ `scripts/check-deployment.sh` เพื่อตรวจสอบ

## 📖 เอกสารเพิ่มเติม

- [`DEPLOYMENT.md`](./DEPLOYMENT.md) - Documentation เดิม (ยังใช้ได้)
- [`backend/DEPLOYMENT.md`](./backend/DEPLOYMENT.md) - Backend deployment guide
- [`ENV_SETUP.md`](./ENV_SETUP.md) - Environment variables setup สำหรับ local development

## 🆘 ต้องการความช่วยเหลือ?

1. ตรวจสอบ [`DEPLOYMENT_STEP_BY_STEP.md`](./DEPLOYMENT_STEP_BY_STEP.md) ส่วน Troubleshooting
2. ตรวจสอบ logs ใน Render Dashboard (สำหรับ backend)
3. ตรวจสอบ logs ใน Vercel Dashboard (สำหรับ frontend)
4. ใช้ `scripts/check-deployment.sh` เพื่อตรวจสอบปัญหา

---

**พร้อมเริ่ม Deploy แล้ว!** 🎉


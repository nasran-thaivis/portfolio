import { defineConfig } from 'prisma/config';
import * as dotenv from 'dotenv';
import * as path from 'path';
import * as fs from 'fs';

// โหลด .env file จากหลายๆ path ที่เป็นไปได้
const possiblePaths = [
  path.resolve(process.cwd(), '.env'), // จาก current working directory
  path.resolve(process.cwd(), '../.env'), // จาก parent directory
  path.resolve(__dirname, '../../.env'), // จาก backend/prisma/.env
  path.resolve(__dirname, '../../../.env'), // จาก root ของโปรเจค
];

for (const envPath of possiblePaths) {
  if (fs.existsSync(envPath)) {
    dotenv.config({ path: envPath });
    break;
  }
}

// ถ้ายังไม่เจอ ลองโหลดจาก default location
dotenv.config();

// ตรวจสอบว่า DATABASE_URL ถูกตั้งค่าหรือไม่
// สำหรับ build-time อาจจะไม่มี DATABASE_URL (จะใช้ dummy URL)
const databaseUrl = process.env.DATABASE_URL || 'postgresql://dummy:dummy@localhost:5432/dummy';

// แสดง warning ถ้าไม่มี DATABASE_URL (แต่ไม่ exit เพื่อให้ build ผ่านได้)
if (!process.env.DATABASE_URL) {
  console.warn('⚠️ WARNING: DATABASE_URL is not set! Using dummy URL for build-time generation.');
  console.warn('DATABASE_URL will be required at runtime.');
}

// ตรวจสอบ provider จาก DATABASE_URL
const getProvider = (url: string): 'postgresql' | 'mysql' => {
  if (url.startsWith('postgresql://') || url.startsWith('postgres://')) {
    return 'postgresql';
  }
  if (url.startsWith('mysql://')) {
    return 'mysql';
  }
  // default เป็น postgresql
  return 'postgresql';
};

export default defineConfig({
  datasource: {
    provider: getProvider(databaseUrl),
    url: databaseUrl,
  },
});


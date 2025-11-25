import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // Seed User
  // สร้าง user เดียวสำหรับ login
  const mainUser = await prisma.user.upsert({
    where: { email: 'nasran1@gmail.com' },
    update: {
      password: 'Nasran1', // อัปเดตรหัสผ่านเพื่อให้สามารถ login ได้
    },
    create: {
      email: 'nasran1@gmail.com',
      name: 'Nasran',
      username: 'nasran1',
      password: 'Nasran1', // ⚠️ In production, hash this
    },
  });
  
  // Log username ของ user เพื่อ debug
  console.log('📝 User username:', mainUser.username);

  console.log('✅ Created/Updated user:', mainUser);

  // Seed Contact Requests
  // ใช้ upsert เพื่อป้องกัน error เมื่อรัน seed ซ้ำ และต้องระบุ userId
  const contact1 = await prisma.contactRequest.upsert({
    where: {
      // ใช้ email + name เป็น unique identifier (ถ้า schema รองรับ)
      // หรือใช้ id ถ้ามีอยู่แล้ว แต่เนื่องจากเรา seed ใหม่ ให้ใช้ create แล้วจัดการ error
      id: '00000000-0000-0000-0000-000000000001', // ใช้ fixed ID สำหรับ seed
    },
    update: {
      // อัปเดตข้อมูลถ้ามีอยู่แล้ว
      name: 'Jane Smith',
      email: 'jane@example.com',
      message: 'Hello! I am interested in your services.',
      status: 'new',
      userId: mainUser.id, // ใช้ user ID จาก mainUser
    },
    create: {
      id: '00000000-0000-0000-0000-000000000001', // ใช้ fixed ID สำหรับ seed
      name: 'Jane Smith',
      email: 'jane@example.com',
      message: 'Hello! I am interested in your services.',
      status: 'new',
      userId: mainUser.id, // ใช้ user ID จาก mainUser
    },
  });

  const contact2 = await prisma.contactRequest.upsert({
    where: {
      id: '00000000-0000-0000-0000-000000000002', // ใช้ fixed ID สำหรับ seed
    },
    update: {
      name: 'Bob Johnson',
      email: 'bob@example.com',
      message: 'Can you help me with my project?',
      status: 'new',
      userId: mainUser.id, // ใช้ user ID จาก mainUser
    },
    create: {
      id: '00000000-0000-0000-0000-000000000002', // ใช้ fixed ID สำหรับ seed
      name: 'Bob Johnson',
      email: 'bob@example.com',
      message: 'Can you help me with my project?',
      status: 'new',
      userId: mainUser.id, // ใช้ user ID จาก mainUser
    },
  });

  console.log('✅ Created/Updated contact requests:', { contact1, contact2 });

  console.log('🎉 Database seed completed!');
}

main()
  .catch((e) => {
    console.error('❌ Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });


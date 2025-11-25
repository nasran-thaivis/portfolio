import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET: ดึงข้อมูล
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const username = searchParams.get("username");

    if (!username) return NextResponse.json({ message: "Username required" }, { status: 400 });

    const user = await prisma.user.findUnique({
      where: { username: username },
      include: { heroSection: true },
    });

    return NextResponse.json(user?.heroSection || {});
  } catch (error: any) {
    console.error("[GET Error]", error);
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}

// PATCH: บันทึกข้อมูล (เวอร์ชัน Debug)
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { username, title, description, imageUrl } = body;

    if (!username) {
      return NextResponse.json({ message: "Username is required" }, { status: 400 });
    }

    const safeUsername = String(username);

    // 1. หา User หรือ สร้างใหม่
    let user = await prisma.user.findUnique({
      where: { username: safeUsername },
    });

    if (!user) {
      console.log(`Creating new user: ${safeUsername}`);
      try {
        user = await prisma.user.create({
          data: {
            username: safeUsername,
            name: safeUsername,
            // ใส่ random string ต่อท้ายกัน email ซ้ำ (เผื่อกรณีลบ user แล้วสร้างใหม่)
            email: `${safeUsername}_${Date.now()}@example.com`, 
            password: "auto-pass-dummy", 
          },
        });
      } catch (createError: any) {
        // ถ้าสร้าง User ไม่ผ่าน ให้ส่ง Error กลับไปบอกทันที
        console.error("Create User Error:", createError);
        return NextResponse.json(
            { message: `สร้าง User ไม่ได้: ${createError.message}` }, 
            { status: 500 }
        );
      }
    }

    // 2. อัปเดต HeroSection
    const updatedHeroSection = await prisma.heroSection.upsert({
      where: { userId: user.id },
      update: { title, description, imageUrl },
      create: { userId: user.id, title, description, imageUrl },
    });

    return NextResponse.json(updatedHeroSection);

  } catch (error: any) {
    console.error("Server Error:", error);
    // ส่งข้อความ Error จริงๆ กลับไปที่หน้าเว็บ
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
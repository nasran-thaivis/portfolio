import { Injectable } from '@nestjs/common';
import { CreateHeroSectionDto } from './dto/create-hero-section.dto';
import { UpdateHeroSectionDto } from './dto/update-hero-section.dto';
import { PrismaService } from '../prisma/prisma.service';
import { UploadService } from '../upload/upload.service';

@Injectable()
export class HeroSectionService {
  constructor(
    private prisma: PrismaService,
    private uploadService: UploadService,
  ) {}

  // 1. ดึงข้อมูล Hero (ถ้าไม่มี ให้สร้าง Default ให้เลย)
  async findOne(userId?: string, username?: string) {
    let hero;
    
    if (userId) {
      // Find by userId
      hero = await this.prisma.heroSection.findUnique({
        where: { userId },
      });
    } else if (username) {
      // Find by username
      const user = await this.prisma.user.findUnique({
        where: { username },
        include: { heroSection: true },
      });
      hero = user?.heroSection;
    }

    let result;
    if (!hero) {
      // ถ้ายังไม่มีใน DB ให้สร้างค่าเริ่มต้นให้
      if (!userId && username) {
        // Get userId from username
        const user = await this.prisma.user.findUnique({
          where: { username },
        });
        if (user) userId = user.id;
      }
      
      if (userId) {
        result = await this.prisma.heroSection.create({
          data: {
            userId,
            title: 'Welcome',
            description: 'This is my portfolio',
            imageUrl: 'https://placehold.co/1920x1080',
          },
        });
      } else {
        // Return default if no user found
        return {
          title: 'Welcome',
          description: 'This is my portfolio',
          imageUrl: 'https://placehold.co/1920x1080',
        };
      }
    } else {
      result = hero;
    }

    // แปลง imageUrl เป็น proxy URL ถ้ามี
    if (result.imageUrl) {
      result.imageUrl = this.uploadService.getProxyUrl(result.imageUrl);
    }

    return result;
  }

  // 2. อัปเดตข้อมูล Hero (ใช้ upsert: มีก็แก้ ไม่มีก็สร้าง)
  // userId อาจจะเป็น userId จริงๆ (UUID หรือ timestamp string) หรือ username (fallback mode)
  async update(userIdOrUsername: string, updateHeroSectionDto: UpdateHeroSectionDto) {
    let userId = userIdOrUsername;
    
    // ตรวจสอบว่าเป็น UUID หรือไม่ (UUID มีรูปแบบ xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx)
    const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(userIdOrUsername);
    
    if (!isUUID) {
      // ถ้าไม่ใช่ UUID อาจจะเป็น:
      // 1. userId ที่เป็น timestamp string (เช่น "1763975423916") - ใช้โดยตรง
      // 2. username - ต้องหา userId จาก database
      
      // ตรวจสอบว่าเป็นตัวเลขทั้งหมด (น่าจะเป็น timestamp ID)
      const isNumericId = /^\d+$/.test(userIdOrUsername);
      
      if (isNumericId) {
        // เป็น numeric ID (timestamp) - ใช้โดยตรง
        console.log(`[HeroSectionService] Using numeric userId: ${userIdOrUsername}`);
        userId = userIdOrUsername;
      } else {
        // น่าจะเป็น username - หา userId จาก database
        console.log(`[HeroSectionService] Looking up userId for username: ${userIdOrUsername}`);
        const user = await this.prisma.user.findUnique({
          where: { username: userIdOrUsername },
          select: { id: true },
        });
        
        if (!user) {
          throw new Error(`User with username "${userIdOrUsername}" not found in database. Please make sure the user exists.`);
        }
        
        userId = user.id;
        console.log(`[HeroSectionService] Found userId: ${userId} for username: ${userIdOrUsername}`);
      }
    } else {
      // เป็น UUID - ใช้โดยตรง
      console.log(`[HeroSectionService] Using UUID userId: ${userIdOrUsername}`);
    }

    // แปลง proxy URL กลับเป็น path ก่อนบันทึกลง database
    const normalizedData = {
      ...updateHeroSectionDto,
      imageUrl: updateHeroSectionDto.imageUrl !== undefined
        ? (updateHeroSectionDto.imageUrl 
            ? this.uploadService.normalizeImageUrl(updateHeroSectionDto.imageUrl)
            : updateHeroSectionDto.imageUrl)
        : undefined,
    };

    const result = await this.prisma.heroSection.upsert({
      where: { userId },
      update: normalizedData,
      create: {
        userId,
        title: 'Welcome',
        description: 'This is my portfolio',
        ...normalizedData,
      },
    });

    // แปลง path เป็น proxy URL เมื่อ return ให้ frontend
    if (result.imageUrl) {
      result.imageUrl = this.uploadService.getProxyUrl(result.imageUrl);
    }

    return result;
  }
}

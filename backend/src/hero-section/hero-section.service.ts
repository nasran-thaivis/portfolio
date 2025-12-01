import { Injectable } from '@nestjs/common';
import { CreateHeroSectionDto } from './dto/create-hero-section.dto';
import { UpdateHeroSectionDto } from './dto/update-hero-section.dto';
import { PrismaService } from '../prisma/prisma.service';
import { UploadService } from '../upload/upload.service';
import { UsersService } from '../users/users.service';

@Injectable()
export class HeroSectionService {
  constructor(
    private prisma: PrismaService,
    private uploadService: UploadService,
    private usersService: UsersService,
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
  // userId อาจจะเป็น userId จริงๆ (UUID, CUID, หรือ timestamp string) หรือ username (fallback mode)
  async update(userIdOrUsername: string, updateHeroSectionDto: UpdateHeroSectionDto) {
    // Ensure user exists in database (create if not exists)
    const user = await this.usersService.ensureUserExists(userIdOrUsername);
    const userId = user.id;

    console.log(`[HeroSectionService] Updating hero section for userId: ${userId} (from: ${userIdOrUsername})`);

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

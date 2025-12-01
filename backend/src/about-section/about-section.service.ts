import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { CreateAboutSectionDto } from './dto/create-about-section.dto';
import { PrismaService } from '../prisma/prisma.service';
import { UploadService } from '../upload/upload.service';
import { UsersService } from '../users/users.service';

@Injectable()
export class AboutSectionService {
  constructor(
    private prisma: PrismaService,
    private uploadService: UploadService,
    private usersService: UsersService,
  ) {}

  // 1. ดึงข้อมูล (ถ้าไม่มี ให้สร้าง Default)
  async findOne(userId?: string, username?: string) {
    let about;
    
    if (userId) {
      // Find by userId
      about = await this.prisma.aboutSection.findUnique({
        where: { userId },
      });
    } else if (username) {
      // Find by username
      const user = await this.prisma.user.findUnique({
        where: { username },
        include: { aboutSection: true },
      });
      about = user?.aboutSection;
    }

    let result;
    if (!about) {
      // ถ้ายังไม่มีใน DB ให้สร้างค่าเริ่มต้นให้
      if (!userId && username) {
        // Get userId from username
        const user = await this.prisma.user.findUnique({
          where: { username },
        });
        if (user) userId = user.id;
      }
      
      if (userId) {
        result = await this.prisma.aboutSection.create({
          data: {
            userId,
            title: 'About Me',
            description: 'I am a passionate developer...',
            imageUrl: 'https://placehold.co/600x400',
          },
        });
      } else {
        // Return default if no user found
        return {
          title: 'About Me',
          description: 'I am a passionate developer...',
          imageUrl: 'https://placehold.co/600x400',
        };
      }
    } else {
      result = about;
    }

    // แปลง imageUrl เป็น proxy URL ถ้ามี
    if (result.imageUrl) {
      result.imageUrl = this.uploadService.getProxyUrl(result.imageUrl);
    }

    return result;
  }

  // 2. อัปเดตข้อมูล (Upsert)
  // userId อาจจะเป็น userId จริงๆ (UUID, CUID, หรือ timestamp string) หรือ username (fallback mode)
  async update(userIdOrUsername: string, createAboutSectionDto: CreateAboutSectionDto) {
    try {
      // Ensure user exists in database (create if not exists)
      const user = await this.usersService.ensureUserExists(userIdOrUsername);
      const userId = user.id;

      console.log(`[AboutSectionService] Updating about section for userId: ${userId} (from: ${userIdOrUsername})`);

      // แปลง proxy URL กลับเป็น path ก่อนบันทึกลง database
      let normalizedImageUrl = createAboutSectionDto.imageUrl;
      if (createAboutSectionDto.imageUrl !== undefined && createAboutSectionDto.imageUrl) {
        try {
          normalizedImageUrl = this.uploadService.normalizeImageUrl(createAboutSectionDto.imageUrl);
        } catch (error) {
          console.warn(`[AboutSectionService] Failed to normalize imageUrl: ${createAboutSectionDto.imageUrl}`, error);
          // ถ้า normalize ไม่ได้ ให้ใช้ค่าเดิม
          normalizedImageUrl = createAboutSectionDto.imageUrl;
        }
      }

      const normalizedData = {
        ...createAboutSectionDto,
        imageUrl: normalizedImageUrl,
      };

      const result = await this.prisma.aboutSection.upsert({
        where: { userId },
        update: normalizedData,
        create: {
          userId,
          ...normalizedData,
        },
      });

      // แปลง path เป็น proxy URL เมื่อ return ให้ frontend
      if (result.imageUrl) {
        try {
          result.imageUrl = this.uploadService.getProxyUrl(result.imageUrl);
        } catch (error) {
          console.warn(`[AboutSectionService] Failed to get proxy URL for: ${result.imageUrl}`, error);
          // ถ้าแปลงไม่ได้ ให้ใช้ค่าเดิม
        }
      }

      return result;
    } catch (error: any) {
      console.error('[AboutSectionService] Error in update:', error);
      // Re-throw NestJS exceptions as-is
      if (error instanceof NotFoundException || error instanceof BadRequestException) {
        throw error;
      }
      // For Prisma errors, wrap in BadRequestException
      if (error.code && error.code.startsWith('P')) {
        throw new BadRequestException(`Database error: ${error.message || error}`);
      }
      // For other errors, wrap in BadRequestException with clear message
      throw new BadRequestException(`Failed to update about section: ${error.message || error}`);
    }
  }
}
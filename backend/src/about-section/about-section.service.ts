import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { CreateAboutSectionDto } from './dto/create-about-section.dto';
import { PrismaService } from '../prisma/prisma.service';
import { UploadService } from '../upload/upload.service';

@Injectable()
export class AboutSectionService {
  constructor(
    private prisma: PrismaService,
    private uploadService: UploadService,
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
      let userId = userIdOrUsername;
      
      // ตรวจสอบว่าเป็น UUID หรือไม่ (UUID มีรูปแบบ xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx)
      const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(userIdOrUsername);
      
      if (!isUUID) {
        // ตรวจสอบว่าเป็น CUID หรือไม่ (CUID มีรูปแบบ c + 24 alphanumeric characters)
        const isCUID = /^c[a-z0-9]{24}$/i.test(userIdOrUsername);
        
        if (isCUID) {
          // เป็น CUID - ใช้โดยตรง
          console.log(`[AboutSectionService] Using CUID userId: ${userIdOrUsername}`);
          userId = userIdOrUsername;
        } else {
          // ถ้าไม่ใช่ UUID หรือ CUID อาจจะเป็น:
          // 1. userId ที่เป็น timestamp string (เช่น "1763975423916") - ใช้โดยตรง
          // 2. username - ต้องหา userId จาก database
          
          // ตรวจสอบว่าเป็นตัวเลขทั้งหมด (น่าจะเป็น timestamp ID)
          const isNumericId = /^\d+$/.test(userIdOrUsername);
          
          if (isNumericId) {
            // เป็น numeric ID (timestamp) - ใช้โดยตรง
            console.log(`[AboutSectionService] Using numeric userId: ${userIdOrUsername}`);
            userId = userIdOrUsername;
          } else {
            // น่าจะเป็น username - หา userId จาก database
            console.log(`[AboutSectionService] Looking up userId for username: ${userIdOrUsername}`);
            const user = await this.prisma.user.findUnique({
              where: { username: userIdOrUsername },
              select: { id: true },
            });
            
            if (!user) {
              throw new NotFoundException(`User with username "${userIdOrUsername}" not found in database. Please make sure the user exists.`);
            }
            
            userId = user.id;
            console.log(`[AboutSectionService] Found userId: ${userId} for username: ${userIdOrUsername}`);
          }
        }
      } else {
        // เป็น UUID - ใช้โดยตรง
        console.log(`[AboutSectionService] Using UUID userId: ${userIdOrUsername}`);
      }

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
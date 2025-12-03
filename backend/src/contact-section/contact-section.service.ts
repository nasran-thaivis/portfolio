import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { CreateContactSectionDto } from './dto/create-contact-section.dto';
import { PrismaService } from '../prisma/prisma.service';
import { UsersService } from '../users/users.service';

@Injectable()
export class ContactSectionService {
  constructor(
    private prisma: PrismaService,
    private usersService: UsersService,
  ) {}

  // 1. ดึงข้อมูล (ถ้าไม่มี ให้สร้าง Default)
  async findOne(userId?: string, username?: string) {
    try {
      let contact;
      
      if (userId) {
        // Find by userId
        contact = await this.prisma.contactSection.findUnique({
          where: { userId },
        });
      } else if (username) {
        // Find by username
        const user = await this.prisma.user.findUnique({
          where: { username },
          include: { contactSection: true },
        });
        contact = user?.contactSection;
      }

      let result;
      if (!contact) {
        // ถ้ายังไม่มีใน DB ให้สร้างค่าเริ่มต้นให้
        if (!userId && username) {
          // Get userId from username
          const user = await this.prisma.user.findUnique({
            where: { username },
          });
          if (user) userId = user.id;
        }
        
        if (userId) {
          try {
            result = await this.prisma.contactSection.create({
              data: {
                userId,
                phone: '062-209-5297',
                email: null, // จะใช้ email จาก User model แทน
              },
            });
          } catch (createError: any) {
            // If create fails (e.g., duplicate key), try to fetch again
            if (createError.code === 'P2002') {
              contact = await this.prisma.contactSection.findUnique({
                where: { userId },
              });
              result = contact;
            } else {
              throw createError;
            }
          }
        } else {
          // Return default if no user found
          return {
            phone: '062-209-5297',
            email: null,
          };
        }
      } else {
        result = contact;
      }

      return result;
    } catch (error: any) {
      console.error('[ContactSectionService] Error in findOne:', error);
      
      // Re-throw NestJS exceptions as-is
      if (error instanceof NotFoundException || error instanceof BadRequestException) {
        throw error;
      }
      
      // For Prisma errors, wrap in BadRequestException
      if (error.code && error.code.startsWith('P')) {
        throw new BadRequestException(`Database error: ${error.message || error}`);
      }
      
      // For other errors, return default data instead of throwing
      // This allows the frontend to still render the page
      console.warn('[ContactSectionService] Returning default contact data due to error');
      return {
        phone: '062-209-5297',
        email: null,
      };
    }
  }

  // 2. อัปเดตข้อมูล (Upsert)
  async update(userIdOrUsername: string, createContactSectionDto: CreateContactSectionDto) {
    try {
      // Ensure user exists in database (create if not exists)
      const user = await this.usersService.ensureUserExists(userIdOrUsername);
      const userId = user.id;

      console.log(`[ContactSectionService] Updating contact section for userId: ${userId} (from: ${userIdOrUsername})`);

      const result = await this.prisma.contactSection.upsert({
        where: { userId },
        update: createContactSectionDto,
        create: {
          userId,
          ...createContactSectionDto,
        },
      });

      return result;
    } catch (error: any) {
      console.error('[ContactSectionService] Error in update:', error);
      // Re-throw NestJS exceptions as-is
      if (error instanceof NotFoundException || error instanceof BadRequestException) {
        throw error;
      }
      // For Prisma errors, wrap in BadRequestException
      if (error.code && error.code.startsWith('P')) {
        throw new BadRequestException(`Database error: ${error.message || error}`);
      }
      // For other errors, wrap in BadRequestException with clear message
      throw new BadRequestException(`Failed to update contact section: ${error.message || error}`);
    }
  }
}


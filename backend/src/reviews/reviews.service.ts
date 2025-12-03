import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { CreateReviewDto } from './dto/create-review.dto';
import { PrismaService } from '../prisma/prisma.service';
import { UploadService } from '../upload/upload.service';
import { UsersService } from '../users/users.service';

@Injectable()
export class ReviewsService {
  constructor(
    private prisma: PrismaService,
    private uploadService: UploadService,
    private usersService: UsersService,
  ) {}

  /**
   * สร้าง Review โดยรองรับทั้ง userId และ username
   * - identifier อาจเป็น userId จริง, username, หรือค่าอื่นจาก Admin Dashboard
   * - ใช้ UsersService.ensureUserExists() เพื่อหา/สร้าง user ใน DB ก่อน
   */
  async create(identifier: string, createReviewDto: CreateReviewDto) {
    // Ensure user exists in database (create if not exists)
    const user = await this.usersService.ensureUserExists(identifier);
    const userId = user.id;

    console.log(`[ReviewsService] Creating review for userId: ${userId} (from: ${identifier})`);

    // แปลง rating ให้เป็น number เสมอ
    // แปลง proxy URL กลับเป็น path ก่อนบันทึกลง database
    const data = {
      ...createReviewDto,
      userId,
      rating: Number(createReviewDto.rating),
      avatarUrl: createReviewDto.avatarUrl 
        ? this.uploadService.normalizeImageUrl(createReviewDto.avatarUrl)
        : createReviewDto.avatarUrl,
    };
    
    const review = await this.prisma.review.create({ data });

    // แปลง path เป็น proxy URL เมื่อ return ให้ frontend
    if (review.avatarUrl) {
      review.avatarUrl = this.uploadService.getProxyUrl(review.avatarUrl);
    }

    return review;
  }

  async findAll(userId?: string, username?: string) {
    let whereClause: any = {};
    
    if (userId) {
      whereClause.userId = userId;
    } else if (username) {
      const user = await this.prisma.user.findUnique({
        where: { username },
      });
      if (user) {
        whereClause.userId = user.id;
      } else {
        return []; // Return empty if user not found
      }
    }

    const reviews = await this.prisma.review.findMany({
      where: whereClause,
      orderBy: { createdAt: 'desc' },
    });

    return reviews.map((review) => {
      if (review.avatarUrl) {
        review.avatarUrl = this.uploadService.getProxyUrl(review.avatarUrl);
      }
      return review;
    });
  }

  async remove(userId: string, id: string) {
    const review = await this.prisma.review.findUnique({ where: { id } });
    if (!review) {
      throw new NotFoundException('Review not found');
    }
    if (review.userId !== userId) {
      throw new ForbiddenException('Access denied. This review belongs to another user.');
    }
    return this.prisma.review.delete({
      where: { id },
    });
  }
}
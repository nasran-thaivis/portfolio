import { Injectable, NotFoundException } from '@nestjs/common'; // <--- เพิ่ม NotFoundException
import { CreateReviewDto } from './dto/create-review.dto';
import { PrismaService } from '../prisma/prisma.service';
import { UploadService } from '../upload/upload.service';

@Injectable()
export class ReviewsService {
  constructor(
    private prisma: PrismaService,
    private uploadService: UploadService,
  ) {}

  // 1. แก้ type ของ argument แรกจาก userId เป็น username
  async create(username: string, createReviewDto: CreateReviewDto) {
    
    // [ใหม่] ค้นหา User ID จาก username ที่ส่งเข้ามา
    const user = await this.prisma.user.findUnique({
      where: { username: username },
    });

    // ถ้าไม่เจอ user ชื่อนี้ ให้แจ้ง Error กลับไป
    if (!user) {
      throw new NotFoundException(`User with username "${username}" not found`);
    }

    // แปลง rating ให้เป็น number เสมอ (กันเหนียว)
    // แปลง proxy URL กลับเป็น path ก่อนบันทึกลง database
    const data = {
      ...createReviewDto,
      userId: user.id, // <--- [สำคัญ] ใช้ ID ที่เพิ่งหาเจอจาก Database มาใส่แทน
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

  // ... (ส่วน findAll และ remove ปล่อยไว้เหมือนเดิม)
  async findAll(userId?: string, username?: string) {
     // โค้ดเดิมของคุณ...
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
     // โค้ดเดิมของคุณ...
    const review = await this.prisma.review.findUnique({ where: { id } });
    if (!review || review.userId !== userId) {
      throw new Error('Review not found or access denied');
    }
    return this.prisma.review.delete({
      where: { id },
    });
  }
}
import { Controller, Get, Post, Body, Param, Delete, Req, BadRequestException } from '@nestjs/common';
import { ReviewsService } from './reviews.service';
import { CreateReviewDto } from './dto/create-review.dto';
import { CurrentUser } from '../common/decorators/user.decorator';

@Controller('reviews')
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  @Post()
  create(@Body() body: any) {
    // 1. ดึง username และข้อมูล review อื่นๆ ออกมาจาก body
    const { username, ...createReviewDto } = body;

    // 2. เช็คว่าส่ง username มาไหม ถ้าไม่ส่งให้ error
    if (!username) {
      throw new BadRequestException('Username is required to create a review');
    }

    // 3. เรียก Service โดยส่ง username ไปแทน user.id
    // (หมายเหตุ: ต้องแน่ใจว่าแก้ไฟล์ reviews.service.ts ให้รับ username ตามที่คุยกันแล้วนะครับ)
    return this.reviewsService.create(username, createReviewDto);
  }

  @Get()
  findAll(@Req() req: any) {
    const userId = req.user?.id;
    const username = req.query.username as string;
    return this.reviewsService.findAll(userId, username);
  }

  @Delete(':id')
  remove(@CurrentUser() user: any, @Param('id') id: string) {
    // การลบยังคงต้องใช้สิทธิ์เจ้าของ (Login) เหมือนเดิม
    if (!user) {
      throw new Error('Authentication required');
    }
    return this.reviewsService.remove(user.id, id);
  }
}
import { Controller, Get, Post, Body, Param, Delete, Req, BadRequestException, UnauthorizedException } from '@nestjs/common';
import { ReviewsService } from './reviews.service';
import { CreateReviewDto } from './dto/create-review.dto';
import { CurrentUser } from '../common/decorators/user.decorator';

@Controller('reviews')
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  @Post()
  create(@CurrentUser() user: any, @Req() req: any, @Body() body: any) {
    /**
     * รองรับทั้งสองกรณี:
     * 1) มีการ auth ปกติ → ใช้ user.id หรือ user.username จาก CurrentUser
     * 2) มาจาก Admin Dashboard ผ่าน Next.js proxy → ใช้ header: x-username หรือ x-user-id
     * 3) ส่ง username ใน body → ใช้ username จาก body
     *
     * Priority: body username > header username > header userId > current user username > current user id
     */

    // 1. ดึง username จากหลายแหล่ง
    const bodyUsername = body.username;
    const headerUsername = req.headers['x-username'] as string | undefined;
    const headerUserId = req.headers['x-user-id'] as string | undefined;
    
    // Priority: body > header username > header userId > current user
    let identifier: string | undefined;
    
    if (bodyUsername) {
      identifier = bodyUsername;
      console.log(`[ReviewsController] Using username from body: ${bodyUsername}`);
    } else if (headerUsername) {
      identifier = headerUsername;
      console.log(`[ReviewsController] Using username from header: ${headerUsername}`);
    } else if (headerUserId) {
      identifier = headerUserId;
      console.log(`[ReviewsController] Using x-user-id from header: ${headerUserId}`);
    } else if (user?.username) {
      identifier = user.username;
      console.log(`[ReviewsController] Using username from current user: ${user.username}`);
    } else if (user?.id) {
      identifier = user.id;
      console.log(`[ReviewsController] Using id from current user: ${user.id}`);
    }

    if (!identifier) {
      console.error('[ReviewsController] Create attempted without authentication or username');
      throw new UnauthorizedException('Username or user identifier is required to create a review. Please provide username in body, or x-username/x-user-id header.');
    }

    // 2. ดึงข้อมูล review ออกจาก body (ไม่รวม username)
    const { username, ...createReviewDto } = body;

    console.log(`[ReviewsController] Creating review for identifier: ${identifier}`);
    return this.reviewsService.create(identifier, createReviewDto);
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
      throw new UnauthorizedException('Authentication required');
    }
    return this.reviewsService.remove(user.id, id);
  }
}
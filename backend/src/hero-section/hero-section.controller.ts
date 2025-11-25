import { Controller, Get, Body, Patch, Post, Req, UnauthorizedException } from '@nestjs/common';
import { HeroSectionService } from './hero-section.service';
import { CreateHeroSectionDto } from './dto/create-hero-section.dto';
import { UpdateHeroSectionDto } from './dto/update-hero-section.dto';
import { CurrentUser } from '../common/decorators/user.decorator';

@Controller('hero-section')
export class HeroSectionController {
  constructor(private readonly heroSectionService: HeroSectionService) {}

  // ดึงข้อมูล (GET /api/hero-section)
  // รองรับทั้ง public (by username) และ authenticated (by userId)
  @Get()
  async findOne(@Req() req: any) {
    const userId = req.user?.id;
    const username = req.query.username as string;
    return this.heroSectionService.findOne(userId, username);
  }

  // แก้ไขข้อมูล (PATCH /api/hero-section)
  // รองรับทั้ง authenticated user และ fallback mode (ใช้ userId จาก headers)
  @Patch()
  update(@CurrentUser() user: any, @Req() req: any, @Body() updateHeroSectionDto: UpdateHeroSectionDto) {
    // Try to get userId from authenticated user first
    let userId = user?.id;
    
    // If no authenticated user, try to get from headers (fallback mode)
    if (!userId) {
      userId = req.headers['x-user-id'] as string;
      if (!userId) {
        // Try username and look up userId
        const username = req.headers['x-username'] as string;
        if (username) {
          console.log(`[HeroSectionController] No authenticated user, but username provided: ${username}`);
          // We'll need to handle this in the service
          userId = username; // Pass username as identifier
        }
      }
    }
    
    if (!userId) {
      console.error('[HeroSectionController] Update attempted without authentication or userId/username');
      throw new UnauthorizedException('Authentication required. Please provide x-user-id or x-username header.');
    }
    
    console.log(`[HeroSectionController] Updating hero section for userId/username: ${userId}`);
    return this.heroSectionService.update(userId, updateHeroSectionDto);
  }

  // เผื่อใครเผลอใช้ POST ก็ให้ทำงานเหมือน Update
  @Post()
  create(@CurrentUser() user: any, @Req() req: any, @Body() createHeroSectionDto: CreateHeroSectionDto) {
    // Try to get userId from authenticated user first
    let userId = user?.id;
    
    // If no authenticated user, try to get from headers (fallback mode)
    if (!userId) {
      userId = req.headers['x-user-id'] as string;
      if (!userId) {
        const username = req.headers['x-username'] as string;
        if (username) {
          console.log(`[HeroSectionController] No authenticated user, but username provided: ${username}`);
          userId = username;
        }
      }
    }
    
    if (!userId) {
      console.error('[HeroSectionController] Create attempted without authentication or userId/username');
      throw new UnauthorizedException('Authentication required. Please provide x-user-id or x-username header.');
    }
    
    console.log(`[HeroSectionController] Creating hero section for userId/username: ${userId}`);
    return this.heroSectionService.update(userId, createHeroSectionDto);
  }
}

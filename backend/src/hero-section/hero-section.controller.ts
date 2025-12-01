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
    // 1) เริ่มจาก user ที่ auth มาก่อน
    let identifier = user?.id as string | undefined;

    // 2) แล้วค่อยดูจาก headers โดยให้ priority กับ x-username ก่อน
    const headerUsername = req.headers['x-username'] as string | undefined;
    const headerUserId = req.headers['x-user-id'] as string | undefined;

    if (!identifier && headerUsername) {
      // ใช้ username เป็นตัวระบุหลัก (เหมาะกับ URL เช่น /johndoe)
      identifier = headerUsername;
      console.log(`[HeroSectionController] Using username from header: ${headerUsername}`);
    } else if (!identifier && headerUserId) {
      // fallback เป็น userId จาก header
      identifier = headerUserId;
      console.log(`[HeroSectionController] Using x-user-id from header: ${headerUserId}`);
    }

    if (!identifier) {
      console.error('[HeroSectionController] Update attempted without authentication or userId/username');
      throw new UnauthorizedException('Authentication required. Please provide x-user-id or x-username header.');
    }

    console.log(`[HeroSectionController] Updating hero section for userId/username: ${identifier}`);
    return this.heroSectionService.update(identifier, updateHeroSectionDto);
  }

  // เผื่อใครเผลอใช้ POST ก็ให้ทำงานเหมือน Update
  @Post()
  create(@CurrentUser() user: any, @Req() req: any, @Body() createHeroSectionDto: CreateHeroSectionDto) {
    // ใช้ logic เดียวกับ PATCH: ให้ priority กับ username ถ้ามี
    let identifier = user?.id as string | undefined;

    const headerUsername = req.headers['x-username'] as string | undefined;
    const headerUserId = req.headers['x-user-id'] as string | undefined;

    if (!identifier && headerUsername) {
      identifier = headerUsername;
      console.log(`[HeroSectionController] Using username from header (POST): ${headerUsername}`);
    } else if (!identifier && headerUserId) {
      identifier = headerUserId;
      console.log(`[HeroSectionController] Using x-user-id from header (POST): ${headerUserId}`);
    }

    if (!identifier) {
      console.error('[HeroSectionController] Create attempted without authentication or userId/username');
      throw new UnauthorizedException('Authentication required. Please provide x-user-id or x-username header.');
    }

    console.log(`[HeroSectionController] Creating hero section for userId/username: ${identifier}`);
    return this.heroSectionService.update(identifier, createHeroSectionDto);
  }
}

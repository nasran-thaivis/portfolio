import { Controller, Get, Body, Patch, Post, Req, UnauthorizedException, BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { AboutSectionService } from './about-section.service';
import { CreateAboutSectionDto } from './dto/create-about-section.dto';
import { CurrentUser } from '../common/decorators/user.decorator';

@Controller('about-section')
export class AboutSectionController {
  constructor(private readonly aboutSectionService: AboutSectionService) {}

  @Get()
  async findOne(@Req() req: any) {
    const userId = req.user?.id;
    const username = req.query.username as string;
    return this.aboutSectionService.findOne(userId, username);
  }

  @Patch()
  async update(@CurrentUser() user: any, @Req() req: any, @Body() createAboutSectionDto: CreateAboutSectionDto) {
    try {
      // 1) เริ่มจาก user ที่ auth มาก่อน
      let identifier = user?.id as string | undefined;

      // 2) แล้วค่อยดูจาก headers โดยให้ priority กับ x-username ก่อน
      const headerUsername = req.headers['x-username'] as string | undefined;
      const headerUserId = req.headers['x-user-id'] as string | undefined;

      if (!identifier && headerUsername) {
        identifier = headerUsername;
        console.log(`[AboutSectionController] Using username from header: ${headerUsername}`);
      } else if (!identifier && headerUserId) {
        identifier = headerUserId;
        console.log(`[AboutSectionController] Using x-user-id from header: ${headerUserId}`);
      }
      
      if (!identifier) {
        console.error('[AboutSectionController] Update attempted without authentication or userId/username');
        throw new UnauthorizedException('Authentication required. Please provide x-user-id or x-username header.');
      }
      
      console.log(`[AboutSectionController] Updating about section for userId/username: ${identifier}`);
      return await this.aboutSectionService.update(identifier, createAboutSectionDto);
    } catch (error: any) {
      console.error('[AboutSectionController] Error updating about section:', error);
      
      // Re-throw NestJS exceptions as-is
      if (error instanceof UnauthorizedException || 
          error instanceof BadRequestException || 
          error instanceof InternalServerErrorException) {
        throw error;
      }
      
      // For other errors, check if it's a user not found error
      if (error.message && error.message.includes('not found')) {
        throw new BadRequestException(error.message);
      }
      
      // For other errors, wrap in InternalServerErrorException
      throw new InternalServerErrorException(`Failed to update about section: ${error.message || error}`);
    }
  }

  @Post()
  create(@CurrentUser() user: any, @Req() req: any, @Body() createAboutSectionDto: CreateAboutSectionDto) {
    let identifier = user?.id as string | undefined;

    const headerUsername = req.headers['x-username'] as string | undefined;
    const headerUserId = req.headers['x-user-id'] as string | undefined;

    if (!identifier && headerUsername) {
      identifier = headerUsername;
      console.log(`[AboutSectionController] Using username from header (POST): ${headerUsername}`);
    } else if (!identifier && headerUserId) {
      identifier = headerUserId;
      console.log(`[AboutSectionController] Using x-user-id from header (POST): ${headerUserId}`);
    }
    
    if (!identifier) {
      console.error('[AboutSectionController] Create attempted without authentication or userId/username');
      throw new UnauthorizedException('Authentication required. Please provide x-user-id or x-username header.');
    }
    
    console.log(`[AboutSectionController] Creating about section for userId/username: ${identifier}`);
    return this.aboutSectionService.update(identifier, createAboutSectionDto);
  }
}
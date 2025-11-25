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
      // Try to get userId from authenticated user first
      let userId = user?.id;
      
      // If no authenticated user, try to get from headers (fallback mode)
      // Priority: x-user-id header (supports UUID, CUID, numeric IDs) > x-username header
      if (!userId) {
        userId = req.headers['x-user-id'] as string;
        if (!userId) {
          const username = req.headers['x-username'] as string;
          if (username) {
            console.log(`[AboutSectionController] No authenticated user, but username provided: ${username}`);
            userId = username;
          }
        }
      }
      
      if (!userId) {
        console.error('[AboutSectionController] Update attempted without authentication or userId/username');
        throw new UnauthorizedException('Authentication required. Please provide x-user-id or x-username header.');
      }
      
      console.log(`[AboutSectionController] Updating about section for userId/username: ${userId}`);
      return await this.aboutSectionService.update(userId, createAboutSectionDto);
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
    // Try to get userId from authenticated user first
    let userId = user?.id;
    
    // If no authenticated user, try to get from headers (fallback mode)
    if (!userId) {
      userId = req.headers['x-user-id'] as string;
      if (!userId) {
        const username = req.headers['x-username'] as string;
        if (username) {
          console.log(`[AboutSectionController] No authenticated user, but username provided: ${username}`);
          userId = username;
        }
      }
    }
    
    if (!userId) {
      console.error('[AboutSectionController] Create attempted without authentication or userId/username');
      throw new UnauthorizedException('Authentication required. Please provide x-user-id or x-username header.');
    }
    
    console.log(`[AboutSectionController] Creating about section for userId/username: ${userId}`);
    return this.aboutSectionService.update(userId, createAboutSectionDto);
  }
}
import { Controller, Get, Body, Patch, Post, Req, UnauthorizedException, BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { ContactSectionService } from './contact-section.service';
import { CreateContactSectionDto } from './dto/create-contact-section.dto';
import { CurrentUser } from '../common/decorators/user.decorator';

@Controller('contact-section')
export class ContactSectionController {
  constructor(private readonly contactSectionService: ContactSectionService) {}

  @Get()
  async findOne(@Req() req: any) {
    try {
      const userId = req.user?.id;
      const username = req.query.username as string;
      return await this.contactSectionService.findOne(userId, username);
    } catch (error: any) {
      console.error('[ContactSectionController] Error in findOne:', error);
      
      // Re-throw NestJS exceptions as-is
      if (error instanceof BadRequestException || 
          error instanceof InternalServerErrorException) {
        throw error;
      }
      
      // For Prisma errors, wrap in BadRequestException
      if (error.code && error.code.startsWith('P')) {
        throw new BadRequestException(`Database error: ${error.message || error}`);
      }
      
      // For other errors, wrap in InternalServerErrorException
      throw new InternalServerErrorException(`Failed to get contact section: ${error.message || error}`);
    }
  }

  @Patch()
  async update(@CurrentUser() user: any, @Req() req: any, @Body() createContactSectionDto: CreateContactSectionDto) {
    try {
      // 1) เริ่มจาก user ที่ auth มาก่อน
      let identifier = user?.id as string | undefined;

      // 2) แล้วค่อยดูจาก headers โดยให้ priority กับ x-username ก่อน
      const headerUsername = req.headers['x-username'] as string | undefined;
      const headerUserId = req.headers['x-user-id'] as string | undefined;

      if (!identifier && headerUsername) {
        identifier = headerUsername;
        console.log(`[ContactSectionController] Using username from header: ${headerUsername}`);
      } else if (!identifier && headerUserId) {
        identifier = headerUserId;
        console.log(`[ContactSectionController] Using x-user-id from header: ${headerUserId}`);
      }
      
      if (!identifier) {
        console.error('[ContactSectionController] Update attempted without authentication or userId/username');
        throw new UnauthorizedException('Authentication required. Please provide x-user-id or x-username header.');
      }
      
      console.log(`[ContactSectionController] Updating contact section for userId/username: ${identifier}`);
      return await this.contactSectionService.update(identifier, createContactSectionDto);
    } catch (error: any) {
      console.error('[ContactSectionController] Error updating contact section:', error);
      
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
      throw new InternalServerErrorException(`Failed to update contact section: ${error.message || error}`);
    }
  }

  @Post()
  create(@CurrentUser() user: any, @Req() req: any, @Body() createContactSectionDto: CreateContactSectionDto) {
    let identifier = user?.id as string | undefined;

    const headerUsername = req.headers['x-username'] as string | undefined;
    const headerUserId = req.headers['x-user-id'] as string | undefined;

    if (!identifier && headerUsername) {
      identifier = headerUsername;
      console.log(`[ContactSectionController] Using username from header (POST): ${headerUsername}`);
    } else if (!identifier && headerUserId) {
      identifier = headerUserId;
      console.log(`[ContactSectionController] Using x-user-id from header (POST): ${headerUserId}`);
    }
    
    if (!identifier) {
      console.error('[ContactSectionController] Create attempted without authentication or userId/username');
      throw new UnauthorizedException('Authentication required. Please provide x-user-id or x-username header.');
    }
    
    console.log(`[ContactSectionController] Creating contact section for userId/username: ${identifier}`);
    return this.contactSectionService.update(identifier, createContactSectionDto);
  }
}


import {
  Controller, //ตัวจัดการการข้อมูล สำหรับหน้า Contact Us (Controller)
  Get, //HTTP Methods
  Post, //HTTP Methods 
  Put, //HTTP Methods 
  Delete, //HTTP Methods 
  Body, //ตัวดึงข้อมูล (จาก Body หรือ URL)
  Param, //ตัวดึงข้อมูล (จาก Param)
  Req, // Request object
  HttpCode, // การจัดการ Status Code (200, 201, 404)
  HttpStatus, // การจัดการ Status Code (200, 201, 404)
  BadRequestException,
  NotFoundException,
  HttpException, // การจัดการ Error
} from '@nestjs/common'; 
import { ContactService } from './contact.service';
import { CreateContactDto, UpdateContactStatusDto } from './dto/contact.dto';
import { PrismaService } from '../prisma/prisma.service';

@Controller('contact')
export class ContactController {
  constructor(
    private readonly contactService: ContactService,
    private readonly prisma: PrismaService,
  ) {}

  @Get()
  findAll(@Req() req: any) {
    const userId = req.user?.id;
    const username = req.query.username as string;
    return this.contactService.findAll(userId, username);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.contactService.findOne(id);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createContactDto: CreateContactDto, @Req() req: any) {
    
    // Get username from query (for public contact forms)
    const username = req.query.userId as string; // Note: query param is named userId but contains username
    let userId: string | undefined;
    
    if (username) {
      // Find user by username
      const user = await this.prisma.user.findUnique({
        where: { username },
      });
      if (user) {
        userId = user.id;
      }
    }
    
    return this.contactService.create(createContactDto, userId);
  }

  @Put(':id/status')
  updateStatus(
    @Param('id') id: string,
    @Body() updateStatusDto: UpdateContactStatusDto,
  ) {
    
    return this.contactService.updateStatus(id, updateStatusDto);
    
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string) { 
    return this.contactService.remove(id); 
  }
}


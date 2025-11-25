import { HttpException, HttpStatus, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateContactDto, UpdateContactStatusDto } from './dto/contact.dto';

@Injectable()
export class ContactService {
  constructor(private prisma: PrismaService) {} 

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

    return this.prisma.contactRequest.findMany({
      where: whereClause,
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findOne(id: string) {
    return this.prisma.contactRequest.findUnique({
      where: { id },
    });
  }

  async create(createContactDto: CreateContactDto, userId?: string) {
    return this.prisma.contactRequest.create({
      data: {
        ...createContactDto,
        userId: userId || null, // Allow null for public contact forms
      },
    });
  }

  async updateStatus(id: string, updateStatusDto: UpdateContactStatusDto) {
    try {
      return await this.prisma.contactRequest.update({
        where: { id },
        data: { status: updateStatusDto.status },
      });
    } catch (error) {
      // จับ Prisma error เมื่อไม่พบ record (P2025)
      // if (error.code === 'P2025') {
        // throw new NotFoundException(`Contact request with ID ${id} not found`);
      // }    // จับ error อื่นๆ
      throw new HttpException(
        'Unexpected error during user creation',
        HttpStatus.NOT_ACCEPTABLE,
      );
    }
  }

  async remove(id: string) {
    await this.prisma.contactRequest.delete({
      where: { id },
    });
    return { message: 'Contact request deleted successfully' };
  }
}


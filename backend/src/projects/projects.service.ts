// src/projects/projects.service.ts

import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { PrismaService } from '../prisma/prisma.service';
import { UploadService } from '../upload/upload.service';
import { UsersService } from '../users/users.service';

@Injectable()
export class ProjectsService {
  constructor(
    private prisma: PrismaService,
    private uploadService: UploadService,
    private usersService: UsersService,
  ) {}

  // 2. ฟังก์ชันสร้างโปรเจกต์ใหม่ (POST)
  /**
   * สร้าง Project ใหม่โดยรองรับทั้ง userId และ username
   * - identifier อาจเป็น userId จริง, username, หรือค่าอื่นจาก Admin Dashboard
   * - ใช้ UsersService.ensureUserExists() เพื่อหา/สร้าง user ใน DB ก่อน
   */
  async create(identifier: string, createProjectDto: CreateProjectDto) {
    // Ensure user exists in database (create if not exists)
    const user = await this.usersService.ensureUserExists(identifier);
    const userId = user.id;

    console.log(`[ProjectsService] Creating project for userId: ${userId} (from: ${identifier})`);

    // แปลง proxy URL กลับเป็น path ก่อนบันทึกลง database
    const normalizedData = {
      ...createProjectDto,
      userId,
      imageUrl: createProjectDto.imageUrl 
        ? this.uploadService.normalizeImageUrl(createProjectDto.imageUrl)
        : createProjectDto.imageUrl,
    };

    const project = await this.prisma.project.create({
      data: normalizedData,
    });

    // แปลง path เป็น proxy URL เมื่อ return ให้ frontend
    if (project.imageUrl) {
      project.imageUrl = this.uploadService.getProxyUrl(project.imageUrl);
    }

    return project;
  }

  // 3. ฟังก์ชันดึงข้อมูลทั้งหมด (GET)
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

    const projects = await this.prisma.project.findMany({
      where: whereClause,
      orderBy: { createdAt: 'desc' }, // เรียงจากใหม่ไปเก่า
    });

    // แปลง imageUrl เป็น proxy URL สำหรับแต่ละ project
    return projects.map((project) => {
      if (project.imageUrl) {
        project.imageUrl = this.uploadService.getProxyUrl(project.imageUrl);
      }
      return project;
    });
  }

  // 4. ฟังก์ชันดึงข้อมูลอันเดียว (GET :id)
  async findOne(id: string) {
    const project = await this.prisma.project.findUnique({ where: { id } });
    
    if (project && project.imageUrl) {
      project.imageUrl = this.uploadService.getProxyUrl(project.imageUrl);
    }

    return project;
  }

  // 5. ฟังก์ชันแก้ไข (PATCH)
  async update(userId: string, id: string, updateProjectDto: UpdateProjectDto) {
    // Verify project belongs to user
    const existingProject = await this.prisma.project.findUnique({ where: { id } });
    if (!existingProject) {
      throw new NotFoundException('Project not found');
    }
    if (existingProject.userId !== userId) {
      throw new ForbiddenException('Access denied. This project belongs to another user.');
    }
    // แปลง proxy URL กลับเป็น path ก่อนบันทึกลง database
    const normalizedData = {
      ...updateProjectDto,
      imageUrl: updateProjectDto.imageUrl !== undefined
        ? (updateProjectDto.imageUrl 
            ? this.uploadService.normalizeImageUrl(updateProjectDto.imageUrl)
            : updateProjectDto.imageUrl)
        : undefined,
    };

    const project = await this.prisma.project.update({
      where: { id },
      data: normalizedData,
    });

    // แปลง path เป็น proxy URL เมื่อ return ให้ frontend
    if (project.imageUrl) {
      project.imageUrl = this.uploadService.getProxyUrl(project.imageUrl);
    }

    return project;
  }

  // 6. ฟังก์ชันลบ (DELETE)
  async remove(userId: string, id: string) {
    // Verify project belongs to user
    const project = await this.prisma.project.findUnique({ where: { id } });
    if (!project) {
      throw new NotFoundException('Project not found');
    }
    if (project.userId !== userId) {
      throw new ForbiddenException('Access denied. This project belongs to another user.');
    }
    return this.prisma.project.delete({ where: { id } });
  }
}
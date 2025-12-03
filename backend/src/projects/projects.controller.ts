// src/projects/projects.controller.ts

import { Controller, Get, Post, Body, Patch, Param, Delete, Req, UnauthorizedException } from '@nestjs/common';
import { ProjectsService } from './projects.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { CurrentUser } from '../common/decorators/user.decorator';

@Controller('projects')
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  @Post()
  create(@CurrentUser() user: any, @Req() req: any, @Body() createProjectDto: CreateProjectDto) {
    /**
     * รองรับทั้งสองกรณี:
     * 1) มีการ auth ปกติ → ใช้ user.id จาก CurrentUser
     * 2) มาจาก Admin Dashboard ผ่าน Next.js proxy → ใช้ header: x-username หรือ x-user-id
     *
     * จากนั้นส่ง identifier ไปที่ Service ซึ่งจะเรียก UsersService.ensureUserExists()
     * เพื่อหา/สร้าง User ให้ตรงกับข้อมูลนี้
     */

    // 1) เริ่มจาก user ที่ auth มาก่อน
    let identifier = user?.id as string | undefined;

    // 2) แล้วค่อยดูจาก headers โดยให้ priority กับ x-username ก่อน
    const headerUsername = req.headers['x-username'] as string | undefined;
    const headerUserId = req.headers['x-user-id'] as string | undefined;

    if (!identifier && headerUsername) {
      // ใช้ username เป็นตัวระบุหลัก (เหมาะกับ URL เช่น /johndoe)
      identifier = headerUsername;
      console.log(`[ProjectsController] Using username from header: ${headerUsername}`);
    } else if (!identifier && headerUserId) {
      // fallback เป็น userId จาก header
      identifier = headerUserId;
      console.log(`[ProjectsController] Using x-user-id from header: ${headerUserId}`);
    }

    if (!identifier) {
      console.error('[ProjectsController] Create attempted without authentication or userId/username');
      throw new UnauthorizedException('Authentication required. Please provide x-user-id or x-username header.');
    }

    console.log(`[ProjectsController] Creating project for userId/username: ${identifier}`);
    return this.projectsService.create(identifier, createProjectDto);
  }

  @Get()
  findAll(@Req() req: any) {
    const userId = req.user?.id;
    const username = req.query.username as string;
    return this.projectsService.findAll(userId, username);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.projectsService.findOne(id);
  }

  @Patch(':id')
  update(@CurrentUser() user: any, @Param('id') id: string, @Body() updateProjectDto: UpdateProjectDto) {
    if (!user) {
      throw new UnauthorizedException('Authentication required');
    }
    return this.projectsService.update(user.id, id, updateProjectDto);
  }

  @Delete(':id')
  remove(@CurrentUser() user: any, @Param('id') id: string) {
    if (!user) {
      throw new UnauthorizedException('Authentication required');
    }
    return this.projectsService.remove(user.id, id);
  }
}
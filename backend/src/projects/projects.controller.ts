// src/projects/projects.controller.ts

import { Controller, Get, Post, Body, Patch, Param, Delete, Req } from '@nestjs/common';
import { ProjectsService } from './projects.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { CurrentUser } from '../common/decorators/user.decorator';

@Controller('projects')
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  @Post()
  create(@CurrentUser() user: any, @Body() createProjectDto: CreateProjectDto) {
    if (!user) {
      throw new Error('Authentication required');
    }
    return this.projectsService.create(user.id, createProjectDto);
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
      throw new Error('Authentication required');
    }
    return this.projectsService.update(user.id, id, updateProjectDto);
  }

  @Delete(':id')
  remove(@CurrentUser() user: any, @Param('id') id: string) {
    if (!user) {
      throw new Error('Authentication required');
    }
    return this.projectsService.remove(user.id, id);
  }
}
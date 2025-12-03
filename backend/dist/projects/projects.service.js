"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProjectsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const upload_service_1 = require("../upload/upload.service");
const users_service_1 = require("../users/users.service");
let ProjectsService = class ProjectsService {
    constructor(prisma, uploadService, usersService) {
        this.prisma = prisma;
        this.uploadService = uploadService;
        this.usersService = usersService;
    }
    async create(identifier, createProjectDto) {
        try {
            const user = await this.usersService.ensureUserExists(identifier);
            const userId = user.id;
            console.log(`[ProjectsService] Creating project for userId: ${userId} (from: ${identifier})`);
            console.log('[ProjectsService] Payload:', JSON.stringify(createProjectDto, null, 2));
            let normalizedImageUrl = createProjectDto.imageUrl;
            if (createProjectDto.imageUrl) {
                try {
                    normalizedImageUrl = this.uploadService.normalizeImageUrl(createProjectDto.imageUrl);
                    console.log(`[ProjectsService] Normalized imageUrl: ${createProjectDto.imageUrl} -> ${normalizedImageUrl}`);
                }
                catch (error) {
                    console.warn(`[ProjectsService] Failed to normalize imageUrl: ${createProjectDto.imageUrl}`, error);
                    normalizedImageUrl = createProjectDto.imageUrl;
                }
            }
            const normalizedData = {
                ...createProjectDto,
                userId,
                imageUrl: normalizedImageUrl,
            };
            console.log('[ProjectsService] Creating project with data:', JSON.stringify(normalizedData, null, 2));
            const project = await this.prisma.project.create({
                data: normalizedData,
            });
            console.log('[ProjectsService] Project created successfully:', project.id);
            if (project.imageUrl) {
                try {
                    project.imageUrl = this.uploadService.getProxyUrl(project.imageUrl);
                }
                catch (error) {
                    console.warn(`[ProjectsService] Failed to get proxy URL for: ${project.imageUrl}`, error);
                }
            }
            return project;
        }
        catch (error) {
            console.error('[ProjectsService] Error creating project:', error);
            console.error('[ProjectsService] Error details:', {
                code: error.code,
                meta: error.meta,
                message: error.message,
                stack: error.stack,
            });
            if (error.code && error.code.startsWith('P')) {
                const errorMessage = error.meta?.cause || error.meta?.target || error.message || 'Database error when creating project';
                throw new common_1.BadRequestException(`Database error: ${errorMessage}`);
            }
            if (error instanceof common_1.BadRequestException ||
                error instanceof common_1.NotFoundException ||
                error instanceof common_1.ForbiddenException ||
                error instanceof common_1.InternalServerErrorException) {
                throw error;
            }
            throw new common_1.InternalServerErrorException(error.message || 'Failed to create project');
        }
    }
    async findAll(userId, username) {
        let whereClause = {};
        if (userId) {
            whereClause.userId = userId;
        }
        else if (username) {
            const user = await this.prisma.user.findUnique({
                where: { username },
            });
            if (user) {
                whereClause.userId = user.id;
            }
            else {
                return [];
            }
        }
        const projects = await this.prisma.project.findMany({
            where: whereClause,
            orderBy: { createdAt: 'desc' },
        });
        return projects.map((project) => {
            if (project.imageUrl) {
                project.imageUrl = this.uploadService.getProxyUrl(project.imageUrl);
            }
            return project;
        });
    }
    async findOne(id) {
        const project = await this.prisma.project.findUnique({ where: { id } });
        if (project && project.imageUrl) {
            project.imageUrl = this.uploadService.getProxyUrl(project.imageUrl);
        }
        return project;
    }
    async update(userId, id, updateProjectDto) {
        const existingProject = await this.prisma.project.findUnique({ where: { id } });
        if (!existingProject) {
            throw new common_1.NotFoundException('Project not found');
        }
        if (existingProject.userId !== userId) {
            throw new common_1.ForbiddenException('Access denied. This project belongs to another user.');
        }
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
        if (project.imageUrl) {
            project.imageUrl = this.uploadService.getProxyUrl(project.imageUrl);
        }
        return project;
    }
    async remove(userId, id) {
        const project = await this.prisma.project.findUnique({ where: { id } });
        if (!project) {
            throw new common_1.NotFoundException('Project not found');
        }
        if (project.userId !== userId) {
            throw new common_1.ForbiddenException('Access denied. This project belongs to another user.');
        }
        return this.prisma.project.delete({ where: { id } });
    }
};
exports.ProjectsService = ProjectsService;
exports.ProjectsService = ProjectsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        upload_service_1.UploadService,
        users_service_1.UsersService])
], ProjectsService);
//# sourceMappingURL=projects.service.js.map
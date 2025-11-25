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
let ProjectsService = class ProjectsService {
    constructor(prisma, uploadService) {
        this.prisma = prisma;
        this.uploadService = uploadService;
    }
    async create(userId, createProjectDto) {
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
        if (project.imageUrl) {
            project.imageUrl = this.uploadService.getProxyUrl(project.imageUrl);
        }
        return project;
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
        if (!existingProject || existingProject.userId !== userId) {
            throw new Error('Project not found or access denied');
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
        if (!project || project.userId !== userId) {
            throw new Error('Project not found or access denied');
        }
        return this.prisma.project.delete({ where: { id } });
    }
};
exports.ProjectsService = ProjectsService;
exports.ProjectsService = ProjectsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        upload_service_1.UploadService])
], ProjectsService);
//# sourceMappingURL=projects.service.js.map
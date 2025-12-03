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
exports.HeroSectionService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const upload_service_1 = require("../upload/upload.service");
const users_service_1 = require("../users/users.service");
let HeroSectionService = class HeroSectionService {
    constructor(prisma, uploadService, usersService) {
        this.prisma = prisma;
        this.uploadService = uploadService;
        this.usersService = usersService;
    }
    async findOne(userId, username) {
        let hero;
        if (userId) {
            hero = await this.prisma.heroSection.findUnique({
                where: { userId },
            });
        }
        else if (username) {
            const user = await this.prisma.user.findUnique({
                where: { username },
                include: { heroSection: true },
            });
            hero = user?.heroSection;
        }
        let result;
        if (!hero) {
            if (!userId && username) {
                const user = await this.prisma.user.findUnique({
                    where: { username },
                });
                if (user)
                    userId = user.id;
            }
            if (userId) {
                result = await this.prisma.heroSection.create({
                    data: {
                        userId,
                        title: 'Welcome',
                        description: 'This is my portfolio',
                        imageUrl: 'https://placehold.co/1920x1080',
                    },
                });
            }
            else {
                return {
                    title: 'Welcome',
                    description: 'This is my portfolio',
                    imageUrl: 'https://placehold.co/1920x1080',
                };
            }
        }
        else {
            result = hero;
        }
        if (result.imageUrl) {
            result.imageUrl = this.uploadService.getProxyUrl(result.imageUrl);
        }
        return result;
    }
    async update(userIdOrUsername, updateHeroSectionDto) {
        const user = await this.usersService.ensureUserExists(userIdOrUsername);
        const userId = user.id;
        console.log(`[HeroSectionService] Updating hero section for userId: ${userId} (from: ${userIdOrUsername})`);
        const normalizedData = {
            ...updateHeroSectionDto,
            imageUrl: updateHeroSectionDto.imageUrl !== undefined
                ? (updateHeroSectionDto.imageUrl
                    ? this.uploadService.normalizeImageUrl(updateHeroSectionDto.imageUrl)
                    : updateHeroSectionDto.imageUrl)
                : undefined,
        };
        const result = await this.prisma.heroSection.upsert({
            where: { userId },
            update: normalizedData,
            create: {
                userId,
                title: 'Welcome',
                description: 'This is my portfolio',
                ...normalizedData,
            },
        });
        if (result.imageUrl) {
            result.imageUrl = this.uploadService.getProxyUrl(result.imageUrl);
        }
        return result;
    }
};
exports.HeroSectionService = HeroSectionService;
exports.HeroSectionService = HeroSectionService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        upload_service_1.UploadService,
        users_service_1.UsersService])
], HeroSectionService);
//# sourceMappingURL=hero-section.service.js.map
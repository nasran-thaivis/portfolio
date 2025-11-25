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
let HeroSectionService = class HeroSectionService {
    constructor(prisma, uploadService) {
        this.prisma = prisma;
        this.uploadService = uploadService;
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
        let userId = userIdOrUsername;
        const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(userIdOrUsername);
        if (!isUUID) {
            const isNumericId = /^\d+$/.test(userIdOrUsername);
            if (isNumericId) {
                console.log(`[HeroSectionService] Using numeric userId: ${userIdOrUsername}`);
                userId = userIdOrUsername;
            }
            else {
                console.log(`[HeroSectionService] Looking up userId for username: ${userIdOrUsername}`);
                const user = await this.prisma.user.findUnique({
                    where: { username: userIdOrUsername },
                    select: { id: true },
                });
                if (!user) {
                    throw new Error(`User with username "${userIdOrUsername}" not found in database. Please make sure the user exists.`);
                }
                userId = user.id;
                console.log(`[HeroSectionService] Found userId: ${userId} for username: ${userIdOrUsername}`);
            }
        }
        else {
            console.log(`[HeroSectionService] Using UUID userId: ${userIdOrUsername}`);
        }
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
        upload_service_1.UploadService])
], HeroSectionService);
//# sourceMappingURL=hero-section.service.js.map
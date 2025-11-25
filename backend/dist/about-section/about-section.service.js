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
exports.AboutSectionService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const upload_service_1 = require("../upload/upload.service");
let AboutSectionService = class AboutSectionService {
    constructor(prisma, uploadService) {
        this.prisma = prisma;
        this.uploadService = uploadService;
    }
    async findOne(userId, username) {
        let about;
        if (userId) {
            about = await this.prisma.aboutSection.findUnique({
                where: { userId },
            });
        }
        else if (username) {
            const user = await this.prisma.user.findUnique({
                where: { username },
                include: { aboutSection: true },
            });
            about = user?.aboutSection;
        }
        let result;
        if (!about) {
            if (!userId && username) {
                const user = await this.prisma.user.findUnique({
                    where: { username },
                });
                if (user)
                    userId = user.id;
            }
            if (userId) {
                result = await this.prisma.aboutSection.create({
                    data: {
                        userId,
                        title: 'About Me',
                        description: 'I am a passionate developer...',
                        imageUrl: 'https://placehold.co/600x400',
                    },
                });
            }
            else {
                return {
                    title: 'About Me',
                    description: 'I am a passionate developer...',
                    imageUrl: 'https://placehold.co/600x400',
                };
            }
        }
        else {
            result = about;
        }
        if (result.imageUrl) {
            result.imageUrl = this.uploadService.getProxyUrl(result.imageUrl);
        }
        return result;
    }
    async update(userIdOrUsername, createAboutSectionDto) {
        try {
            let userId = userIdOrUsername;
            const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(userIdOrUsername);
            if (!isUUID) {
                const isCUID = /^c[a-z0-9]{24}$/i.test(userIdOrUsername);
                if (isCUID) {
                    console.log(`[AboutSectionService] Using CUID userId: ${userIdOrUsername}`);
                    userId = userIdOrUsername;
                }
                else {
                    const isNumericId = /^\d+$/.test(userIdOrUsername);
                    if (isNumericId) {
                        console.log(`[AboutSectionService] Using numeric userId: ${userIdOrUsername}`);
                        userId = userIdOrUsername;
                    }
                    else {
                        console.log(`[AboutSectionService] Looking up userId for username: ${userIdOrUsername}`);
                        const user = await this.prisma.user.findUnique({
                            where: { username: userIdOrUsername },
                            select: { id: true },
                        });
                        if (!user) {
                            throw new common_1.NotFoundException(`User with username "${userIdOrUsername}" not found in database. Please make sure the user exists.`);
                        }
                        userId = user.id;
                        console.log(`[AboutSectionService] Found userId: ${userId} for username: ${userIdOrUsername}`);
                    }
                }
            }
            else {
                console.log(`[AboutSectionService] Using UUID userId: ${userIdOrUsername}`);
            }
            let normalizedImageUrl = createAboutSectionDto.imageUrl;
            if (createAboutSectionDto.imageUrl !== undefined && createAboutSectionDto.imageUrl) {
                try {
                    normalizedImageUrl = this.uploadService.normalizeImageUrl(createAboutSectionDto.imageUrl);
                }
                catch (error) {
                    console.warn(`[AboutSectionService] Failed to normalize imageUrl: ${createAboutSectionDto.imageUrl}`, error);
                    normalizedImageUrl = createAboutSectionDto.imageUrl;
                }
            }
            const normalizedData = {
                ...createAboutSectionDto,
                imageUrl: normalizedImageUrl,
            };
            const result = await this.prisma.aboutSection.upsert({
                where: { userId },
                update: normalizedData,
                create: {
                    userId,
                    ...normalizedData,
                },
            });
            if (result.imageUrl) {
                try {
                    result.imageUrl = this.uploadService.getProxyUrl(result.imageUrl);
                }
                catch (error) {
                    console.warn(`[AboutSectionService] Failed to get proxy URL for: ${result.imageUrl}`, error);
                }
            }
            return result;
        }
        catch (error) {
            console.error('[AboutSectionService] Error in update:', error);
            if (error instanceof common_1.NotFoundException || error instanceof common_1.BadRequestException) {
                throw error;
            }
            if (error.code && error.code.startsWith('P')) {
                throw new common_1.BadRequestException(`Database error: ${error.message || error}`);
            }
            throw new common_1.BadRequestException(`Failed to update about section: ${error.message || error}`);
        }
    }
};
exports.AboutSectionService = AboutSectionService;
exports.AboutSectionService = AboutSectionService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        upload_service_1.UploadService])
], AboutSectionService);
//# sourceMappingURL=about-section.service.js.map
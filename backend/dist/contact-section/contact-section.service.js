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
exports.ContactSectionService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const users_service_1 = require("../users/users.service");
let ContactSectionService = class ContactSectionService {
    constructor(prisma, usersService) {
        this.prisma = prisma;
        this.usersService = usersService;
    }
    async findOne(userId, username) {
        try {
            let contact;
            if (userId) {
                contact = await this.prisma.contactSection.findUnique({
                    where: { userId },
                });
            }
            else if (username) {
                const user = await this.prisma.user.findUnique({
                    where: { username },
                    include: { contactSection: true },
                });
                contact = user?.contactSection;
            }
            let result;
            if (!contact) {
                if (!userId && username) {
                    const user = await this.prisma.user.findUnique({
                        where: { username },
                    });
                    if (user)
                        userId = user.id;
                }
                if (userId) {
                    try {
                        result = await this.prisma.contactSection.create({
                            data: {
                                userId,
                                phone: '062-209-5297',
                                email: null,
                            },
                        });
                    }
                    catch (createError) {
                        if (createError.code === 'P2002') {
                            contact = await this.prisma.contactSection.findUnique({
                                where: { userId },
                            });
                            result = contact;
                        }
                        else {
                            throw createError;
                        }
                    }
                }
                else {
                    return {
                        phone: '062-209-5297',
                        email: null,
                    };
                }
            }
            else {
                result = contact;
            }
            return result;
        }
        catch (error) {
            console.error('[ContactSectionService] Error in findOne:', error);
            if (error instanceof common_1.NotFoundException || error instanceof common_1.BadRequestException) {
                throw error;
            }
            if (error.code && error.code.startsWith('P')) {
                throw new common_1.BadRequestException(`Database error: ${error.message || error}`);
            }
            console.warn('[ContactSectionService] Returning default contact data due to error');
            return {
                phone: '062-209-5297',
                email: null,
            };
        }
    }
    async update(userIdOrUsername, createContactSectionDto) {
        try {
            const user = await this.usersService.ensureUserExists(userIdOrUsername);
            const userId = user.id;
            console.log(`[ContactSectionService] Updating contact section for userId: ${userId} (from: ${userIdOrUsername})`);
            const result = await this.prisma.contactSection.upsert({
                where: { userId },
                update: createContactSectionDto,
                create: {
                    userId,
                    ...createContactSectionDto,
                },
            });
            return result;
        }
        catch (error) {
            console.error('[ContactSectionService] Error in update:', error);
            if (error instanceof common_1.NotFoundException || error instanceof common_1.BadRequestException) {
                throw error;
            }
            if (error.code && error.code.startsWith('P')) {
                throw new common_1.BadRequestException(`Database error: ${error.message || error}`);
            }
            throw new common_1.BadRequestException(`Failed to update contact section: ${error.message || error}`);
        }
    }
};
exports.ContactSectionService = ContactSectionService;
exports.ContactSectionService = ContactSectionService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        users_service_1.UsersService])
], ContactSectionService);
//# sourceMappingURL=contact-section.service.js.map
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
exports.ContactService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let ContactService = class ContactService {
    constructor(prisma) {
        this.prisma = prisma;
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
        return this.prisma.contactRequest.findMany({
            where: whereClause,
            orderBy: {
                createdAt: 'desc',
            },
        });
    }
    async findOne(id) {
        return this.prisma.contactRequest.findUnique({
            where: { id },
        });
    }
    async create(createContactDto, userId) {
        return this.prisma.contactRequest.create({
            data: {
                ...createContactDto,
                userId: userId || null,
            },
        });
    }
    async updateStatus(id, updateStatusDto) {
        try {
            return await this.prisma.contactRequest.update({
                where: { id },
                data: { status: updateStatusDto.status },
            });
        }
        catch (error) {
            throw new common_1.HttpException('Unexpected error during user creation', common_1.HttpStatus.NOT_ACCEPTABLE);
        }
    }
    async remove(id) {
        await this.prisma.contactRequest.delete({
            where: { id },
        });
        return { message: 'Contact request deleted successfully' };
    }
};
exports.ContactService = ContactService;
exports.ContactService = ContactService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ContactService);
//# sourceMappingURL=contact.service.js.map
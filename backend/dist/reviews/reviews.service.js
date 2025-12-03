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
exports.ReviewsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const upload_service_1 = require("../upload/upload.service");
const users_service_1 = require("../users/users.service");
let ReviewsService = class ReviewsService {
    constructor(prisma, uploadService, usersService) {
        this.prisma = prisma;
        this.uploadService = uploadService;
        this.usersService = usersService;
    }
    async create(identifier, createReviewDto) {
        const user = await this.usersService.ensureUserExists(identifier);
        const userId = user.id;
        console.log(`[ReviewsService] Creating review for userId: ${userId} (from: ${identifier})`);
        const data = {
            ...createReviewDto,
            userId,
            rating: Number(createReviewDto.rating),
            avatarUrl: createReviewDto.avatarUrl
                ? this.uploadService.normalizeImageUrl(createReviewDto.avatarUrl)
                : createReviewDto.avatarUrl,
        };
        const review = await this.prisma.review.create({ data });
        if (review.avatarUrl) {
            review.avatarUrl = this.uploadService.getProxyUrl(review.avatarUrl);
        }
        return review;
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
        const reviews = await this.prisma.review.findMany({
            where: whereClause,
            orderBy: { createdAt: 'desc' },
        });
        return reviews.map((review) => {
            if (review.avatarUrl) {
                review.avatarUrl = this.uploadService.getProxyUrl(review.avatarUrl);
            }
            return review;
        });
    }
    async remove(userId, id) {
        const review = await this.prisma.review.findUnique({ where: { id } });
        if (!review) {
            throw new common_1.NotFoundException('Review not found');
        }
        if (review.userId !== userId) {
            throw new common_1.ForbiddenException('Access denied. This review belongs to another user.');
        }
        return this.prisma.review.delete({
            where: { id },
        });
    }
};
exports.ReviewsService = ReviewsService;
exports.ReviewsService = ReviewsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        upload_service_1.UploadService,
        users_service_1.UsersService])
], ReviewsService);
//# sourceMappingURL=reviews.service.js.map
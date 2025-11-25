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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AboutSectionController = void 0;
const common_1 = require("@nestjs/common");
const about_section_service_1 = require("./about-section.service");
const create_about_section_dto_1 = require("./dto/create-about-section.dto");
const user_decorator_1 = require("../common/decorators/user.decorator");
let AboutSectionController = class AboutSectionController {
    constructor(aboutSectionService) {
        this.aboutSectionService = aboutSectionService;
    }
    async findOne(req) {
        const userId = req.user?.id;
        const username = req.query.username;
        return this.aboutSectionService.findOne(userId, username);
    }
    async update(user, req, createAboutSectionDto) {
        try {
            let userId = user?.id;
            if (!userId) {
                userId = req.headers['x-user-id'];
                if (!userId) {
                    const username = req.headers['x-username'];
                    if (username) {
                        console.log(`[AboutSectionController] No authenticated user, but username provided: ${username}`);
                        userId = username;
                    }
                }
            }
            if (!userId) {
                console.error('[AboutSectionController] Update attempted without authentication or userId/username');
                throw new common_1.UnauthorizedException('Authentication required. Please provide x-user-id or x-username header.');
            }
            console.log(`[AboutSectionController] Updating about section for userId/username: ${userId}`);
            return await this.aboutSectionService.update(userId, createAboutSectionDto);
        }
        catch (error) {
            console.error('[AboutSectionController] Error updating about section:', error);
            if (error instanceof common_1.UnauthorizedException ||
                error instanceof common_1.BadRequestException ||
                error instanceof common_1.InternalServerErrorException) {
                throw error;
            }
            if (error.message && error.message.includes('not found')) {
                throw new common_1.BadRequestException(error.message);
            }
            throw new common_1.InternalServerErrorException(`Failed to update about section: ${error.message || error}`);
        }
    }
    create(user, req, createAboutSectionDto) {
        let userId = user?.id;
        if (!userId) {
            userId = req.headers['x-user-id'];
            if (!userId) {
                const username = req.headers['x-username'];
                if (username) {
                    console.log(`[AboutSectionController] No authenticated user, but username provided: ${username}`);
                    userId = username;
                }
            }
        }
        if (!userId) {
            console.error('[AboutSectionController] Create attempted without authentication or userId/username');
            throw new common_1.UnauthorizedException('Authentication required. Please provide x-user-id or x-username header.');
        }
        console.log(`[AboutSectionController] Creating about section for userId/username: ${userId}`);
        return this.aboutSectionService.update(userId, createAboutSectionDto);
    }
};
exports.AboutSectionController = AboutSectionController;
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AboutSectionController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)(),
    __param(0, (0, user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Req)()),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, create_about_section_dto_1.CreateAboutSectionDto]),
    __metadata("design:returntype", Promise)
], AboutSectionController.prototype, "update", null);
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Req)()),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, create_about_section_dto_1.CreateAboutSectionDto]),
    __metadata("design:returntype", void 0)
], AboutSectionController.prototype, "create", null);
exports.AboutSectionController = AboutSectionController = __decorate([
    (0, common_1.Controller)('about-section'),
    __metadata("design:paramtypes", [about_section_service_1.AboutSectionService])
], AboutSectionController);
//# sourceMappingURL=about-section.controller.js.map
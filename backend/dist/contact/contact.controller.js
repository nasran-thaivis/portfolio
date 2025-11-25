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
exports.ContactController = void 0;
const common_1 = require("@nestjs/common");
const contact_service_1 = require("./contact.service");
const contact_dto_1 = require("./dto/contact.dto");
const prisma_service_1 = require("../prisma/prisma.service");
let ContactController = class ContactController {
    constructor(contactService, prisma) {
        this.contactService = contactService;
        this.prisma = prisma;
    }
    findAll(req) {
        const userId = req.user?.id;
        const username = req.query.username;
        return this.contactService.findAll(userId, username);
    }
    findOne(id) {
        return this.contactService.findOne(id);
    }
    async create(createContactDto, req) {
        if (!createContactDto.name || !createContactDto.email || !createContactDto.message) {
            throw new common_1.BadRequestException('Missing required fields');
        }
        const username = req.query.userId;
        let userId;
        if (username) {
            const user = await this.prisma.user.findUnique({
                where: { username },
            });
            if (user) {
                userId = user.id;
            }
        }
        return this.contactService.create(createContactDto, userId);
    }
    updateStatus(id, updateStatusDto) {
        return this.contactService.updateStatus(id, updateStatusDto);
    }
    remove(id) {
        return this.contactService.remove(id);
    }
};
exports.ContactController = ContactController;
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], ContactController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], ContactController.prototype, "findOne", null);
__decorate([
    (0, common_1.Post)(),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [contact_dto_1.CreateContactDto, Object]),
    __metadata("design:returntype", Promise)
], ContactController.prototype, "create", null);
__decorate([
    (0, common_1.Put)(':id/status'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, contact_dto_1.UpdateContactStatusDto]),
    __metadata("design:returntype", void 0)
], ContactController.prototype, "updateStatus", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, common_1.HttpCode)(common_1.HttpStatus.NO_CONTENT),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], ContactController.prototype, "remove", null);
exports.ContactController = ContactController = __decorate([
    (0, common_1.Controller)('contact'),
    __metadata("design:paramtypes", [contact_service_1.ContactService,
        prisma_service_1.PrismaService])
], ContactController);
//# sourceMappingURL=contact.controller.js.map
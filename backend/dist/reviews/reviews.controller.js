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
exports.ReviewsController = void 0;
const common_1 = require("@nestjs/common");
const reviews_service_1 = require("./reviews.service");
const user_decorator_1 = require("../common/decorators/user.decorator");
let ReviewsController = class ReviewsController {
    constructor(reviewsService) {
        this.reviewsService = reviewsService;
    }
    create(user, req, body) {
        const bodyUsername = body.username;
        const headerUsername = req.headers['x-username'];
        const headerUserId = req.headers['x-user-id'];
        let identifier;
        if (bodyUsername) {
            identifier = bodyUsername;
            console.log(`[ReviewsController] Using username from body: ${bodyUsername}`);
        }
        else if (headerUsername) {
            identifier = headerUsername;
            console.log(`[ReviewsController] Using username from header: ${headerUsername}`);
        }
        else if (headerUserId) {
            identifier = headerUserId;
            console.log(`[ReviewsController] Using x-user-id from header: ${headerUserId}`);
        }
        else if (user?.username) {
            identifier = user.username;
            console.log(`[ReviewsController] Using username from current user: ${user.username}`);
        }
        else if (user?.id) {
            identifier = user.id;
            console.log(`[ReviewsController] Using id from current user: ${user.id}`);
        }
        if (!identifier) {
            console.error('[ReviewsController] Create attempted without authentication or username');
            throw new common_1.UnauthorizedException('Username or user identifier is required to create a review. Please provide username in body, or x-username/x-user-id header.');
        }
        const { username, ...createReviewDto } = body;
        console.log(`[ReviewsController] Creating review for identifier: ${identifier}`);
        return this.reviewsService.create(identifier, createReviewDto);
    }
    findAll(req) {
        const userId = req.user?.id;
        const username = req.query.username;
        return this.reviewsService.findAll(userId, username);
    }
    remove(user, id) {
        if (!user) {
            throw new common_1.UnauthorizedException('Authentication required');
        }
        return this.reviewsService.remove(user.id, id);
    }
};
exports.ReviewsController = ReviewsController;
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Req)()),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, Object]),
    __metadata("design:returntype", void 0)
], ReviewsController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], ReviewsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], ReviewsController.prototype, "remove", null);
exports.ReviewsController = ReviewsController = __decorate([
    (0, common_1.Controller)('reviews'),
    __metadata("design:paramtypes", [reviews_service_1.ReviewsService])
], ReviewsController);
//# sourceMappingURL=reviews.controller.js.map
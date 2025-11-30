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
exports.AuthMiddleware = void 0;
const common_1 = require("@nestjs/common");
const users_service_1 = require("../../users/users.service");
let AuthMiddleware = class AuthMiddleware {
    constructor(usersService) {
        this.usersService = usersService;
    }
    async use(req, res, next) {
        const userId = req.headers['x-user-id'];
        const username = req.headers['x-username'];
        if (!userId && !username) {
            return next();
        }
        try {
            let user;
            if (userId) {
                try {
                    user = await this.usersService.findOne(userId);
                }
                catch (error) {
                    console.log(`[AuthMiddleware] User with ID ${userId} not found, continuing without authentication`);
                    return next();
                }
            }
            else if (username) {
                user = await this.usersService.findByUsername(username);
                if (!user) {
                    console.log(`[AuthMiddleware] User with username ${username} not found, continuing without authentication`);
                    return next();
                }
            }
            if (user) {
                req.user = user;
            }
            next();
        }
        catch (error) {
            console.error('[AuthMiddleware] Error during authentication:', error?.message || error);
            next();
        }
    }
};
exports.AuthMiddleware = AuthMiddleware;
exports.AuthMiddleware = AuthMiddleware = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [users_service_1.UsersService])
], AuthMiddleware);
//# sourceMappingURL=auth.middleware.js.map
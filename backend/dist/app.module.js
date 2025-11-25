"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const app_controller_1 = require("./app.controller");
const app_service_1 = require("./app.service");
const prisma_module_1 = require("./prisma/prisma.module");
const users_module_1 = require("./users/users.module");
const contact_module_1 = require("./contact/contact.module");
const projects_module_1 = require("./projects/projects.module");
const reviews_module_1 = require("./reviews/reviews.module");
const hero_section_module_1 = require("./hero-section/hero-section.module");
const about_section_module_1 = require("./about-section/about-section.module");
const upload_module_1 = require("./upload/upload.module");
const auth_middleware_1 = require("./common/middleware/auth.middleware");
let AppModule = class AppModule {
    configure(consumer) {
        consumer
            .apply(auth_middleware_1.AuthMiddleware)
            .forRoutes('*');
    }
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [prisma_module_1.PrismaModule, users_module_1.UsersModule, contact_module_1.ContactModule, projects_module_1.ProjectsModule, reviews_module_1.ReviewsModule, hero_section_module_1.HeroSectionModule, about_section_module_1.AboutSectionModule, upload_module_1.UploadModule],
        controllers: [app_controller_1.AppController],
        providers: [app_service_1.AppService, auth_middleware_1.AuthMiddleware],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map
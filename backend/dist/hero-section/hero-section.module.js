"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.HeroSectionModule = void 0;
const common_1 = require("@nestjs/common");
const hero_section_service_1 = require("./hero-section.service");
const hero_section_controller_1 = require("./hero-section.controller");
const upload_module_1 = require("../upload/upload.module");
const users_module_1 = require("../users/users.module");
let HeroSectionModule = class HeroSectionModule {
};
exports.HeroSectionModule = HeroSectionModule;
exports.HeroSectionModule = HeroSectionModule = __decorate([
    (0, common_1.Module)({
        imports: [upload_module_1.UploadModule, users_module_1.UsersModule],
        controllers: [hero_section_controller_1.HeroSectionController],
        providers: [hero_section_service_1.HeroSectionService],
    })
], HeroSectionModule);
//# sourceMappingURL=hero-section.module.js.map
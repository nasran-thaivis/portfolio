"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AboutSectionModule = void 0;
const common_1 = require("@nestjs/common");
const about_section_service_1 = require("./about-section.service");
const about_section_controller_1 = require("./about-section.controller");
const upload_module_1 = require("../upload/upload.module");
const users_module_1 = require("../users/users.module");
let AboutSectionModule = class AboutSectionModule {
};
exports.AboutSectionModule = AboutSectionModule;
exports.AboutSectionModule = AboutSectionModule = __decorate([
    (0, common_1.Module)({
        imports: [upload_module_1.UploadModule, users_module_1.UsersModule],
        controllers: [about_section_controller_1.AboutSectionController],
        providers: [about_section_service_1.AboutSectionService],
    })
], AboutSectionModule);
//# sourceMappingURL=about-section.module.js.map
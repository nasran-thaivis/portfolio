"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ContactSectionModule = void 0;
const common_1 = require("@nestjs/common");
const contact_section_service_1 = require("./contact-section.service");
const contact_section_controller_1 = require("./contact-section.controller");
const users_module_1 = require("../users/users.module");
let ContactSectionModule = class ContactSectionModule {
};
exports.ContactSectionModule = ContactSectionModule;
exports.ContactSectionModule = ContactSectionModule = __decorate([
    (0, common_1.Module)({
        imports: [users_module_1.UsersModule],
        controllers: [contact_section_controller_1.ContactSectionController],
        providers: [contact_section_service_1.ContactSectionService],
    })
], ContactSectionModule);
//# sourceMappingURL=contact-section.module.js.map
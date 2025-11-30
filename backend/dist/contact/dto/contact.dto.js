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
exports.UpdateContactStatusDto = exports.CreateContactDto = void 0;
const class_validator_1 = require("class-validator");
class CreateContactDto {
}
exports.CreateContactDto = CreateContactDto;
__decorate([
    (0, class_validator_1.IsString)({ message: 'ชื่อต้องเป็นข้อความ' }),
    (0, class_validator_1.IsNotEmpty)({ message: 'กรุณากรอกชื่อ' }),
    (0, class_validator_1.MaxLength)(100, { message: 'ชื่อต้องไม่เกิน 100 ตัวอักษร' }),
    __metadata("design:type", String)
], CreateContactDto.prototype, "name", void 0);
__decorate([
    (0, class_validator_1.IsEmail)({}, { message: 'อีเมลต้องเป็นรูปแบบอีเมลที่ถูกต้อง' }),
    (0, class_validator_1.IsNotEmpty)({ message: 'กรุณากรอกอีเมล' }),
    __metadata("design:type", String)
], CreateContactDto.prototype, "email", void 0);
__decorate([
    (0, class_validator_1.IsString)({ message: 'ข้อความต้องเป็นข้อความ' }),
    (0, class_validator_1.IsNotEmpty)({ message: 'กรุณากรอกข้อความ' }),
    (0, class_validator_1.MaxLength)(1000, { message: 'ข้อความต้องไม่เกิน 1000 ตัวอักษร' }),
    __metadata("design:type", String)
], CreateContactDto.prototype, "message", void 0);
__decorate([
    (0, class_validator_1.IsString)({ message: 'สถานะต้องเป็นข้อความ' }),
    (0, class_validator_1.IsNotEmpty)({ message: 'กรุณากรอกสถานะ' }),
    (0, class_validator_1.MaxLength)(100, { message: 'สถานะต้องไม่เกิน 100 ตัวอักษร' }),
    __metadata("design:type", String)
], CreateContactDto.prototype, "status", void 0);
class UpdateContactStatusDto {
}
exports.UpdateContactStatusDto = UpdateContactStatusDto;
//# sourceMappingURL=contact.dto.js.map
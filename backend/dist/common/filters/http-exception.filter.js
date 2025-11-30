"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.HttpExceptionFilter = void 0;
const common_1 = require("@nestjs/common");
let HttpExceptionFilter = class HttpExceptionFilter {
    catch(exception, host) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse();
        const status = exception.getStatus();
        const exceptionResponse = exception.getResponse();
        if (status === common_1.HttpStatus.BAD_REQUEST) {
            const message = exceptionResponse.message;
            const errors = {};
            if (Array.isArray(message)) {
                message.forEach((item) => {
                    if (typeof item === 'object' && item.property && item.constraints) {
                        const property = item.property.toLowerCase();
                        const constraintMessages = Object.values(item.constraints);
                        if (constraintMessages.length > 0 && ['name', 'email', 'message', 'status', 'username', 'password'].includes(property)) {
                            errors[property] = constraintMessages[0];
                        }
                    }
                    else if (typeof item === 'string') {
                        if (item.includes('ชื่อ') || item.toLowerCase().includes('name')) {
                            errors.name = item;
                        }
                        else if (item.includes('อีเมล') || item.toLowerCase().includes('email')) {
                            errors.email = item;
                        }
                        else if (item.includes('ข้อความ') || item.toLowerCase().includes('message')) {
                            errors.message = item;
                        }
                        else if (item.includes('สถานะ') || item.toLowerCase().includes('status')) {
                            errors.status = item;
                        }
                        else if (item.includes('username') || item.includes('ชื่อผู้ใช้')) {
                            errors.username = item;
                        }
                        else if (item.includes('รหัสผ่าน') || item.toLowerCase().includes('password')) {
                            errors.password = item;
                        }
                        else {
                            const propertyMatch = item.match(/^(\w+)\s/i);
                            if (propertyMatch) {
                                const property = propertyMatch[1].toLowerCase();
                                if (['name', 'email', 'message', 'status', 'username', 'password'].includes(property)) {
                                    errors[property] = item;
                                }
                            }
                        }
                    }
                });
            }
            if (Object.keys(errors).length > 0) {
                return response.status(status).json({
                    statusCode: status,
                    message: 'Validation failed',
                    errors: errors,
                });
            }
        }
        const message = typeof exceptionResponse === 'string'
            ? exceptionResponse
            : exceptionResponse.message || 'An error occurred';
        response.status(status).json({
            statusCode: status,
            message: Array.isArray(message) ? message : [message],
            error: exception.name,
        });
    }
};
exports.HttpExceptionFilter = HttpExceptionFilter;
exports.HttpExceptionFilter = HttpExceptionFilter = __decorate([
    (0, common_1.Catch)(common_1.HttpException)
], HttpExceptionFilter);
//# sourceMappingURL=http-exception.filter.js.map
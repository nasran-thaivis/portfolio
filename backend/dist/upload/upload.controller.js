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
exports.UploadController = void 0;
const common_1 = require("@nestjs/common");
const platform_express_1 = require("@nestjs/platform-express");
const upload_service_1 = require("./upload.service");
let UploadController = class UploadController {
    constructor(uploadService) {
        this.uploadService = uploadService;
    }
    async uploadImage(file) {
        try {
            console.log('[UploadController] Image upload request received');
            if (!file) {
                console.error('[UploadController] No file uploaded');
                throw new common_1.BadRequestException('No file uploaded');
            }
            console.log(`[UploadController] Uploading file: ${file.originalname}, size: ${file.size} bytes, type: ${file.mimetype}`);
            const url = await this.uploadService.uploadFile(file, 'images');
            console.log(`[UploadController] File uploaded successfully: ${url}`);
            return {
                url,
                message: 'File uploaded successfully',
            };
        }
        catch (error) {
            console.error('[UploadController] Error uploading image:', error?.message || error);
            throw error;
        }
    }
    async getSignedUrl(url) {
        if (!url) {
            throw new common_1.BadRequestException('URL parameter is required');
        }
        const signedUrl = await this.uploadService.getSignedUrl(url);
        return {
            signedUrl,
        };
    }
    async getImage(path, url, res) {
        const urlOrPath = path || url;
        if (!urlOrPath) {
            throw new common_1.BadRequestException('path or url parameter is required');
        }
        try {
            const { Body, ContentType } = await this.uploadService.getImageStream(urlOrPath);
            if (ContentType) {
                res.setHeader('Content-Type', ContentType);
            }
            else {
                res.setHeader('Content-Type', 'image/jpeg');
            }
            res.setHeader('Cache-Control', 'public, max-age=3600');
            res.setHeader('ETag', `"${urlOrPath}"`);
            const chunks = [];
            if (Body && typeof Body === 'object') {
                if (Body instanceof Buffer) {
                    return res.send(Body);
                }
                if (typeof Body.transformToByteArray === 'function') {
                    const buffer = await Body.transformToByteArray();
                    return res.send(Buffer.from(buffer));
                }
                if (Symbol.asyncIterator in Body || Symbol.iterator in Body) {
                    for await (const chunk of Body) {
                        chunks.push(chunk instanceof Uint8Array ? chunk : new Uint8Array(chunk));
                    }
                    return res.send(Buffer.concat(chunks.map(chunk => Buffer.from(chunk))));
                }
                if (typeof Body.pipe === 'function') {
                    return Body.pipe(res);
                }
            }
            const buffer = await this.streamToBuffer(Body);
            res.send(buffer);
        }
        catch (error) {
            console.error('Error streaming image:', error);
            throw new common_1.NotFoundException('Image not found');
        }
    }
    async streamToBuffer(stream) {
        const chunks = [];
        if (stream instanceof Buffer) {
            return stream;
        }
        if (stream && typeof stream.transformToByteArray === 'function') {
            const array = await stream.transformToByteArray();
            return Buffer.from(array);
        }
        if (stream && (Symbol.asyncIterator in stream || Symbol.iterator in stream)) {
            for await (const chunk of stream) {
                chunks.push(Buffer.from(chunk));
            }
            return Buffer.concat(chunks);
        }
        throw new Error('Unable to convert stream to buffer');
    }
};
exports.UploadController = UploadController;
__decorate([
    (0, common_1.Post)('image'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('file', {
        limits: {
            fileSize: 5 * 1024 * 1024,
        },
        fileFilter: (req, file, cb) => {
            if (!file.mimetype.startsWith('image/')) {
                console.error(`[UploadController] Invalid file type: ${file.mimetype}`);
                return cb(new common_1.BadRequestException('Only image files are allowed'), false);
            }
            cb(null, true);
        },
    })),
    __param(0, (0, common_1.UploadedFile)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], UploadController.prototype, "uploadImage", null);
__decorate([
    (0, common_1.Get)('signed-url'),
    __param(0, (0, common_1.Query)('url')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], UploadController.prototype, "getSignedUrl", null);
__decorate([
    (0, common_1.Get)('image'),
    __param(0, (0, common_1.Query)('path')),
    __param(1, (0, common_1.Query)('url')),
    __param(2, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", Promise)
], UploadController.prototype, "getImage", null);
exports.UploadController = UploadController = __decorate([
    (0, common_1.Controller)('upload'),
    __metadata("design:paramtypes", [upload_service_1.UploadService])
], UploadController);
//# sourceMappingURL=upload.controller.js.map
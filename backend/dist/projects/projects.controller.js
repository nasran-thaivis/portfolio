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
exports.ProjectsController = void 0;
const common_1 = require("@nestjs/common");
const projects_service_1 = require("./projects.service");
const create_project_dto_1 = require("./dto/create-project.dto");
const update_project_dto_1 = require("./dto/update-project.dto");
const user_decorator_1 = require("../common/decorators/user.decorator");
let ProjectsController = class ProjectsController {
    constructor(projectsService) {
        this.projectsService = projectsService;
    }
    async create(user, req, createProjectDto) {
        try {
            let identifier = user?.id;
            const headerUsername = req.headers['x-username'];
            const headerUserId = req.headers['x-user-id'];
            if (!identifier && headerUsername) {
                identifier = headerUsername;
                console.log(`[ProjectsController] Using username from header: ${headerUsername}`);
            }
            else if (!identifier && headerUserId) {
                identifier = headerUserId;
                console.log(`[ProjectsController] Using x-user-id from header: ${headerUserId}`);
            }
            if (!identifier) {
                console.error('[ProjectsController] Create attempted without authentication or userId/username');
                throw new common_1.UnauthorizedException('Authentication required. Please provide x-user-id or x-username header.');
            }
            console.log(`[ProjectsController] Creating project for userId/username: ${identifier}`);
            console.log(`[ProjectsController] Request body:`, JSON.stringify(createProjectDto, null, 2));
            return await this.projectsService.create(identifier, createProjectDto);
        }
        catch (error) {
            console.error('[ProjectsController] Error in create:', error);
            throw error;
        }
    }
    findAll(req) {
        const userId = req.user?.id;
        const username = req.query.username;
        return this.projectsService.findAll(userId, username);
    }
    findOne(id) {
        return this.projectsService.findOne(id);
    }
    update(user, id, updateProjectDto) {
        if (!user) {
            throw new common_1.UnauthorizedException('Authentication required');
        }
        return this.projectsService.update(user.id, id, updateProjectDto);
    }
    remove(user, id) {
        if (!user) {
            throw new common_1.UnauthorizedException('Authentication required');
        }
        return this.projectsService.remove(user.id, id);
    }
};
exports.ProjectsController = ProjectsController;
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Req)()),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, create_project_dto_1.CreateProjectDto]),
    __metadata("design:returntype", Promise)
], ProjectsController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], ProjectsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], ProjectsController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)(':id'),
    __param(0, (0, user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, update_project_dto_1.UpdateProjectDto]),
    __metadata("design:returntype", void 0)
], ProjectsController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], ProjectsController.prototype, "remove", null);
exports.ProjectsController = ProjectsController = __decorate([
    (0, common_1.Controller)('projects'),
    __metadata("design:paramtypes", [projects_service_1.ProjectsService])
], ProjectsController);
//# sourceMappingURL=projects.controller.js.map
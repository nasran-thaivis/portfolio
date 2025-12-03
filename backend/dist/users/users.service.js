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
exports.UsersService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let UsersService = class UsersService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findAll() {
        return this.prisma.user.findMany({
            select: {
                id: true,
                email: true,
                name: true,
                username: true,
                createdAt: true,
                updatedAt: true,
            },
        });
    }
    async findOne(id) {
        const user = await this.prisma.user.findUnique({
            where: { id },
            select: {
                id: true,
                email: true,
                name: true,
                username: true,
                createdAt: true,
                updatedAt: true,
            },
        });
        if (!user) {
            throw new common_1.NotFoundException(`User with ID ${id} not found`);
        }
        return user;
    }
    async findByEmail(email) {
        return this.prisma.user.findUnique({
            where: { email },
        });
    }
    async findByUsername(username) {
        return this.prisma.user.findUnique({
            where: { username },
            select: {
                id: true,
                email: true,
                name: true,
                username: true,
                createdAt: true,
                updatedAt: true,
            },
        });
    }
    async checkUsernameAvailability(username) {
        const user = await this.prisma.user.findUnique({
            where: { username },
        });
        return !user;
    }
    async validateUser(email, password) {
        console.log('[UsersService] validateUser() called with:', { email, hasPassword: !!password });
        const user = await this.prisma.user.findUnique({
            where: { email },
        });
        if (!user) {
            console.log('[UsersService] User not found with email:', email);
            return null;
        }
        if (user.password !== password) {
            console.log('[UsersService] Password mismatch for email:', email);
            return null;
        }
        console.log('[UsersService] Login successful for user:', { id: user.id, email: user.email, username: user.username });
        const { password: _, ...userWithoutPassword } = user;
        return userWithoutPassword;
    }
    async create(createUserDto) {
        console.log('[UsersService] create() called with:', {
            email: createUserDto.email,
            name: createUserDto.name,
            username: createUserDto.username,
            hasPassword: !!createUserDto.password,
        });
        const existingEmail = await this.prisma.user.findUnique({
            where: { email: createUserDto.email },
        });
        if (existingEmail) {
            console.log('[UsersService] Email already exists:', createUserDto.email);
            throw new common_1.ConflictException('Email already exists');
        }
        const existingUsername = await this.prisma.user.findUnique({
            where: { username: createUserDto.username },
        });
        if (existingUsername) {
            console.log('[UsersService] Username already exists:', createUserDto.username);
            throw new common_1.ConflictException('Username already exists');
        }
        console.log('[UsersService] Creating user with data:', {
            email: createUserDto.email,
            name: createUserDto.name,
            username: createUserDto.username,
        });
        const user = await this.prisma.user.create({
            data: createUserDto,
            select: {
                id: true,
                email: true,
                name: true,
                username: true,
                createdAt: true,
                updatedAt: true,
            },
        });
        console.log('[UsersService] User created successfully:', {
            id: user.id,
            email: user.email,
            name: user.name,
            username: user.username,
        });
        return user;
    }
    async update(id, updateUserDto) {
        await this.findOne(id);
        const user = await this.prisma.user.update({
            where: { id },
            data: updateUserDto,
            select: {
                id: true,
                email: true,
                name: true,
                username: true,
                createdAt: true,
                updatedAt: true,
            },
        });
        return user;
    }
    async remove(id) {
        await this.findOne(id);
        await this.prisma.user.delete({
            where: { id },
        });
        return { message: 'User deleted successfully' };
    }
    async ensureUserExists(userIdOrUsername) {
        console.log(`[UsersService] ensureUserExists() called with: ${userIdOrUsername}`);
        const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(userIdOrUsername);
        const isCUID = /^c[a-z0-9]{24}$/i.test(userIdOrUsername);
        const isNumericId = /^\d+$/.test(userIdOrUsername);
        let user = null;
        if (isUUID || isCUID || isNumericId) {
            try {
                user = await this.prisma.user.findUnique({
                    where: { id: userIdOrUsername },
                });
                if (user) {
                    console.log(`[UsersService] Found user by ID: ${userIdOrUsername}`, { id: user.id, email: user.email, username: user.username });
                }
            }
            catch (error) {
                console.log(`[UsersService] User with ID ${userIdOrUsername} not found, trying username`);
            }
        }
        if (!user) {
            user = await this.prisma.user.findUnique({
                where: { username: userIdOrUsername },
            });
            if (user) {
                console.log(`[UsersService] Found user by username: ${userIdOrUsername}`, { id: user.id, email: user.email, username: user.username });
            }
        }
        if (user) {
            console.log(`[UsersService] Returning existing user: ${user.username} (${user.id})`);
            return user;
        }
        console.warn(`[UsersService] User not found: ${userIdOrUsername}. Creating auto-generated user.`);
        console.warn(`[UsersService] ⚠️ This should only happen when saving data in Admin dashboard for the first time.`);
        const username = (isUUID || isCUID || isNumericId) ? `user_${Date.now()}` : userIdOrUsername;
        const name = (isUUID || isCUID || isNumericId) ? `User ${Date.now()}` : userIdOrUsername;
        const email = `${username}_${Date.now()}@auto-generated.local`;
        const newUser = await this.prisma.user.create({
            data: {
                username,
                name,
                email,
                password: 'auto-generated-password-change-me',
            },
            select: {
                id: true,
                email: true,
                name: true,
                username: true,
                createdAt: true,
                updatedAt: true,
            },
        });
        console.log(`[UsersService] Auto-created user: ${username} (${newUser.id}) with email: ${email}`);
        return newUser;
    }
};
exports.UsersService = UsersService;
exports.UsersService = UsersService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], UsersService);
//# sourceMappingURL=users.service.js.map
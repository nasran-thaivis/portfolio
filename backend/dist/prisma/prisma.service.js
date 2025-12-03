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
var PrismaService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.PrismaService = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
let PrismaService = PrismaService_1 = class PrismaService extends client_1.PrismaClient {
    constructor() {
        super();
        this.logger = new common_1.Logger(PrismaService_1.name);
        const dbUrl = process.env.DATABASE_URL;
        if (!dbUrl) {
            this.logger.error('❌ DATABASE_URL is not set!');
            this.logger.error('Please set DATABASE_URL environment variable');
            throw new Error('DATABASE_URL environment variable is required');
        }
        const isProduction = process.env.NODE_ENV === 'production';
        if (isProduction && (dbUrl.includes('localhost') || dbUrl.includes('127.0.0.1'))) {
            this.logger.error('❌ ERROR: DATABASE_URL contains localhost/127.0.0.1 in production environment!');
            this.logger.error('This will not work in production. For Render.com deployment:');
            this.logger.error('1. Go to Render Dashboard → Your PostgreSQL Service');
            this.logger.error('2. Copy the "Internal Database URL"');
            this.logger.error('3. Set it as DATABASE_URL in your Web Service Environment Variables');
            throw new Error('DATABASE_URL cannot point to localhost in production environment');
        }
        const maskedUrl = dbUrl.replace(/:[^:@]+@/, ':****@');
        this.logger.log(`📝 DATABASE_URL: ${maskedUrl}`);
        if (!dbUrl.startsWith('mysql://') && !dbUrl.startsWith('postgresql://') && !dbUrl.startsWith('postgres://')) {
            this.logger.warn('⚠️ WARNING: DATABASE_URL should start with mysql://, postgresql:// or postgres://');
        }
    }
    async onModuleInit() {
        try {
            const maxRetries = 5;
            let retries = 0;
            while (retries < maxRetries) {
                try {
                    await this.$connect();
                    const currentDbUrl = process.env.DATABASE_URL || '';
                    const dbType = currentDbUrl.startsWith('mysql://') ? 'MySQL' : 'PostgreSQL';
                    this.logger.log(`✅ Connected to ${dbType} database`);
                    return;
                }
                catch (error) {
                    retries++;
                    if (retries >= maxRetries) {
                        this.logger.error(`❌ Failed to connect to database after ${maxRetries} attempts`);
                        const dbUrl = process.env.DATABASE_URL;
                        if (dbUrl) {
                            const maskedUrl = dbUrl.replace(/:[^:@]+@/, ':****@');
                            this.logger.error(`DATABASE_URL: ${maskedUrl}`);
                            if (error instanceof Error) {
                                if (error.message.includes("Can't reach database server")) {
                                    this.logger.error('');
                                    this.logger.error('🔍 Troubleshooting steps:');
                                    this.logger.error('1. Verify DATABASE_URL is correctly set in your environment variables');
                                    this.logger.error('2. Check that DATABASE_URL points to your database (MySQL or PostgreSQL)');
                                    this.logger.error('3. Ensure the database server is running and accessible');
                                    this.logger.error('4. Check network connectivity and firewall settings');
                                }
                                else if (error.message.includes('authentication failed')) {
                                    this.logger.error('');
                                    this.logger.error('🔍 Authentication failed:');
                                    this.logger.error('1. Verify database username and password in DATABASE_URL');
                                    this.logger.error('2. Check that the database user has proper permissions');
                                }
                                else if (error.message.includes('database') && error.message.includes('does not exist')) {
                                    this.logger.error('');
                                    this.logger.error('🔍 Database does not exist:');
                                    this.logger.error('1. Verify the database name in DATABASE_URL is correct');
                                    this.logger.error('2. Run migrations: npx prisma migrate deploy');
                                }
                            }
                        }
                        else {
                            this.logger.error('DATABASE_URL: Not set');
                            this.logger.error('Please set DATABASE_URL environment variable');
                        }
                        throw error;
                    }
                    this.logger.warn(`⚠️ Database connection attempt ${retries}/${maxRetries} failed, retrying in 2 seconds...`);
                    await new Promise(resolve => setTimeout(resolve, 2000));
                }
            }
        }
        catch (error) {
            this.logger.error('❌ Database connection error:', error);
            throw error;
        }
    }
    async onModuleDestroy() {
        await this.$disconnect();
        this.logger.log('❌ Disconnected from database');
    }
};
exports.PrismaService = PrismaService;
exports.PrismaService = PrismaService = PrismaService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [])
], PrismaService);
//# sourceMappingURL=prisma.service.js.map
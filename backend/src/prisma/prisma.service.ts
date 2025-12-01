import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(PrismaService.name);

  constructor() {
    super({
      datasources: {
        db: {
          url: process.env.DATABASE_URL,
        },
      },
    });
    
    // Validate and log DATABASE_URL for debugging (without password)
    const dbUrl = process.env.DATABASE_URL;
    if (!dbUrl) {
      this.logger.error('❌ DATABASE_URL is not set!');
      this.logger.error('Please set DATABASE_URL environment variable');
      throw new Error('DATABASE_URL environment variable is required');
    }

    // Check for localhost in production environment
    const isProduction = process.env.NODE_ENV === 'production';
    if (isProduction && dbUrl.includes('localhost')) {
      this.logger.warn('⚠️ WARNING: DATABASE_URL contains localhost in production environment!');
      this.logger.warn('This usually indicates a misconfiguration. For Render.com deployment,');
      this.logger.warn('make sure DATABASE_URL is set to your Render PostgreSQL database URL.');
    }

    const maskedUrl = dbUrl.replace(/:[^:@]+@/, ':****@');
    this.logger.log(`📝 DATABASE_URL: ${maskedUrl}`);
    
    // Validate DATABASE_URL format
    if (!dbUrl.startsWith('postgresql://') && !dbUrl.startsWith('postgres://')) {
      this.logger.warn('⚠️ WARNING: DATABASE_URL does not start with postgresql:// or postgres://');
    }
  }

  async onModuleInit() {
    try {
      const maxRetries = 5;
      let retries = 0;
      
      while (retries < maxRetries) {
        try {
          await this.$connect();
          this.logger.log('✅ Connected to PostgreSQL database');
          return;
        } catch (error) {
          retries++;
          if (retries >= maxRetries) {
            this.logger.error(`❌ Failed to connect to database after ${maxRetries} attempts`);
            const dbUrl = process.env.DATABASE_URL;
            if (dbUrl) {
              const maskedUrl = dbUrl.replace(/:[^:@]+@/, ':****@');
              this.logger.error(`DATABASE_URL: ${maskedUrl}`);
              
              // Provide helpful error messages based on error type
              if (error instanceof Error) {
                if (error.message.includes("Can't reach database server")) {
                  this.logger.error('');
                  this.logger.error('🔍 Troubleshooting steps:');
                  this.logger.error('1. Verify DATABASE_URL is correctly set in your environment variables');
                  this.logger.error('2. For Render.com: Check that DATABASE_URL points to your Render PostgreSQL database');
                  this.logger.error('3. Ensure the database server is running and accessible');
                  this.logger.error('4. Check network connectivity and firewall settings');
                } else if (error.message.includes('authentication failed')) {
                  this.logger.error('');
                  this.logger.error('🔍 Authentication failed:');
                  this.logger.error('1. Verify database username and password in DATABASE_URL');
                  this.logger.error('2. Check that the database user has proper permissions');
                } else if (error.message.includes('database') && error.message.includes('does not exist')) {
                  this.logger.error('');
                  this.logger.error('🔍 Database does not exist:');
                  this.logger.error('1. Verify the database name in DATABASE_URL is correct');
                  this.logger.error('2. Run migrations: npx prisma migrate deploy');
                }
              }
            } else {
              this.logger.error('DATABASE_URL: Not set');
              this.logger.error('Please set DATABASE_URL environment variable');
            }
            throw error;
          }
          this.logger.warn(`⚠️ Database connection attempt ${retries}/${maxRetries} failed, retrying in 2 seconds...`);
          await new Promise(resolve => setTimeout(resolve, 2000));
        }
      }
    } catch (error) {
      this.logger.error('❌ Database connection error:', error);
      throw error;
    }
  }

  async onModuleDestroy() {
    await this.$disconnect();
    this.logger.log('❌ Disconnected from database');
  }
}


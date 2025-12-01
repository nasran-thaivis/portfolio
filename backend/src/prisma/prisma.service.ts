import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(PrismaService.name);

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
            this.logger.error(`DATABASE_URL: ${process.env.DATABASE_URL ? 'Set' : 'Not set'}`);
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


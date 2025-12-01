import { Module } from '@nestjs/common';
import { HeroSectionService } from './hero-section.service';
import { HeroSectionController } from './hero-section.controller';
import { UploadModule } from '../upload/upload.module';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [UploadModule, UsersModule],
  controllers: [HeroSectionController],
  providers: [HeroSectionService],
})
export class HeroSectionModule {}

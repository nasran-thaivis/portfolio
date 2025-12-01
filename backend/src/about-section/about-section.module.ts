import { Module } from '@nestjs/common';
import { AboutSectionService } from './about-section.service';
import { AboutSectionController } from './about-section.controller';
import { UploadModule } from '../upload/upload.module';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [UploadModule, UsersModule],
  controllers: [AboutSectionController],
  providers: [AboutSectionService],
})
export class AboutSectionModule {}

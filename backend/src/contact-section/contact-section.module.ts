import { Module } from '@nestjs/common';
import { ContactSectionService } from './contact-section.service';
import { ContactSectionController } from './contact-section.controller';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [UsersModule],
  controllers: [ContactSectionController],
  providers: [ContactSectionService],
})
export class ContactSectionModule {}


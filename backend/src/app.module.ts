import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { UsersModule } from './users/users.module';
import { ContactModule } from './contact/contact.module';
import { ProjectsModule } from './projects/projects.module';
import { ReviewsModule } from './reviews/reviews.module';
import { HeroSectionModule } from './hero-section/hero-section.module';
import { AboutSectionModule } from './about-section/about-section.module';
import { UploadModule } from './upload/upload.module';
import { AuthMiddleware } from './common/middleware/auth.middleware';

@Module({
  imports: [PrismaModule, UsersModule, ContactModule, ProjectsModule, ReviewsModule, HeroSectionModule, AboutSectionModule, UploadModule],
  controllers: [AppController],
  providers: [AppService, AuthMiddleware],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(AuthMiddleware)
      .forRoutes('*');
  }
}


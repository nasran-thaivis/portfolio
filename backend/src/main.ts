import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { json, urlencoded } from 'express'; // <--- 1. Import ตัวนี้เพิ่มมา
import { ValidationPipe } from '@nestjs/common';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // === 2. เพิ่มส่วนนี้เพื่อรองรับการส่งรูปภาพขนาดใหญ่ (แก้ Error 413 Payload Too Large) ===
  // กำหนดไว้ 10mb เพื่อให้รองรับ Base64 string ยาวๆ ได้สบาย
  app.use(json({ limit: '10mb' }));
  app.use(urlencoded({ extended: true, limit: '10mb' }));
  // ==========================================================================
  
  // Enable CORS for frontend
  const corsOrigin = process.env.CORS_ORIGIN || 'http://localhost:3000';
  const allowedOrigins = corsOrigin.split(',').map(origin => origin.trim());
  
  app.enableCors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps or curl requests)
      if (!origin) return callback(null, true);
      
      // Check if origin is in allowed list
      if (allowedOrigins.includes(origin) || allowedOrigins.includes('*')) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
  });
  
  // Global prefix (URL จะเป็น localhost:3001/api/...)
  app.setGlobalPrefix('api');
  
  // Global ValidationPipe - validates DTOs and uses custom messages from DTO decorators
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // Strip properties that don't have decorators
      forbidNonWhitelisted: false, // Don't throw error for non-whitelisted properties
      transform: true, // Automatically transform payloads to DTO instances
      transformOptions: {
        enableImplicitConversion: true, // Enable implicit type conversion
      },
    }),
  );
  
  // Global exception filter to format validation errors
  app.useGlobalFilters(new HttpExceptionFilter());
  
  // Port configuration - Render will set PORT automatically, fallback to 3001 for local development
  const port = process.env.PORT || 3001; 
  
  await app.listen(port);
  console.log(`🚀 Backend is running on: http://localhost:${port}/api`);
}

bootstrap();
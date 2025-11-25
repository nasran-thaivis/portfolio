import {
  Controller,
  Post,
  Get,
  Query,
  Res,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Response } from 'express';
import { UploadService } from './upload.service';

@Controller('upload')
export class UploadController {
  constructor(private readonly uploadService: UploadService) {}

  @Post('image')
  @UseInterceptors(
    FileInterceptor('file', {
      limits: {
        fileSize: 5 * 1024 * 1024, // 5MB
      },
      fileFilter: (req, file, cb) => {
        // ตรวจสอบว่าเป็นไฟล์รูปภาพเท่านั้น
        if (!file.mimetype.startsWith('image/')) {
          console.error(`[UploadController] Invalid file type: ${file.mimetype}`);
          return cb(
            new BadRequestException('Only image files are allowed'),
            false,
          );
        }
        cb(null, true);
      },
    }),
  )
  async uploadImage(@UploadedFile() file: Express.Multer.File) {
    try {
      console.log('[UploadController] Image upload request received');
      
      if (!file) {
        console.error('[UploadController] No file uploaded');
        throw new BadRequestException('No file uploaded');
      }

      console.log(`[UploadController] Uploading file: ${file.originalname}, size: ${file.size} bytes, type: ${file.mimetype}`);

      // อัปโหลดไฟล์ไปยัง S3
      const url = await this.uploadService.uploadFile(file, 'images');

      console.log(`[UploadController] File uploaded successfully: ${url}`);

      return {
        url,
        message: 'File uploaded successfully',
      };
    } catch (error: any) {
      console.error('[UploadController] Error uploading image:', error?.message || error);
      throw error;
    }
  }

  @Get('signed-url')
  async getSignedUrl(@Query('url') url: string) {
    if (!url) {
      throw new BadRequestException('URL parameter is required');
    }

    const signedUrl = await this.uploadService.getSignedUrl(url);
    return {
      signedUrl,
    };
  }

  @Get('image')
  async getImage(
    @Query('path') path: string,
    @Query('url') url: string,
    @Res() res: Response,
  ) {
    // ต้องมี path หรือ url อย่างใดอย่างหนึ่ง
    const urlOrPath = path || url;
    if (!urlOrPath) {
      throw new BadRequestException('path or url parameter is required');
    }

    try {
      // ดึงไฟล์จาก DigitalOcean Spaces
      const { Body, ContentType } = await this.uploadService.getImageStream(urlOrPath);

      // Set headers
      if (ContentType) {
        res.setHeader('Content-Type', ContentType);
      } else {
        // Default to image/jpeg if ContentType is not available
        res.setHeader('Content-Type', 'image/jpeg');
      }
      
      // Set cache headers (cache 1 hour)
      res.setHeader('Cache-Control', 'public, max-age=3600');
      res.setHeader('ETag', `"${urlOrPath}"`);

      // AWS SDK v3 returns a Readable stream
      // Convert it to a buffer and send
      const chunks: Uint8Array[] = [];
      
      // Handle different stream types
      if (Body && typeof Body === 'object') {
        // If it's already a buffer
        if (Body instanceof Buffer) {
          return res.send(Body);
        }
        
        // If it has a transformToByteArray method (AWS SDK v3 Readable)
        if (typeof (Body as any).transformToByteArray === 'function') {
          const buffer = await (Body as any).transformToByteArray();
          return res.send(Buffer.from(buffer));
        }
        
        // If it's an async iterable
        if (Symbol.asyncIterator in Body || Symbol.iterator in Body) {
          for await (const chunk of Body as any) {
            chunks.push(chunk instanceof Uint8Array ? chunk : new Uint8Array(chunk));
          }
          return res.send(Buffer.concat(chunks.map(chunk => Buffer.from(chunk))));
        }
        
        // If it has a pipe method (Node.js stream)
        if (typeof (Body as any).pipe === 'function') {
          return (Body as any).pipe(res);
        }
      }

      // Fallback: try to read as buffer
      const buffer = await this.streamToBuffer(Body);
      res.send(buffer);
    } catch (error) {
      console.error('Error streaming image:', error);
      throw new NotFoundException('Image not found');
    }
  }

  private async streamToBuffer(stream: any): Promise<Buffer> {
    const chunks: Buffer[] = [];
    
    if (stream instanceof Buffer) {
      return stream;
    }
    
    if (stream && typeof stream.transformToByteArray === 'function') {
      const array = await stream.transformToByteArray();
      return Buffer.from(array);
    }
    
    if (stream && (Symbol.asyncIterator in stream || Symbol.iterator in stream)) {
      for await (const chunk of stream) {
        chunks.push(Buffer.from(chunk));
      }
      return Buffer.concat(chunks);
    }
    
    throw new Error('Unable to convert stream to buffer');
  }
}


import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { S3Client, PutObjectCommand, DeleteObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class UploadService {
  private s3Client: S3Client;
  private bucketName: string;
  private endpoint: string;

  constructor() {
    // ตรวจสอบ environment variables
    const endpoint = process.env.DO_SPACES_ENDPOINT;
    const region = process.env.DO_SPACES_REGION;
    const accessKeyId = process.env.DO_SPACES_KEY;
    const secretAccessKey = process.env.DO_SPACES_SECRET;
    this.bucketName = process.env.DO_SPACES_BUCKET;

    if (!endpoint || !region || !accessKeyId || !secretAccessKey || !this.bucketName) {
      console.warn('⚠️ DigitalOcean Spaces credentials not configured. Upload service may not work.');
    }

    this.endpoint = endpoint;

    // สร้าง S3 Client สำหรับ DigitalOcean Spaces
    this.s3Client = new S3Client({
      endpoint,
      region,
      credentials: {
        accessKeyId,
        secretAccessKey,
      },
      forcePathStyle: false, // DigitalOcean Spaces ใช้ virtual-hosted-style
    });
  }

  /**
   * อัปโหลดไฟล์ไปยัง DigitalOcean Spaces
   * @param file - ไฟล์จาก Multer
   * @param folder - โฟลเดอร์ใน bucket (เช่น 'images', 'logos')
   * @returns Path ของไฟล์ใน bucket (เช่น 'images/f8307809-0faa-4c6a-ae4f-9881e09c1cba.jpeg')
   */
  async uploadFile(file: any, folder: string = 'uploads'): Promise<string> {
    try {
      // สร้างชื่อไฟล์ที่ไม่ซ้ำกัน
      const fileExtension = file.originalname.split('.').pop();
      const fileName = `${folder}/${uuidv4()}.${fileExtension}`;

      // อัปโหลดไฟล์ (private - ไม่มี ACL)
      await this.s3Client.send(
        new PutObjectCommand({
          Bucket: this.bucketName,
          Key: fileName,
          Body: file.buffer,
          ContentType: file.mimetype,
        }),
      );

      // คืนเฉพาะ path (ไม่ใช่ full URL)
      return fileName;
    } catch (error) {
      console.error('Error uploading file to S3:', error);
      throw new InternalServerErrorException('Failed to upload file to storage');
    }
  }

  /**
   * แปลง path เป็น full URL
   * @param path - Path ของไฟล์ใน bucket (เช่น 'images/file.jpeg')
   * @returns Full URL ของไฟล์
   */
  getFullUrl(path: string): string {
    if (!path) return path;
    
    // ถ้าเป็น full URL อยู่แล้ว ให้คืนค่าเดิม
    if (path.startsWith('http://') || path.startsWith('https://')) {
      return path;
    }

    // สร้าง full URL จาก path
    return `${this.endpoint}/${this.bucketName}/${path}`;
  }

  /**
   * แปลง URL หรือ path เป็น path ใน bucket
   * @param urlOrPath - Full URL หรือ path ของไฟล์
   * @returns Path ใน bucket
   */
  private extractPath(urlOrPath: string): string {
    if (!urlOrPath) return urlOrPath;

    // ถ้าเป็น path อยู่แล้ว (ไม่มี http:// หรือ https://)
    if (!urlOrPath.startsWith('http://') && !urlOrPath.startsWith('https://')) {
      return urlOrPath;
    }

    try {
      // ถ้าเป็น full URL ให้แยก path ออกมา
      // URL format: https://endpoint/bucket-name/folder/file.ext
      // หรือ: https://bucket-name.endpoint/folder/file.ext (virtual-hosted-style)
      
      // ลองหา bucket name ใน URL
      const bucketPattern = `/${this.bucketName}/`;
      const bucketIndex = urlOrPath.indexOf(bucketPattern);
      
      if (bucketIndex !== -1) {
        // พบ bucket name ใน path-style URL
        return urlOrPath.substring(bucketIndex + bucketPattern.length);
      }

      // ลองหา endpoint ใน URL
      if (this.endpoint) {
        const endpointIndex = urlOrPath.indexOf(this.endpoint);
        if (endpointIndex !== -1) {
          const afterEndpoint = urlOrPath.substring(endpointIndex + this.endpoint.length);
          // ลบ leading slash ถ้ามี
          const path = afterEndpoint.startsWith('/') ? afterEndpoint.substring(1) : afterEndpoint;
          
          // ถ้า path เริ่มด้วย bucket name ให้ลบออก
          if (path.startsWith(`${this.bucketName}/`)) {
            return path.substring(this.bucketName.length + 1);
          }
          
          return path;
        }
      }

      // ถ้าไม่พบรูปแบบที่รู้จัก ให้ลองแยกจาก URL structure
      // URL format: https://domain/path
      const urlObj = new URL(urlOrPath);
      const pathname = urlObj.pathname;
      
      // ลบ leading slash
      const path = pathname.startsWith('/') ? pathname.substring(1) : pathname;
      
      // ถ้า path เริ่มด้วย bucket name ให้ลบออก
      if (path.startsWith(`${this.bucketName}/`)) {
        return path.substring(this.bucketName.length + 1);
      }
      
      return path;
    } catch (error) {
      // ถ้า parse URL ไม่ได้ อาจเป็น path ที่ไม่ถูกต้อง
      console.warn(`Could not extract path from: ${urlOrPath}`, error);
      return urlOrPath;
    }
  }

  /**
   * ลบไฟล์จาก DigitalOcean Spaces
   * @param urlOrPath - URL หรือ path ของไฟล์ที่ต้องการลบ
   */
  async deleteFile(urlOrPath: string): Promise<void> {
    try {
      // แปลง URL หรือ path เป็น path ใน bucket
      const fileName = this.extractPath(urlOrPath);
      
      if (!fileName) {
        console.warn('Invalid file URL or path, cannot extract fileName:', urlOrPath);
        return;
      }

      await this.s3Client.send(
        new DeleteObjectCommand({
          Bucket: this.bucketName,
          Key: fileName,
        }),
      );

      console.log(`✅ Deleted file from S3: ${fileName}`);
    } catch (error) {
      console.error('Error deleting file from S3:', error);
      // ไม่ throw error เพราะการลบไฟล์ไม่สำเร็จไม่ควรทำให้ระบบล้มเหลว
    }
  }

  /**
   * สร้าง presigned URL สำหรับเข้าถึงไฟล์ private
   * @param urlOrPath - URL หรือ path ของไฟล์ที่ต้องการสร้าง signed URL
   * @param expiresIn - เวลาหมดอายุเป็นวินาที (default: 3600 = 1 ชั่วโมง)
   * @returns Presigned URL ที่ใช้ได้ชั่วคราว
   */
  async getSignedUrl(urlOrPath: string, expiresIn: number = 3600): Promise<string> {
    try {
      if (!urlOrPath) {
        return urlOrPath;
      }

      // แปลง URL หรือ path เป็น path ใน bucket
      const fileName = this.extractPath(urlOrPath);
      
      // สร้าง GetObjectCommand
      const command = new GetObjectCommand({
        Bucket: this.bucketName,
        Key: fileName,
      });

      // สร้าง presigned URL ที่หมดอายุใน expiresIn วินาที
      const signedUrl = await getSignedUrl(this.s3Client, command, { expiresIn });
      
      return signedUrl;
    } catch (error) {
      console.error('Error generating signed URL:', error);
      // ถ้าเกิด error ให้คืนค่าเดิม (fallback สำหรับไฟล์ public เก่าหรือ path ที่ไม่ถูกต้อง)
      return urlOrPath;
    }
  }

  /**
   * ดึงไฟล์จาก DigitalOcean Spaces และ return stream พร้อม metadata
   * @param urlOrPath - URL หรือ path ของไฟล์ที่ต้องการดึง
   * @returns Object ที่มี Body (stream) และ ContentType
   */
  async getImageStream(urlOrPath: string): Promise<{ Body: any; ContentType?: string }> {
    try {
      if (!urlOrPath) {
        throw new Error('URL or path is required');
      }

      // แปลง URL หรือ path เป็น path ใน bucket
      const fileName = this.extractPath(urlOrPath);
      
      // สร้าง GetObjectCommand
      const command = new GetObjectCommand({
        Bucket: this.bucketName,
        Key: fileName,
      });

      // ดึงไฟล์จาก S3
      const response = await this.s3Client.send(command);
      
      return {
        Body: response.Body,
        ContentType: response.ContentType,
      };
    } catch (error) {
      console.error('Error getting image stream:', error);
      throw new InternalServerErrorException('Failed to retrieve image from storage');
    }
  }

  /**
   * สร้าง proxy URL สำหรับเข้าถึงรูปภาพผ่าน backend
   * @param urlOrPath - URL หรือ path ของไฟล์
   * @returns Proxy URL
   */
  getProxyUrl(urlOrPath: string): string {
    if (!urlOrPath) return urlOrPath;

    // ถ้าเป็น external URL ที่ไม่ใช่ DigitalOcean Spaces ให้คืนค่าเดิม
    if (urlOrPath.startsWith('http://') || urlOrPath.startsWith('https://')) {
      const isDigitalOceanSpace = urlOrPath.includes('digitaloceanspaces.com');
      if (!isDigitalOceanSpace) {
        return urlOrPath;
      }
    }

    // สร้าง proxy URL
    const encodedPath = encodeURIComponent(urlOrPath);
    return `/api/upload/image?path=${encodedPath}`;
  }

  /**
   * แปลง proxy URL หรือ full URL กลับเป็น path สำหรับเก็บใน database
   * @param urlOrPath - Proxy URL (เช่น http://localhost:3001/api/upload/image?path=images%2Fxxx.png) หรือ path (เช่น images/xxx.png)
   * @returns Path ใน bucket (เช่น images/xxx.png)
   */
  normalizeImageUrl(urlOrPath: string): string {
    if (!urlOrPath) return urlOrPath;

    // ถ้าเป็น path อยู่แล้ว (ไม่มี http:// หรือ https:// และไม่ใช่ proxy URL)
    if (!urlOrPath.startsWith('http://') && !urlOrPath.startsWith('https://')) {
      // ถ้าเป็น proxy URL path (ขึ้นต้นด้วย /api/upload/image)
      if (urlOrPath.startsWith('/api/upload/image')) {
        try {
          const url = new URL(urlOrPath, 'http://localhost'); // ใช้ dummy base URL เพื่อ parse query string
          const pathParam = url.searchParams.get('path');
          if (pathParam) {
            return decodeURIComponent(pathParam);
          }
        } catch (error) {
          console.warn(`Could not parse proxy URL: ${urlOrPath}`, error);
        }
      }
      // ถ้าเป็น path ปกติ ให้คืนค่าเดิม
      return urlOrPath;
    }

    // ถ้าเป็น full URL (http:// หรือ https://)
    try {
      const url = new URL(urlOrPath);
      
      // ตรวจสอบว่าเป็น proxy URL หรือไม่ (เช่น http://localhost:3001/api/upload/image?path=...)
      if (url.pathname === '/api/upload/image') {
        const pathParam = url.searchParams.get('path');
        if (pathParam) {
          return decodeURIComponent(pathParam);
        }
      }

      // ถ้าเป็น DigitalOcean Spaces URL หรือ external URL อื่นๆ ให้ใช้ extractPath
      return this.extractPath(urlOrPath);
    } catch (error) {
      console.warn(`Could not normalize URL: ${urlOrPath}`, error);
      // ถ้า parse ไม่ได้ ให้ลองใช้ extractPath
      return this.extractPath(urlOrPath);
    }
  }
}


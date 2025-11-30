import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const status = exception.getStatus();
    const exceptionResponse = exception.getResponse();

    // Handle validation errors (BadRequestException from ValidationPipe)
    if (status === HttpStatus.BAD_REQUEST) {
      const message = (exceptionResponse as any).message;
      const errors: Record<string, string> = {};
      
      // ValidationPipe sends errors as array of error objects: [{ property: 'name', constraints: {...} }, ...]
      // Or as array of strings: ['error message 1', 'error message 2', ...]
      if (Array.isArray(message)) {
        message.forEach((item: any) => {
          if (typeof item === 'object' && item.property && item.constraints) {
            // Format 1: Error object with property and constraints
            const property = item.property.toLowerCase();
            const constraintMessages = Object.values(item.constraints) as string[];
            // Use the first constraint message (custom message from DTO)
            if (constraintMessages.length > 0 && ['name', 'email', 'message', 'status', 'username', 'password'].includes(property)) {
              errors[property] = constraintMessages[0];
            }
          } else if (typeof item === 'string') {
            // Format 2: String messages - try to extract field name
            if (item.includes('ชื่อ') || item.toLowerCase().includes('name')) {
              errors.name = item;
            } else if (item.includes('อีเมล') || item.toLowerCase().includes('email')) {
              errors.email = item;
            } else if (item.includes('ข้อความ') || item.toLowerCase().includes('message')) {
              errors.message = item;
            } else if (item.includes('สถานะ') || item.toLowerCase().includes('status')) {
              errors.status = item;
            } else if (item.includes('username') || item.includes('ชื่อผู้ใช้')) {
              errors.username = item;
            } else if (item.includes('รหัสผ่าน') || item.toLowerCase().includes('password')) {
              errors.password = item;
            } else {
              // Try to extract from ValidationPipe default format: "property must be..."
              const propertyMatch = item.match(/^(\w+)\s/i);
              if (propertyMatch) {
                const property = propertyMatch[1].toLowerCase();
                if (['name', 'email', 'message', 'status', 'username', 'password'].includes(property)) {
                  errors[property] = item;
                }
              }
            }
          }
        });
      }

      // Only return formatted errors if we found any
      if (Object.keys(errors).length > 0) {
        return response.status(status).json({
          statusCode: status,
          message: 'Validation failed',
          errors: errors,
        });
      }
    }

    // Handle other HTTP exceptions
    const message =
      typeof exceptionResponse === 'string'
        ? exceptionResponse
        : (exceptionResponse as any).message || 'An error occurred';

    response.status(status).json({
      statusCode: status,
      message: Array.isArray(message) ? message : [message],
      error: exception.name,
    });
  }
}


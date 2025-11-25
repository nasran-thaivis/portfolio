import { Injectable, NestMiddleware, UnauthorizedException } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { UsersService } from '../../users/users.service';

@Injectable()
export class AuthMiddleware implements NestMiddleware {
  constructor(private usersService: UsersService) {}

  async use(req: Request, res: Response, next: NextFunction) {
    // Get user ID from header or query (simple approach)
    // In production, use JWT token or session
    const userId = req.headers['x-user-id'] as string;
    const username = req.headers['x-username'] as string;

    if (!userId && !username) {
      // Allow public routes (like viewing profiles)
      // Only require auth for write operations
      return next();
    }

    try {
      let user;
      if (userId) {
        try {
          user = await this.usersService.findOne(userId);
        } catch (error: any) {
          // User not found - log but don't throw error
          // This allows upload endpoints to work even if user doesn't exist in DB
          console.log(`[AuthMiddleware] User with ID ${userId} not found, continuing without authentication`);
          return next();
        }
      } else if (username) {
        // findByUsername returns null if not found (doesn't throw)
        user = await this.usersService.findByUsername(username);
        if (!user) {
          console.log(`[AuthMiddleware] User with username ${username} not found, continuing without authentication`);
          return next();
        }
      }

      // Attach user to request object if found
      if (user) {
        (req as any).user = user;
      }
      
      next();
    } catch (error: any) {
      // For any other errors, log and continue (don't block upload endpoints)
      console.error('[AuthMiddleware] Error during authentication:', error?.message || error);
      next();
    }
  }
}


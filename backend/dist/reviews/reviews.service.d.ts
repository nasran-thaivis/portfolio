import { CreateReviewDto } from './dto/create-review.dto';
import { PrismaService } from '../prisma/prisma.service';
import { UploadService } from '../upload/upload.service';
export declare class ReviewsService {
    private prisma;
    private uploadService;
    constructor(prisma: PrismaService, uploadService: UploadService);
    create(username: string, createReviewDto: CreateReviewDto): Promise<{
        name: string;
        id: string;
        createdAt: Date;
        userId: string;
        rating: number;
        comment: string;
        avatarUrl: string | null;
    }>;
    findAll(userId?: string, username?: string): Promise<{
        name: string;
        id: string;
        createdAt: Date;
        userId: string;
        rating: number;
        comment: string;
        avatarUrl: string | null;
    }[]>;
    remove(userId: string, id: string): Promise<{
        name: string;
        id: string;
        createdAt: Date;
        userId: string;
        rating: number;
        comment: string;
        avatarUrl: string | null;
    }>;
}

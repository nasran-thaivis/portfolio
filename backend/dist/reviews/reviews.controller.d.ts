import { ReviewsService } from './reviews.service';
export declare class ReviewsController {
    private readonly reviewsService;
    constructor(reviewsService: ReviewsService);
    create(body: any): Promise<{
        name: string;
        id: string;
        createdAt: Date;
        userId: string;
        rating: number;
        comment: string;
        avatarUrl: string | null;
    }>;
    findAll(req: any): Promise<{
        name: string;
        id: string;
        createdAt: Date;
        userId: string;
        rating: number;
        comment: string;
        avatarUrl: string | null;
    }[]>;
    remove(user: any, id: string): Promise<{
        name: string;
        id: string;
        createdAt: Date;
        userId: string;
        rating: number;
        comment: string;
        avatarUrl: string | null;
    }>;
}

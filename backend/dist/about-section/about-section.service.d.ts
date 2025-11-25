import { CreateAboutSectionDto } from './dto/create-about-section.dto';
import { PrismaService } from '../prisma/prisma.service';
import { UploadService } from '../upload/upload.service';
export declare class AboutSectionService {
    private prisma;
    private uploadService;
    constructor(prisma: PrismaService, uploadService: UploadService);
    findOne(userId?: string, username?: string): Promise<any>;
    update(userIdOrUsername: string, createAboutSectionDto: CreateAboutSectionDto): Promise<{
        id: string;
        updatedAt: Date;
        userId: string;
        title: string;
        description: string | null;
        imageUrl: string | null;
    }>;
}

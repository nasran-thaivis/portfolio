import { UpdateHeroSectionDto } from './dto/update-hero-section.dto';
import { PrismaService } from '../prisma/prisma.service';
import { UploadService } from '../upload/upload.service';
export declare class HeroSectionService {
    private prisma;
    private uploadService;
    constructor(prisma: PrismaService, uploadService: UploadService);
    findOne(userId?: string, username?: string): Promise<any>;
    update(userIdOrUsername: string, updateHeroSectionDto: UpdateHeroSectionDto): Promise<{
        id: string;
        updatedAt: Date;
        userId: string;
        title: string;
        description: string | null;
        imageUrl: string | null;
    }>;
}

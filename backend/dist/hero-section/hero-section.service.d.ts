import { UpdateHeroSectionDto } from './dto/update-hero-section.dto';
import { PrismaService } from '../prisma/prisma.service';
import { UploadService } from '../upload/upload.service';
import { UsersService } from '../users/users.service';
export declare class HeroSectionService {
    private prisma;
    private uploadService;
    private usersService;
    constructor(prisma: PrismaService, uploadService: UploadService, usersService: UsersService);
    findOne(userId?: string, username?: string): Promise<any>;
    update(userIdOrUsername: string, updateHeroSectionDto: UpdateHeroSectionDto): Promise<{
        id: string;
        userId: string;
        title: string;
        description: string | null;
        imageUrl: string | null;
        updatedAt: Date;
    }>;
}

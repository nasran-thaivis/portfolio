import { CreateAboutSectionDto } from './dto/create-about-section.dto';
import { PrismaService } from '../prisma/prisma.service';
import { UploadService } from '../upload/upload.service';
import { UsersService } from '../users/users.service';
export declare class AboutSectionService {
    private prisma;
    private uploadService;
    private usersService;
    constructor(prisma: PrismaService, uploadService: UploadService, usersService: UsersService);
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

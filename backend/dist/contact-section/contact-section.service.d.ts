import { CreateContactSectionDto } from './dto/create-contact-section.dto';
import { PrismaService } from '../prisma/prisma.service';
import { UsersService } from '../users/users.service';
export declare class ContactSectionService {
    private prisma;
    private usersService;
    constructor(prisma: PrismaService, usersService: UsersService);
    findOne(userId?: string, username?: string): Promise<any>;
    update(userIdOrUsername: string, createContactSectionDto: CreateContactSectionDto): Promise<{
        id: string;
        userId: string;
        phone: string | null;
        email: string | null;
        updatedAt: Date;
    }>;
}

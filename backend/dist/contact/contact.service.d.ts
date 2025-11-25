import { PrismaService } from '../prisma/prisma.service';
import { CreateContactDto, UpdateContactStatusDto } from './dto/contact.dto';
export declare class ContactService {
    private prisma;
    constructor(prisma: PrismaService);
    findAll(userId?: string, username?: string): Promise<{
        id: string;
        email: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        message: string;
        status: string;
        userId: string;
    }[]>;
    findOne(id: string): Promise<{
        id: string;
        email: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        message: string;
        status: string;
        userId: string;
    }>;
    create(createContactDto: CreateContactDto, userId?: string): Promise<{
        id: string;
        email: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        message: string;
        status: string;
        userId: string;
    }>;
    updateStatus(id: string, updateStatusDto: UpdateContactStatusDto): Promise<{
        id: string;
        email: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        message: string;
        status: string;
        userId: string;
    }>;
    remove(id: string): Promise<{
        message: string;
    }>;
}

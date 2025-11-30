import { PrismaService } from '../prisma/prisma.service';
import { CreateContactDto, UpdateContactStatusDto } from './dto/contact.dto';
export declare class ContactService {
    private prisma;
    constructor(prisma: PrismaService);
    findAll(userId?: string, username?: string): Promise<{
        email: string;
        name: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        message: string;
        status: string;
        userId: string;
    }[]>;
    findOne(id: string): Promise<{
        email: string;
        name: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        message: string;
        status: string;
        userId: string;
    }>;
    create(createContactDto: CreateContactDto, userId?: string): Promise<{
        email: string;
        name: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        message: string;
        status: string;
        userId: string;
    }>;
    updateStatus(id: string, updateStatusDto: UpdateContactStatusDto): Promise<{
        email: string;
        name: string;
        id: string;
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

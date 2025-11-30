import { ContactService } from './contact.service';
import { CreateContactDto, UpdateContactStatusDto } from './dto/contact.dto';
import { PrismaService } from '../prisma/prisma.service';
export declare class ContactController {
    private readonly contactService;
    private readonly prisma;
    constructor(contactService: ContactService, prisma: PrismaService);
    findAll(req: any): Promise<{
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
    create(createContactDto: CreateContactDto, req: any): Promise<{
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

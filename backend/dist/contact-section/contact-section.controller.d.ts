import { ContactSectionService } from './contact-section.service';
import { CreateContactSectionDto } from './dto/create-contact-section.dto';
export declare class ContactSectionController {
    private readonly contactSectionService;
    constructor(contactSectionService: ContactSectionService);
    findOne(req: any): Promise<any>;
    update(user: any, req: any, createContactSectionDto: CreateContactSectionDto): Promise<{
        email: string | null;
        id: string;
        updatedAt: Date;
        userId: string;
        phone: string | null;
    }>;
    create(user: any, req: any, createContactSectionDto: CreateContactSectionDto): Promise<{
        email: string | null;
        id: string;
        updatedAt: Date;
        userId: string;
        phone: string | null;
    }>;
}

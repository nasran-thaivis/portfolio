import { AboutSectionService } from './about-section.service';
import { CreateAboutSectionDto } from './dto/create-about-section.dto';
export declare class AboutSectionController {
    private readonly aboutSectionService;
    constructor(aboutSectionService: AboutSectionService);
    findOne(req: any): Promise<any>;
    update(user: any, req: any, createAboutSectionDto: CreateAboutSectionDto): Promise<{
        id: string;
        updatedAt: Date;
        userId: string;
        title: string;
        description: string | null;
        imageUrl: string | null;
    }>;
    create(user: any, req: any, createAboutSectionDto: CreateAboutSectionDto): Promise<{
        id: string;
        updatedAt: Date;
        userId: string;
        title: string;
        description: string | null;
        imageUrl: string | null;
    }>;
}

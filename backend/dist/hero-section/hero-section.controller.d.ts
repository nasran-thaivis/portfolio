import { HeroSectionService } from './hero-section.service';
import { CreateHeroSectionDto } from './dto/create-hero-section.dto';
import { UpdateHeroSectionDto } from './dto/update-hero-section.dto';
export declare class HeroSectionController {
    private readonly heroSectionService;
    constructor(heroSectionService: HeroSectionService);
    findOne(req: any): Promise<any>;
    update(user: any, req: any, updateHeroSectionDto: UpdateHeroSectionDto): Promise<{
        id: string;
        userId: string;
        title: string;
        description: string | null;
        imageUrl: string | null;
        updatedAt: Date;
    }>;
    create(user: any, req: any, createHeroSectionDto: CreateHeroSectionDto): Promise<{
        id: string;
        userId: string;
        title: string;
        description: string | null;
        imageUrl: string | null;
        updatedAt: Date;
    }>;
}

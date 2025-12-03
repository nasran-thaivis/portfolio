import { ProjectsService } from './projects.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
export declare class ProjectsController {
    private readonly projectsService;
    constructor(projectsService: ProjectsService);
    create(user: any, req: any, createProjectDto: CreateProjectDto): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        link: string | null;
        userId: string;
        title: string;
        description: string | null;
        imageUrl: string | null;
    }>;
    findAll(req: any): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        link: string | null;
        userId: string;
        title: string;
        description: string | null;
        imageUrl: string | null;
    }[]>;
    findOne(id: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        link: string | null;
        userId: string;
        title: string;
        description: string | null;
        imageUrl: string | null;
    }>;
    update(user: any, id: string, updateProjectDto: UpdateProjectDto): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        link: string | null;
        userId: string;
        title: string;
        description: string | null;
        imageUrl: string | null;
    }>;
    remove(user: any, id: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        link: string | null;
        userId: string;
        title: string;
        description: string | null;
        imageUrl: string | null;
    }>;
}

import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { PrismaService } from '../prisma/prisma.service';
import { UploadService } from '../upload/upload.service';
import { UsersService } from '../users/users.service';
export declare class ProjectsService {
    private prisma;
    private uploadService;
    private usersService;
    constructor(prisma: PrismaService, uploadService: UploadService, usersService: UsersService);
    create(identifier: string, createProjectDto: CreateProjectDto): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        link: string | null;
        userId: string;
        title: string;
        description: string | null;
        imageUrl: string | null;
    }>;
    findAll(userId?: string, username?: string): Promise<{
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
    update(userId: string, id: string, updateProjectDto: UpdateProjectDto): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        link: string | null;
        userId: string;
        title: string;
        description: string | null;
        imageUrl: string | null;
    }>;
    remove(userId: string, id: string): Promise<{
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

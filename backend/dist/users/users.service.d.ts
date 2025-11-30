import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto, UpdateUserDto } from './dto/user.dto';
export declare class UsersService {
    private prisma;
    constructor(prisma: PrismaService);
    findAll(): Promise<{
        email: string;
        name: string;
        username: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
    }[]>;
    findOne(id: string): Promise<{
        email: string;
        name: string;
        username: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
    }>;
    findByEmail(email: string): Promise<{
        email: string;
        name: string;
        username: string;
        password: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
    }>;
    findByUsername(username: string): Promise<{
        email: string;
        name: string;
        username: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
    }>;
    checkUsernameAvailability(username: string): Promise<boolean>;
    validateUser(email: string, password: string): Promise<{
        email: string;
        name: string;
        username: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
    }>;
    create(createUserDto: CreateUserDto): Promise<{
        email: string;
        name: string;
        username: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
    }>;
    update(id: string, updateUserDto: UpdateUserDto): Promise<{
        email: string;
        name: string;
        username: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
    }>;
    remove(id: string): Promise<{
        message: string;
    }>;
}

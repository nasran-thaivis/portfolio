import { UsersService } from './users.service';
import { CreateUserDto, UpdateUserDto, LoginUserDto } from './dto/user.dto';
export declare class UsersController {
    private readonly usersService;
    constructor(usersService: UsersService);
    findAll(): Promise<{
        id: string;
        email: string;
        name: string;
        username: string;
        createdAt: Date;
        updatedAt: Date;
    }[]>;
    findOne(id: string): Promise<{
        id: string;
        email: string;
        name: string;
        username: string;
        createdAt: Date;
        updatedAt: Date;
    }>;
    create(createUserDto: CreateUserDto): Promise<{
        id: string;
        email: string;
        name: string;
        username: string;
        createdAt: Date;
        updatedAt: Date;
    }>;
    update(id: string, updateUserDto: UpdateUserDto): Promise<{
        id: string;
        email: string;
        name: string;
        username: string;
        createdAt: Date;
        updatedAt: Date;
    }>;
    remove(id: string): Promise<{
        message: string;
    }>;
    findByUsername(username: string): Promise<{
        success: boolean;
        user: {
            id: string;
            email: string;
            name: string;
            username: string;
            createdAt: Date;
            updatedAt: Date;
        };
    }>;
    checkUsername(username: string): Promise<{
        success: boolean;
        available: boolean;
        message: string;
    }>;
    login(loginUserDto: LoginUserDto): Promise<{
        success: boolean;
        message: string;
        user?: undefined;
    } | {
        success: boolean;
        user: {
            id: string;
            email: string;
            name: string;
            username: string;
            createdAt: Date;
            updatedAt: Date;
        };
        message: string;
    }>;
    register(createUserDto: CreateUserDto): Promise<{
        success: boolean;
        user: {
            id: string;
            email: string;
            name: string;
            username: string;
            createdAt: Date;
            updatedAt: Date;
        };
        message: string;
    } | {
        success: boolean;
        message: any;
        user?: undefined;
    }>;
}

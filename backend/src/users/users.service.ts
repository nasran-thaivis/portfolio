import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto, UpdateUserDto } from './dto/user.dto';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        username: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  async findOne(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        name: true,
        username: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    return user;
  }

  async findByEmail(email: string) {
    return this.prisma.user.findUnique({
      where: { email },
    });
  }

  async findByUsername(username: string) {
    return this.prisma.user.findUnique({
      where: { username },
      select: {
        id: true,
        email: true,
        name: true,
        username: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  async checkUsernameAvailability(username: string): Promise<boolean> {
    const user = await this.prisma.user.findUnique({
      where: { username },
    });
    return !user; // Return true if username is available
  }

  async validateUser(email: string, password: string) {
    console.log('[UsersService] validateUser() called with:', { email, hasPassword: !!password });
    
    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      console.log('[UsersService] User not found with email:', email);
      return null;
    }

    if (user.password !== password) {
      console.log('[UsersService] Password mismatch for email:', email);
      return null;
    }

    console.log('[UsersService] Login successful for user:', { id: user.id, email: user.email, username: user.username });

    // Return user without password
    const { password: _, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  async create(createUserDto: CreateUserDto) {
    // Log incoming data (ไม่ log password)
    console.log('[UsersService] create() called with:', {
      email: createUserDto.email,
      name: createUserDto.name,
      username: createUserDto.username,
      hasPassword: !!createUserDto.password,
    });

    // Check if email already exists
    const existingEmail = await this.prisma.user.findUnique({
      where: { email: createUserDto.email },
    });

    if (existingEmail) {
      console.log('[UsersService] Email already exists:', createUserDto.email);
      throw new ConflictException('Email already exists');
    }

    // Check if username already exists
    const existingUsername = await this.prisma.user.findUnique({
      where: { username: createUserDto.username },
    });

    if (existingUsername) {
      console.log('[UsersService] Username already exists:', createUserDto.username);
      throw new ConflictException('Username already exists');
    }

    // ⚠️ In production, hash password with bcrypt
    console.log('[UsersService] Creating user with data:', {
      email: createUserDto.email,
      name: createUserDto.name,
      username: createUserDto.username,
    });
    
    const user = await this.prisma.user.create({
      data: createUserDto,
      select: {
        id: true,
        email: true,
        name: true,
        username: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    console.log('[UsersService] User created successfully:', {
      id: user.id,
      email: user.email,
      name: user.name,
      username: user.username,
    });

    return user;
  }

  async update(id: string, updateUserDto: UpdateUserDto) {
    await this.findOne(id); // Check if exists

    // ⚠️ In production, hash password with bcrypt if changed
    const user = await this.prisma.user.update({
      where: { id },
      data: updateUserDto,
      select: {
        id: true,
        email: true,
        name: true,
        username: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return user;
  }

  async remove(id: string) {
    await this.findOne(id); // Check if exists

    await this.prisma.user.delete({
      where: { id },
    });

    return { message: 'User deleted successfully' };
  }

  /**
   * Ensure user exists in database. If not found, create a new user automatically.
   * This is used when saving data in Admin for the first time.
   * @param userIdOrUsername - User ID (UUID, CUID, or timestamp string) or username
   * @returns User object (existing or newly created)
   */
  async ensureUserExists(userIdOrUsername: string) {
    console.log(`[UsersService] ensureUserExists() called with: ${userIdOrUsername}`);
    
    // Check if it's a UUID
    const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(userIdOrUsername);
    
    // Check if it's a CUID
    const isCUID = /^c[a-z0-9]{24}$/i.test(userIdOrUsername);
    
    // Check if it's a numeric ID (timestamp)
    const isNumericId = /^\d+$/.test(userIdOrUsername);

    let user = null;

    // Try to find user by ID first (if it's UUID, CUID, or numeric ID)
    if (isUUID || isCUID || isNumericId) {
      try {
        user = await this.prisma.user.findUnique({
          where: { id: userIdOrUsername },
        });
        if (user) {
          console.log(`[UsersService] Found user by ID: ${userIdOrUsername}`, { id: user.id, email: user.email, username: user.username });
        }
      } catch (error) {
        // If not found, continue to try username
        console.log(`[UsersService] User with ID ${userIdOrUsername} not found, trying username`);
      }
    }

    // If not found by ID, try to find by username
    if (!user) {
      user = await this.prisma.user.findUnique({
        where: { username: userIdOrUsername },
      });
      if (user) {
        console.log(`[UsersService] Found user by username: ${userIdOrUsername}`, { id: user.id, email: user.email, username: user.username });
      }
    }

    // If user exists, return it
    if (user) {
      console.log(`[UsersService] Returning existing user: ${user.username} (${user.id})`);
      return user;
    }

    // User doesn't exist - create a new one automatically
    // ⚠️ WARNING: This should only be called from Admin dashboard when user is authenticated
    // If user registered properly, they should exist in database
    console.warn(`[UsersService] User not found: ${userIdOrUsername}. Creating auto-generated user.`);
    console.warn(`[UsersService] ⚠️ This should only happen when saving data in Admin dashboard for the first time.`);
    
    // Use userIdOrUsername as username if it's not a UUID/CUID/numeric ID
    const username = (isUUID || isCUID || isNumericId) ? `user_${Date.now()}` : userIdOrUsername;
    const name = (isUUID || isCUID || isNumericId) ? `User ${Date.now()}` : userIdOrUsername;
    
    // Generate a unique email
    const email = `${username}_${Date.now()}@auto-generated.local`;
    
    // Create user with dummy password (user can change it later)
    const newUser = await this.prisma.user.create({
      data: {
        username,
        name,
        email,
        password: 'auto-generated-password-change-me', // ⚠️ User should change this
      },
      select: {
        id: true,
        email: true,
        name: true,
        username: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    console.log(`[UsersService] Auto-created user: ${username} (${newUser.id}) with email: ${email}`);
    return newUser;
  }
}


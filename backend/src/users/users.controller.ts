import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  HttpCode,
  HttpStatus,
  NotFoundException,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto, UpdateUserDto, LoginUserDto } from './dto/user.dto';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  findAll() {
    return this.usersService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(id);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(id, updateUserDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string) {
    return this.usersService.remove(id);
  }

  @Get('username/:username')
  async findByUsername(@Param('username') username: string) {
    const user = await this.usersService.findByUsername(username);
    if (!user) {
      throw new NotFoundException(`User with username '${username}' not found`);
    }
    return { success: true, user };
  }

  @Get('check-username/:username')
  async checkUsername(@Param('username') username: string) {
    const isAvailable = await this.usersService.checkUsernameAvailability(username);
    return { 
      success: true, 
      available: isAvailable,
      message: isAvailable ? 'Username is available' : 'Username already taken'
    };
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() loginUserDto: LoginUserDto) {
    console.log('[UsersController] login() called with:', {
      email: loginUserDto.email,
      hasPassword: !!loginUserDto.password,
    });
    
    const user = await this.usersService.validateUser(loginUserDto.email, loginUserDto.password);
    if (!user) {
      console.log('[UsersController] Login failed: Invalid email or password');
      return { success: false, message: 'Invalid email or password' };
    }
    
    console.log('[UsersController] Login successful:', {
      id: user.id,
      email: user.email,
      username: user.username,
    });
    
    return { success: true, user, message: 'Login successful' };
  }

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  async register(@Body() createUserDto: CreateUserDto) {
    try {
      console.log('[UsersController] register() called with:', {
        email: createUserDto.email,
        name: createUserDto.name,
        username: createUserDto.username,
        hasPassword: !!createUserDto.password,
      });
      
      const user = await this.usersService.create(createUserDto);
      
      console.log('[UsersController] Registration successful:', {
        id: user.id,
        email: user.email,
        name: user.name,
        username: user.username,
      });
      
      return { success: true, user, message: 'Registration successful' };
    } catch (error) {
      console.error('[UsersController] Registration failed:', error.message);
      return { 
        success: false, 
        message: error.message || 'Registration failed' 
      };
    }
  }
}


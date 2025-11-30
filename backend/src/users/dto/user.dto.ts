// ไฟล์: src/users/dto/user.dto.ts
import { IsEmail, IsNotEmpty, IsString, MinLength, IsOptional, Matches } from 'class-validator';

// --- สำหรับสมัครสมาชิก (Register) ---
export class CreateUserDto {
  @IsEmail({}, { message: 'รูปแบบอีเมลไม่ถูกต้อง' })
  @IsNotEmpty({ message: 'กรุณากรอกอีเมล' })
  email: string;

  @IsString()
  @IsNotEmpty({ message: 'กรุณากรอกชื่อ' })
  name: string;

  @IsString()
  @IsNotEmpty({ message: 'กรุณากรอก username' })
  username: string;

  @IsString()
  @MinLength(6, { message: 'รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร' })
  @IsNotEmpty({ message: 'กรุณากรอกรหัสผ่าน' })
  password: string;
}

// --- สำหรับเข้าสู่ระบบ (Login) ---
export class LoginUserDto {
  @IsEmail({}, { message: 'รูปแบบอีเมลไม่ถูกต้อง' })
  @IsNotEmpty({ message: 'กรุณากรอกอีเมล' })
  email: string;

  @IsString()
  @IsNotEmpty({ message: 'กรุณากรอกรหัสผ่าน' })
  password: string;
}

// --- สำหรับแก้ไขข้อมูล (Update) ---
export class UpdateUserDto {
  @IsOptional()
  @IsEmail({}, { message: 'รูปแบบอีเมลไม่ถูกต้อง' })
  email?: string;

  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  username?: string;

  @IsOptional()
  @IsString()
  @MinLength(6, { message: 'รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร' })
  password?: string;
}
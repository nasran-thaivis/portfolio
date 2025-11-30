import { IsString, IsNotEmpty, MaxLength, IsEmail } from 'class-validator';

export class CreateContactDto {
  @IsString({ message: 'ชื่อต้องเป็นข้อความ' })
  @IsNotEmpty({ message: 'กรุณากรอกชื่อ' })
  @MaxLength(100, { message: 'ชื่อต้องไม่เกิน 100 ตัวอักษร' }    )
  name: string;  //ชื่อผู้ใช้งาน

  @IsEmail({}, { message: 'อีเมลต้องเป็นรูปแบบอีเมลที่ถูกต้อง' })
  @IsNotEmpty({ message: 'กรุณากรอกอีเมล' })
  email: string;  //อีเมลผู้ใช้งาน

  @IsString({ message: 'ข้อความต้องเป็นข้อความ' })
  @IsNotEmpty({ message: 'กรุณากรอกข้อความ' })
  @MaxLength(1000, { message: 'ข้อความต้องไม่เกิน 1000 ตัวอักษร' })
  message: string;  //ข้อความที่กรอกมา

  @IsString({ message: 'สถานะต้องเป็นข้อความ' })
  @IsNotEmpty({ message: 'กรุณากรอกสถานะ' })
  @MaxLength(100, { message: 'สถานะต้องไม่เกิน 100 ตัวอักษร' })
  status?: string;  //สถานะการข้อมูล อัตโนมัติ
}

export class UpdateContactStatusDto {
  status: string; // 'new' | 'read' | 'replied' //สถานะการข้อมูล
}


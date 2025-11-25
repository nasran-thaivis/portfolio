export class CreateUserDto {
  email: string;
  name: string;
  username: string;
  password: string;
}

export class UpdateUserDto {
  email?: string;
  name?: string;
  username?: string;
  password?: string;
}

export class LoginUserDto {
  email: string;
  password: string;
}


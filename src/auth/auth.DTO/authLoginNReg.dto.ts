import { IsEmail, IsNumber, IsString, MinLength } from 'class-validator';

export class RegisterUserDto {
  @IsString()
  username: string;

  @IsString()
  first_name: string;
  
  @IsString()
  last_name: string;

  @IsNumber()
  role_id: number;

  @IsString()
  @MinLength(8)
  password_hash: string;


}

export class LoginUserDto {
  @IsString()
  username: string;

  @IsString()
  @MinLength(8)
  password_hash: string;
}
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service.js';
import { AuthRepository} from '../auth.repository.js';
import { PasswordHasher } from '@nestjs/authentication';
import * as argon2 from 'argon2';
import { RegisterUserDto, LoginUserDto } from '../auth.DTO/authLoginNReg.dto.js';

@Injectable()
export class AuthService {
  constructor(private authRepository: AuthRepository) {}

  async registerUser(dto: RegisterUserDto) {
    try {
      const existingUser = await this.authRepository.findByName(dto.username);
      if (existingUser) {
        throw new Error('Username already exists');
      }

      dto.password_hash = await argon2.hash(dto.password_hash);
      console.log('Hashed password:', typeof dto.password_hash);
      return await this.authRepository.createUser(dto);

    } catch (error: any) {
      throw new Error(`Failed to create user: ${error.message}`);
    }
  }
  

   async loginUser(dto: LoginUserDto) {
    const user = await this.authRepository.findByName(dto.username);

    // Same error for "no user" and "wrong password" to avoid user enumeration
    if (!user || !(await argon2.verify(user.password_hash, dto.password_hash))) {
      throw new UnauthorizedException('Invalid username or password');
    }

    const { password_hash: _omit, ...safeUser } = user;
    return safeUser;
  }
}
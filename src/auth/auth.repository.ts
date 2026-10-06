import { randomUUID } from 'node:crypto';
import { Injectable } from '@nestjs/common';
import { Prisma } from '../generated/prisma/client.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { users } from '../generated/prisma/client.js';

interface UserRow extends users{
    passwordHash: string | null;
}

@Injectable()
export class AuthRepository {
    private readonly rows = new Map<string, UserRow>
    constructor(private prisma: PrismaService){}

    async createUser(data: Prisma.usersUncheckedCreateInput) {
        return this.prisma.users.create({ data });
        }

    
    async VerifyAccount(username: string, password_hash: string): Promise<users | null> {
        return this.prisma.users.findFirst({
            where: {
                username: username,
                password_hash: password_hash
            }
        });
    }   

    async findById(id: number): Promise<users | null> {
        return this.prisma.users.findUnique({
            where: {
                user_id: id
            },
        });
        }

    async findByName(name: string): Promise<users | null>{
        return this.prisma.users.findFirst({
            where: {
                username: name
            }
        })
    }
    
    async editUser(id: number, data: Prisma.usersUncheckedUpdateInput): Promise<users | null> {
        return this.prisma.users.update({
            where: {
                user_id: id
            },
            data: data
        })
    }

    async deleteUser(id: number): Promise<users | null> {
        return this.prisma.users.delete({
            where: {
                user_id: id
            }
        })
    }

    async getAllUsers(): Promise<users[]> {
        return this.prisma.users.findMany();
    }

    async getRoleById(id: number): Promise<string | null> {
        const user = await this.prisma.roles.findUnique({
            where: {
                role_id: id
            },
            select: {
                role_name: true
            }
        });
        return user?.role_name || null;
    }

}